const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`REQUEST: ${req.method} ${req.originalUrl}`);
  console.log("Body:", req.body);
  next();
});

const db = require("./config/database.js");
db.getConnection()
  .then((conn) => {
    console.log("Η βάση MariaDB συνδέθηκε με επιτυχία!");
    conn.release();
  })
  .catch((err) => {
    console.error("Σφάλμα σύνδεσης με τη βάση MariaDB:", err);
  });

const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

const restaurantRoutes = require("./routes/restaurants");
app.use("/api/restaurants", restaurantRoutes);

const reservationRoutes = require("./routes/reservations");
app.use("/api/reservations", reservationRoutes);

app.get("/", (req, res) => {
  res.send("Το backend λειτουργεί σωστά!");
});

app.use((req, res) => {
  res.status(404).json({ message: "Διαδρομή δεν βρέθηκε" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Ο server τρέχει στη θύρα ${PORT}`);
});
