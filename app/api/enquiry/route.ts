import { createHash } from "node:crypto";
import { validateEnquiry } from "@/lib/enquiry";
import { googleFormAnswers, googleFormUrl } from "@/lib/google-form";
const accepted = new Map<string, number>();
export const runtime = "nodejs";
const reply = (body: object, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  const allowed =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `${requestUrl.protocol}//${request.headers.get("host") || requestUrl.host}`;
  if (!origin || origin !== new URL(allowed).origin)
    return reply(
      { error: "Please submit the form from the PIXÜ website." },
      403,
    );
  if (!request.headers.get("content-type")?.includes("application/json"))
    return reply({ error: "Unsupported request." }, 415);
  let raw: Record<string, unknown>;
  try {
    // Bound the actual stream, not only the untrusted Content-Length header.
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Empty request." }, 400);
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 16000) {
        await reader.cancel();
        return reply({ error: "Your message is too long." }, 413);
      }
      chunks.push(chunk.value);
    }
    raw = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new Error("invalid");
  } catch {
    return reply({ error: "Please check the form and try again." }, 400);
  }
  if (raw.website)
    return reply(
      { error: "We couldn’t verify this enquiry. Please email us instead." },
      400,
    );
  const validated = validateEnquiry(raw);
  if (!validated.valid)
    return reply(
      {
        error: "Please check the highlighted fields.",
        errors: validated.errors,
      },
      400,
    );
  if (
    typeof raw.requestId !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(raw.requestId)
  )
    return reply({ error: "Please refresh the page and try again." }, 400);
  const {
    TURNSTILE_SECRET_KEY,
  } = process.env;
  if (
    (process.env.NODE_ENV === "production" && !TURNSTILE_SECRET_KEY)
  )
    return reply(
      {
        error:
          "Online enquiries are temporarily unavailable. Please email info@pixustudios.com with your event date.",
      },
      503,
    );
  try {
    if (TURNSTILE_SECRET_KEY) {
      if (
        typeof raw.token !== "string" ||
        !raw.token ||
        raw.token.length > 2048
      )
        return reply({ error: "Please complete the security check." }, 400);
      const verified = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: new URLSearchParams({
            secret: TURNSTILE_SECRET_KEY,
            response: raw.token,
          }),
          signal: AbortSignal.timeout(8000),
        },
      );
      const result = await verified.json();
      if (
        !verified.ok ||
        !result.success ||
        result.hostname !== new URL(allowed).hostname ||
        result.action !== "enquiry"
      )
        return reply(
          { error: "The security check expired. Please try again." },
          400,
        );
    }
    const { data } = validated;
    const hash = createHash("sha256")
      .update(raw.requestId + JSON.stringify(data))
      .digest("hex");
    for (const [key, expires] of accepted) if (expires < Date.now()) accepted.delete(key);
    if (accepted.has(hash)) return reply({ ok: true }, 200);
    const response = await fetch(googleFormUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: googleFormAnswers(data),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok)
      return reply(
        {
          error:
            "We couldn’t send your enquiry. Your details are still here — try again or email info@pixustudios.com.",
        },
        502,
      );
    const confirmation = await response.text();
    if (!/class="[^"]*(?:vHW8K|freebirdFormviewerViewResponseConfirmationMessage)/.test(confirmation)) throw new Error("Google Form did not confirm receipt");
    if (accepted.size >= 1000) accepted.delete(accepted.keys().next().value!);
    accepted.set(hash, Date.now() + 10 * 60 * 1000);
    return reply({ ok: true }, 200);
  } catch {
    return reply(
      {
        error:
          "We couldn’t confirm your enquiry was received. Please check before submitting again, or email info@pixustudios.com.",
      },
      502,
    );
  }
}
