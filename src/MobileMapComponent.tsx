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

const croatiaBounds: [[number, number], [number, number]] = [
  [42.3, 13.3],
  [46.6, 19.5],
];

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};


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
  const [currentInstruction, setCurrentInstruction] = useState<string | null>(null);
  const [filterZona, setFilterZona] = useState<number | null>(null);
  const [filterMjesta, setFilterMjesta] = useState<number | null>(null);

  const routingControlRef = useRef<any>(null);
  const mapRef = useRef<L.Map | null>(null);

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
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.error("Greška pri praćenju lokacije:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
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
        lineOptions: {
          styles: [{ color: "#2563eb", weight: 3.5, opacity: 0.9 }],
          addWaypoints: false,
          extendToWaypoints: true,
          missingRouteTolerance: 10,
          updateWhileIdle: false
        },
        containerClassName: "custom-routing-container",
      })
      
      .on("routesfound", function (e: any) {
        const instructions = e.routes[0].instructions || e.routes[0].instructions || e.routes[0].segments?.flatMap((seg: any) => seg.steps) || [];
        if (instructions.length > 0) {
          setCurrentInstruction(instructions[0].instruction || instructions[0].text);
        }
      })
      .on("routeselected", function (e: any) {
        const steps = e.route.instructions || e.route.segments?.flatMap((s: any) => s.steps) || [];
        if (steps.length > 0) {
          setCurrentInstruction(steps[0].instruction || steps[0].text);
        }
      })
      .addTo(mapRef.current);
      const container = routingControlRef.current.getContainer();
if (container) {
  container.style.display = "none";
}
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

      <div className={`mobile-map-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="mobile-map">
          <MapContainer
            center={defaultPosition}
            zoom={13}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
            maxBounds={croatiaBounds}
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
          {currentInstruction && (
            <div className="navigation-instruction">
              <p>{currentInstruction}</p>
            </div>
          )}

          <button
            className={`fullscreen-toggle ${isFullscreen ? 'fullscreen-active' : 'above-list'}`}
            onClick={() => setIsFullscreen(prev => !prev)}
          >
            <img src="/fullscreen.png" alt="fullscreen" />
          </button>
        </div>

        {routeTarget && (
          <button
            className={`cancel-navigation ${isFullscreen ? "on-top" : "behind-content"}`}
            onClick={() => {
              routingControlRef.current?.remove();
              routingControlRef.current = null;
              setRouteTarget(null);
              setCurrentInstruction(null);
            }}
          >
            Prekini navigaciju
          </button>
        )}
      </div>

      {!isFullscreen && (
  <div className="mobile-content">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3 style={{ marginBottom: "1rem", color: "#000" }}>🅿️ Lista parkinga</h3>
      <div style={{ display: "flex", gap: "8px" }}>
        <select
          value={filterZona ?? ""}
          onChange={(e) => setFilterZona(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Sve zone</option>
          <option value="1">Zona 1</option>
          <option value="2">Zona 2</option>
          <option value="3">Zona 3</option>
          <option value="4">Zona 4</option>
        </select>

        <select
          value={filterMjesta ?? ""}
          onChange={(e) => setFilterMjesta(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Bilo koliko mjesta</option>
          <option value="1">Više od 0</option>
          <option value="5">Više od 5</option>
          <option value="10">Više od 10</option>
        </select>
      </div>
    </div>

    {[...markers]
      .filter(marker => {
        if (filterZona !== null && marker.zona !== filterZona) return false;
        if (filterMjesta !== null && marker.slobodnaMjesta <= filterMjesta) return false;
        return true;
      })
      .sort((a, b) => {
        if (!userPosition) return 0;
        const distA = getDistance(userPosition[0], userPosition[1], a.lat, a.lon);
        const distB = getDistance(userPosition[0], userPosition[1], b.lat, b.lon);
        return distA - distB;
      })
      .map((marker) => (
        <div key={marker.id} className="parking-item">
          <div
            style={{ color: "#000", cursor: "pointer" }}
            onClick={() => {
              mapRef.current?.closePopup();
              mapRef.current?.setView([marker.lat, marker.lon], 16);
            }}
          >
            <div style={{ fontWeight: "bold" }}>{marker.name}</div>
            <div style={{ fontSize: "13px", color: "#444" }}>
              Zona: {marker.zona} | Slobodna mjesta: {marker.slobodnaMjesta}
            </div>
          </div>
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