# ParkFind

*ParkFind* je pametno rješenje koje vozačima prikazuje slobodna parkirna mjesta u realnom vremenu. Cilj aplikacije je olakšati pronalazak parkirnog mjesta pomoću interaktivne karte, filtera, pretrage, označavanja favorita i pametnog prepoznavanja zauzetosti putem kamere.

## 🚀 Funkcionalnosti

- Prikaz karte s lokacijama slobodnih parkirnih mjesta
- Detekcija zauzetosti pomoću ESP32-CAM
- Filtriranje po zoni
- Pretraživanje po nazivu parkinga
- Prikaz udaljenosti do svakog parkinga
- Navigacija do odabranog parkinga (Leaflet Routing)
- Navigacija putem Google Mapsa
- Plaćanje parkinga
- Spremanje i brisanje registracija
- Označavanje omiljenih parkinga
- Tooltip s informacijama na hover (desktop)
- Pretraživanje bilo koje adrese
- Drugačiji prikaz karti
- Slanje mailove i doniranje

## 🔧 Tehnologije

- *Frontend:* React, Vite, Leaflet
- *Backend:* Node.js, Express
- *Baza podataka:* Postgresql, Neon
- *Hardware:* ESP32-CAM (detekcija pomoću boje / grayscale analize)
- *Deploy:* 
  - Frontend: [Vercel](https://vercel.com/)
  - Backend: [Render](https://render.com/)

## 🛠 Instalacija i pokretanje

### Frontend (React aplikacija)

1. Kloniraj repozitorij:
   bash
   git clone https://github.com/tinkunjas/parkfind.git
   cd parkfind
   

2. Instaliraj ovisnosti:
   bash
   npm install
   

3. Pokreni razvojni server:
   bash
   npm run dev
   

> Aplikacija će biti dostupna na http://localhost:5173/.

---

### Backend (Express API)

1. Uđi u backend direktorij:
   bash
   cd parkfind-backend
   

2. Napravi .env datoteku s podacima baze:
   env
   Host: sql7.freesqldatabase.com
   Database name: sql7776146
   Database user: sql7776146
   Database password: u9fw2eJFX5
   Port number: 3306
   

3. Instaliraj ovisnosti:
   bash
   npm install
   

4. Pokreni server:
   bash
   node index.js
   

> API će biti dostupan na http://localhost:3001/.

---

### ESP32-CAM

- Kod se nalazi u hardware/ direktoriju
- Kamera koristi JPEG format za inicijalnu konfiguraciju parkirališta, zatim grayscale format za detekciju
- HTTP GET zahtjevi šalju broj slobodnih mjesta backendu svakih nekoliko sekundi
- Debug informacije se ispisuju putem Serial.print()

---

## 🖼 Prikaz aplikacije

https://drive.google.com/file/d/1A7kyVx5HGcWx5_VR6CW4Txyom3rawuBe/view?usp=drivesdk

## 📁 Struktura projekta


parkfind/
├── public/             → statički sadržaj
├── src/                → frontend (React)
├── parkfind-backend/   → Node.js API
├── hardware/           → ESP32-CAM kod
├── index.html
├── vite.config.ts
└── README.md


---

## 👥 Autori

- *Tin Kunjas* – Frontend (React, dizajn, funkcionalnosti)
- *Martino Pranjić* – Hardware (ESP32, kamera, prepoznavanje)
- *Hrvoje Staniša* – baza podataka, poslovni plan

---

## 📬 Kontakt

- Parkfind tim email:
- parkfind.team@gmail.com

---