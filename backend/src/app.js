const path = require("path");
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const errorHandler = require("./middleware/errorHandler");

// Routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const portfolioRoutes = require("./routes/portfolio");
const dashboardRoutes = require("./routes/dashboard");
const analyticsRoutes = require("./routes/analytics");
const referralRoutes = require("./routes/referral");
const subscriptionRoutes = require("./routes/subscription");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/upload");
const projectsRoutes = require("./routes/projects");

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// MIDDLEWARES GLOBAUX
// ============================================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Log des requêtes en développement
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Servir les fichiers uploadés statiquement
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============================================================
// ROUTES
// ============================================================

app.get("/", (_req, res) => {
  res.json({ message: "AfriFolio API", version: "1.0.0", status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/projects", projectsRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

// ============================================================
// ERROR HANDLER (doit être en dernier)
// ============================================================
app.use(errorHandler);

// ============================================================
// DÉMARRAGE
// ============================================================
app.listen(PORT, () => {
  console.log(`🚀 AfriFolio API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
