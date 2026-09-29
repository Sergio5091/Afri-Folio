// ============================================================
// Compression des photos dans le navigateur avant envoi.
// Une photo de téléphone (3-6 Mo) devient ~200-400 Ko :
// envoi plus rapide et moins de données mobiles consommées.
// ============================================================
import { uploadImage } from "@workspace/api-client-react";

export async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image illisible"));
      el.src = url;
    });

    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    // Garder l'original s'il est déjà plus léger
    return blob && blob.size < file.size ? blob : file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Compresse puis envoie une image ; retourne son URL publique. */
export async function uploadPhoto(file: File | Blob, kind: "image" | "avatar" | "logo" = "image", maxSize?: number) {
  const blob = file instanceof File ? await compressImage(file, maxSize ?? (kind === "avatar" ? 800 : 1600)) : file;
  const { url } = await uploadImage(blob, kind);
  return url;
}
