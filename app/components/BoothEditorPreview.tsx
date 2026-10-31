"use client";
import { useEffect, useState } from "react";
import BoothPhotoEditor from "./BoothPhotoEditor";
import { createComposite, boothTemplates, photoShapes, type PhotoShape } from "@/lib/booth";
export default function BoothEditorPreview() {
  const [shape, setShape] = useState<PhotoShape>("Heart");
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    let cancelled = false;
    createComposite(["/pixu-photobooth-kiss-black-and-white.jpg"], boothTemplates[1], "single", shape).then(({canvas}) => { if (!cancelled) setImage(canvas.toDataURL()); });
    return () => { cancelled = true; };
  }, [shape]);
  return <main id="main" className="pixu-modern container booth-shell"><h1>pixü & friends editor preview</h1><p>Local sample photo — no camera needed.</p><label className="booth-shape-picker">Photo shape<select value={shape} onChange={e => setShape(e.target.value as PhotoShape)}>{photoShapes.map(s => <option key={s}>{s}</option>)}</select></label>{image && <BoothPhotoEditor image={image} onExport={setFile} />}<p role="status">{file ? "Decorated download ready" : "Preparing image…"}</p></main>;
}
