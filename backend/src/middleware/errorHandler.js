/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, _next) {
  // Erreurs d'upload (taille, format)
  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Image trop lourde (max 8 Mo)" : `Erreur d'envoi du fichier : ${err.message}`;
    return res.status(400).json({ message });
  }
  if (err.message && err.message.startsWith("Format non supporté")) {
    return res.status(400).json({ message: err.message });
  }

  // Erreurs de validation MySQL (duplicate entry, etc.)
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Cette valeur existe déjà" });
  }

  // JSON mal formé
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Requête invalide" });
  }

  const status = err.status || err.statusCode || 500;
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // Ne pas exposer les détails techniques en production
  const message =
    status >= 500 && process.env.NODE_ENV === "production" ? "Erreur interne du serveur" : err.message || "Erreur interne du serveur";

  res.status(status).json({ message });
}

module.exports = errorHandler;
