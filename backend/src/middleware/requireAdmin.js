/**
 * Middleware: vérifie que l'utilisateur est admin
 * Doit être utilisé APRÈS authenticate
 */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: "Accès refusé : droits administrateur requis" });
  }
  next();
}

module.exports = requireAdmin;
