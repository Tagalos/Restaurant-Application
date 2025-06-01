require("dotenv").config();
const express  = require("express");
const bcrypt   = require("bcrypt");
const jwt      = require("jsonwebtoken");
const db       = require("../config/database"); 

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Όλα τα πεδία απαιτούνται." });
  }

  let conn;
  try {
    conn = await db.getConnection();
    const [existing] = await conn.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing) {
      return res.status(409).json({ message: "Ο χρήστης υπάρχει ήδη." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await conn.query(
      "INSERT INTO users(name, email, password) VALUES(?, ?, ?)",
      [name, email, hashed]
    );

    const newUserId = result.insertId.toString();

    res.status(201).json({
      id: newUserId,
      name,
      email
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email & password απαιτούνται." });
  }

  let conn;
  try {
    conn = await db.getConnection();
    const [user] = await conn.query(
      "SELECT id, name, password FROM users WHERE email = ?",
      [email]
    );
    if (!user) {
      return res.status(401).json({ message: "Λάθος credentials." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Λάθος credentials." });
    }
    const payload = { id: user.id.toString(), name: user.name, email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h"
    });

    res.json({ token, expiresIn: "2h" });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;