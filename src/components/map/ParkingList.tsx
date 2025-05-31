import React from "react";
import { getDistance } from "../../utils/getDistance";
import "../../styles/ParkingList.css"

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
    <div className="parking-list-container">
      <div className="parking-content">
        <h3 className="parking-title-header">🅿️ Lista parkinga</h3>

        <input
          type="text"
          placeholder="Pretraži parking..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="parking-search-input"
        />

        <div className="filter-row">
          <select
            value={selectedZone ?? ""}
            onChange={(e) => setSelectedZone(e.target.value ? Number(e.target.value) : null)}
            className="parking-select"
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

          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`favorites-toggle ${showOnlyFavorites ? "active" : ""}`}
          >
            ❤️ Favoriti
          </button>
        </div>

        {sortedMarkers.map((marker) => {
          const distance = userPosition
            ? (getDistance(userPosition[0], userPosition[1], marker.position[0], marker.position[1]) / 1000).toFixed(2)
            : "-";

          return (
            <div
              key={marker.id}
              className="parking-item"
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
              <div className="parking-item-content">
                <div className="parking-item-name">{marker.popupText}</div>
                <div className="parking-info-row">
                  <span className="parking-type">{zoneLabels[marker.zona]}</span>
                  <span className="availability">Slobodna mjesta: {marker.slobodnaMjesta}</span>
                  <span className="distance">{distance} km</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(marker.id);
                }}
                className="heart-button"
              >
                {favorites.includes(marker.id) ? "❤️" : "🤍"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParkingList;
