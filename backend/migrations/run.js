const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function runMigrations() {
  // Connect without specifying a database first (to allow CREATE DATABASE)
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  console.log("🚀 Running migrations...");

  const migrations = [
    "001_create_tables.sql",
    "002_add_profile_type_and_projects.sql",
    "003_add_new_themes.sql",
  ];

  for (const file of migrations) {
    const sqlFile = path.join(__dirname, file);
    if (!fs.existsSync(sqlFile)) {
      console.log(`⏭️  Skipping ${file} (not found)`);
      continue;
    }
    const sql = fs.readFileSync(sqlFile, "utf8");
    try {
      await conn.query(sql);
      console.log(`✅ ${file} completed`);
    } catch (err) {
      // Ignorer les erreurs "colonne déjà existante" (migration déjà appliquée)
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log(`⚠️  ${file} skipped (colonnes déjà existantes)`);
      } else {
        console.error(`❌ ${file} failed:`, err.message);
        process.exit(1);
      }
    }
  }

  await conn.end();
  console.log("🎉 All migrations completed successfully");
}

runMigrations();
