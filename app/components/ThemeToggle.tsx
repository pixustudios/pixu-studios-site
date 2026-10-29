"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return (
    <div
      ref={root}
      className={`theme-picker ${className}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="theme-picker-trigger"
        onClick={() => setOpen(!open)}
        aria-label={`Appearance: ${theme} mode`}
        aria-expanded={open}
        aria-controls={panelId}
        title="Appearance"
      >
        {theme === "dark" ? <FiMoon aria-hidden="true" /> : <FiSun aria-hidden="true" />}
        <FiChevronDown className="theme-picker-chevron" aria-hidden="true" />
      </button>
      <div id={panelId} className="theme-picker-panel" hidden={!open} role="group" aria-label="Appearance">
        {(["light", "dark"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={theme === option}
            onClick={() => {
              setTheme(option);
              setOpen(false);
              trigger.current?.focus();
            }}
          >
            {option === "light" ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
            <span>{option === "light" ? "Light" : "Dark"}</span>
            {theme === option && <FiCheck aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
}
