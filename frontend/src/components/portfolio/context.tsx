import { createContext, useContext } from "react";
import type { Profile } from "@workspace/api-client-react";
import type { TemplateId, TemplateMeta } from "@/lib/templates";
import type { Profession } from "@/lib/professions";

export type PortfolioMode = "public" | "preview" | "demo";

export interface PortfolioCtx {
  tpl: TemplateId;
  meta: TemplateMeta;
  profile: Profile;
  profession: Profession;
  primary: string;
  mode: PortfolioMode;
  username: string;
  plan: "free" | "premium";
  /** Ouvre WhatsApp avec un message prérempli (et enregistre le clic) */
  whatsapp: (message?: string) => string | null;
  track: (type: string) => void;
  openLightbox: (images: { url: string; caption?: string }[], index: number) => void;
  openLeadForm: () => void;
}

export const PortfolioContext = createContext<PortfolioCtx | null>(null);

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio doit être utilisé dans <PortfolioView>");
  return ctx;
}
