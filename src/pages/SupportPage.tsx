import React, { useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import "../styles/SupportPage.css";

const SupportPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    alert("Hvala na poruci! Odgovorit ćemo vam u najkraćem mogućem roku.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="support-container">
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

      <div className={`support-content ${sidebarOpen ? "shifted" : ""}`}>
        <div className="support-header">
          <h1 className="support-title">Podrška</h1>
          <p className="support-subtitle">
            Imate pitanje? Pošaljite nam poruku putem obrasca ispod ili donirajte ako želite podržati razvoj.
          </p>
        </div>

        <form className="support-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Ime:</label>
            <input
              id="name"
              className="form-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Unesite svoje ime"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email:</label>
            <input
              id="email"
              className="form-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Unesite svoju email adresu"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message" className="form-label">Poruka:</label>
            <textarea
              id="message"
              className="form-textarea"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Opišite svoj upit ili problem..."
              rows={6}
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Pošalji poruku
          </button>
        </form>

        <div className="donation-section">
          <h3 className="donation-title">
            <span className="donation-icon">💙</span> Želite podržati projekt?
          </h3>
          <p className="donation-description">
            Vaša donacija će nam pomoći u daljnjem razvoju i unaprjeđenju aplikacije.
          </p>
          <button className="donation-button">Podrži projekt</button>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;