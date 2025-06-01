const express = require("express");
const db = require("../config/database");
const verifyToken = require("../middleware/auth");
const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  const { restaurant_id, reservation_date, reservation_time, people_count } =
    req.body;
  const client_id = req.user.id;
  let conn;

  try {
    conn = await db.getConnection();

    const existing = await conn.query(
      `SELECT reservation_id
         FROM reservations
        WHERE client_id = ?
          AND restaurant_id = ?
          AND reservation_date = ?`,
      [client_id, restaurant_id, reservation_date]
    );
    if (existing.length > 0) {
      conn.release();
      return res.status(409).json({
        message:
          "Έχετε ήδη μία κράτηση σε αυτό το εστιατόριο την ίδια ημερομηνία.",
      });
    }

    await conn.query(
      `INSERT INTO reservations
         (user_id, restaurant_id, reservation_date, reservation_time, people_count)
       VALUES (?, ?, ?, ?, ?)`,
      [
        client_id,
        restaurant_id,
        reservation_date,
        reservation_time,
        people_count,
      ]
    );
    conn.release();
    res.status(201).json({ message: "Κράτηση επιτυχής." });
  } catch (err) {
    console.error("Σφάλμα POST /reservations:", err);
    if (conn) conn.release();
    res.status(500).json({ message: "Εσωτερικό σφάλμα." });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { reservation_date, reservation_time, people_count } = req.body;
  const client_id = req.user.id;
  let conn;

  try {
    conn = await db.getConnection();

    const existingRes = await conn.query(
      `SELECT restaurant_id
         FROM reservations
        WHERE reservation_id = ? AND client_id = ?`,
      [id, client_id]
    );
    if (existingRes.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Κράτηση δεν βρέθηκε ή άδεια." });
    }
    const restaurant_id = existingRes[0].restaurant_id;

    const conflict = await conn.query(
      `SELECT reservation_id
         FROM reservations
        WHERE user_id = ?
          AND restaurant_id = ?
          AND reservation_date = ?
          AND reservation_id <> ?`,
      [user_id, restaurant_id, reservation_date, id]
    );
    if (conflict.length > 0) {
      conn.release();
      return res.status(409).json({
        message:
          "Έχετε ήδη μία άλλη κράτηση σε αυτό το εστιατόριο την ίδια ημερομηνία.",
      });
    }

    const result = await conn.query(`
      UPDATE reservations
      SET reservation_date = ?, reservation_time = ?, people_count = ?
      WHERE reservation_id = ?`,
      [reservation_date, reservation_time, people_count, id, client_id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Κράτηση δεν βρέθηκε ή άδεια." });
    }
    res.json({ message: "Κράτηση ενημερώθηκε." });
  } catch (err) {
    console.error("Σφάλμα PUT /reservations:", err);
    if (conn) conn.release();
    res.status(500).json({ message: "Εσωτερικό σφάλμα." });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const client_id = req.user.id;
  let conn;

  try {
    conn = await db.getConnection();
    const result = await conn.query(
      `DELETE FROM reservations
         WHERE reservation_id = ? AND user_id = ?`,
      [id, client_id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Κράτηση δεν βρέθηκε ή άδεια." });
    }
    res.json({ message: "Κράτηση διαγράφηκε." });
  } catch (err) {
    console.error("Σφάλμα DELETE /reservations:", err);
    if (conn) conn.release();
    res.status(500).json({ message: "Εσωτερικό σφάλμα." });
  }
});

router.get("/user", async (req, res) => {
  try {
    const userId = req.user?.id || 1;

    const sql =`
      SELECT
        r.reservation_id              AS reservation_id,
        r.restaurant_id               AS restaurant_id,
        rt.restaurant_name            AS restaurant_name,
        rt.restaurant_location        AS restaurant_location,
        rt.restaurant_description     AS restaurant_description,
        r.reservation_date,
        r.reservation_time,
        r.people_count
      FROM reservations AS r
      JOIN restaurants   AS rt
        ON r.restaurant_id = rt.restaurant_id
      WHERE r.user_id = ?
      ORDER BY r.reservation_date DESC, r.reservation_time ASC
    `;

    const [rows] = await db.query(sql, [userId]);
    res.json(rows);
  } catch (err) {
    console.error("Σφάλμα GET /reservations/user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
