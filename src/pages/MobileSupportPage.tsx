import React, { useState } from "react";
import MobileSidebar from "../components/sidebar/MobileSidebar";
import "../styles/pageStyles.css";

const MobileSupportPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="page-container">
      <MobileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>

      <div className={`page-content ${sidebarOpen ? "shifted" : ""}`}>
        <h1 className="page-title"> Podrška </h1>
        <p className="page-subtitle">
          Imaš pitanje? Pošalji nam poruku putem forme ispod ili doniraj ako želiš podržati razvoj.
        </p>

        <div className="support-form">
          <label>Ime:</label>
          <input className="support-input" type="text" placeholder="Unesi ime" />

          <label>Email:</label>
          <input className="support-input" type="email" placeholder="Unesi email" />

          <label>Poruka:</label>
          <textarea className="support-textarea" placeholder="Tvoja poruka..." />

          <button className="support-button">Pošalji</button>
        </div>

        <div className="donation-section">
          <p>💰 <strong>Želiš podržati projekt?</strong></p>
          <button className="donation-button">DONIRAJ!</button>
        </div>
      </div>
    </div>
  );
};

export default MobileSupportPage;
