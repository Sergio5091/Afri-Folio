USE afrifolio;

-- Ajouter profile_type à la table profiles
ALTER TABLE profiles
  ADD COLUMN profile_type VARCHAR(50) NULL DEFAULT NULL AFTER user_id;

-- Ajouter display_order à projects
ALTER TABLE projects
  ADD COLUMN display_order INT NOT NULL DEFAULT 0;
