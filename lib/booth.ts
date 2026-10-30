export async function requestCamera(): Promise<MediaStream> {
  return new Promise((resolve, reject) => {
    let finished = false;
    const timer = setTimeout(() => {
      finished = true;
      reject(
        new Error(
          "The camera permission request is still waiting. Check your browser’s permission prompt, or open this page in Safari or Chrome and try again.",
        ),
      );
    }, 20000);
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1440 },
          aspectRatio: { ideal: 4 / 3 },
        },
        audio: false,
      })
      .then(
        (media) => {
          clearTimeout(timer);
          if (finished) {
            media.getTracks().forEach((track) => track.stop());
            return;
          }
          finished = true;
          resolve(media);
        },
        (error) => {
          clearTimeout(timer);
          if (!finished) {
            finished = true;
            reject(error);
          }
        },
      );
  });
}
export const boothTemplates = [
  { name: "Burgundy", background: "#701c2c", text: "#f5efe8" },
  { name: "Paper", background: "#f5efe8", text: "#281d21" },
  { name: "Midnight", background: "#141112", text: "#f5efe8" },
  { name: "Dusty rose", background: "#dfaaa5", text: "#321e25" },
  { name: "PIXÜ gold", background: "#e5b447", text: "#281d21" },
  { name: "White", background: "#ffffff", text: "#171312" },
  { name: "Black", background: "#000000", text: "#ffffff" },
  { name: "Stone", background: "#b8afa5", text: "#281d21" },
  { name: "Charcoal", background: "#454343", text: "#ffffff" },
  { name: "Navy", background: "#24344a", text: "#ffffff" },
  { name: "Forest", background: "#344b40", text: "#ffffff" },
  { name: "Classic red", background: "#ad302c", text: "#ffffff" },
];
export const boothLayouts = [
  { id: "strip", name: "4-photo strip", count: 4, columns: 1, width: 1200, frameRatio: 16 / 9 },
  { id: "grid", name: "4-photo grid", count: 4, columns: 2, width: 1600, frameRatio: 16 / 9 },
  { id: "single", name: "Landscape photo", count: 1, columns: 1, width: 1600, frameRatio: 16 / 9 },
  { id: "duo", name: "2-photo strip", count: 2, columns: 1, width: 1200, frameRatio: 4 / 3 },
  { id: "portrait", name: "Portrait keepsake", count: 1, columns: 1, width: 1200, frameRatio: 3 / 4 },
  { id: "trio", name: "3-photo story", count: 3, columns: 1, width: 1200, frameRatio: 4 / 3 },
] as const;
export type BoothLayoutId = (typeof boothLayouts)[number]["id"];
export const photoShapes = ["Rectangle", "Oval", "Circle", "Heart", "Star", "Arch"] as const;
export type PhotoShape = (typeof photoShapes)[number];
export const photoFilters = [
  { name: "Original", value: "none" },
  { name: "Black & white", value: "grayscale(1) contrast(1.08)" },
  { name: "Vintage", value: "sepia(.45) saturate(.7) contrast(.92) brightness(1.06)" },
  { name: "Warm", value: "sepia(.25) saturate(1.15) brightness(1.04)" },
  { name: "Cool", value: "saturate(.8) hue-rotate(15deg) brightness(1.05)" },
  { name: "Soft", value: "contrast(.85) saturate(.8) brightness(1.1)" },
  { name: "Bold", value: "contrast(1.2) saturate(1.25)" },
] as const;
export function photoShapePath(shape: PhotoShape, x: number, y: number, w: number, h: number) {
  const path = new Path2D();
  const cx = x + w / 2, cy = y + h / 2;
  if (shape === "Oval" || shape === "Circle") {
    const r = Math.min(w, h) / 2;
    path.ellipse(cx, cy, shape === "Circle" ? r : w / 2, shape === "Circle" ? r : h / 2, 0, 0, Math.PI * 2);
  } else if (shape === "Heart") {
    path.moveTo(cx, y + h);
    path.bezierCurveTo(x - w * .2, y + h * .48, x, y - h * .3, cx, y + h * .22);
    path.bezierCurveTo(x + w, y - h * .3, x + w * 1.2, y + h * .48, cx, y + h);
  } else if (shape === "Star") {
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const radius = i % 2 ? .46 : 1;
      const px = cx + Math.cos(angle) * w / 2 * radius;
      const py = cy + Math.sin(angle) * h / 2 * radius;
      if (i === 0) path.moveTo(px, py); else path.lineTo(px, py);
    }
  } else if (shape === "Arch") {
    path.moveTo(x, y + h); path.lineTo(x, y + h / 2);
    path.bezierCurveTo(x, y - h / 6, x + w, y - h / 6, x + w, y + h / 2);
    path.lineTo(x + w, y + h);
  } else path.rect(x, y, w, h);
  path.closePath();
  return path;
}
export async function createComposite(
  photos: string[],
  template: (typeof boothTemplates)[number],
  layoutId: BoothLayoutId = photos.length === 1 ? "single" : "strip",
  shape: PhotoShape = "Rectangle",
  filter: string = "none",
) {
  const layout = boothLayouts.find((item) => item.id === layoutId)!;
  if (photos.length !== layout.count) throw new Error("Please retake the photos for your selected layout.");
  const padding = 50;
  const gap = 28;
  const frameWidth = (layout.width - padding * 2 - gap * (layout.columns - 1)) / layout.columns;
  // Shape is a mask within the layout, never a change to the exported frame dimensions.
  const frameHeight = Math.round(frameWidth / layout.frameRatio);
  const rows = Math.ceil(layout.count / layout.columns);
  const canvas = document.createElement("canvas");
  canvas.width = layout.width;
  canvas.height = padding * 2 + rows * frameHeight + (rows - 1) * gap + 180;
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error(
      "Your browser couldn’t create the image. Try a different browser.",
    );
  await document.fonts.ready;
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-display") || "Georgia";
  context.fillStyle = template.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < photos.length; i++) {
    const photo = new Image();
    photo.src = photos[i];
    await photo.decode();
    const ratio = Math.max(frameWidth / photo.width, frameHeight / photo.height);
    const sourceWidth = Math.min(photo.width, frameWidth / ratio);
    const sourceHeight = Math.min(photo.height, frameHeight / ratio);
    if (shape !== "Rectangle") {
      context.save();
      context.clip(photoShapePath(shape, padding + (i % layout.columns) * (frameWidth + gap), padding + Math.floor(i / layout.columns) * (frameHeight + gap), frameWidth, frameHeight));
    }
    context.filter = filter;
    context.drawImage(
      photo,
      (photo.width - sourceWidth) / 2,
      (photo.height - sourceHeight) / 2,
      sourceWidth,
      sourceHeight,
      padding + (i % layout.columns) * (frameWidth + gap),
      padding + Math.floor(i / layout.columns) * (frameHeight + gap),
      frameWidth,
      frameHeight,
    );
    context.filter = "none";
    if (shape !== "Rectangle") context.restore();
  }
  context.fillStyle = template.text;
  context.textAlign = "center";
  context.font = `italic 600 85px ${family || "Georgia"}`;
  context.fillText("pixü", canvas.width / 2, canvas.height - 100);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) =>
        value
          ? resolve(value)
          : reject(new Error("Image export failed. Please try again.")),
      "image/png",
    ),
  );
  return { canvas, blob };
}
export function cameraErrorMessage(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError")
    return "Camera access wasn’t allowed. Open your browser’s site settings to allow the camera, then try again. In an in-app browser, open this page in Safari or Chrome.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "No available camera was found. Try a device with a front-facing camera.";
  if (name === "NotReadableError" || name === "AbortError")
    return "Your camera may be in use by another app. Close that app and try again.";
  return error instanceof Error
    ? error.message
    : "The camera couldn’t start. Try opening this page in Safari or Chrome over HTTPS.";
}
