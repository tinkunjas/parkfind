import React, { useState } from "react";
import Sidebar from "../Sidebar";
import "./pageStyles.css";

const Team: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="page-container">
      <Sidebar
  isOpen={sidebarOpen}
  setTileLayerUrl={() => {}}
  toggleSatelliteView={() => {}}
/>
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>

      <div className={`page-content ${sidebarOpen ? "shifted" : ""}`}>
        <h1 className="page-title"> ParkFind
        </h1>
        <p className="page-subtitle">
          Pružamo jednostavniji i lakši pronalazak prakinga. Be ahead, don't waste time!
        </p>

        <div className="support-form">
          <p>Ime: Tin Kunjas</p>
          <p>Uloga: Fullstack Developer</p>
          <br />
          <p>Ime: Hrvoje Staniša</p>
          <p>Uloga: Mobile Developer and database manager</p>
          <br />
          <p>Ime: Martino Pranjić</p>
          <p>Uloga: Hardware Specialist</p>
        </div>
      </div>
    </div>
  );
};

export default Team;
