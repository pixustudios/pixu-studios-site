import test from "node:test";
import assert from "node:assert/strict";
import { boothLayouts, boothTemplates, createComposite, photoShapes, photoShapePath } from "../lib/booth.ts";

test("photo masks are closed, finite paths for each supported shape", () => {
  const paths = [];
  globalThis.Path2D = class {
    constructor() { this.calls = []; paths.push(this.calls); }
    moveTo(...args) { this.calls.push(["move", ...args]); }
    lineTo(...args) { this.calls.push(["line", ...args]); }
    bezierCurveTo(...args) { this.calls.push(["curve", ...args]); }
    ellipse(...args) { this.calls.push(["ellipse", ...args]); }
    rect(...args) { this.calls.push(["rect", ...args]); }
    closePath() { this.calls.push(["close"]); }
  };
  for (const shape of photoShapes) {
    const path = photoShapePath(shape, 50, 60, 1100, 620);
    assert.equal(path.calls.at(-1)[0], "close", shape);
    assert.ok(path.calls.flatMap(call => call.slice(1)).every(Number.isFinite), shape);
    assert.ok(path.calls.length > 1, shape);
  }
  const circle = photoShapePath("Circle", 50, 60, 1100, 620).calls[0];
  assert.equal(circle[3], circle[4], "circle radii stay equal in landscape frames");
});

test("all booth layouts export the right photo count, bounds and grid positions", async () => {
  let draws = [];
  const photoFilterValues = [];
  const logoFilterValues = [];
  const context = { translate() {}, rotate() {}, save() {}, restore() {}, clip() {}, fillRect() {}, fillText() { logoFilterValues.push(this.filter); }, drawImage(...args) { draws.push(args); photoFilterValues.push(this.filter); } };
  globalThis.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => context, toBlob: (callback) => callback(new Blob(["png"])) }),
    fonts: { ready: Promise.resolve() },
    documentElement: {},
  };
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => "Georgia" });
  globalThis.Image = class { width = 1920; height = 1440; async decode() {} };
  for (const layout of boothLayouts) {
    draws = [];
    const { canvas, blob } = await createComposite(Array(layout.count).fill("photo"), boothTemplates[1], layout.id);
    assert.equal(draws.length, layout.count, layout.id);
    assert.equal(canvas.width, layout.width);
    assert.ok(blob.size > 0);
    for (const [, sx, sy, sw, sh, x, y, w, h] of draws) {
      assert.ok(sx >= 0 && sy >= 0 && sx + sw <= 1920.001 && sy + sh <= 1440.001);
      assert.ok(x >= 0 && y >= 0 && x + w <= canvas.width && y + h <= canvas.height - 180);
      assert.ok(Math.abs(w / h - layout.frameRatio) < 0.005);
    }
    if (layout.id === "grid") {
      assert.equal(draws[0][6], draws[1][6]);
      assert.equal(draws[0][5], draws[2][5]);
      assert.ok(draws[1][5] > draws[0][5]);
      assert.ok(draws[2][6] > draws[0][6]);
    }
    for (const shape of photoShapes) {
      const shaped = await createComposite(Array(layout.count).fill("photo"), boothTemplates[1], layout.id, shape);
      assert.equal(shaped.canvas.width, canvas.width, `${layout.id} ${shape} width`);
      assert.equal(shaped.canvas.height, canvas.height, `${layout.id} ${shape} height`);
    }

  }
  await assert.rejects(createComposite(["photo"], boothTemplates[0], "grid"), /retake/);
  await createComposite(["photo"], boothTemplates[0], "single", "Rectangle", "grayscale(1)");
  assert.equal(photoFilterValues.at(-1), "grayscale(1)", "filter applies to photo pixels");
  assert.equal(logoFilterValues.at(-1), "none", "logo keeps its original finish colour");
});
