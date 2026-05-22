/**
 * Script pour créer un compte administrateur
 * Usage: node scripts/create-admin.js
 */
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const path = require("path");
const readline = require("readline");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("\n🛡️  Création d'un compte administrateur AfriFolio\n");

  const username = await ask("Username       : ");
  const email    = await ask("Email          : ");
  const password = await ask("Mot de passe   : ");

  if (!username || !email || !password) {
    console.error("❌ Tous les champs sont requis.");
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("❌ Le mot de passe doit contenir au moins 6 caractères.");
    process.exit(1);
  }

  rl.close();

  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || "localhost",
    port:     parseInt(process.env.DB_PORT || "3306"),
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME     || "afrifolio",
  });

  // Vérifier si l'email ou username existe déjà
  const [existing] = await conn.query(
    "SELECT id, is_admin FROM users WHERE username = ? OR email = ?",
    [username.toLowerCase(), email.toLowerCase()]
  );

  if (existing.length > 0) {
    const user = existing[0];
    if (user.is_admin) {
      console.log("⚠️  Cet utilisateur est déjà administrateur.");
    } else {
      // Promouvoir en admin
      await conn.query("UPDATE users SET is_admin = 1 WHERE id = ?", [user.id]);
      console.log(`\n✅ Utilisateur existant promu administrateur (ID: ${user.id})`);
    }
    await conn.end();
    return;
  }

  // Générer un code de parrainage unique
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const referralCode = "REF-" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(password, 12);

  // Insérer l'admin
  const [result] = await conn.query(
    `INSERT INTO users (username, email, password_hash, referral_code, is_admin, plan)
     VALUES (?, ?, ?, ?, 1, 'premium')`,
    [username.toLowerCase(), email.toLowerCase(), passwordHash, referralCode]
  );

  // Créer un profil vide
  await conn.query(
    "INSERT INTO profiles (user_id, email_contact) VALUES (?, ?)",
    [result.insertId, email.toLowerCase()]
  );

  await conn.end();

  console.log(`
✅ Administrateur créé avec succès !
   ID       : ${result.insertId}
   Username : ${username.toLowerCase()}
   Email    : ${email.toLowerCase()}
   Plan     : premium
   Admin    : oui

🔗 Connectez-vous sur : http://localhost:5173/admin/connexion
`);
}

main().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
