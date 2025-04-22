import React, { useState } from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  setTileLayerUrl: (url: string) => void;
  toggleSatelliteView: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setTileLayerUrl,
  toggleSatelliteView,
}) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleMode = () => {
    const darkUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    const lightUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    setTileLayerUrl(darkMode ? lightUrl : darkUrl);
    setDarkMode(!darkMode);
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <h2>Menu</h2>
      <ul className="menu">
        <li><Link to="/">🏠 Home</Link></li>
        <li><Link to="/team">👥 Team</Link></li>
        <li><Link to="/support">📞 Support</Link></li>
      </ul>

      <div className="tile-options">
        <h3>🗺️ Prikaz karte</h3>

        <div className="toggle-wrapper">
          <span className="map-icon">🌞</span>
          <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={toggleMode} />
            <span className="slider round"></span>
          </label>
          <span className="map-icon">🌙</span>
        </div>

        <button onClick={toggleSatelliteView}>
          🛰️ Satelitski
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
