# ParkFind

ParkFind je aplikacija za prikaz slobodnih parkirnih mjesta u stvarnom vremenu. Cilj je olakšati pronalazak parkirnog mjesta pomoću mape, filtera, pretrage i pametnog prepoznavanja putem kamere.

## 🔧 Tehnologije

- **Frontend:** React + Vite + Leaflet
- **Backend:** Express API za upravljanje podacima
- **Hardware:** ESP32-CAM za vizualno prepoznavanje slobodnih mjesta

## 🗂 Struktura projekta

```
parkfind/
├── public/           → statički sadržaj (slike, favicon itd.)
├── src/              → frontend React kod
├── backend/          → backend API kod
├── hardware/         → ESP32 kod za prepoznavanje
├── index.html        → ulazna HTML stranica
├── vite.config.ts    → konfiguracija za Vite
└── README.md         → ovaj dokument
```

## 👥 Autori

- **Tin Kunjas** – Frontend (React, dizajn, funkcionalnosti)
- **Martino Pranjić** – Hardware (ESP32, kamera, hardware)
- **Hrvoje Staniša** – Backend, baza podataka, poslovni plan
