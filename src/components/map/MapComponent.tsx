import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  Tooltip,
} from "react-leaflet";
import SearchBar from "../search/SearchBar";
import Sidebar from "../sidebar/Sidebar";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ParkingList from "./ParkingList";
import MapMover from "./MapMover";
import ZoneIcons from "./ZoneIcons";
import { debounce } from "lodash";

const defaultPosition: [number, number] = [45.815399, 15.966568];

const croatiaBounds: [[number, number], [number, number]] = [
  [42.3, 13.3],
  [46.6, 19.5],
];

const zoneLabels: Record<number, string> = {
  1: "Zona 1",
  2: "Zona 2",
  3: "Zona 3",
  4: "Zona 4",
  5: "Garaža",
  6: "Privatan parking",
  7: "Javni parking",
};

const userIcon = new L.Icon({
  iconUrl: "/user.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MarkerData {
  id: number;
  position: [number, number];
  popupText: string;
  zona: number;
  slobodnaMjesta: number;
}

const MapComponent: React.FC = () => {
  const lightUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const satelliteUrl =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  const [tileLayerUrl, setTileLayerUrl] = useState<string>(satelliteUrl);
  const [previousTileLayer, setPreviousTileLayer] = useState<string>(lightUrl);
  const [isSatellite, setIsSatellite] = useState<boolean>(true);
  const [searchResult, setSearchResult] = useState<
    { lat: number; lon: number; name?: string } | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const lastOpenedPopupRef = useRef<L.Popup | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const isMovingRef = useRef(false);

  const markerRefs = useRef<Record<number, L.Marker>>({});

  const handleMarkerClick = debounce((marker: MarkerData) => {
    try {
      if (!mapRef.current) return;
      if (isMovingRef.current) return;

      isMovingRef.current = true;
      mapRef.current.closePopup();

      const markerInstance = markerRefs.current[marker.id];
      if (markerInstance) {
        markerInstance.openPopup();
      }
      isMovingRef.current = false;
    } catch (error) {
      console.error("Greška pri kliku na parking:", error);
      isMovingRef.current = false;
    }
  }, 300);

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("favoriti");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Greska pri ucitavanju favorita:", e);
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
      const response = await fetch(
        "https://parkfind-backend.onrender.com/api/parking"
      );
      const data = await response.json();
      const parsed = data.map((item: any) => ({
        id: item.id,
        position: [item.lat, item.lon] as [number, number],
        popupText: item.name,
        zona: item.zona,
        slobodnaMjesta: item.slobodnaMjesta ?? item.slobodnamjesta ?? 0,
      }));
      setMarkers(parsed);
    } catch (error) {
      console.error("Greska pri ucitavanju datoteke:", error);
    }
  };

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      (error) => {
        console.error("Greska pri dohvacanju lokacije:", error);
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

  const filtriraniMarkeri = markers.filter(
    (m) =>
      (selectedZone ? m.zona === selectedZone : true) &&
      (!showOnlyFavorites || favorites.includes(m.id)) &&
      (!searchText || m.popupText.toLowerCase().includes(searchText.toLowerCase()))
  );

  useEffect(() => {
    try {
      localStorage.setItem("favoriti", JSON.stringify(favorites));
    } catch (e) {
      console.error("Greska pri spremanju favorita:", e);
    }
  }, [favorites]);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <SearchBar onSearch={handleSearch} />

      <ParkingList
        markers={markers}
        userPosition={userPosition}
        searchText={searchText}
        setSearchText={setSearchText}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        showOnlyFavorites={showOnlyFavorites}
        setShowOnlyFavorites={setShowOnlyFavorites}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        mapRef={mapRef}
        markerRefs={markerRefs}
      />

      <Sidebar
        isOpen={sidebarOpen}
        setTileLayerUrl={(url: string) => {
          setTileLayerUrl(url);
          setPreviousTileLayer(url);
          setIsSatellite(false);
        }}
        toggleSatelliteView={toggleSatelliteView}
      />

      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>

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
            position: "fixed",
            bottom: "100px",
            left: "12px",
            zIndex: 2000,
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
            padding: 0
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
          <img src="/center.png" alt="Centar" style={{ width: "22px", height: "22px" }} />
        </button>

        {filtriraniMarkeri.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={ZoneIcons[marker.zona]}
            ref={(ref) => {
              if (ref) markerRefs.current[marker.id] = ref;
              else delete markerRefs.current[marker.id];
            }}
            eventHandlers={{
              click: () => {
                handleMarkerClick(marker);
              },
              popupopen: (e) => {
                if (
                  lastOpenedPopupRef.current &&
                  lastOpenedPopupRef.current !== e.popup
                ) {
                  lastOpenedPopupRef.current.close();
                }
                lastOpenedPopupRef.current = e.popup;
              },
            }}
          >
            <Popup maxWidth={250}>
              <div style={{ fontSize: "14px" }}>
                {marker.popupText}
                <br />
                {zoneLabels[marker.zona] || `Nepoznata zona (${marker.zona})`}
                <br />
                Slobodna mjesta: {marker.slobodnaMjesta}
                <br />
               <a
  className="google-maps-button"
  href={`https://www.google.com/maps/dir/?api=1&destination=${marker.position[0]},${marker.position[1]}&travelmode=driving`}
  target="_blank"
  rel="noopener noreferrer"
>
  <img src="/gmaps.png" alt="Google Maps" />
  <span>Otvori u Google Maps</span>
</a>
              </div>
            </Popup>

            <Tooltip direction="top" offset={[0, -20]} opacity={0.9} permanent={false}>
              {marker.popupText}
            </Tooltip>
          </Marker>
        ))}

        {searchResult && (
          <MapMover
            lat={searchResult.lat}
            lon={searchResult.lon}
            name={searchResult.name}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
