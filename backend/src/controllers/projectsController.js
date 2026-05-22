const pool = require("../config/db");

function formatProject(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    projectUrl: row.project_url,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

// GET /api/projects
async function getProjects(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM projects WHERE user_id = ? ORDER BY display_order ASC, created_at DESC",
      [req.user.id]
    );
    return res.json(rows.map(formatProject));
  } catch (err) {
    next(err);
  }
}

// POST /api/projects
async function createProject(req, res, next) {
  try {
    const { title, description, imageUrl, projectUrl, displayOrder } = req.body;

    if (!title || title.trim().length < 2) {
      return res.status(400).json({ message: "Le titre est requis (min 2 caractères)" });
    }

    // Compter les projets existants
    const [count] = await pool.query(
      "SELECT COUNT(*) AS total FROM projects WHERE user_id = ?",
      [req.user.id]
    );

    const order = displayOrder ?? count[0].total;

    const [result] = await pool.query(
      `INSERT INTO projects (user_id, title, description, image_url, project_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        description || null,
        imageUrl || null,
        projectUrl || null,
        order,
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM projects WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json(formatProject(rows[0]));
  } catch (err) {
    next(err);
  }
}

// PUT /api/projects/:id
async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, projectUrl, displayOrder } = req.body;

    // Vérifier que le projet appartient à l'utilisateur
    const [existing] = await pool.query(
      "SELECT id FROM projects WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Projet introuvable" });
    }

    if (!title || title.trim().length < 2) {
      return res.status(400).json({ message: "Le titre est requis (min 2 caractères)" });
    }

    await pool.query(
      `UPDATE projects SET
        title = ?,
        description = ?,
        image_url = ?,
        project_url = ?,
        display_order = ?
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        description || null,
        imageUrl || null,
        projectUrl || null,
        displayOrder ?? 0,
        id,
        req.user.id,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);
    return res.json(formatProject(rows[0]));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/projects/:id
async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      "SELECT id FROM projects WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Projet introuvable" });
    }

    await pool.query("DELETE FROM projects WHERE id = ? AND user_id = ?", [id, req.user.id]);

    return res.json({ message: "Projet supprimé" });
  } catch (err) {
    next(err);
  }
}

// POST /api/projects/:id/image
async function uploadProjectImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const { id } = req.params;
    const appUrl = process.env.APP_URL || "http://localhost:3001";
    const fileUrl = `${appUrl}/uploads/projects/${req.file.filename}`;

    // Vérifier ownership
    const [existing] = await pool.query(
      "SELECT id FROM projects WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Projet introuvable" });
    }

    await pool.query(
      "UPDATE projects SET image_url = ? WHERE id = ? AND user_id = ?",
      [fileUrl, id, req.user.id]
    );

    return res.json({ url: fileUrl });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProjects, createProject, updateProject, deleteProject, uploadProjectImage };
