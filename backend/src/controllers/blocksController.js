const pool = require("../config/db");
const { formatBlock } = require("../utils/format");
const { sanitizeBlocks, countPhotos, ValidationError } = require("../utils/blocks");
const { FREE_PLAN_LIMITS } = require("../config/constants");

async function listBlocks(userId, db = pool) {
  const [rows] = await db.query(
    "SELECT * FROM profile_blocks WHERE user_id = ? ORDER BY position ASC, id ASC",
    [userId]
  );
  return rows.map(formatBlock);
}

// GET /api/blocks
async function getBlocks(req, res, next) {
  try {
    return res.json(await listBlocks(req.user.id));
  } catch (err) {
    next(err);
  }
}

// PUT /api/blocks — enregistre la liste complète des sections, dans l'ordre.
// Les sections absentes de la liste sont supprimées.
async function saveBlocks(req, res, next) {
  let blocks;
  try {
    blocks = sanitizeBlocks(req.body?.blocks);
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    return next(err);
  }

  if (req.user.plan !== "premium") {
    const photos = countPhotos(blocks);
    if (photos > FREE_PLAN_LIMITS.photos) {
      return res.status(403).json({
        code: "PHOTO_LIMIT",
        message: `Le plan gratuit est limité à ${FREE_PLAN_LIMITS.photos} photos (vous en avez ${photos}). Passez Pro pour des photos illimitées.`,
      });
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query("SELECT id FROM profile_blocks WHERE user_id = ?", [req.user.id]);
    const ownedIds = new Set(existing.map((r) => r.id));
    const keptIds = new Set();

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const data = JSON.stringify(b.data);
      if (b.id && ownedIds.has(b.id)) {
        await conn.query(
          "UPDATE profile_blocks SET type = ?, position = ?, visible = ?, data = ? WHERE id = ? AND user_id = ?",
          [b.type, i, b.visible ? 1 : 0, data, b.id, req.user.id]
        );
        keptIds.add(b.id);
      } else {
        await conn.query(
          "INSERT INTO profile_blocks (user_id, type, position, visible, data) VALUES (?, ?, ?, ?, ?)",
          [req.user.id, b.type, i, b.visible ? 1 : 0, data]
        );
      }
    }

    const toDelete = [...ownedIds].filter((id) => !keptIds.has(id));
    if (toDelete.length > 0) {
      await conn.query("DELETE FROM profile_blocks WHERE user_id = ? AND id IN (?)", [req.user.id, toDelete]);
    }

    await conn.commit();
    return res.json(await listBlocks(req.user.id, conn));
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

module.exports = { getBlocks, saveBlocks, listBlocks };
