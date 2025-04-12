import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  ZoomControl,
  useMap,
  Popup
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "./MobileMapComponent.css";
import SearchBar from "./MobileSearchBar";
import MobileSidebar from "./MobileSidebar";

const defaultPosition: [number, number] = [45.815399, 15.966568];

interface MarkerData {
  id: number;
  lat: number;
  lon: number;
  name: string;
  zona: number;
  slobodnaMjesta: number;
}

const zoneIcons: Record<number, L.Icon> = {
  1: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  2: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  3: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  4: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

const MapResizer = ({ trigger }: { trigger: boolean }) => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [trigger, map]);
  return null;
};

const MobileMapComponent: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [searchResult, setSearchResult] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [routeTarget, setRouteTarget] = useState<[number, number] | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<any>(null);

  const handleSearch = (lat: number, lon: number, name?: string) => {
    setSearchResult({ lat, lon, name });
    mapRef.current?.setView([lat, lon], 15);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Greška pri dohvaćanju lokacije:", err)
    );
  }, []);

  useEffect(() => {
    if (routeTarget && userPosition && mapRef.current) {
      routingControlRef.current?.remove();

      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userPosition[0], userPosition[1]),
          L.latLng(routeTarget[0], routeTarget[1]),
        ],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        createMarker: () => null,
        containerClassName: "custom-routing-container", // Key line
        position: "bottomright",
        lineOptions: {
          styles: [
            { color: "#2563eb", weight: 3.5, opacity: 0.9 }
          ]
        }
      }).addTo(mapRef.current);
    }
  }, [routeTarget, userPosition]);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const res = await fetch("/parkinzi.txt");
        const text = await res.text();
        const parsed = text.trim().split("\n").map((line) => {
          const [id, lat, lon, name, zona, slobodnaMjesta] = line.split(";");
          return {
            id: Number(id),
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            name,
            zona: Number(zona),
            slobodnaMjesta: Number(slobodnaMjesta),
          };
        });
        setMarkers(parsed);
      } catch (error) {
        console.error("Greška pri učitavanju parkinga:", error);
      }
    };

    fetchMarkers();
    const interval = setInterval(fetchMarkers, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mobile-container">
      <MobileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

      <div className="mobile-map-wrapper">
        <div className="mobile-map">
          <MapContainer
            center={defaultPosition}
            zoom={13}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
            maxBounds={[[42.3, 13.3], [46.9, 19.7]]}
            maxBoundsViscosity={1.0}
            ref={mapRef}
          >
            <MapResizer trigger={isFullscreen} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <ZoomControl position="bottomleft" />

            {userPosition && (
              <Marker
                position={userPosition}
                icon={new L.Icon({
                  iconUrl: "https://cdn-icons-png.flaticon.com/512/3177/3177361.png",
                  iconSize: [35, 35],
                  iconAnchor: [17, 35],
                })}
              >
                <Popup offset={[0, -40]} closeButton={true}>
                  Tvoja lokacija
                </Popup>
              </Marker>
            )}

            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.lat, marker.lon]}
                icon={zoneIcons[marker.zona]}
              >
                <Popup>
                  {marker.name}<br />
                  Zona: {marker.zona}<br />
                  Slobodna mjesta: {marker.slobodnaMjesta}<br />
                  <button
                    className="popup-navigate-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullscreen(true);
                      setRouteTarget([marker.lat, marker.lon]);
                      mapRef.current?.closePopup();
                    }}
                  >
                    <img src="/directiongo2.png" alt="go" style={{ width: "22px", height: "22px" }} />
                    Započni navigaciju
                  </button>
                </Popup>
              </Marker>
            ))}

            {searchResult && (
              <Marker
                position={[searchResult.lat, searchResult.lon]}
                icon={new L.Icon({
                  iconUrl: "/marker.png",
                  iconSize: [40, 40],
                  iconAnchor: [20, 40],
                  popupAnchor: [0, -40],
                })}
              >
                <Popup maxWidth={200}>
                  {searchResult.name && searchResult.name.length > 60
                    ? `${searchResult.name.substring(0, 60)}...`
                    : searchResult.name || "Odabrana lokacija"}
                </Popup>
              </Marker>
            )}
          </MapContainer>

<SearchBar onSearch={handleSearch} />

{}
<button className="fullscreen-toggle" onClick={() => setIsFullscreen(prev => !prev)}>
  <img src="/fullscreen.png" alt="fullscreen" />
</button>

        </div>

        {routeTarget && (
          <button
            className="cancel-navigation"
            onClick={() => {
              routingControlRef.current?.remove();
              routingControlRef.current = null;
              setRouteTarget(null);
            }}
          >
            Prekini navigaciju
          </button>
        )}
      </div>

      {!isFullscreen && (
        <div className="mobile-content">
          <h3 style={{ marginBottom: "1rem", color: "#000" }}>🅿️ Lista parkinga</h3>
          {markers.map((marker) => (
            <div key={marker.id} className="parking-item">
              <span style={{ color: "#000" }}>{marker.name}</span>
              <button
                className="navigate-button"
                onClick={() => {
                  setIsFullscreen(true);
                  setRouteTarget([marker.lat, marker.lon]);
                }}
              >
                <img src="/directiongo2.png" alt="go" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileMapComponent;
