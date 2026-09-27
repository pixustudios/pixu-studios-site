# Verification — 27 September 2026

## Completed

- Original project inspected and run before changes; original code/assets backed up locally.
- Next.js updated from 16.2.4 to 16.3.6 and compatible dependency security fixes applied. npm audit reported zero vulnerabilities after the update (356 packages audited).
- ESLint: passed without warnings. Type checking: passed. Production build: passed on Next.js 16.3.6.
- 17 Node tests passed: required fields, dates, length limits, payload sanitisation, camera error messages, origin/body limits, honeypot, missing configuration, provider failures/timeouts, Turnstile verification and idempotent successful mocked delivery.
- HTTP smoke checks against the production preview: six pages, 52 internal links/anchors, seven original images plus optimised variants, five permanent redirects, 404, robots and sitemap passed. Re-run with `node tests/smoke.mjs`; default origin is http://127.0.0.1:3002, configurable via SMOKE_URL.
- Browser layout inspection of home, experiences, about, contact, online booth and privacy at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px: no horizontal overflow.
- Desktop/mobile navigation, mobile menu dismissal with Escape, route selection and enquiry service preselection checked.
- Gallery previous/next buttons, thumbnail selection, keyboard arrows, viewer previous/next, close button, native modal focus containment, Escape and return of focus checked.
- Form: empty submission focuses the first invalid field; accessible field names remain stable; complete test input reaches the unavailable-configuration response and preserves values. No real message was sent.
- Booth: landing, layouts, explicit permission step, pending request, 20-second timeout recovery and cancellation checked. Camera requests are not made on initial page load.
- No application console warnings/errors seen during normal page/navigation checks. The intentionally unavailable form endpoint produces an expected HTTP 503 when credentials are absent.

## Limits / launch checks

- The in-app browser did not grant a hardware camera stream. Actual capture, four-frame timing, preview templates, PNG download and native share need real-device testing on iOS Safari / Android Chrome over HTTPS. Camera-error mappings are unit tested; no claim of hardware verification is made.
- Touch swipe code is present; physical touch gestures need device testing.
- Email success/provider-error paths are tested using mocks. Real Turnstile verification, Resend sending-domain setup and inbox delivery need business credentials.
- Google Places integration has not been exercised against a real listing. Supply the key/Place ID, attribution URLs and final legal notices before enabling.
- Consent-gated analytics hooks are present; no external analytics provider is active.
- No Lighthouse score or formal WCAG certification is claimed. Complete a deployed performance/accessibility review with actual service integrations and real devices before launch.
- Domain-specific canonical URLs, sitemap/indexability, HTTPS and DNS can only be finally verified after deployment configuration.

See README.md for exact configuration and deployment steps. The local preview is not a public deployment.


## Original-design restoration
The original design/routes were restored after the checks above. Those earlier responsive/redirect results describe the saved redesign. The secure form and new Online Booth remain. Build, lint and 17 tests passed after restoration; the smoke script now covers the restored routes.
