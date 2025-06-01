import React, { useState } from "react";
import MobileSidebar from "../components/sidebar/MobileSidebar";
import "../styles/pageStyles.css";

interface TeamMember {
  name: string;
  role: string;
  description?: string;
}

const MobileTeam: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const teamMembers: TeamMember[] = [
    {
      name: "Tin Kunjas",
      role: "Frontend Developer",
      description: "Zadužen za razvoj korisničkog sučelja i UX/UI dizajn"
    },
    {
      name: "Hrvoje Staniša",
      role: "Business plan and database manager",
      description: "Zadužen za poslovni plan i upravljanje bazom podataka"
    },
    {
      name: "Martino Pranjić",
      role: "Hardware Specialist",
      description: "Zadužen za hardverske komponente i funkcionalnost"
    }
  ];

  return (
    <div className="page-container">
      <MobileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span className="hamburger-icon">☰</span>
      </button>

      <div className={`page-content ${sidebarOpen ? "shifted" : ""}`}>
        <div className="page-header">
          <h1 className="page-title">ParkFind Tim</h1>
          <p className="page-subtitle">
            Pružamo jednostavniji i lakši pronalazak parkinga. Be ahead, don't waste time!
          </p>
        </div>

        <div className="team-members">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member-card">
              <h3 className="member-name">{member.name}</h3>
              <p className="member-role">{member.role}</p>
              {member.description && (
                <p className="member-description">{member.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileTeam;