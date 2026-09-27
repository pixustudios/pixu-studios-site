import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
export const metadata = pageMetadata(
  "Privacy & Cookies",
  "How the PIXÜ website handles enquiry details, camera access and optional analytics.",
  "/privacy",
);
export default function Privacy() {
  return (
    <main id="main" className="container prose">
      <p className="eyebrow">Your privacy</p>
      <h1>
        Small print.
        <br />
        <em>Clear intentions.</em>
      </h1>
      <p>
        This page describes how the website is designed to work.
        Business-specific privacy details are awaiting confirmation before
        public launch.
      </p>
      <h2>Your enquiries</h2>
      <p>
        The enquiry form collects your name, email, event date, event type,
        location and chosen experience. Your phone number and message are
        optional. These details are sent to PIXÜ so the team can respond and
        prepare a quote.
      </p>
      <p>
        The configured delivery service is Resend. When enabled, Cloudflare
        Turnstile checks form submissions for spam and may process technical
        device and connection information. Hosting providers also process
        technical request data to operate the site.
      </p>
      <h2>The online booth</h2>
      <p>
        The booth asks for camera access only after you choose “Allow camera”.
        It does not request microphone access. Captured photographs are
        processed in your browser’s memory and are not uploaded to PIXÜ’s
        server. Download saves a copy to your device. Sharing sends the image to
        the destination you choose in your device’s share menu.
      </p>
      <p>
        The camera is stopped when you finish capturing, cancel, leave the page,
        or put the page in the background. Refreshing the page clears the
        booth’s in-memory photographs.
      </p>
      <h2>Cookies & analytics</h2>
      <p>
        No analytics provider is enabled by default. The site includes optional
        event hooks, which remain inactive until analytics consent is recorded.
        The camera tool does not need tracking cookies. A configured
        spam-prevention service may use technical storage; review its current
        privacy information below.
      </p>
      <p>
        If analytics is enabled later, the privacy notice must identify the
        provider and a choice to accept, decline and withdraw consent must be
        available before non-essential tracking begins.
      </p>
      <h2>Contact & your choices</h2>
      <p>
        Contact <a href={`mailto:${site.email}`}>{site.email}</a> about your
        data or an enquiry. The business must confirm its legal identity, postal
        contact details, lawful basis, retention period, processors,
        international transfers, rights procedure and complaint information
        before launch.
      </p>
      <p>
        <a href="https://www.cloudflare.com/privacypolicy/">
          Cloudflare privacy information
        </a>{" "}
        ·{" "}
        <a href="https://resend.com/legal/privacy-policy">
          Resend privacy information
        </a>{" "}
        ·{" "}
        <a href="https://ico.org.uk/for-the-public/">
          UK privacy rights information
        </a>
      </p>
    </main>
  );
}
