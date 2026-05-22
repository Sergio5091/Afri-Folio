const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Créer le dossier uploads s'il n'existe pas
const UPLOADS_DIR = path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Sous-dossiers par type
const SUBDIRS = ["avatars", "logos", "projects"];
SUBDIRS.forEach((dir) => {
  const fullPath = path.join(UPLOADS_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

/**
 * Crée un storage multer pour un sous-dossier donné
 */
function createStorage(subfolder) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(UPLOADS_DIR, subfolder));
    },
    filename: (req, file, cb) => {
      const userId = req.user?.id || "unknown";
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${subfolder}-${userId}-${Date.now()}${ext}`;
      cb(null, filename);
    },
  });
}

/**
 * Filtre : accepte uniquement les images
 */
function imageFilter(_req, file, cb) {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format non supporté. Utilisez JPG, PNG, WEBP ou GIF."), false);
  }
}

// Upload avatar (photo de profil) — max 5MB
const uploadAvatar = multer({
  storage: createStorage("avatars"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Upload logo — max 2MB
const uploadLogo = multer({
  storage: createStorage("logos"),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Upload image projet — max 5MB
const uploadProjectImg = multer({
  storage: createStorage("projects"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadAvatar, uploadLogo, uploadProjectImg, UPLOADS_DIR };
