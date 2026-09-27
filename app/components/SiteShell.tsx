"use client";
import { usePathname } from "next/navigation";

import ModernSiteHeader from "./ModernSiteHeader";
import SiteFooter from "./SiteFooter";
import BrandMotion from "./BrandMotion";
import { ThemeProvider } from "./ThemeProvider";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const modern = ["/online-booth", "/experiences", "/about", "/privacy"].includes(pathname);
  return <ThemeProvider>
    <div className="pixu-modern navigation-shell"><ModernSiteHeader /></div>
    {modern ? <div className="pixu-modern">{children}<SiteFooter /></div> : <><div className="pixu-original"><BrandMotion />{children}</div><div className="pixu-modern"><SiteFooter /></div></>}
  </ThemeProvider>;
}
