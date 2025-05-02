import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ZoomControl,
  Tooltip,
} from "react-leaflet";
import SearchBar from "./SearchBar";
import Sidebar from "./Sidebar";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const defaultPosition: [number, number] = [45.815399, 15.966568];

const croatiaBounds: [[number, number], [number, number]] = [
  [42.3, 13.3],
  [46.6, 19.5],
];

const userIcon = new L.Icon({
  iconUrl: "/user.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const MapMover = ({ lat, lon, name }: { lat: number; lon: number; name?: string }) => {
  const map = useMap();

  useEffect(() => {
    const target = [lat, lon] as [number, number];

    const customIcon = new L.Icon({
      iconUrl: "/marker.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    map.setView(target, 15);

    const marker = L.marker(target, { icon: customIcon }).addTo(map);

    const popupContent = document.createElement("div");
    popupContent.style.fontSize = "14px";

    popupContent.innerHTML = `
      <div>
        ${name?.length ? name.length > 60 ? name.substring(0, 60) + "..." : name : "Odabrana lokacija"}
        <br/>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving" 
           target="_blank" rel="noopener noreferrer" 
           style="display: flex; align-items: center; gap: 6px; text-decoration: none; margin-top: 8px; color: #2563eb;">
          <img src="/gmaps.png" alt="gmaps" class="google-maps-icon" />
          Otvori u Google Maps
        </a>
      </div>
    `;

    marker.bindPopup(popupContent).openPopup();

    return () => {
      map.removeLayer(marker);
    };
  }, [lat, lon, name, map]);

  return null;
};


interface MarkerData {
  id: number;
  position: [number, number];
  popupText: string;
  zona: number;
  slobodnaMjesta: number;
}

const zoneIcons: Record<number, L.Icon> = {
  1: new L.Icon({
    iconUrl: "/1.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  2: new L.Icon({
    iconUrl: "/2.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  3: new L.Icon({
    iconUrl: "/3.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  4: new L.Icon({
    iconUrl: "/4.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

const MapComponent: React.FC = () => {
  const lightUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const satelliteUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  const [tileLayerUrl, setTileLayerUrl] = useState<string>(satelliteUrl);
  const [previousTileLayer, setPreviousTileLayer] = useState<string>(lightUrl);
  const [isSatellite, setIsSatellite] = useState<boolean>(true);
  const [searchResult, setSearchResult] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [searchText, setSearchText] = useState("");
  const lastOpenedPopupRef = useRef<L.Popup | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  const markerRefs = useRef<Record<number, L.Marker>>({});
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("favoriti");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Greška pri učitavanju favorita:", e);
      return [];
    }
  });
  

const toggleFavorite = (id: number) => {
  setFavorites((prev) =>
    prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
  );
};


  const fetchMarkers = async () => {
    try {
      const response = await fetch("https://parkfind-backend.onrender.com/api/parking");
const data = await response.json();
const parsed = data.map((item: any) => ({
  id: item.id,
  position: [item.lat, item.lon],
  popupText: item.name,
  zona: item.zona,
  slobodnaMjesta: item.slobodnaMjesta,
}));
setMarkers(parsed);
    } catch (error) {
      console.error("Greška pri učitavanju datoteke:", error);
    }
  };

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Greška pri dohvaćanju lokacije:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );
  
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    fetchMarkers();
    const interval = setInterval(fetchMarkers, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (lat: number, lon: number, name?: string) => {
    setSearchResult({ lat, lon, name });
  };

  const toggleSatelliteView = () => {
    if (isSatellite) {
      setTileLayerUrl(previousTileLayer);
      setIsSatellite(false);
    } else {
      setPreviousTileLayer(tileLayerUrl);
      setTileLayerUrl(satelliteUrl);
      setIsSatellite(true);
    }
  };

  const filtriraniMarkeri = markers.filter((m) =>
    (selectedZone ? m.zona === selectedZone : true) &&
    (!showOnlyFavorites || favorites.includes(m.id)) &&
    (!searchText || m.popupText.toLowerCase().includes(searchText.toLowerCase()))
  );

  useEffect(() => {
    try {
      localStorage.setItem("favoriti", JSON.stringify(favorites));
    } catch (e) {
      console.error("Greška pri spremanju favorita:", e);
    }
  }, [favorites]);
  

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <SearchBar onSearch={handleSearch} />

      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "10px",
          width: "300px",
          maxHeight: "70vh",
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
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '10px 6px',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    flex: 1
  }}
          >
            <option value="">Sve zone</option>
            <option value="1">Zona 1</option>
            <option value="2">Zona 2</option>
            <option value="3">Zona 3</option>
            <option value="4">Zona 4</option>
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
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              backgroundSize: '10px 6px',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              flex: 1
            }}
          >
          <option value="">Svi parkinzi</option>
          <option value="favorites">Favoriti ❤️</option>
          </select>
        </div>

        {[...filtriraniMarkeri]
  .sort((a, b) => {
    if (!userPosition) return 0;
    const distA = getDistance(userPosition[0], userPosition[1], a.position[0], a.position[1]);
    const distB = getDistance(userPosition[0], userPosition[1], b.position[0], b.position[1]);
    return distA - distB;
  })
  .map((marker) => (

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
      Zona: {marker.zona} | Slobodna mjesta: {marker.slobodnaMjesta}
    </div>

    {userPosition && (
      <div style={{ fontSize: "13px", color: "#444" }}>
        {(getDistance(userPosition[0], userPosition[1], marker.position[0], marker.position[1]) / 1000).toFixed(2)} km udaljeno
      </div>
    )}
  </div>
))}

      </div>

      <Sidebar
        isOpen={sidebarOpen}
        setTileLayerUrl={(url: string) => {
          setTileLayerUrl(url);
          setPreviousTileLayer(url);
          setIsSatellite(false);
        }}
        toggleSatelliteView={toggleSatelliteView}
      />

      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

      <MapContainer
        center={defaultPosition}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        maxBounds={croatiaBounds}
        maxBoundsViscosity={1.0}
        minZoom={8}
        zoomControl={false}
        ref={(mapInstance) => {
          if (mapInstance) mapRef.current = mapInstance;
        }}
      >
        <ZoomControl position="bottomleft" />

        <TileLayer
          url={tileLayerUrl}
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> / <a href="https://www.openstreetmap.org/">OSM</a> / <a href="https://carto.com/">CARTO</a>'
        />

