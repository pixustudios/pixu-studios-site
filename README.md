> Current design: original homepage layout, font families and sizing with the simplified navigation. Services/packages redirect to Experiences; Reviews is on the homepage; Store redirects to Contact. The new Online Booth and secure short enquiry form are retained. Both earlier designs are backed up locally.

# PIXÜ Studios

An editorial event photography website built with Next.js 16.3.6, React 19, TypeScript and Tailwind CSS 4. It uses the App Router, server-rendered pages, an enquiry route handler, responsive image optimisation, and local licensed Manrope / Cormorant Garamond webfonts.

## Local development

Use Node 24 LTS (minimum 22.18). From this directory:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

PowerShell: use `Copy-Item .env.example .env.local` instead of `cp` if preferred. Open http://localhost:3000. If using another host/port, change `NEXT_PUBLIC_SITE_URL` to that exact origin and restart. Without email credentials, the form deliberately returns an unavailable message; it never simulates a sent enquiry.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

The production build needs no font-network requests. The test suite uses Node’s built-in runner and mock providers; it sends no emails and does not activate a camera. See [verification](docs/VERIFICATION.md) for browser checks and remaining device tests.

## Architecture

- `app/page.tsx`: concise homepage; original photography, two experiences, interactive gallery, process, genuine reviews and final CTA.
- `app/experiences/page.tsx`: both services and verified existing inclusions; tailored quote instead of three unpriced collections.
- `app/about/page.tsx`: shortened original H & D story.
- `app/contact/page.tsx`: one enquiry flow, with optional experience preselection.
- `app/online-booth/page.tsx`: guided local-only camera workflow.
- `app/privacy/page.tsx`: factual technical privacy information and visibly identified business details awaiting confirmation.
- `app/components`: shared header/footer, tracked CTA, gallery/lightbox, enquiry form, reviews, final CTA.
- `lib/site.ts`: editable photographs, service content, contact/social links and approved manual reviews.
- `lib/enquiry.ts`: shared client/server validation. `app/api/enquiry/route.ts`: protected delivery.
- `lib/booth.ts`: camera recovery and full-resolution canvas composition.
- `lib/reviews.ts`: optional server-only Google Places adapter; approved manual fallback.
- `lib/analytics.ts`: consent-gated event interface with no provider enabled.
- `lib/metadata.ts`, `app/robots.ts`, `app/sitemap.ts`: SEO configuration.
- `app/globals.css`: tokens and responsive component styles. All original photographs remain in `public/` and `images/`.

Old routes redirect permanently: `/creative-services` → `/experiences`; `/photobooth` and `/photobooth/packages` → `/experiences#photobooth`; `/reviews` → `/#reviews`; `/store` → `/contact`. Gallery remains a homepage section. The incomplete shop, theme-switching code, duplicate headers, sample reviews and hidden cart flows were removed. A local, ignored `pixu-before-redesign.zip` preserves the pre-redesign source and assets, including uncommitted work. It must not be deployed.

## Deploy to Vercel

Vercel is the simplest fit for this existing Next.js application; a static-only host cannot run the enquiry endpoint.

1. Review the launch requirements below. Create a private GitHub repository if you do not already have one. Commit the application, lockfile, fonts/licences, original assets and `.env.example`. Never commit `.env.local`, the local backup ZIP or test artifacts.
2. In Vercel, choose **Add New → Project**, import that repository and select the directory containing this `package.json` as the Root Directory. Framework preset: **Next.js**. Node version: **24.x**.
3. Use install command `npm ci`, build command `npm run build`, and the default Next.js output setting. No custom output directory or framework migration is needed.
4. In **Settings → Environment Variables**, add the six form/site variables below for Production. Use separate test values and domains for Preview. Changes to `NEXT_PUBLIC_*` variables need a new build.
5. Deploy. Verify the Vercel deployment URL, all routes, image loading and the 404 page. Preview environments are marked noindex. Test form delivery against a controlled inbox before directing customers to it.
6. Add the custom domain as below, set `NEXT_PUBLIC_SITE_URL` to the final canonical HTTPS origin, and redeploy. Register that hostname in Turnstile.
7. Submit a real test enquiry, confirm receipt in the inbox and inspect its Reply-To. Resend acceptance is not a guarantee of inbox placement: check the provider’s delivery/bounce dashboard and monitor it after launch.

### Environment variables

