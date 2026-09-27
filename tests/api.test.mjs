import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import ts from "typescript";
const source = readFileSync(
  new URL("../app/api/enquiry/route.ts", import.meta.url),
  "utf8",
).replace(
  "@/lib/enquiry",
  pathToFileURL(process.cwd() + "/lib/enquiry.ts").href,
);
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { POST } = await import(
  "data:text/javascript;base64," + Buffer.from(js).toString("base64")
);
const saved = { ...process.env };
const realFetch = globalThis.fetch;
const valid = {
  name: "Test Guest",
  email: "guest@example.com",
  phone: "+44 7700 900123",
  date: "2027-10-20",
  eventType: "Wedding",
  location: "London",
  eventTime: "7pm", duration: "3 hours", guestCount: "51-100", boothOption: "Digital Only", heardFrom: "Instagram", contactMethod: "Email",
  details: "",
  requestId: "12345678-1234-1234-1234-123456789abc",
  token: "test-token",
};
const req = (body = valid, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/enquiry", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  process.env.NODE_ENV = "test";
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  process.env.RESEND_API_KEY = "test-only";
  process.env.ENQUIRY_FROM_EMAIL = "test@example.com";
  process.env.ENQUIRY_TO_EMAIL = "test@example.com";
  delete process.env.TURNSTILE_SECRET_KEY;
  globalThis.fetch = async () => {
    throw new Error("Unexpected network call");
  };
});
afterEach(() => {
  for (const key of Object.keys(process.env))
    if (!(key in saved)) delete process.env[key];
  Object.assign(process.env, saved);
  globalThis.fetch = realFetch;
});
test("cross-origin requests rejected before delivery", async () =>
  assert.equal((await POST(req(valid, "https://other.example"))).status, 403));
test("malformed and oversized bodies rejected", async () => {
  assert.equal((await POST(req({ details: "x".repeat(16001) }))).status, 413);
  assert.equal((await POST(req(null))).status, 400);
});
test("honeypot blocks submission", async () =>
  assert.equal((await POST(req({ ...valid, website: "spam" }))).status, 400));
test("invalid form returns field errors", async () => {
  const response = await POST(req({ ...valid, email: "wrong" }));
  assert.equal(response.status, 400);
  assert.ok((await response.json()).errors.email);
});
test("production fails closed without spam credentials", async () => {
  process.env.NODE_ENV = "production";
  assert.equal((await POST(req())).status, 503);
});
test("missing delivery credentials never claims success", async () => {
  delete process.env.RESEND_API_KEY;
  assert.equal((await POST(req())).status, 503);
});
test("failed email provider never claims success", async () => {
  globalThis.fetch = async () => new Response("{}", { status: 500 });
  assert.equal((await POST(req())).status, 502);
});
test("provider timeout is a recoverable failure", async () => {
  globalThis.fetch = async () => {
    throw new Error("timeout");
  };
  assert.equal((await POST(req())).status, 502);
});
test("successful retries send identical idempotency key and safe plain text", async () => {
  const keys = [];
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    keys.push(options.headers["Idempotency-Key"]);
    const body = JSON.parse(options.body);
    assert.equal(body.reply_to, valid.email);
    assert.ok(!body.html);
    return Response.json({ id: "test-accepted" });
  };
  assert.equal((await POST(req())).status, 200);
  assert.equal((await POST(req())).status, 200);
  assert.equal(keys[0], keys[1]);
});
test("Turnstile hostname and action checked before sending", async () => {
  process.env.TURNSTILE_SECRET_KEY = "test-only";
  globalThis.fetch = async () =>
    Response.json({
      success: true,
      hostname: "evil.example",
      action: "enquiry",
    });
  assert.equal((await POST(req())).status, 400);
  globalThis.fetch = async () =>
    Response.json({ success: true, hostname: "localhost", action: "other" });
  assert.equal((await POST(req())).status, 400);
});
test("verified production submission is accepted", async () => {
  process.env.NODE_ENV = "production";
  process.env.TURNSTILE_SECRET_KEY = "test-only";
  globalThis.fetch = async (url) =>
    url.includes("siteverify")
      ? Response.json({
          success: true,
          hostname: "localhost",
          action: "enquiry",
        })
      : Response.json({ id: "test-accepted" });
  assert.equal((await POST(req())).status, 200);
});
