import { useState, useEffect } from "react";
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
import Filter from "./Filter";

const defaultPosition: [number, number] = [45.815399, 15.966568];

const croatiaBounds: [[number, number], [number, number]] = [
  [42.3, 13.3],
  [46.6, 19.5],
];

const UserLocationMarker = () => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Greška pri dohvaćanju lokacije:", error);
      }
    );
  }, []);

  if (!userPosition) return null;

  return (
    <Marker position={userPosition}>
      <Popup>Tvoja trenutna lokacija</Popup>
    </Marker>
  );
};

const MapMover = ({ lat, lon, name }: { lat: number; lon: number; name?: string }) => {
  const map = useMap();

  useEffect(() => {
    const target = [lat, lon] as [number, number];
    map.setView(target, 15);

    const marker = L.marker(target).addTo(map);
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
    const interval = setInterval(fetchMarkers, 0);
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
    selectedZone ? m.zona === selectedZone : true
  );

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <SearchBar onSearch={handleSearch} />

      <Filter selectedZone={selectedZone} setSelectedZone={setSelectedZone} />

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
      >
        <ZoomControl position="bottomleft" />
        <TileLayer
          url={tileLayerUrl}
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> / <a href="https://www.openstreetmap.org/">OSM</a> / <a href="https://carto.com/">CARTO</a>'
        />

        <UserLocationMarker />

        {filtriraniMarkeri.map((marker) => (
          <Marker key={marker.id} position={marker.position} icon={zoneIcons[marker.zona]}>
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