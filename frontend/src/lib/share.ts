import { API_BASE_URL } from "@workspace/api-client-react";

/** Adresse publique du portfolio : monsite.com/identifiant */
export function portfolioUrl(username: string) {
  return `${window.location.origin}/${username}`;
}

/** Affichage sans le protocole : afrifolio.com/identifiant */
export function portfolioDisplayUrl(username: string) {
  return `${window.location.host}/${username}`;
}

/**
 * Lien à partager sur les réseaux : passe par le serveur qui fournit l'aperçu
 * (photo, nom, métier) à WhatsApp et Facebook, puis redirige vers le portfolio.
 */
export function shareUrl(username: string, src = "whatsapp") {
  return `${API_BASE_URL}/share/${username}?src=${src}`;
}

export function whatsappShare(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function shareMessage(username: string, name?: string | null, title?: string | null) {
  const who = [name, title].filter(Boolean).join(", ");
  return `Découvrez mon portfolio${who ? ` (${who})` : ""} : ${shareUrl(username)}`;
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Anciens navigateurs mobiles
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}