{userPosition && (
  <Marker position={userPosition} icon={userIcon}>
    <Popup>Tvoja lokacija</Popup>
  </Marker>
)}
{!userPosition && (
  <Marker position={defaultPosition} icon={userIcon}>
    <Popup>Lokacija nije dostupna</Popup>
  </Marker>
)}


        <button
          style={{
            position: "absolute",
    bottom: "100px",
    left: "12px",
    zIndex: 1000,
    background: "#fff",
    borderRadius: "50%",
    width: "42px",
    height: "42px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
          }}
          onClick={() => {
            if (userPosition && mapRef.current) {
              mapRef.current.setView(userPosition, 16);
              if (lastOpenedPopupRef.current) {
                lastOpenedPopupRef.current.close();
                lastOpenedPopupRef.current = null;
              }
            }
          }}
        >
          <img src="/center.png" alt="Centar" style={{ width: 22, height: 22 }} />
        </button>

        {filtriraniMarkeri.map((marker) => (
  <Marker
    key={marker.id}
    position={marker.position}
    icon={zoneIcons[marker.zona]}
    title={marker.popupText}
    ref={(ref) => {
      if (ref) markerRefs.current[marker.id] = ref;
    }}
    eventHandlers={{
      popupopen: (e) => {
        if (lastOpenedPopupRef.current && lastOpenedPopupRef.current !== e.popup) {
          lastOpenedPopupRef.current.close();
        }
        lastOpenedPopupRef.current = e.popup;
      },
    }}
  >
    <Popup maxWidth={250}>
  <div style={{ fontSize: "14px" }}>
    {marker.popupText}<br />
    Zona: {marker.zona}<br />
    Slobodna mjesta: {marker.slobodnaMjesta}<br />

    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${marker.position[0]},${marker.position[1]}&travelmode=driving`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        textDecoration: "none",
        marginTop: "8px",
        color: "#2563eb"
      }}
    >
      <img src="/gmaps.png" alt="gmaps" style={{
        width: "18px",
        height: "18px",
        borderRadius: "4px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
        objectFit: "contain"
      }} />
      Otvori u Google Maps
    </a>
  </div>
</Popup>

    <Tooltip direction="top" offset={[0, -20]} opacity={0.9} permanent={false}>
    {marker.popupText}
  </Tooltip>
  </Marker>
))}


        {searchResult && (
          <MapMover lat={searchResult.lat} lon={searchResult.lon} name={searchResult.name} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;