| Variable                         | Purpose                                                                                        | Required        |
| -------------------------------- | ---------------------------------------------------------------------------------------------- | --------------- |
| `NEXT_PUBLIC_SITE_URL`           | Exact canonical origin, e.g. `https://YOUR_DOMAIN`; canonical/OG/sitemap and form origin check | Production      |
| `RESEND_API_KEY`                 | Server-only key allowed to send mail for your verified domain                                  | Form            |
| `ENQUIRY_FROM_EMAIL`             | Verified sender, e.g. `PIXÜ Studios <enquiries@YOUR_DOMAIN>`                                   | Form            |
| `ENQUIRY_TO_EMAIL`               | Inbox to receive enquiries                                                                     | Form            |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public Turnstile widget site key                                                               | Production form |
| `TURNSTILE_SECRET_KEY`           | Server-only Turnstile validation secret                                                        | Production form |
| `GOOGLE_REVIEWS_ENABLED`         | `true` to enable live reviews, otherwise manual fallback                                       | Optional        |
| `GOOGLE_PLACES_API_KEY`          | Server-only Places API (New) key                                                               | Live reviews    |
| `GOOGLE_PLACE_ID`                | Your genuine Google business Place ID                                                          | Live reviews    |

There is no database or camera-image storage service. Keep API keys out of `NEXT_PUBLIC_*` variables, source code and browser scripts. Only the site URL and Turnstile site key are public.

## Connect your custom domain

The repository contains an email domain but does not establish the domain you own or your DNS registrar. Replace `YOUR_DOMAIN` with your chosen domain; do not assume ownership from the email address.

1. In Vercel **Project → Settings → Domains**, add `YOUR_DOMAIN` and `www.YOUR_DOMAIN`.
2. Choose one canonical hostname; redirect the other to it in Vercel. Use the canonical origin in `NEXT_PUBLIC_SITE_URL`.
3. Open your DNS provider’s DNS management page. Copy the exact records shown on each Vercel domain card:

   | Host                                                 | Type  | Value                                             |
   | ---------------------------------------------------- | ----- | ------------------------------------------------- |
   | `@` (root/apex)                                      | A     | The IPv4 address shown by Vercel for this project |
   | `www`                                                | CNAME | The project-specific target shown by Vercel       |
   | As displayed, if ownership verification is requested | TXT   | The exact verification value from Vercel          |

4. Replace conflicting website A/AAAA/CNAME records for those hostnames. Preserve mail MX records, SPF/DKIM/DMARC TXT records and unrelated subdomains. Do not change nameservers unless you deliberately intend to migrate all DNS management.
5. Wait for DNS propagation and Vercel’s **Valid Configuration** status. Vercel provisions and renews HTTPS certificates after DNS/domain verification. Existing restrictive CAA records may need adjustment according to the Vercel dashboard.
6. Confirm both hostnames resolve over HTTPS and the alternate redirects to the canonical domain. Update Turnstile allowed hostnames and redeploy with the final site URL.
7. Check `/robots.txt` and `/sitemap.xml`: production should be indexable and all sitemap URLs must use the final domain. Submit the sitemap in your Google Search Console account when ready.

