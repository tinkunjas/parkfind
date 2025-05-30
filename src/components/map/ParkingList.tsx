import React from "react";
import { getDistance } from "../../utils/getDistance";

interface MarkerData {
  id: number;
  position: [number, number];
  popupText: string;
  zona: number;
  slobodnaMjesta: number;
}

const zoneLabels: Record<number, string> = {
  1: "Zona 1",
  2: "Zona 2",
  3: "Zona 3",
  4: "Zona 4",
  5: "Garaža",
  6: "Privatan parking",
  7: "Javni parking",
};


interface Props {
  markers: MarkerData[];
  userPosition: [number, number] | null;
  searchText: string;
  setSearchText: (text: string) => void;
  selectedZone: number | null;
  setSelectedZone: (zone: number | null) => void;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (fav: boolean) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
  mapRef: React.RefObject<L.Map | null>
  markerRefs: React.MutableRefObject<Record<number, L.Marker>>;
}

const ParkingList: React.FC<Props> = ({
  markers,
  userPosition,
  searchText,
  setSearchText,
  selectedZone,
  setSelectedZone,
  showOnlyFavorites,
  setShowOnlyFavorites,
  favorites,
  toggleFavorite,
  mapRef,
  markerRefs,
}) => {
  const filtriraniMarkeri = markers.filter((m) =>
    (selectedZone ? m.zona === selectedZone : true) &&
    (!showOnlyFavorites || favorites.includes(m.id)) &&
    (!searchText || m.popupText.toLowerCase().includes(searchText.toLowerCase()))
  );

  const sortedMarkers = [...filtriraniMarkeri].sort((a, b) => {
    if (!userPosition) return 0;
    const distA = getDistance(userPosition[0], userPosition[1], a.position[0], a.position[1]);
    const distB = getDistance(userPosition[0], userPosition[1], b.position[0], b.position[1]);
    return distA - distB;
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "60px",
        left: "10px",
        width: "300px",
        maxHeight: "65vh",
        overflowY: "auto",
        zIndex: 1000,
        backgroundColor: "white",
        borderRadius: "10px",
        padding: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      }}
    >
      <h3 style={{ marginBottom: "1rem", color: "#111" }}>🅿️ Lista parkinga</h3>
      <input
        type="text"
        placeholder="Pretraži parking..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{
          width: 'calc(100% - 24px)',
          color: '#000',
          margin: '0 12px 12px 12px',
          padding: '6px 10px',
          border: '1px solid #ccc',
          borderRadius: '18px',
          fontSize: '14px',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff'
        }}
      />

      <div style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>
        <select
          value={selectedZone ?? ""}
          onChange={(e) =>
            setSelectedZone(e.target.value ? Number(e.target.value) : null)
          }
          style={{
            padding: '6px 10px',
            border: '1px solid #ccc',
            borderRadius: '18px',
            fontSize: '14px',
            backgroundColor: '#ffffff',
            color: '#000',
            appearance: 'none',
            flex: 1
          }}
        >
          <option value="">Sve zone</option>
          <option value="1">Zona 1</option>
<option value="2">Zona 2</option>
<option value="3">Zona 3</option>
<option value="4">Zona 4</option>
<option value="5">Garaža</option>
<option value="6">Privatan</option>
<option value="7">Javni</option>
        </select>

        <select
          onChange={(e) => {
            setShowOnlyFavorites(e.target.value === "favorites");
          }}
          style={{
            padding: '6px 10px',
            border: '1px solid #ccc',
            borderRadius: '18px',
            fontSize: '14px',
            backgroundColor: '#ffffff',
            color: '#000',
            appearance: 'none',
            flex: 1
          }}
        >
          <option value="">Svi parkinzi</option>
          <option value="favorites">Favoriti ❤️</option>
        </select>
      </div>

      {sortedMarkers.map((marker) => (
        <div
          key={marker.id}
          style={{
            backgroundColor: "#f9fafb",
            padding: "8px",
            marginBottom: "6px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => {
            const map = mapRef.current;
            if (map) {
              const [lat, lon] = marker.position;
              map.whenReady(() => {
                map.closePopup();
                map.setView([lat, lon], 16, { animate: true });

                const handleMoveEnd = () => {
                  markerRefs.current[marker.id]?.openPopup();
                  map.off("moveend", handleMoveEnd);
                };

                map.on("moveend", handleMoveEnd);
              });
            }
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: "bold" }}>{marker.popupText}</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(marker.id);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              {favorites.includes(marker.id) ? "❤️" : "🤍"}
            </button>
          </div>

          <div style={{ fontSize: "13px", color: "#444" }}>
  {zoneLabels[marker.zona] || `Nepoznata zona (${marker.zona})`} | Slobodna mjesta: {marker.slobodnaMjesta}
</div>


          {userPosition && (
            <div style={{ fontSize: "13px", color: "#444" }}>
              {(getDistance(userPosition[0], userPosition[1], marker.position[0], marker.position[1]) / 1000).toFixed(2)} km udaljeno
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ParkingList;
