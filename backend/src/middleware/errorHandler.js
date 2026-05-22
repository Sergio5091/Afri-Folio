/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // Erreurs de validation MySQL (duplicate entry, etc.)
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Cette valeur existe déjà" });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Erreur interne du serveur";

  res.status(status).json({ message });
}

module.exports = errorHandler;
