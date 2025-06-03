import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface MapMoverProps {
  lat: number;
  lon: number;
  name?: string;
}

const MapMover: React.FC<MapMoverProps> = ({ lat, lon, name }) => {
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
        <a class="google-maps-button" 
           href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving" 
           target="_blank" rel="noopener noreferrer">
          <img src="/gmaps.png" alt="Google Maps" />
          <span>Otvori u Google Maps</span>
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

export default MapMover;
