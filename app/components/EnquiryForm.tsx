"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import {
  eventTypes,
  guestCounts, boothOptions,
  validateEnquiry,
  type Enquiry,
} from "@/lib/enquiry";
import { track } from "@/lib/analytics";
import Link from "next/link";
type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
function EnquiryFormContent() {
  const [eventChoice, setEventChoice] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof Enquiry, string>>>(
    {},
  );
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [message, setMessage] = useState("");
  const started = useRef(false);
  const submitting = useRef(false);
  const requestId = useRef("");
  const token = useRef("");
  const widget = useRef<string | undefined>(undefined);
  const security = useRef<HTMLDivElement>(null);
  const result = useRef<HTMLDivElement>(null);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(
    () => () => {
      if (widget.current) window.turnstile?.remove(widget.current);
    },
    [],
  );
  const mountSecurity = () => {
    if (
      !sitekey ||
      !security.current ||
      !window.turnstile ||
      widget.current !== undefined
    )
      return;
    widget.current = window.turnstile.render(security.current, {
      sitekey,
      action: "enquiry",
      theme: "dark",
      size: "flexible",
      callback: (value: string) => {
        token.current = value;
        setMessage("");
      },
      "expired-callback": () => {
        token.current = "";
      },
      "error-callback": () => {
        token.current = "";
        setMessage(
          "The security check couldn’t load. Please retry or email info@pixustudios.com.",
        );
      },
    });
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const checked = validateEnquiry(fields);
    setErrors(checked.errors);
    setMessage("");
    if (!checked.valid) {
      const first = Object.keys(checked.errors)[0];
      (form.elements.namedItem(first) as HTMLElement)?.focus();
      return;
    }
    if (sitekey && !token.current) {
      setMessage("Please complete the security check below, then try again.");
      security.current?.focus();
      return;
    }
    submitting.current = true;
    setState("loading");
    requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checked.data,
          website: fields.website,
          token: token.current,
          requestId: requestId.current,
        }),
        signal: AbortSignal.timeout(25000),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setErrors(data.errors || {});
        throw new Error(data.error || "Please try again or email us directly.");
      }
      setState("success");
      track("enquiry_submitted");
      requestAnimationFrame(() => result.current?.focus());
    } catch (error) {
      setState("idle");
      setMessage(
        error instanceof Error && error.name !== "TimeoutError"
          ? error.message
          : "We couldn’t confirm delivery. Please try again or email info@pixustudios.com.",
      );
    } finally {
      submitting.current = false;
      token.current = "";
      if (widget.current !== undefined) window.turnstile?.reset(widget.current);
    }
  };
  if (state === "success")
    return (
      <div ref={result} tabIndex={-1} className="success-panel" role="status">
        <p className="eyebrow">Enquiry received</p>
        <h2>You’re in.</h2>
        <p>We’ll check the date and get back to you shortly.</p>
        <p>
          This is an enquiry, not a confirmed booking. We’ll talk through the
          details together.
        </p>
        <Link href="/#gallery" className="text-link">
          A little inspiration while you wait
        </Link>
      </div>
    );
  const field = (
    name: keyof Enquiry,
    label: string,
    type = "text",
    optional = false,
    autoComplete?: string,
  ) => (
    <label className="form-field">
      <span id={`${name}-label`}>
        {label}
        {optional && " (optional)"}
      </span>
      <input
        aria-labelledby={`${name}-label`}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={!optional}
        maxLength={
          name === "email"
            ? 254
            : name === "location"
              ? 200
              : name === "phone"
                ? 30
                : 100
        }
        min={
          type === "date" ? new Date().toISOString().slice(0, 10) : undefined
        }
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
      />
      {errors[name] && (
        <span className="field-error" id={`${name}-error`}>
          {errors[name]}
        </span>
      )}
    </label>
  );
  const choice = (
    name: keyof Enquiry,
    label: string,
    options: string[],
    onChange?: (value: string) => void,
    className = "",
  ) => (
    <label className={`form-field ${className}`}>
      <span id={`${name}-label`}>{label}</span>
      <select name={name} required defaultValue="" aria-labelledby={`${name}-label`} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={e => onChange?.(e.target.value)}>
        <option value="" disabled>Select an option</option>
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
      {errors[name] && <span className="field-error" id={`${name}-error`}>{errors[name]}</span>}
    </label>
  );
  return (
    <form
      className="enquiry-form"
      onSubmit={submit}
      noValidate
      aria-busy={state === "loading"}
      onFocus={() => {
        if (!started.current) {
          track("enquiry_started");
          started.current = true;
        }
      }}
    >
      <div className="form-grid">
        {field("name", "Full Name", "text", false, "name")}
        {field("email", "Email", "email", false, "email")}
        {field("phone", "Phone", "tel", false, "tel")}
        {field("date", "Event Date", "date")}
        {field("eventTime", "Event Time")}
        {field("duration", "Photobooth Hire Duration")}
        {choice("eventType", "Type of Event", eventTypes, setEventChoice)}
        {eventChoice === "Other" && field("eventTypeOther", "Other event type")}
        {field("location", "Location", "text", true)}
        {choice("guestCount", "Estimated Number of Guests", guestCounts)}
        {choice("boothOption", "Photobooth option", boothOptions, undefined, "full")}
        <label className="form-field full">
          <span id="details-label">Anything else we should know? (optional)</span>
          <textarea aria-labelledby="details-label" name="details" rows={2} maxLength={2000} aria-invalid={!!errors.details} aria-describedby={errors.details ? "details-error" : undefined} />
          {errors.details && <span id="details-error" className="field-error">{errors.details}</span>}
        </label>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          Leave this empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {sitekey && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            onReady={mountSecurity}
            onError={() =>
              setMessage(
                "The security check is unavailable. Please email info@pixustudios.com.",
              )
            }
          />
          <div
            ref={security}
            className="turnstile"
            tabIndex={-1}
            aria-label="Security verification"
          />
        </>
      )}
      {message && (
        <p className="form-status" role="alert">
          {message}
        </p>
      )}
      <button className="button" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Sending your enquiry…" : "Send enquiry"}
      </button>
      <p className="form-note">
        We’ll use these details to respond to your enquiry.{" "}
        <Link href="/privacy">Privacy & cookies</Link>. No payment needed to
        enquire.
      </p>
    </form>
  );
}

export default function EnquiryForm() {
 return <div className="pixu-modern"><EnquiryFormContent /></div>;
}
