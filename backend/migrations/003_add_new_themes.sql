USE afrifolio;

-- Le thème est désormais une chaîne libre (validée côté API) :
-- évite de modifier l'ENUM à chaque nouveau template.
ALTER TABLE profiles
  MODIFY COLUMN style_theme VARCHAR(30) NOT NULL DEFAULT 'modern';
