import React, { useState } from "react";
import MobileSidebar from "../MobileSidebar";

const Team: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <MobileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>

      <div style={{ padding: "2rem", marginLeft: sidebarOpen ? "200px" : "0" }}>
        <h1>👥 Naš Tim</h1>
        <p>Ovdje dolazi info o timu...</p>
      </div>
    </div>
  );
};

export default Team;
