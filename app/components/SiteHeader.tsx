"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { siteNavigation } from "./navigation";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/#about") return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const leftNavigation = siteNavigation.filter((item) => item.region === "left");
  const onlineNavigation = siteNavigation.find((item) => item.key === "online")!;
  const bookingNavigation = siteNavigation.find((item) => item.key === "booking")!;
  const linkClass = (href: string) => `transition-opacity hover:opacity-60${isActive(pathname, href) ? " text-[color:var(--brand-action)]" : ""}`;
  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <header className="site-header sticky top-0 z-50 w-full border-b border-[color:var(--line)] bg-[color:var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <nav className="hidden items-center gap-5 text-[12px] uppercase tracking-[0.18em] text-[color:var(--foreground)] lg:flex" aria-label="Primary navigation">
            {leftNavigation.filter((item) => item.key !== "booking").map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
            <Link href={bookingNavigation.href} className="header-book-link" aria-current={pathname === "/contact" ? "page" : undefined}>
              {bookingNavigation.label}
            </Link>
          </nav>

          <Link href="/" className="justify-self-center" aria-label="PIXÜ home">
            <Image src="/logo.png" alt="PIXÜ Studios logo" width={200} height={90} priority className="mx-auto h-auto w-[120px] sm:w-[160px]" style={{ filter: theme === "dark" ? "brightness(0) invert(1)" : "none" }} />
          </Link>

          <div className="hidden items-center justify-self-end gap-3 lg:flex">
            <Link href={onlineNavigation.href} className="header-online-link" aria-current={isActive(pathname, onlineNavigation.href) ? "page" : undefined}>
              Try our online photobooth
            </Link>
            <button type="button" onClick={toggleTheme} className="header-theme-toggle" aria-label="Toggle dark and light mode">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>

        <nav className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[12px] uppercase tracking-[0.15em] text-[color:var(--foreground)] lg:hidden" aria-label="Mobile navigation">
          {siteNavigation.map((item) => item.key === "booking" ? <Link key={item.key} href={item.href} className="header-book-link" aria-current={pathname === "/contact" ? "page" : undefined}>{item.label}</Link> : <Link key={item.key} href={item.href} className={linkClass(item.href)} aria-current={isActive(pathname, item.href) ? "page" : undefined}>{item.label}</Link>)}
          <button type="button" onClick={toggleTheme} className="header-theme-toggle">{theme === "dark" ? "Light mode" : "Dark mode"}</button>
        </nav>
      </div>
    </header>
  );
}
