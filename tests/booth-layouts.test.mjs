import test from "node:test";
import assert from "node:assert/strict";
import { boothLayouts, boothTemplates, createComposite } from "../lib/booth.ts";

test("all booth layouts export the right photo count, bounds and grid positions", async () => {
  let draws = [];
  const context = { fillRect() {}, fillText() {}, drawImage(...args) { draws.push(args); } };
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
  }
  await assert.rejects(createComposite(["photo"], boothTemplates[0], "grid"), /retake/);
});
