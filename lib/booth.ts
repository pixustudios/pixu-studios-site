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
];
export const boothLayouts = [
  { id: "strip", name: "4-photo strip", count: 4, columns: 1, width: 1200, frameRatio: 16 / 9 },
  { id: "grid", name: "4-photo grid", count: 4, columns: 2, width: 1600, frameRatio: 16 / 9 },
  { id: "single", name: "Landscape photo", count: 1, columns: 1, width: 1600, frameRatio: 16 / 9 },
  { id: "duo", name: "2-photo strip", count: 2, columns: 1, width: 1200, frameRatio: 4 / 3 },
] as const;
export type BoothLayoutId = (typeof boothLayouts)[number]["id"];
export async function createComposite(
  photos: string[],
  template: (typeof boothTemplates)[number],
  layoutId: BoothLayoutId = photos.length === 1 ? "single" : "strip",
) {
  const layout = boothLayouts.find((item) => item.id === layoutId)!;
  if (photos.length !== layout.count) throw new Error("Please retake the photos for your selected layout.");
  const padding = 50;
  const gap = 28;
  const frameWidth = (layout.width - padding * 2 - gap * (layout.columns - 1)) / layout.columns;
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
  context.fillStyle = template.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < photos.length; i++) {
    const photo = new Image();
    photo.src = photos[i];
    await photo.decode();
    const ratio = Math.max(frameWidth / photo.width, frameHeight / photo.height);
    const sourceWidth = Math.min(photo.width, frameWidth / ratio);
    const sourceHeight = Math.min(photo.height, frameHeight / ratio);
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
  }
  await document.fonts.ready;
  const family = getComputedStyle(document.documentElement).getPropertyValue(
    "--font-display",
  );
  context.fillStyle = template.text;
  context.textAlign = "center";
  context.font = `italic 600 85px ${family || "Georgia"}`;
  context.fillText("pixü", canvas.width / 2, canvas.height - 100);
  context.font = "24px Arial";
  context.fillText(
    "WHERE MOMENTS ARE HAPPILY DOCUMENTED.",
    canvas.width / 2,
    canvas.height - 45,
  );
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
