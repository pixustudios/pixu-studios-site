"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      className={`rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-[color:var(--foreground)] transition hover:border-[color:var(--brand-red)] ${className}`}
      aria-label="Toggle dark and light mode"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
