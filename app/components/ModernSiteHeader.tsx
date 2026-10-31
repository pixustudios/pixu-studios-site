"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
const links = [
  { href: "/#experiences", label: "Experiences" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#about", label: "About" },
  { href: "/online-booth", label: "Online Booth" },
];
function ShopNavItem({ tooltipId, label = "Shop" }: { tooltipId: string; label?: string }) {
  return (
    <span className="shop-nav-wrap">
      <button
        type="button"
        className="shop-nav-item"
        aria-disabled="true"
        aria-describedby={tooltipId}
      >
        {label}
      </button>
      <span className="shop-nav-tooltip" id={tooltipId} role="tooltip">
        Coming soon
      </span>
    </span>
  );
}
export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header
      className={`site-header${scrolled && !open ? " is-scrolled" : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="container header-inner">
        <Link
          href="/"
          className="logo"
          aria-label="PIXÜ Studios home"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/pixu-studios-logo.png"
            alt="PIXÜ"
            width={200}
            height={90}
            sizes="110px"
          />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <ShopNavItem tooltipId="shop-coming-soon-desktop" />
        </nav>
        <div className="header-actions">
          <ThemeToggle className="desktop-theme-toggle" />
          <button
            className="menu-toggle"
            ref={toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "close menu" : "open menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? "close" : "menu"}
          </button>
        </div>
      </div>
      <nav
        id="mobile-menu"
        className="mobile-menu"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label.toLowerCase()}
          </Link>
        ))}
        <ShopNavItem tooltipId="shop-coming-soon-mobile" label="shop" />
        <ThemeToggle className="mobile-theme-toggle" />
      </nav>
    </header>
  );
}
