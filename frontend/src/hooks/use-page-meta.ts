import { useEffect } from "react";

function setMeta(attr: "name" | "property", key: string, value?: string) {
  if (!value) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

/** Titre et balises de partage de la page courante */
export function usePageMeta({ title, description, image }: { title?: string; description?: string; image?: string }) {
  useEffect(() => {
    const previous = document.title;
    if (title) document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image);
    return () => {
      document.title = previous;
    };
  }, [title, description, image]);
}
