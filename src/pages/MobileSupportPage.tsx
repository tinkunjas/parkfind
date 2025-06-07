import React, { useState } from "react";
import MobileSidebar from "../components/sidebar/MobileSidebar";
import "../styles/pageStyles.css";
import emailjs from "@emailjs/browser";

const MobileSupportPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [registracija, setRegistracija] = useState<string>("");
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

      await emailjs.send(
        "service_aj584wv",
        "template_3ksr87c",
        templateParams,
        "HPFCxB0_k1942qsww"
      );

      setSendStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      console.error("Email sending failed:", error);
      setSendStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  const handleDonate = () => {
    window.open("https://www.paypal.com/paypalme/parkfind", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="page-container">
      <MobileSidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        registracija={registracija} 
        setRegistracija={setRegistracija}
      />

      <button 
        className="hamburger" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <span className="hamburger-icon">☰</span>
      </button>

      <div className={`page-content ${sidebarOpen ? "shifted" : ""}`}>
        <div className="page-header">
          <h1 className="page-title">Podrška</h1>
          <p className="page-subtitle">
            Imaš pitanje? Pošalji nam poruku putem obrasca ispod ili doniraj kako bi podržao razvoj.
          </p>
        </div>

        {sendStatus === "success" && (
          <div className="alert alert-success">
            Poruka je uspješno poslana! Odgovorit ćemo u najkraćem mogućem roku.
          </div>
        )}

        {sendStatus === "error" && (
          <div className="alert alert-error">
            Došlo je do greške pri slanju. Pokušaj ponovno kasnije.
          </div>
        )}

        <form className="support-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Ime:</label>
            <input
              id="name"
              className="support-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Unesi svoje ime"
              required
              disabled={isSending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email:</label>
            <input
              id="email"
              className="support-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Unesi svoju email adresu"
              required
              disabled={isSending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message" className="form-label">Poruka:</label>
            <textarea
              id="message"
              className="support-textarea"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Opiši svoj upit ili problem..."
              rows={5}
              required
              disabled={isSending}
            />
          </div>

          <button 
            type="submit" 
            className="support-button"
            disabled={isSending}
          >
            {isSending ? "Šaljem..." : "Pošalji poruku"}
          </button>
        </form>

        <div className="donation-section">
          <h3 className="donation-title">
            <span className="donation-icon">💙</span> Želiš podržati projekt?
          </h3>
          <p className="donation-description">
            Tvoja donacija nam pomaže u daljnjem razvoju i održavanju aplikacije.
          </p>
          <button 
            className="donation-button"
            onClick={handleDonate}
            aria-label="Doniraj putem PayPal-a"
          >
            DONIRAJ
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSupportPage;