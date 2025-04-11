import React, { useState } from "react";
import MobileSidebar from "../MobileSidebar";

const SupportPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <MobileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>

      <div style={{ padding: "2rem", marginLeft: sidebarOpen ? "200px" : "0" }}>
        <h1>📞 Podrška</h1>
        <p>Kontakt forma, email i ostalo...</p>
      </div>
    </div>
  );
};

export default SupportPage;
