const pool = require("../config/db");
const { formatLead } = require("../utils/format");

// GET /api/leads
async function getLeads(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM leads WHERE user_id = ? ORDER BY created_at DESC LIMIT 200",
      [req.user.id]
    );
    return res.json(rows.map(formatLead));
  } catch (err) {
    next(err);
  }
}

// PUT /api/leads/:id  { isRead }
async function updateLead(req, res, next) {
  try {
    const [result] = await pool.query("UPDATE leads SET is_read = ? WHERE id = ? AND user_id = ?", [
      req.body?.isRead === false ? 0 : 1,
      req.params.id,
      req.user.id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Message introuvable" });
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// PUT /api/leads/read-all
async function markAllRead(req, res, next) {
  try {
    await pool.query("UPDATE leads SET is_read = 1 WHERE user_id = ?", [req.user.id]);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/leads/:id
async function deleteLead(req, res, next) {
  try {
    const [result] = await pool.query("DELETE FROM leads WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Message introuvable" });
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLeads, updateLead, markAllRead, deleteLead };