Vercel’s generic examples are A `76.76.21.21` and CNAME `cname.vercel-dns-0.com`, but **the project’s dashboard values take precedence**. Exact project-specific targets cannot be known before the project/domain is created. [Official domain setup](https://vercel.com/docs/domains/set-up-custom-domain).

## Enquiry delivery & spam protection

1. Create a Resend sending domain and add the exact DNS verification records Resend supplies. Verify the domain. Keep existing mail-provider DNS intact.
2. Create a restricted sending API key. Set sender, recipient and key as server environment variables.
3. Create a Cloudflare Turnstile widget for the production hostname. Set both keys. Do not use Cloudflare test keys on a public site.
4. The browser POSTs JSON to `/api/enquiry`. The handler checks same origin, content type, a 16 KB streamed body limit, required fields, calendar date, length limits and a honeypot. Production requires Turnstile; its one-use token, hostname and `enquiry` action are verified server-side before delivery.
5. Emails contain plain text and a validated Reply-To. No input is interpolated into HTML. A request UUID plus payload hash provides stable Resend idempotency for retries within the provider’s 24-hour window. The form locks during submission and preserves inputs on failure. It shows success only after Resend returns an accepted message ID.
6. No lead payload is logged or written to local/serverless disk. Email and infrastructure providers have their own retention. Confirm those arrangements in the privacy notice. Enable Vercel firewall/rate-limiting appropriate to traffic if sustained abuse appears; do not rely on in-memory counters across serverless instances.

[Resend email API](https://resend.com/docs/api-reference/emails/send-email), [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [Turnstile verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## Google Reviews

Default: `approvedReviews` in `lib/site.ts` is empty. No rating, invented quote or customer count is displayed. Add only authentic, approved reviews. A record contains `name`, `rating`, `text`; Google-sourced records should also preserve source, original review URL and author attribution. Configure `site.googleReviewsUrl` using your real business/reviews URL. `googleRating` is optional verified manual data; never infer it from a handful of testimonials.

For live integration, enable billing and Places API (New) in Google Cloud; provide the actual Place ID and a server-only restricted key, then set `GOOGLE_REVIEWS_ENABLED=true`. `lib/reviews.ts` fetches Place Details with a narrow field mask, a timeout and `cache: no-store`. It falls back to approved manual reviews when unavailable. Enabling it makes the homepage request-rendered. Set billing budgets and quotas. Places typically returns a selected subset, not your entire review history.

The component keeps original review text, ratings, available author avatar/name/profile link, source review link, relative date, Google Maps text attribution in the compact attribution line, and a relevance-order disclosure. Before enabling, finalise the privacy and terms notices required by Google, review the current attribution policy for your display, and verify the live response with your real listing. Do not cache or scrape review content. No aggregate-rating structured data is fabricated. [Places policies](https://developers.google.com/maps/documentation/places/web-service/policies).

## Analytics

Nothing is sent to an analytics provider by default. `track()` in `lib/analytics.ts` dispatches `pixu:analytics` browser events only when `pixu-analytics-consent` equals `granted` in localStorage. The payload is an event name only; no enquiry fields, email, photographs or full query-string URL.

To connect your provider, implement a small client adapter that subscribes to `pixu:analytics` and forwards `event.detail.name` to the provider. Mount it only after the provider’s required consent. Add an accessible accept/decline choice with no preselected consent, persist the decision and provide a privacy-page control to withdraw it. On withdrawal, stop/unload the adapter and remove any provider cookies/storage according to its documentation. Update the privacy notice first. Do not enable an invasive provider by simply pasting a script in the layout.

Events: `check_availability_clicked`, `enquiry_started`, `enquiry_submitted`, `gallery_opened`, `instagram_clicked`, `online_booth_started`, `online_booth_completed`, `online_booth_booking_clicked`.

## Update content

- **Gallery:** add an original photo under `public/`, then add an entry to `gallery` in `lib/site.ts`: `src`, accurate `alt`, real width/height and a short caption. The featured image/lightbox use `contain` to keep the full frame; thumbnails are cropped. Non-critical images are lazy loaded with responsive sizes. Preserve originals; Next.js generates AVIF/WebP variants.
- **Services/packages:** edit `experiences` in `lib/site.ts`. It drives home previews and detailed inclusions. No package names or prices are invented. Confirm film roll counts, scan/delivery format and turnaround before adding specific promises.
- **Links:** edit `site.instagram`, `site.googleReviewsUrl`, `site.email` and verified business fields in the same file. Set the domain using `NEXT_PUBLIC_SITE_URL`.
- **Story:** edit `app/about/page.tsx`, retaining factual founder/history information.
- **Templates:** edit `boothTemplates` in `lib/booth.ts`. PNG export is 1200px wide; a four-photo strip is 3620px tall. Quality is limited by the camera’s native resolution. Frames are mirrored consistently and never cropped in the composite.
- **Fonts:** licensed local Latin variable WOFF2 files are in `app/fonts/`, with original SIL OFL notices. Source: the official Google Fonts repository and Google Fonts webfont service.

## Before public launch

Supply/confirm: chosen domain and registrar access; verified sending domain and inbox; Turnstile keys; actual Google business URL/Place ID if using reviews; approved testimonials; service inclusions and delivery details; photograph publication permissions; legal entity/contact address, lawful basis, retention, processors/transfers and rights/complaints process. Finalise `app/privacy/page.tsx` and Google-required terms before live reviews. The website currently labels missing legal details honestly.

Run a real inbox-delivery test, a camera test on iOS Safari and Android Chrome, and a final accessibility/performance audit on the deployed HTTPS site. The automated suite cannot prove email inbox placement, hardware camera behaviour or native OS sharing. No deployment, DNS change, account creation, public publication or secret provisioning has been performed by this redesign.


### Booking form

The original Google Form was reviewed on 27 September 2026. The website now uses a shorter quoting flow: contact details, date/time, hire duration, event type, optional location, guest count, booth option and an optional note. Referral source and preferred contact method were deliberately removed to reduce friction. “Other” event type reveals a text field. Submission still uses `/api/enquiry` and Resend; it does not write to Google Forms.
