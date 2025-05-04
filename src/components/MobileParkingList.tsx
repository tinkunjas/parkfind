import React from "react";
import L from "leaflet";
import { getDistance } from "../utils/getDistance";

interface MarkerData {
  id: number;
  lat: number;
  lon: number;
  name: string;
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
    7: "Javni parking"
  };  

interface MobileParkingListProps {
  markers: MarkerData[];
  userPosition: [number, number] | null;
  filterZona: number | null;
  setFilterZona: (zona: number | null) => void;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (value: boolean) => void;
  searchText: string;
  setSearchText: (value: string) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
  markerRefs: React.MutableRefObject<Record<number, L.Marker>>;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  setRouteTarget: React.Dispatch<React.SetStateAction<[number, number] | null>>;
  routingControlRef: React.MutableRefObject<any>;
}

const MobileParkingList: React.FC<MobileParkingListProps> = ({
  markers,
  userPosition,
  filterZona,
  setFilterZona,
  showOnlyFavorites,
  setShowOnlyFavorites,
  searchText,
  setSearchText,
  favorites,
  toggleFavorite,
  mapRef,
  markerRefs,
  setIsFullscreen,
  setRouteTarget,
  routingControlRef
}) => {
  return (
    <div className="mobile-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ marginBottom: "1rem", marginLeft: "7px", color: "#000" }}>🅿️ Lista parkinga</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={filterZona ?? ""}
            onChange={(e) =>
              setFilterZona(e.target.value ? Number(e.target.value) : null)
            }
            style={{ marginRight: "-4px" }}
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
            value={showOnlyFavorites ? "favorites" : ""}
            onChange={(e) => setShowOnlyFavorites(e.target.value === "favorites")}
            style={{ marginRight: "8px" }}
          >
            <option value="">Svi parkinzi</option>
            <option value="favorites">Favoriti ❤️</option>
          </select>
        </div>
      </div>

      <input
        type="text"
        className="mobile-parking-search-input"
        placeholder="Pretraži parking..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {[...markers]
        .filter((marker) => {
          if (filterZona !== null && marker.zona !== filterZona) return false;
          if (showOnlyFavorites && !favorites.includes(marker.id)) return false;
          if (searchText && !marker.name.toLowerCase().includes(searchText.toLowerCase())) return false;
          return true;
        })
        .sort((a, b) => {
          if (!userPosition) return 0;
          const distA = getDistance(userPosition[0], userPosition[1], a.lat, a.lon);
          const distB = getDistance(userPosition[0], userPosition[1], b.lat, b.lon);
          return distA - distB;
        })
        .map((marker) => (
          <div
            key={marker.id}
            className="parking-item"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest(".navigate-button")) return;
              const offsetLat = marker.lat - 0.0008;
              if (mapRef.current) {
                const mapInstance = mapRef.current;
                mapInstance.closePopup();
                mapInstance.setView([offsetLat, marker.lon], 16, { animate: true });
                const handleMoveEnd = () => {
                  markerRefs.current[marker.id]?.openPopup();
                  mapInstance.off("moveend", handleMoveEnd);
                };
                mapInstance.on("moveend", handleMoveEnd);
              }
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: "bold", color: "#000" }}>{marker.name}</div>
                <button
                  className="heart-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(marker.id);
                  }}
                >
                  {favorites.includes(marker.id) ? "❤️" : "🤍"}
                </button>
              </div>
              <div style={{ fontSize: "13px", color: "#444" }}>
              {zoneLabels[marker.zona] || `Nepoznata (${marker.zona})`} | Slobodna mjesta: {marker.slobodnaMjesta}
              </div>
              {userPosition && (
                <div style={{ fontSize: "13px", color: "#444" }}>
                  {(getDistance(userPosition[0], userPosition[1], marker.lat, marker.lon) / 1000).toFixed(2)} km udaljeno
                </div>
              )}
            </div>
            <button
              className="navigate-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(true);
                setRouteTarget([marker.lat, marker.lon]);
                mapRef.current?.closePopup();

                if (routingControlRef.current && userPosition) {
                  routingControlRef.current.spliceWaypoints(0, 2);
                  routingControlRef.current.setWaypoints([
                    L.latLng(userPosition[0], userPosition[1]),
                    L.latLng(marker.lat, marker.lon),
                  ]);
                  routingControlRef.current.route();
                }

                if (userPosition) {
                  const offsetLat = userPosition[0] - 0.0012;
                  mapRef.current?.setView([offsetLat, userPosition[1]], 16, { animate: true });
                }
              }}
            >
              <img src="/directiongo2.png" alt="go" />
            </button>
          </div>
        ))}
    </div>
  );
};

export default MobileParkingList;
