-- AfriFolio Database Schema
-- Run: node migrations/run.js

CREATE DATABASE IF NOT EXISTS afrifolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE afrifolio;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plan          ENUM('free', 'premium') NOT NULL DEFAULT 'free',
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_by   INT NULL,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    DATETIME NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_users_referred_by FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 2. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNIQUE NOT NULL,
  full_name           VARCHAR(100)  NULL,
  title               VARCHAR(150)  NULL,
  tagline             VARCHAR(255)  NULL,
  bio                 TEXT          NULL,
  photo_url           VARCHAR(500)  NULL,
  logo_url            VARCHAR(500)  NULL,
  skills              JSON          NULL,
  services            TEXT          NULL,
  whatsapp            VARCHAR(30)   NULL,
  email_contact       VARCHAR(255)  NULL,
  linkedin            VARCHAR(500)  NULL,
  twitter             VARCHAR(500)  NULL,
  github              VARCHAR(500)  NULL,
  website             VARCHAR(500)  NULL,
  country             VARCHAR(100)  NULL,
  city                VARCHAR(100)  NULL,
  style_theme         ENUM('minimalist','modern','classic','bold','elegant') NOT NULL DEFAULT 'modern',
  primary_color       VARCHAR(10)   NULL DEFAULT '#4f46e5',
  font_family         VARCHAR(100)  NULL DEFAULT 'Inter',
  years_experience    INT           NULL,
  completed_projects  INT           NULL,
  satisfied_clients   INT           NULL,
  available_for_work  BOOLEAN       NOT NULL DEFAULT TRUE,
  updated_at          DATETIME      NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT         NULL,
  image_url     VARCHAR(500) NULL,
  project_url   VARCHAR(500) NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. PORTFOLIO VIEWS (analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolio_views (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  portfolio_username VARCHAR(50) NOT NULL,
  viewer_ip          VARCHAR(45) NULL,
  viewer_country     VARCHAR(100) NULL,
  viewed_at          DATETIME NOT NULL DEFAULT NOW(),
  INDEX idx_views_username (portfolio_username),
  INDEX idx_views_date (viewed_at)
) ENGINE=InnoDB;

-- ============================================================
-- 5. COMMISSIONS (parrainage)
-- ============================================================
CREATE TABLE IF NOT EXISTS commissions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  referrer_id INT NOT NULL,
  referee_id  INT NOT NULL,
  amount      INT NOT NULL,
  month       VARCHAR(7) NOT NULL,
  status      ENUM('pending','paid') NOT NULL DEFAULT 'pending',
  created_at  DATETIME NOT NULL DEFAULT NOW(),
  UNIQUE KEY uq_commission_referee_month (referee_id, month),
  CONSTRAINT fk_commissions_referrer FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_commissions_referee  FOREIGN KEY (referee_id)  REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. WITHDRAWALS (retraits)
-- ============================================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  amount        INT NOT NULL,
  method        ENUM('mobile_money','subscription_credit') NOT NULL,
  phone_number  VARCHAR(30) NULL,
  status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  requested_at  DATETIME NOT NULL DEFAULT NOW(),
  processed_at  DATETIME NULL,
  CONSTRAINT fk_withdrawals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. SUBSCRIPTIONS / PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  operator     ENUM('mtn','moov','wave') NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  amount       INT NOT NULL DEFAULT 360,
  status       ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
  external_ref VARCHAR(255) NULL,
  expires_at   DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
