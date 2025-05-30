import React from "react";
import "../../styles/MobileSidebar.css";
import { Link } from "react-router-dom";

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {isOpen && <div className="mobile-overlay" onClick={() => setIsOpen(false)}></div>}

      <div className={`mobile-sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="mobile-sidebar-title">📘 Menu</h2>
        <ul className="mobile-menu">
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>
              🏠 <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/team" onClick={() => setIsOpen(false)}>
              👥 <span>Team</span>
            </Link>
          </li>
          <li>
            <Link to="/support" onClick={() => setIsOpen(false)}>
              📞 <span>Support</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default MobileSidebar;
