# Original site audit

The original application was inspected and run before implementation. Its Next.js App Router, React, TypeScript, Tailwind, existing photography and serif/sans identity were retained. A local ignored ZIP preserves the original source and assets.

## Main findings

- Navigation split one buying journey across Home, Services, Packages, Reviews and booking destinations; packages had no prices.
- The homepage repeated seven photographs many times. Gallery images had placeholder descriptions and little useful browsing control.
- The enquiry asked for operational details too early. Its Google Forms no-cors submission could report success even when delivery failed.
- Reviews were samples, not evidence of genuine customer feedback.
- Online Booth mixed camera capture, decorations, an incomplete shop and cart. Camera lifecycle handling produced lint warnings and capture required repeated actions.
- Responsive CSS contained overlapping breakpoint fixes, inconsistent spacing and unused horizontal space. Burgundy supporting text had weak contrast on dark surfaces.
- Duplicate navigation/theme components and unfinished routes increased maintenance cost.
- No tested server-side lead delivery, deployment guide, configurable SEO architecture or automated tests were present.
- Baseline lint reported ten warnings. Dependency auditing later identified vulnerabilities in the original framework and transitive dependencies.

## Decisions

Use the original photography as the main visual material; retain the original H & D story. Consolidate services and unpriced collections into two scannable experiences. Put an accessible availability CTA in the shared header, including mobile. Keep reviews empty until genuine content is supplied. Keep camera imagery on the device. Preserve legacy URLs with permanent redirects. Avoid a framework migration.

The new component/configuration structure and deployment procedure are documented in ../README.md. No prices, customer counts, ratings, founders or achievements were invented.
