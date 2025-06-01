import React, { useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import "../styles/TeamPage.css";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  avatar?: string;
}

const Team: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const teamMembers: TeamMember[] = [
    {
      name: "Tin Kunjas",
      role: "Frontend Developer",
      description: "Zadužen za razvoj korisničkog sučelja i UX/UI dizajn",
    },
    {
      name: "Hrvoje Staniša",
      role: "Backend Developer",
      description: "Zadužen za poslovni plan i upravljanje bazom podataka",
    },
    {
      name: "Martino Pranjić",
      role: "Hardware Specialist",
      description: "Zadužen za hardverske komponente i IoT integracije",
    }
  ];

  return (
    <div className="team-container">
      <Sidebar 
        isOpen={sidebarOpen}
        setTileLayerUrl={() => {}}
        toggleSatelliteView={() => {}}
      />

      <button 
        className="hamburger" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <span className="hamburger-icon">☰</span>
      </button>

      <div className={`team-content ${sidebarOpen ? "shifted" : ""}`}>
        <div className="team-header">
          <h1 className="team-title">Naš Tim</h1>
          <p className="team-subtitle">
            Upoznajte naš tim koji stoji iza ParkFind aplikacije
          </p>
        </div>

        <div className="team-members">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member">
              <div className="member-avatar">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="avatar-image" />
                ) : (
                  <div className="avatar-placeholder">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-description">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;