import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "../../styles/MobileMapComponent.css";
import SearchBar from "../search/MobileSearchBar";
import MobileSidebar from "../sidebar/MobileSidebar";
import ZoneIcons from "./ZoneIcons";
import MobileParkingList from "./MobileParkingList";
import NavigationInstruction from "./NavigationInstruction";
import SearchResultMarker from "./SearchResultMarker";
import MapResizer from "./MapResizer";
import { setupRouting } from "../../utils/CostumRouting";

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

const zoneLabels: Record<number, string> = {
  1: "Zona 1",
  2: "Zona 2",
  3: "Zona 3",
  4: "Zona 4",
  5: "Garaža",
  6: "Privatan parking",
  7: "Javni pakring"
};

interface MarkerData {
  id: number;
  lat: number;
  lon: number;
  name: string;
  zona: number;
  slobodnaMjesta: number;
}

const MobileMapComponent: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [searchResult, setSearchResult] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [routeTarget, setRouteTarget] = useState<[number, number] | null>(null);
  const [currentInstruction, setCurrentInstruction] = useState<string | null>(null);
  const [filterZona, setFilterZona] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [travelDistance, setTravelDistance] = useState<number | null>(null);
  const [tileStyle, setTileStyle] = useState<keyof typeof tileLayers>("osm");
  const markerRefs = useRef<Record<number, L.Marker>>({});
  const routingControlRef = useRef<any>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("favoriti");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Gre\u0161ka pri u\u010ditavanju favorita:", e);
      return [];
    }
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleChangeMapStyle = () => {
    if (tileStyle === "osm") setTileStyle("satellite");
    else if (tileStyle === "satellite") setTileStyle("dark");
    else setTileStyle("osm");
  };

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
        console.error("Gre\u0161ka pri dohva\u0107anju lokacije:", err);
        setUserPosition(defaultPosition);
      }
    );
  }, []);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.error("Gre\u0161ka pri pra\u0107enju lokacije:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (mapRef.current && userPosition) {
      setupRouting({
        map: mapRef.current,
        userPosition,
        routingControlRef,
        setTravelTime,
        setTravelDistance,
        setCurrentInstruction
      });
    }
  }, [userPosition]);
  

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const res = await fetch("https://parkfind-backend.onrender.com/api/parking");
        const data = await res.json();
        const parsed = data.map((item: any) => ({
  id: item.id,
  lat: item.lat,
  lon: item.lon,
  name: item.name,
  zona: item.zona,
  slobodnaMjesta: item.slobodnaMjesta ?? item.slobodnamjesta ?? 0,
}));
setMarkers(parsed);
      } catch (error) {
        console.error("Greska pri ucitavanju parkinga:", error);
      }
    };

    fetchMarkers();
    const interval = setInterval(fetchMarkers, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("favoriti", JSON.stringify(favorites));
    } catch (e) {
      console.error("Gre\u0161ka pri spremanju favorita:", e);
    }
  }, [favorites]);

  if (!userPosition) {
    return (
      <div className="loading-screen">
        <img src="/spinner.png" alt="Učitavanje..." className="spinner" />
        <p style={{ marginTop: "16px", fontSize: "16px", color: "#333", fontWeight: 500 }}>
          Učitavanje karte...
        </p>
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
    className={`center-user-button ${isFullscreen ? 'center-fullscreen' : 'center-above-list'}`}
    onClick={() => {
      const offsetLat = userPosition[0] - 0.0012;
      mapRef.current?.setView([offsetLat, userPosition[1]], 16, { animate: true });

      mapRef.current?.closePopup();
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
                  iconUrl: "/user.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41],
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
  if (showOnlyFavorites && !favorites.includes(marker.id)) return false;
  if (searchText && !marker.name.toLowerCase().includes(searchText.toLowerCase())) return false;
  return true;
})
  .map((marker) => (
    <Marker
  key={marker.id}
  position={[marker.lat, marker.lon]}
  icon={ZoneIcons[marker.zona]}
  ref={(ref) => {
    if (ref) markerRefs.current[marker.id] = ref;
  }}
>

      <Popup>
        {marker.name}<br />
        {zoneLabels[marker.zona] || `Nepoznata zona (${marker.zona})`}<br />
        Slobodna mjesta: {marker.slobodnaMjesta}<br />
        <button
          className="popup-navigate-button"
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
          <img src="/directiongo2.png" alt="go" style={{ width: "18px", height: "18px" }} />
          Započni navigaciju
        </button>
        <div style={{
  marginTop: "6px",
  display: "flex",
  alignItems: "center",
  gap: "6px"
}}>
  <img
    src="/gmaps.png"
    alt="Google Maps"
    className="google-maps-icon"
  />
  <a
    href={`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lon}&travelmode=driving`}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      fontSize: "14px",
      color: "#2563eb",
      textDecoration: "underline"
    }}
  >
    Otvori u Google Maps
  </a>
</div>
      </Popup>
    </Marker>
))}

{searchResult && (
  <SearchResultMarker
    searchResult={searchResult}
    setIsFullscreen={setIsFullscreen}
    setRouteTarget={setRouteTarget}
    userPosition={userPosition}
    routingControlRef={routingControlRef}
    mapRef={mapRef}
  />
)}
          </MapContainer>

          <SearchBar onSearch={handleSearch} />
          <NavigationInstruction
  instruction={currentInstruction}
  routeTarget={routeTarget}
  markers={markers}
  travelTime={travelTime}
  travelDistance={travelDistance}
/>


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
              if (routingControlRef.current) {
                routingControlRef.current.spliceWaypoints(0, 2);
              }
              
            
              setRouteTarget(null);
              setCurrentInstruction(null);
              setTravelTime(null);
              setTravelDistance(null);
            }}            
          >
            Prekini navigaciju
          </button>
        )}
      </div>

      {!isFullscreen && (
        <MobileParkingList
          markers={markers}
          userPosition={userPosition}
          filterZona={filterZona}
          showOnlyFavorites={showOnlyFavorites}
          searchText={searchText}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          mapRef={mapRef}
          markerRefs={markerRefs}
          setIsFullscreen={setIsFullscreen}
          setRouteTarget={setRouteTarget}
          routingControlRef={routingControlRef}
          setFilterZona={setFilterZona}
          setShowOnlyFavorites={setShowOnlyFavorites}
          setSearchText={setSearchText}
        />
      )}
    </div>
  );
};

export default MobileMapComponent;