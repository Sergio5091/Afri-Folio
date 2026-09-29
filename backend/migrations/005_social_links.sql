USE afrifolio;

-- Réseaux les plus utilisés par les pros en Afrique de l'Ouest
ALTER TABLE profiles ADD COLUMN instagram VARCHAR(500) NULL AFTER twitter;
ALTER TABLE profiles ADD COLUMN facebook VARCHAR(500) NULL AFTER instagram;
ALTER TABLE profiles ADD COLUMN tiktok VARCHAR(500) NULL AFTER facebook;
ALTER TABLE profiles ADD COLUMN youtube VARCHAR(500) NULL AFTER tiktok;
