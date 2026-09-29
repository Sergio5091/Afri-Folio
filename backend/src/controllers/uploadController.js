const path = require("path");
const fs = require("fs");
const pool = require("../config/db");

/**
 * Retourne l'URL publique d'un fichier uploadé
 */
function getFileUrl(req, filename, subfolder) {
  const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3001}`;
  return `${appUrl}/uploads/${subfolder}/${filename}`;
}

/**
 * Supprime l'ancien fichier local si c'est une URL locale
 */
function deleteOldFile(url) {
  if (!url) return;
  try {
    // Extraire le chemin relatif depuis l'URL (ex: /uploads/avatars/xxx.jpg)
    const match = url.match(/\/uploads\/(.+)$/);
    if (match) {
      const filePath = path.join(__dirname, "../../uploads", match[1]);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.warn("Impossible de supprimer l'ancien fichier:", err.message);
  }
}

// POST /api/upload/avatar
async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const fileUrl = getFileUrl(req, req.file.filename, "avatars");

    // Récupérer l'ancienne photo pour la supprimer
    const [rows] = await pool.query(
      "SELECT photo_url FROM profiles WHERE user_id = ?",
      [req.user.id]
    );
    if (rows.length > 0) {
      deleteOldFile(rows[0].photo_url);
    }

    // Mettre à jour le profil
    await pool.query(
      "UPDATE profiles SET photo_url = ? WHERE user_id = ?",
      [fileUrl, req.user.id]
    );

    return res.json({
      url: fileUrl,
      message: "Photo de profil mise à jour",
    });
  } catch (err) {
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
}

// POST /api/upload/logo
async function uploadLogo(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const fileUrl = getFileUrl(req, req.file.filename, "logos");

    // Récupérer l'ancien logo pour le supprimer
    const [rows] = await pool.query(
      "SELECT logo_url FROM profiles WHERE user_id = ?",
      [req.user.id]
    );
    if (rows.length > 0) {
      deleteOldFile(rows[0].logo_url);
    }

    // Mettre à jour le profil
    await pool.query(
      "UPDATE profiles SET logo_url = ? WHERE user_id = ?",
      [fileUrl, req.user.id]
    );

    return res.json({
      url: fileUrl,
      message: "Logo mis à jour",
    });
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
}

// POST /api/upload/image — image de section (galerie, avant/après, menu...)
async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }
    return res.status(201).json({ url: getFileUrl(req, req.file.filename, "gallery") });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
}

module.exports = { uploadAvatar, uploadLogo, uploadImage };
