import React, { useState, useEffect } from "react";
import "../../styles/MobileSidebar.css";
import { Link } from "react-router-dom";

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  registracija: string;
  setRegistracija: (reg: string) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  setIsOpen,
  registracija,
  setRegistracija
}) => {
  const [savedRegistracije, setSavedRegistracije] = useState<string[]>([]);
  const [newRegistracija, setNewRegistracija] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("registracije");
      if (stored) setSavedRegistracije(JSON.parse(stored));
    } catch (e) {
      console.error("Greška pri parsiranju registracija iz localStorage:", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("registracije", JSON.stringify(savedRegistracije));
  }, [savedRegistracije]);

  const handleSave = () => {
    const reg = newRegistracija.trim().toUpperCase();

    if (reg === "") {
      alert("Unesite registraciju prije spremanja.");
      return;
    }

    if (!/^[A-Z0-9\-]+$/.test(reg)) {
      alert("Registracija smije sadržavati samo slova, brojeve i crtice.");
      return;
    }

    if (savedRegistracije.includes(reg)) {
      alert("Registracija već postoji.");
      return;
    }

    const updated = [reg, ...savedRegistracije].slice(0, 5);
    setSavedRegistracije(updated);
    setRegistracija(reg);
    setNewRegistracija("");
    alert(`Registracija spremljena: ${reg}`);
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (!registracija) {
      alert("Odaberite registraciju za brisanje.");
      return;
    }

    const updated = savedRegistracije.filter((reg) => reg !== registracija);
    setSavedRegistracije(updated);
    setRegistracija("");
    alert("Registracija je obrisana.");
  };

  return (
    <>
      {isOpen && <div className="mobile-overlay" onClick={() => setIsOpen(false)}></div>}

      <div className={`mobile-sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="mobile-sidebar-title">📘 Menu</h2>
        <ul className="mobile-menu">
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>🏠 <span>Home</span></Link>
          </li>
          <li>
            <Link to="/team" onClick={() => setIsOpen(false)}>👥 <span>Team</span></Link>
          </li>
          <li>
            <Link to="/support" onClick={() => setIsOpen(false)}>📞 <span>Support</span></Link>
          </li>
          <li>
            <select
              className="mobile-registration-select"
              value={registracija}
              onChange={(e) => setRegistracija(e.target.value)}
            >
              <option value="">Odaberi registraciju:</option>
              {savedRegistracije.map((reg) => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Dodaj registraciju"
              className="mobile-registration-input"
              value={newRegistracija}
              onChange={(e) => setNewRegistracija(e.target.value.toUpperCase())}
              maxLength={10}
            />

            <button className="mobile-registration-submit" onClick={handleSave}>
              ✅ Spremi registraciju
            </button>
            <button className="mobile-registration-delete" onClick={handleDelete}>
              ❌ Obriši registraciju
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default MobileSidebar;
