import React from "react";
import "./Filter.css";

interface FilterProps {
  selectedZone: number | null;
  setSelectedZone: (zone: number | null) => void;
}

const Filter: React.FC<FilterProps> = ({ selectedZone, setSelectedZone }) => {
  const zones = [
    { id: 1, label: "Prva zona" },
    { id: 2, label: "Druga zona" },
    { id: 3, label: "Treca zona" },
    { id: 4, label: "Cetvrta zona" },
  ];

  return (
    <div className="filter-container">
      <h3>Filtriraj po zoni</h3>
      <div className="zone-buttons">
        {zones.map((zone) => (
          <button
          key={zone.id}
          className={`zone-button zone-${zone.id} ${selectedZone === zone.id ? "active" : ""}`}
          onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
        >
          {zone.label}
        </button>        
        ))}
      </div>
    </div>
  );
};

export default Filter;
