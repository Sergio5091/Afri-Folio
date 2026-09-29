USE afrifolio;

-- ============================================================
-- PROFILS : métier précis + template + visibilité
-- ============================================================
ALTER TABLE profiles MODIFY COLUMN style_theme VARCHAR(30) NOT NULL DEFAULT 'modern';
ALTER TABLE profiles MODIFY COLUMN font_family VARCHAR(100) NULL DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN profession VARCHAR(60) NULL AFTER profile_type;
ALTER TABLE profiles ADD COLUMN profession_custom VARCHAR(120) NULL AFTER profession;
ALTER TABLE profiles ADD COLUMN template VARCHAR(30) NULL AFTER profession_custom;
ALTER TABLE profiles ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN listed_in_directory BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE profiles ADD INDEX idx_profiles_profession (profession);

-- ============================================================
-- UTILISATEURS : statut (suspension admin) + dernière connexion
-- ============================================================
ALTER TABLE users ADD COLUMN status ENUM('active','suspended') NOT NULL DEFAULT 'active';
ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL;

-- ============================================================
-- BLOCS DE CONTENU (galerie, tarifs, horaires, menu...)
-- ============================================================
CREATE TABLE IF NOT EXISTS profile_blocks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  type       VARCHAR(30) NOT NULL,
  position   INT NOT NULL DEFAULT 0,
  visible    BOOLEAN NOT NULL DEFAULT TRUE,
  data       JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_blocks_user (user_id, position),
  CONSTRAINT fk_blocks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- MESSAGES DE CLIENTS (formulaire du portfolio)
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(30)  NULL,
  email      VARCHAR(255) NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  INDEX idx_leads_user (user_id, created_at),
  CONSTRAINT fk_leads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- ÉVÉNEMENTS (clics WhatsApp, appel, email, partage)
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolio_events (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  portfolio_username VARCHAR(50) NOT NULL,
  type               VARCHAR(30) NOT NULL,
  created_at         DATETIME NOT NULL DEFAULT NOW(),
  INDEX idx_events_username (portfolio_username, created_at)
) ENGINE=InnoDB;

-- Provenance des visites (whatsapp, facebook, direct...)
ALTER TABLE portfolio_views ADD COLUMN source VARCHAR(50) NULL;

-- ============================================================
-- ABONNEMENTS : période + attribution manuelle par un admin
-- ============================================================
ALTER TABLE subscriptions ADD COLUMN period ENUM('monthly','yearly') NOT NULL DEFAULT 'monthly';
ALTER TABLE subscriptions ADD COLUMN granted_by_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscriptions MODIFY COLUMN phone_number VARCHAR(30) NOT NULL DEFAULT '';
