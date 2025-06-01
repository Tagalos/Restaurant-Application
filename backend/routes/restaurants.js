const express = require("express");
const db = require("../config/database");
const router = express.Router();

router.get("/:id/availability", async (req, res) => {
  const restaurantId = req.params.id;
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ message: "Missing date parameter" });
  }
  let conn;
  try {
    conn = await db.getConnection();
    const limitRows = await conn.query(
      "SELECT daily_limit FROM restaurants WHERE restaurant_id = ?",
      [restaurantId]
    );
    if (!Array.isArray(limitRows) || limitRows.length === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    const limit = Number(limitRows[0].daily_limit);
    const countRows = await conn.query(
      `SELECT COUNT(*) AS reserved
       FROM reservations
       WHERE restaurant_id = ? AND reservation_date = ?`,
      [restaurantId, date]
    );
    const reserved = Number(countRows[0].reserved);
    return res.json({ limit, reserved });
  } catch (err) {
    console.error("Error fetching availability:", err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) conn.release();
  }
});

router.get("/", async (req, res) => {
  const { name, location } = req.query;
  let conn;
  try {
    conn = await db.getConnection();
    let sql = `SELECT restaurant_id, restaurant_name, restaurant_location, restaurant_description, daily_limit FROM restaurants`;
    const params = [];
    if (name) {
      sql += " WHERE restaurant_name LIKE ?";
      params.push(`%${name}%`);
    }
    if (location) {
      sql += name
        ? " AND restaurant_location LIKE ?"
        : " WHERE restaurant_location LIKE ?";
      params.push(`%${location}%`);
    }

    const rows = await conn.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error("Error GET /restaurants:", err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
