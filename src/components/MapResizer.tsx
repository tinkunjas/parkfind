import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapResizerProps {
  trigger: boolean;
}

const MapResizer: React.FC<MapResizerProps> = ({ trigger }) => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [trigger, map]);

  return null;
};

export default MapResizer;
