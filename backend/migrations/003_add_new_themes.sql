USE afrifolio;

-- Étendre l'ENUM style_theme avec les nouveaux templates
ALTER TABLE profiles
  MODIFY COLUMN style_theme 
  ENUM('minimalist','modern','classic','bold','elegant','sidebar','card','timeline','magazine','neon')
  NOT NULL DEFAULT 'modern';
