import React, { useState } from "react";
import MobileSidebar from "../components/sidebar/MobileSidebar";
import "../styles/pageStyles.css";

const MobileTeam: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="page-container">
      <MobileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>

      <div className={`page-content ${sidebarOpen ? "shifted" : ""}`}>
        <h1 className="page-title">ParkFind</h1>
        <p className="page-subtitle">
          Pružamo jednostavniji i lakši pronalazak parkinga. Be ahead, don't waste time!
        </p>

        <div className="support-form">
          <p>Ime: Tin Kunjas</p>
          <p>Uloga: Frontend Developer</p>
          <br />
          <p>Ime: Hrvoje Staniša</p>
          <p>Uloga: Business plan and database manager</p>
          <br />
          <p>Ime: Martino Pranjić</p>
          <p>Uloga: Hardware Specialist</p>
        </div>
      </div>
    </div>
  );
};

export default MobileTeam;
