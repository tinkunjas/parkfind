import React from "react";

interface NavigationInstructionProps {
  instruction: string | null;
  routeTarget: [number, number] | null;
  markers: {
    id: number;
    lat: number;
    lon: number;
    name: string;
    zona: number;
    slobodnaMjesta: number;
  }[];
  travelTime: number | null;
  travelDistance: number | null;
}

const NavigationInstruction: React.FC<NavigationInstructionProps> = ({
  instruction,
  routeTarget,
  markers,
  travelTime,
  travelDistance
}) => {
  if (!instruction) return null;

  const slobodnaMjesta = routeTarget
    ? markers.find(m => m.lat === routeTarget[0] && m.lon === routeTarget[1])?.slobodnaMjesta
    : null;

  return (
    <div className="navigation-instruction">
      <p>{instruction}</p>
      {slobodnaMjesta !== null && (
        <div style={{ fontSize: "13px", color: "#333", marginBottom: "4px" }}>
          Slobodna mjesta: {slobodnaMjesta}
        </div>
      )}
      {travelTime !== null && travelDistance !== null && (
        <small style={{ color: "#333" }}>
          {Math.round(travelTime / 60)} min • {(travelDistance / 1000).toFixed(1)} km
        </small>
      )}
    </div>
  );
};

export default NavigationInstruction;
