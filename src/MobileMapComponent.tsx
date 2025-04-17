import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
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

const tileLayers = {
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
};



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
  const [travelTime, setTravelTime] = useState<number | null>(null);
const [travelDistance, setTravelDistance] = useState<number | null>(null);
const [tileStyle, setTileStyle] = useState<keyof typeof tileLayers>("osm");
const markerRefs = useRef<Record<number, L.Marker>>({});


const handleChangeMapStyle = () => {
  if (tileStyle === "osm") setTileStyle("satellite");
  else if (tileStyle === "satellite") setTileStyle("dark");
  else setTileStyle("osm");
};

  const routingControlRef = useRef<any>(null);
  const mapRef = useRef<L.Map | null>(null);

  const handleSearch = (lat: number, lon: number, name?: string) => {
    setSearchResult({ lat, lon, name });
    mapRef.current?.setView([lat, lon], 15);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const position: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(position);
        mapRef.current?.setView(position, 15);
      },
      (err) => {
        console.error("Greška pri dohvaćanju lokacije:", err);
        setUserPosition(defaultPosition);
      }
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
    if (!mapRef.current || !userPosition || !routeTarget) return;
  
    if (routingControlRef.current) {
      routingControlRef.current.setWaypoints([
        L.latLng(userPosition[0], userPosition[1]),
        L.latLng(routeTarget[0], routeTarget[1]),
      ]);
    } else {
      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userPosition[0], userPosition[1]),
          L.latLng(routeTarget[0], routeTarget[1]),
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        show: false,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: "#2563eb", weight: 4, opacity: 1 }],
        },
        containerClassName: "custom-routing-container",
      })
        .on("routesfound", function (e: any) {
          const summary = e.routes[0].summary;
          const instructions = e.routes[0].instructions || e.routes[0].segments?.flatMap((seg: any) => seg.steps) || [];
  
          setTravelTime(summary.totalTime);
          setTravelDistance(summary.totalDistance);
  
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
      if (container) container.style.display = "none";
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
const interval = setInterval(fetchMarkers, 3000);
    return () => clearInterval(interval);
  }, []);

    if (!userPosition || markers.length === 0) {
      return (
        <div className="loading-screen">
          <p>Učitavanje karte...</p>
        </div>
      );
    }

  return (
    <div className="mobile-container">
      <MobileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      <button className="layer-style-button" onClick={handleChangeMapStyle}>
      <img src="/layer.png" alt="layer" />
</button>


      <div className={`mobile-map-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="mobile-map">
        {userPosition && (
  <button
    className="center-user-button"
    onClick={() => {
      const offsetLat = userPosition[0] - 0.0012;
      mapRef.current?.setView([offsetLat, userPosition[1]], 16, { animate: true });
    }}
  >
    <img src="/center.png" alt="centar" />
  </button>
)}

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
  url={tileLayers[tileStyle]}
  attribution='&copy; OpenStreetMap contributors'
/>

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
{markers
  .filter(marker => {
    if (filterZona !== null && marker.zona !== filterZona) return false;
    if (filterMjesta !== null && marker.slobodnaMjesta <= filterMjesta) return false;
    return true;
  })
  .map((marker) => (
    <Marker
  key={marker.id}
  position={[marker.lat, marker.lon]}
  icon={zoneIcons[marker.zona]}
  ref={(ref) => {
    if (ref) markerRefs.current[marker.id] = ref;
  }}
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
          
            if (userPosition) {
              const offsetLat = userPosition[0] - 0.0012;
              mapRef.current?.setView([offsetLat, userPosition[1]], 16, { animate: true });
            }
          }}
          
          
        >
          <img src="/directiongo2.png" alt="go" style={{ width: "18px", height: "18px" }} />
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
      <div>
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
          }}
        >
          <img src="/directiongo2.png" alt="go" style={{ width: "22px", height: "22px" }} />
          Započni navigaciju
        </button>
      </div>
    </Popup>
  </Marker>
)}

          </MapContainer>

          <SearchBar onSearch={handleSearch} />
          {currentInstruction && (
  <div className="navigation-instruction">
    <p>{currentInstruction}</p>
    {travelTime !== null && travelDistance !== null && (
      <small style={{ color: "#333" }}>
        {Math.round(travelTime / 60)} min • {(travelDistance / 1000).toFixed(1)} km
      </small>
    )}
  </div>
)}

<button
  className={`fullscreen-toggle ${isFullscreen ? 'fullscreen-active' : 'above-list'}`}
  onClick={() => setIsFullscreen(prev => !prev)}
>
  <img
    src={isFullscreen ? "/arrow-up.png" : "/arrow-down.png"}
    alt="fullscreen toggle"
    style={{ width: "24px", height: "24px" }}
  />
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
        <div
  key={marker.id}
  className="parking-item"
  style={{ cursor: "pointer" }}
  onClick={(e) => {
    // ignoriraj klik ako je kliknut unutar gumba
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
    <div style={{ fontWeight: "bold", color: "#000" }}>{marker.name}</div>
    <div style={{ fontSize: "13px", color: "#444" }}>
      Zona: {marker.zona} | Slobodna mjesta: {marker.slobodnaMjesta}
    </div>
  </div>

  <button
    className="navigate-button"
    onClick={(e) => {
      e.stopPropagation();
      setIsFullscreen(true);
      setRouteTarget([marker.lat, marker.lon]);
      mapRef.current?.closePopup();
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