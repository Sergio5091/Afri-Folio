/**
 * Script de correction rapide : ajoute les colonnes manquantes
 * sans réexécuter toutes les migrations.
 * 
 * Usage: node migrations/fix_columns.js
 */
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function fixColumns() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "afrifolio",
  });

  console.log("🔧 Vérification et correction des colonnes manquantes...\n");

  const fixes = [
    {
      label: "profiles.profile_type",
      check: `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'profiles' AND COLUMN_NAME = 'profile_type'`,
      alter: `ALTER TABLE profiles ADD COLUMN profile_type VARCHAR(50) NULL DEFAULT NULL AFTER user_id`,
    },
    {
      label: "projects.display_order",
      check: `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'display_order'`,
      alter: `ALTER TABLE projects ADD COLUMN display_order INT NOT NULL DEFAULT 0`,
    },
  ];

  for (const fix of fixes) {
    const [[row]] = await conn.query(fix.check);
    if (row.cnt === 0) {
      await conn.query(fix.alter);
      console.log(`✅ Colonne ajoutée : ${fix.label}`);
    } else {
      console.log(`⏭️  Déjà présente : ${fix.label}`);
    }
  }

  await conn.end();
  console.log("\n🎉 Correction terminée !");
}

fixColumns().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
