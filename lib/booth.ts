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
export function createBoothLogoMark(asset: CanvasImageSource) {
  const logo = document.createElement("canvas");
  logo.width = 805;
  logo.height = 475;
  const context = logo.getContext("2d");
  if (!context)
    throw new Error("Your browser couldn’t prepare the PIXÜ logo. Please try again.");
  context.drawImage(asset, 95, 265, 805, 475, 0, 0, 805, 475);
  const pixels = context.getImageData(0, 0, logo.width, logo.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const darkest = Math.min(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]);
    pixels.data[i + 3] = Math.round(pixels.data[i + 3] * (1 - darkest / 255));
  }
  context.putImageData(pixels, 0, 0);
  return logo;
}
export function applyPhotoFilterPixels(pixels: Uint8ClampedArray, filter: string) {
  const operations = [...filter.matchAll(/([a-z-]+)\(([^)]+)\)/g)];
  if (operations.map(([operation]) => operation).join(" ") !== filter.trim())
    throw new Error("This photo filter isn’t supported by your browser.");
  const clamp = (value: number) => Math.max(0, Math.min(255, value));
  for (let offset = 0; offset < pixels.length; offset += 4) {
    let [red, green, blue] = pixels.slice(offset, offset + 3);
    for (const [, name, rawValue] of operations) {
      const value = Number(rawValue.replace(/%|deg$/, ""));
      if (!Number.isFinite(value))
        throw new Error("This photo filter isn’t supported by your browser.");
      const amount = rawValue.endsWith("%") ? value / 100 : value;
      if (name === "grayscale" || name === "sepia") {
        const weight = Math.max(0, Math.min(1, amount));
        const transformed = name === "grayscale"
          ? [red * .2126 + green * .7152 + blue * .0722, red * .2126 + green * .7152 + blue * .0722, red * .2126 + green * .7152 + blue * .0722]
          : [red * .393 + green * .769 + blue * .189, red * .349 + green * .686 + blue * .168, red * .272 + green * .534 + blue * .131];
        red = clamp(red + (transformed[0] - red) * weight);
        green = clamp(green + (transformed[1] - green) * weight);
        blue = clamp(blue + (transformed[2] - blue) * weight);
      } else if (name === "saturate") {
        const gray = red * .213 + green * .715 + blue * .072;
        red = clamp(gray * (1 - amount) + red * amount);
        green = clamp(gray * (1 - amount) + green * amount);
        blue = clamp(gray * (1 - amount) + blue * amount);
      } else if (name === "hue-rotate") {
        const radians = value * Math.PI / 180;
        const cosine = Math.cos(radians), sine = Math.sin(radians);
        [red, green, blue] = [
          clamp(red * (.213 + .787 * cosine - .213 * sine) + green * (.715 - .715 * cosine - .715 * sine) + blue * (.072 - .072 * cosine + .928 * sine)),
          clamp(red * (.213 - .213 * cosine + .143 * sine) + green * (.715 + .285 * cosine + .140 * sine) + blue * (.072 - .072 * cosine - .283 * sine)),
          clamp(red * (.213 - .213 * cosine - .787 * sine) + green * (.715 - .715 * cosine + .715 * sine) + blue * (.072 + .928 * cosine + .072 * sine)),
        ];
      } else if (name === "contrast") {
        red = clamp((red - 128) * amount + 128);
        green = clamp((green - 128) * amount + 128);
        blue = clamp((blue - 128) * amount + 128);
      } else if (name === "brightness") {
        red = clamp(red * amount);
        green = clamp(green * amount);
        blue = clamp(blue * amount);
      } else {
        throw new Error("This photo filter isn’t supported by your browser.");
      }
    }
    pixels[offset] = red;
    pixels[offset + 1] = green;
    pixels[offset + 2] = blue;
  }
}
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
  const supportsCanvasFilter = typeof context.filter === "string";
  context.fillStyle = template.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < photos.length; i++) {
    const photo = new Image();
    photo.src = photos[i];
    await photo.decode();
    let photoSource: CanvasImageSource = photo;
    if (filter !== "none" && !supportsCanvasFilter) {
      const filteredCanvas = document.createElement("canvas");
      filteredCanvas.width = photo.width;
      filteredCanvas.height = photo.height;
      const filteredContext = filteredCanvas.getContext("2d");
      if (!filteredContext)
        throw new Error("Your browser couldn’t apply the photo filter. Please try again.");
      filteredContext.drawImage(photo, 0, 0);
      const pixels = filteredContext.getImageData(0, 0, photo.width, photo.height);
      applyPhotoFilterPixels(pixels.data, filter);
      filteredContext.putImageData(pixels, 0, 0);
      photoSource = filteredCanvas;
    }
    const ratio = Math.max(frameWidth / photo.width, frameHeight / photo.height);
    const sourceWidth = Math.min(photo.width, frameWidth / ratio);
    const sourceHeight = Math.min(photo.height, frameHeight / ratio);
    if (shape !== "Rectangle") {
      context.save();
      context.clip(photoShapePath(shape, padding + (i % layout.columns) * (frameWidth + gap), padding + Math.floor(i / layout.columns) * (frameHeight + gap), frameWidth, frameHeight));
    }
    if (supportsCanvasFilter) context.filter = filter;
    context.drawImage(
      photoSource,
      (photo.width - sourceWidth) / 2,
      (photo.height - sourceHeight) / 2,
      sourceWidth,
      sourceHeight,
      padding + (i % layout.columns) * (frameWidth + gap),
      padding + Math.floor(i / layout.columns) * (frameHeight + gap),
      frameWidth,
      frameHeight,
    );
    if (supportsCanvasFilter) context.filter = "none";
    if (shape !== "Rectangle") context.restore();
  }
  const asset = new Image();
  asset.src = "/pixu-studios-logo.png";
  await asset.decode();
  const logo = createBoothLogoMark(asset);
  const tintedLogo = document.createElement("canvas");
  tintedLogo.width = logo.width;
  tintedLogo.height = logo.height;
  const logoContext = tintedLogo.getContext("2d");
  if (!logoContext)
    throw new Error("Your browser couldn’t prepare the PIXÜ logo. Please try again.");
  logoContext.drawImage(logo, 0, 0);
  logoContext.globalCompositeOperation = "source-in";
  logoContext.fillStyle = template.text;
  logoContext.fillRect(0, 0, tintedLogo.width, tintedLogo.height);
  const logoWidth = Math.min(150, canvas.width * .16);
  const logoHeight = logoWidth * tintedLogo.height / tintedLogo.width;
  context.drawImage(
    tintedLogo,
    (canvas.width - logoWidth) / 2,
    canvas.height - 100 - logoHeight / 2,
    logoWidth,
    logoHeight,
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
