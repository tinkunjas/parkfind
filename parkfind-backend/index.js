import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Greška prilikom spajanja na bazu:", err);
  } else {
    console.log("Uspješno spojeno na MySQL bazu");
  }
});

// GET svi parkinzi
app.get("/api/parking", (req, res) => {
  const query = "SELECT * FROM parking";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Greška kod SELECT-a:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// POST update slobodnih mjesta
app.post("/api/parking/:id", (req, res) => {
  const id = req.params.id;
  const { slobodnaMjesta } = req.body;

  const query = "UPDATE parking SET slobodnaMjesta = ? WHERE id = ?";
  db.query(query, [slobodnaMjesta, id], (err, result) => {
    if (err) {
      console.error("Greška kod UPDATE-a:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json({ success: true });
    }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend radi na portu ${PORT}`);
});
