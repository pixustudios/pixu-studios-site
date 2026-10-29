"use client";

import { type PointerEvent, type ReactNode } from "react";

export default function TiltPhoto({ children }: { children: ReactNode }) {
  const reset = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    event.currentTarget.style.setProperty("--tilt-x", `${-y * 3}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${x * 5}deg`);
  };

  return <div className="detail-photo tilt-photo" onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}><div className="tilt-photo-inner">{children}</div></div>;
}
