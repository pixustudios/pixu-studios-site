"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Point = { x: number; y: number };
type Mark = { kind: "draw"; points: Point[]; color: string; width: number } | { kind: "sticker"; point: Point; text: string; color: string; size: number };
function paint(ctx: CanvasRenderingContext2D, marks: Mark[], width: number, height: number, logo?: HTMLCanvasElement) {
  ctx.save();
  ctx.scale(width, height);
  for (const mark of marks) {
    ctx.fillStyle = mark.color; ctx.strokeStyle = mark.color;
    if (mark.kind === "sticker") {
      if (mark.text === "PIXÜ" && logo) {
        const sticker = document.createElement("canvas");
        sticker.width = logo.width; sticker.height = logo.height;
        const ink = sticker.getContext("2d")!;
        ink.drawImage(logo, 0, 0); ink.globalCompositeOperation = "source-in";
        ink.fillStyle = mark.color; ink.fillRect(0, 0, sticker.width, sticker.height);
        const w = mark.size * 3, h = w * logo.height / logo.width * width / height;
        ctx.drawImage(sticker, mark.point.x - w / 2, mark.point.y - h / 2, w, h);
        continue;
      }
      ctx.font = `${mark.size}px Georgia`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(mark.text, mark.point.x, mark.point.y);
    } else {
      ctx.lineWidth = mark.width; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
      mark.points.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      if (mark.points.length === 1) { const p = mark.points[0]; ctx.lineTo(p.x + .0001, p.y); }
      ctx.stroke();
    }
  }
  ctx.restore();
}
export default function BoothPhotoEditor({ image, onExport }: { image: string; onExport: (file: File | null) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const draft = useRef<Extract<Mark, { kind: "draw" }> | null>(null);
  const moving = useRef<{ index: number; start: Point; original: Mark } | null>(null);
  const logo = useRef<HTMLCanvasElement | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [tool, setTool] = useState("Move");
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(0.08);
  const [penWidth, setPenWidth] = useState(.004);
  useEffect(() => {
    let cancelled = false;
    onExport(null);
    const photo = new window.Image();
    photo.src = image;
    photo.decode().then(async () => {
      if (!logo.current) {
        const asset = new window.Image(); asset.src = "/logo.png"; await asset.decode();
        const cutout = document.createElement("canvas"); cutout.width = 805; cutout.height = 475;
        const ink = cutout.getContext("2d")!;
        ink.drawImage(asset, 95, 265, 805, 475, 0, 0, 805, 475);
        const pixels = ink.getImageData(0, 0, 805, 475);
        for (let i = 0; i < pixels.data.length; i += 4) {
          const darkest = Math.min(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]);
          pixels.data[i + 3] = Math.round(pixels.data[i + 3] * (1 - darkest / 255));
        }
        ink.putImageData(pixels, 0, 0); logo.current = cutout;
      }
      if (cancelled || !canvas.current) return;
      const el = canvas.current; el.width = photo.width; el.height = photo.height;
      const ctx = el.getContext("2d"); if (!ctx) return;
      ctx.drawImage(photo, 0, 0); paint(ctx, marks, el.width, el.height, logo.current);
      el.toBlob(blob => { if (!cancelled && blob) onExport(new File([blob], "pixu-happily-documented.png", { type: "image/png" })); }, "image/png");
    }).catch(() => { if (!cancelled) onExport(null); });
    return () => { cancelled = true; };
  }, [image, marks, onExport]);
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  };
  const finish = () => {
    moving.current = null;
    if (draft.current) { const mark = draft.current; draft.current = null; setMarks(previous => [...previous, mark]); }
  };
  return <div className="booth-photo-editor">
    <canvas ref={canvas} aria-label="Your photo. Choose a sticker then tap to place it, or choose Draw to doodle." role="img" style={{ touchAction: "none", cursor: tool === "Move" ? "grab" : "crosshair" }}
      onPointerDown={event => {
        const p = point(event);
        if (tool === "Move") {
          const rect = event.currentTarget.getBoundingClientRect();
          const reversedIndex = [...marks].reverse().findIndex(mark => {
            if (mark.kind === "sticker") {
              const width = mark.size * (mark.text === "PIXÜ" ? 3 : mark.text.length > 1 ? mark.text.length * .65 : 1);
              const height = mark.text === "PIXÜ" ? width * 475 / 805 * rect.width / rect.height : mark.size;
              return Math.abs(p.x - mark.point.x) < width / 2 + .02 && Math.abs(p.y - mark.point.y) < height / 2 + .02;
            }
            return mark.points.some((v, i) => {
              const next = mark.points[i + 1] || v;
              const dx = next.x - v.x, dy = next.y - v.y;
              const distance = dx * dx + dy * dy;
              const t = distance ? Math.max(0, Math.min(1, ((p.x - v.x) * dx + (p.y - v.y) * dy) / distance)) : 0;
              return Math.hypot((p.x - v.x - t * dx) * rect.width, (p.y - v.y - t * dy) * rect.height) < 14;
            });
          });
          if (reversedIndex >= 0) {
            const index = marks.length - 1 - reversedIndex;
            event.currentTarget.setPointerCapture(event.pointerId);
            moving.current = { index, start: p, original: marks[index] };
          }
          return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        onExport(null);
        if (tool === "Draw") draft.current = { kind: "draw", points: [p], color, width: penWidth };
        else setMarks(previous => [...previous, { kind: "sticker", point: p, text: tool, color, size }]);
      }}
      onPointerMove={event => {
        if (moving.current) {
          const { index, start, original } = moving.current;
          const p = point(event), dx = p.x - start.x, dy = p.y - start.y;
          onExport(null);
          setMarks(previous => previous.map((mark, i) => i !== index ? mark : original.kind === "sticker"
            ? { ...original, point: { x: original.point.x + dx, y: original.point.y + dy } }
            : { ...original, points: original.points.map(v => ({ x: v.x + dx, y: v.y + dy })) }));
          return;
        }
        if (!draft.current) return;
        const p = point(event), mark = draft.current, previous = mark.points[mark.points.length - 1];
        mark.points.push(p);
        const el = event.currentTarget, ctx = el.getContext("2d");
        if (ctx) paint(ctx, [{ ...mark, points: [previous, p] }], el.width, el.height);
      }} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} />
    <details className="booth-decoration-tools"><summary className="booth-design-trigger"><svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m4 16-1 5 5-1L20 8l-4-4L4 16Z M13 7l4 4M4 16l4 4M19 2v3M17.5 3.5h3" /></svg><span><strong>Make it yours</strong><small>Design your photo · stickers & doodles</small></span><span className="design-trigger-plus" aria-hidden="true">+</span></summary>
      <p>Pick a sticker and tap your photo to place it. Draw to doodle, or choose Move and drag any sticker or doodle to reposition it.</p>
      <div className="editor-tool-row" aria-label="Decoration tools">{["Move", "Draw", "PIXÜ", "♡", "♥", "✦", "★", "✿", "☺", "xoxo"].map(item => <button type="button" key={item} aria-pressed={tool === item} aria-label={item === "Move" ? "Move stickers and doodles" : item === "Draw" ? "Draw on photo" : `Place ${item} sticker`} onClick={() => setTool(item)}>{item === "PIXÜ" ? <Image src="/logo.png" alt="PIXÜ logo" width={48} height={28} className="editor-logo-sticker" /> : item}</button>)}</div>
      <div className="editor-tool-row">
        <label>Ink <input aria-label="Drawing and sticker colour" type="color" value={color} onChange={e => setColor(e.target.value)} /></label>
        <label>Sticker size <input type="range" min="0.035" max="0.18" step="0.005" value={size} onChange={e => setSize(Number(e.target.value))} /></label>
        <label>Pen size <input type="range" min="0.002" max="0.016" step="0.001" value={penWidth} onChange={e => setPenWidth(Number(e.target.value))} /></label>
      </div>
      <div className="editor-tool-row"><button type="button" disabled={!marks.length} onClick={() => setMarks(previous => previous.slice(0, -1))}>Undo</button><button type="button" disabled={!marks.length} onClick={() => setMarks([])}>Clear decorations</button></div>
      <p className="small">Shapes, stickers and doodles are included in your download. Changing the finish keeps your decorations.</p>
    </details>
  </div>;
}
