import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Affiche un portfolio à une largeur "virtuelle" (ex. 390 px = téléphone)
 * réduite pour tenir dans son conteneur. Les container queries du portfolio
 * se basent sur la largeur virtuelle : on voit la vraie mise en page mobile.
 */
export function PreviewFrame({
  children,
  virtualWidth = 390,
  aspect = 19.5 / 9,
  interactive = false,
  lazy = false,
  className = "",
}: {
  children: ReactNode;
  virtualWidth?: number;
  /** hauteur / largeur de la fenêtre visible */
  aspect?: number;
  interactive?: boolean;
  /** Ne rend le contenu qu'à l'approche de l'écran (listes de nombreux aperçus) */
  lazy?: boolean;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [inView, setInView] = useState(!lazy);

  useEffect(() => {
    if (!lazy || inView || !outer.current) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { rootMargin: "300px" });
    obs.observe(outer.current);
    return () => obs.disconnect();
  }, [lazy, inView]);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / virtualWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [virtualWidth]);

  const height = virtualWidth * aspect;

  return (
    <div ref={outer} className={`relative w-full overflow-hidden ${className}`} style={{ height: height * scale }}>
      <div
        className={`absolute left-0 top-0 ${interactive ? "overflow-y-auto overscroll-contain [scrollbar-width:thin]" : "pointer-events-none overflow-hidden"}`}
        style={{ width: virtualWidth, height, transform: `scale(${scale})`, transformOrigin: "top left" }}
        aria-hidden={!interactive}
      >
        {inView ? children : <div className="h-full w-full animate-pulse bg-neutral-100" />}
      </div>
    </div>
  );
}

/** Cadre de téléphone décoratif */
export function PhoneMockup({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-[2.6rem] bg-neutral-900 p-2.5 shadow-2xl ring-1 ring-black/10 ${className}`}>
      <div className="absolute left-1/2 top-3.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
      <div className="overflow-hidden rounded-[2.1rem] bg-white">{children}</div>
    </div>
  );
}
