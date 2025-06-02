import React, { useState } from "react";
import MobileSidebar from "../components/sidebar/MobileSidebar";
import "../styles/pageStyles.css";

const MobileSupportPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [registracija, setRegistracija] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Poruka poslana! Hvala na povratnoj informaciji.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="page-container">
      <MobileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} registracija={registracija} setRegistracija={setRegistracija}/>

      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span className="hamburger-icon">☰</span>
      </button>

      <div className={`page-content ${sidebarOpen ? "shifted" : ""}`}>
        <div className="page-header">
          <h1 className="page-title">Podrška</h1>
          <p className="page-subtitle">
            Imaš pitanje? Pošalji nam poruku putem forme ispod ili doniraj ako želiš podržati razvoj.
          </p>
        </div>

        <form className="support-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Ime:</label>
            <input
              id="name"
              className="support-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Unesi ime"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              className="support-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Unesi email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Poruka:</label>
            <textarea
              id="message"
              className="support-textarea"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tvoja poruka..."
              rows={5}
              required
            />
          </div>

          <button type="submit" className="support-button">
            Pošalji poruku
          </button>
        </form>

        <div className="donation-section">
          <h3 className="donation-title">
            <span className="donation-icon">💙</span> Želiš podržati projekt?
          </h3>
          <p className="donation-description">
            Tvoj doprinos će nam pomoći u daljnjem razvoju i unaprjeđenju aplikacije.
          </p>
          <button className="donation-button">DONIRAJ</button>
        </div>
      </div>
    </div>
  );
};

export default MobileSupportPage;