import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

/** QR code du portfolio, téléchargeable pour flyers, cartes de visite, vitrine... */
export function PortfolioQrCode({ url, filename = "qr-portfolio", size = 180, color = "#1a1410" }: { url: string; filename?: string; size?: number; color?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(url, { width: 720, margin: 1, color: { dark: color, light: "#ffffff" }, errorCorrectionLevel: "M" })
      .then((data) => active && setSrc(data))
      .catch(() => active && setSrc(null));
    return () => {
      active = false;
    };
  }, [url, color]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border bg-white p-3 shadow-sm" style={{ width: size + 24 }}>
        {src ? <img src={src} alt="QR code du portfolio" width={size} height={size} /> : <div style={{ width: size, height: size }} className="animate-pulse rounded-lg bg-muted" />}
      </div>
      {src && (
        <a href={src} download={`${filename}.png`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <Download className="h-4 w-4" /> Télécharger le QR code
        </a>
      )}
    </div>
  );
}
