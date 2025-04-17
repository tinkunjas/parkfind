import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ZoomControl,
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

const UserLocationMarker = ({ setUserPosition }: { setUserPosition: (pos: [number, number]) => void }) => {
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Greška pri dohvaćanju lokacije:", error);
      }
    );
  }, [setUserPosition]);

  return null;
};

const MapMover = ({ lat, lon, name }: { lat: number; lon: number; name?: string }) => {
  const map = useMap();

  useEffect(() => {
    const target = [lat, lon] as [number, number];

    const customIcon = new L.Icon({
      iconUrl: "/marker.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    map.setView(target, 15);

    const marker = L.marker(target, { icon: customIcon }).addTo(map);
    if (name) {
      marker.bindPopup(name).openPopup();
    }

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
  const [slobodnaMjestaFilter, setSlobodnaMjestaFilter] = useState<number | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const lastOpenedPopupRef = useRef<L.Popup | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Record<number, L.Marker>>({});

  const fetchMarkers = async () => {
    try {
      const response = await fetch("/parkinzi.txt");
      const text = await response.text();
      const parsed: MarkerData[] = text.trim().split("\n").map((line) => {
        const [id, lat, lon, popupText, zona, slobodnaMjesta] = line.split(";");
        return {
          id: parseInt(id),
          position: [parseFloat(lat), parseFloat(lon)],
          popupText,
          zona: parseInt(zona),
          slobodnaMjesta: parseInt(slobodnaMjesta),
        };
      });
      setMarkers(parsed);
    } catch (error) {
      console.error("Greška pri učitavanju datoteke:", error);
    }
  };

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
    (slobodnaMjestaFilter !== null ? m.slobodnaMjesta > slobodnaMjestaFilter : true)
  );

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

        <div style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>
          <select
            value={selectedZone ?? ""}
            onChange={(e) =>
              setSelectedZone(e.target.value ? Number(e.target.value) : null)
            }
            style={{ flex: 1 }}
          >
            <option value="">Sve zone</option>
            <option value="1">Zona 1</option>
            <option value="2">Zona 2</option>
            <option value="3">Zona 3</option>
            <option value="4">Zona 4</option>
          </select>

          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setSlobodnaMjestaFilter(null);
              } else {
                setSlobodnaMjestaFilter(Number(val));
              }
            }}
            style={{ flex: 1 }}
          >
            <option value="">Slobodna mjesta</option>
            <option value="5">Više od 5</option>
            <option value="10">Više od 10</option>
          </select>
        </div>

        {filtriraniMarkeri.map((marker) => (
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
                map.setView([lat, lon], 16, { animate: true });
                const handleMoveEnd = () => {
                  markerRefs.current[marker.id]?.openPopup();
                  map.off("moveend", handleMoveEnd);
                };
                map.on("moveend", handleMoveEnd);
              }
            }}
          >
            <div style={{ fontWeight: "bold" }}>{marker.popupText}</div>
            <div style={{ fontSize: "13px", color: "#444" }}>
              Zona: {marker.zona} | Slobodna mjesta: {marker.slobodnaMjesta}
            </div>
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

        <UserLocationMarker setUserPosition={setUserPosition} />

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
            <Popup>
              {marker.popupText} <br />
              Zona: {marker.zona} <br />
              Slobodna mjesta: {marker.slobodnaMjesta}
            </Popup>
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