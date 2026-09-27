"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TrackedLink from "./TrackedLink";
import ThemeToggle from "./ThemeToggle";
const links = [
  { href: "/#experiences", label: "Experiences" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#about", label: "About" },
  { href: "/online-booth", label: "Online Booth" },
];
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
            src="/logo.png"
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
        </nav>
        <div className="header-actions">
          <TrackedLink href="/#booking" className="button header-cta" />
          <ThemeToggle className="desktop-theme-toggle" />
          <button
            className="menu-toggle"
            ref={toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close −" : "Menu +"}
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
            {link.label}
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
        <div onClick={() => setOpen(false)}>
          <TrackedLink href="/#booking" />
        </div>
        <ThemeToggle className="mobile-theme-toggle" />
      </nav>
    </header>
  );
}
