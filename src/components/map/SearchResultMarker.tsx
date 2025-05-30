import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface SearchResultMarkerProps {
  searchResult: { lat: number; lon: number; name?: string };
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  setRouteTarget: React.Dispatch<React.SetStateAction<[number, number] | null>>;
  userPosition: [number, number] | null;
  routingControlRef: React.MutableRefObject<any>;
  mapRef: React.MutableRefObject<L.Map | null>;
}

const SearchResultMarker: React.FC<SearchResultMarkerProps> = ({
  searchResult,
  setIsFullscreen,
  setRouteTarget,
  userPosition,
  routingControlRef,
  mapRef,
}) => {
  if (!searchResult) return null;

  return (
    <Marker
      position={[searchResult.lat, searchResult.lon]}
      icon={new L.Icon({
        iconUrl: "/marker.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })}
    >
      <Popup maxWidth={200}>
        <div style={{ fontSize: "14px" }}>
          {searchResult.name && searchResult.name.length > 60
            ? `${searchResult.name.substring(0, 60)}...`
            : searchResult.name || "Odabrana lokacija"}
          <br />
          <button
            className="popup-navigate-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
              setRouteTarget([searchResult.lat, searchResult.lon]);
              mapRef.current?.closePopup();
            
              if (routingControlRef.current && userPosition) {
                routingControlRef.current.spliceWaypoints(0, 2);
                routingControlRef.current.setWaypoints([
                  L.latLng(userPosition[0], userPosition[1]),
                  L.latLng(searchResult.lat, searchResult.lon),
                ]);
                routingControlRef.current.route();
              }
            
              if (userPosition) {
                const offsetLat = userPosition[0] - 0.0028;
                mapRef.current?.setView([offsetLat, userPosition[1]], 16, { animate: true });
              }              
            }}            
          >
            <img src="/directiongo2.png" alt="go" style={{ width: 18, height: 18 }} />
            Započni navigaciju
          </button>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${searchResult.lat},${searchResult.lon}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              marginTop: "8px",
              fontSize: "14px"
            }}
          >
            <img src="/gmaps.png" alt="gmaps" className="google-maps-icon" />
            Otvori u Google Maps
          </a>
        </div>
      </Popup>
    </Marker>
  );
};

export default SearchResultMarker;
