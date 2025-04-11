import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface Props {
  lat: number;
  lon: number;
  name?: string;
}

const MobileSearchHandler: React.FC<Props> = ({ lat, lon, name }) => {
  const map = useMap();

  useEffect(() => {
    const target = [lat, lon] as [number, number];
    map.setView(target, 15);
    const marker = L.marker(target).addTo(map);
    if (name) marker.bindPopup(name).openPopup();

    const timeout = setTimeout(() => {
      map.removeLayer(marker);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [lat, lon, name, map]);

  return null;
};

export default MobileSearchHandler;
