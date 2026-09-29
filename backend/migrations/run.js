const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Erreurs signifiant qu'une instruction a déjà été appliquée : on les ignore
// pour pouvoir relancer les migrations sans risque.
const ALREADY_APPLIED = new Set([
  "ER_DUP_FIELDNAME",      // colonne déjà existante
  "ER_TABLE_EXISTS_ERROR", // table déjà existante
  "ER_DUP_KEYNAME",        // index déjà existant
  "ER_CANT_DROP_FIELD_OR_KEY",
]);

const MIGRATIONS = [
  "001_create_tables.sql",
  "002_add_profile_type_and_projects.sql",
  "003_add_new_themes.sql",
  "004_professions_blocks_leads.sql",
  "005_social_links.sql",
];

/** Découpe un fichier SQL en instructions (une instruction se termine par ";" en fin de ligne). */
function splitStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
}

async function runMigrations() {
  // Connexion sans base pour permettre CREATE DATABASE
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  const dbName = process.env.DB_NAME || "afrifolio";
  const table = `\`${dbName}\`.schema_migrations`;

  console.log("🚀 Running migrations...");

  // Migrations déjà appliquées (la base peut ne pas encore exister)
  let applied = new Set();
  try {
    const [rows] = await conn.query(`SELECT name FROM ${table}`);
    applied = new Set(rows.map((r) => r.name));
  } catch {
    /* première exécution */
  }

  for (const file of MIGRATIONS) {
    if (applied.has(file)) {
      console.log(`⏭️  ${file} déjà appliquée`);
      continue;
    }
    const sqlFile = path.join(__dirname, file);
    if (!fs.existsSync(sqlFile)) {
      console.log(`⏭️  Skipping ${file} (not found)`);
      continue;
    }

    let skipped = 0;
    for (const statement of splitStatements(fs.readFileSync(sqlFile, "utf8"))) {
      try {
        await conn.query(statement);
      } catch (err) {
        if (ALREADY_APPLIED.has(err.code)) {
          skipped++;
          continue;
        }
        console.error(`❌ ${file} failed on:\n${statement}\n→ ${err.message}`);
        process.exit(1);
      }
    }

    await conn.query(
      `CREATE TABLE IF NOT EXISTS ${table} (
         name VARCHAR(100) PRIMARY KEY,
         applied_at DATETIME NOT NULL DEFAULT NOW()
       ) ENGINE=InnoDB`
    );
    await conn.query(`INSERT IGNORE INTO ${table} (name) VALUES (?)`, [file]);
    console.log(`✅ ${file} completed${skipped ? ` (${skipped} instruction(s) déjà appliquée(s))` : ""}`);
  }

  await conn.end();
  console.log("🎉 All migrations completed successfully");
}

runMigrations();
