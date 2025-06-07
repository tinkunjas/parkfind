import React, { useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import "../styles/SupportPage.css";
import emailjs from "@emailjs/browser";

const SupportPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      alert("Molimo popunite sva polja!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Unesite ispravnu email adresu.");
      return;
    }

    setIsSending(true);
    setSendStatus("idle");

    try {
      const templateParams = {
        to_email: "parkfind.team@gmail.com",
        user_name: formData.name,
        user_email: formData.email,
        message: formData.message,
        reply_to: formData.email
      };

      console.log("Sending email with params:", templateParams);

      await emailjs.send(
        "service_aj584wv",
        "template_3ksr87c",
        templateParams,
        "HPFCxB0_k1942qsww"
      );

      setSendStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      console.error("Email sending failed:", {
        status: error?.status,
        text: error?.text,
        message: error?.message
      });
      setSendStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  const handleDonate = () => {
    window.open("https://www.paypal.com/paypalme/parkfind", "_blank", "noopener,noreferrer");
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
            Imate pitanje? Pošaljite nam poruku putem obrasca ispod ili donirajte kako biste podržali razvoj.
          </p>
        </div>

        {sendStatus === "success" && (
          <div className="alert alert-success">
            Poruka je uspješno poslana! Odgovorit ćemo u najkraćem mogućem roku.
          </div>
        )}

        {sendStatus === "error" && (
          <div className="alert alert-error">
            Došlo je do greške pri slanju. Pokušajte ponovno kasnije.
          </div>
        )}

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
              disabled={isSending}
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
              disabled={isSending}
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
              disabled={isSending}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSending}
          >
            {isSending ? "Šaljem..." : "Pošalji poruku"}
          </button>
        </form>

        <div className="donation-section">
          <h3 className="donation-title">
            <span className="donation-icon">💙</span> Želite podržati projekt?
          </h3>
          <p className="donation-description">
            Vaša donacija nam pomaže u daljnjem razvoju i održavanju aplikacije.
          </p>
          <button 
            className="donation-button"
            onClick={handleDonate}
            aria-label="Donirajte putem PayPal-a"
          >
            DONIRAJ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;