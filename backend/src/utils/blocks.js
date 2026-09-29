const { BLOCK_TYPES } = require("../config/constants");

const MAX_BLOCKS = 30;
const MAX_BLOCK_BYTES = 60 * 1024;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

/**
 * Valide la liste de blocs envoyée par le client.
 * Retourne [{ id?, type, visible, data }] dans l'ordre reçu.
 */
function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) throw new ValidationError("blocks doit être un tableau");
  if (blocks.length > MAX_BLOCKS) throw new ValidationError(`Maximum ${MAX_BLOCKS} sections`);

  return blocks.map((b, i) => {
    if (!b || typeof b !== "object") throw new ValidationError(`Section ${i + 1} invalide`);
    if (!BLOCK_TYPES.includes(b.type)) throw new ValidationError(`Type de section inconnu : ${b.type}`);
    const data = b.data && typeof b.data === "object" && !Array.isArray(b.data) ? b.data : {};
    const json = JSON.stringify(data);
    if (Buffer.byteLength(json, "utf8") > MAX_BLOCK_BYTES) {
      throw new ValidationError(`La section « ${b.type} » est trop volumineuse`);
    }
    return {
      id: Number.isInteger(b.id) ? b.id : null,
      type: b.type,
      visible: b.visible !== false,
      data,
    };
  });
}

/** Compte les photos hébergées dans les blocs (pour la limite du plan gratuit). */
function countPhotos(blocks) {
  let total = 0;
  for (const b of blocks) {
    const items = Array.isArray(b.data?.items) ? b.data.items : [];
    if (b.type === "gallery") total += items.filter((it) => it?.url).length;
    if (b.type === "beforeAfter") total += items.reduce((n, it) => n + (it?.before ? 1 : 0) + (it?.after ? 1 : 0), 0);
    if (b.type === "projects") total += items.filter((it) => it?.image).length;
    if (b.type === "menu") {
      const cats = Array.isArray(b.data?.categories) ? b.data.categories : [];
      for (const c of cats) total += (Array.isArray(c?.items) ? c.items : []).filter((it) => it?.image).length;
    }
  }
  return total;
}

module.exports = { sanitizeBlocks, countPhotos, ValidationError };
