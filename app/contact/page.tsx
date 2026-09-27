"use client";

import Link from "next/link";
import EnquiryForm from "../components/EnquiryForm";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">


      <section className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--brand-red)]">Contact</p>
            <h1 className="mt-5 max-w-xl text-5xl leading-[0.9] text-[color:var(--heading)] sm:text-6xl lg:text-7xl">
              Let’s plan your moment.
            </h1>
          </div>

          <div className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--brand-red)]">Quick enquiry</p>
            <p className="mt-3 text-base leading-8 text-[color:var(--foreground-soft)]">
              Tell us about your event, guest count, style, and the kind of experience you’d like.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--brand-red)]">Email</p>
            <a
              href="mailto:info@pixustudios.com"
              className="mt-4 block text-xl text-[color:var(--foreground)] transition hover:text-[color:var(--brand-red)]"
            >
              info@pixustudios.com
            </a>
          </div>

          <div className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--brand-red)]">Instagram</p>
            <a
              href="https://www.instagram.com/pixustudios"
              target="_blank"
              rel="noreferrer"
              className="mt-4 block text-xl text-[color:var(--foreground)] transition hover:text-[color:var(--brand-red)]"
            >
              @pixustudios
            </a>
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--brand-red)] p-6 text-[#fffaf6] shadow-[var(--shadow-soft)] sm:p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#f8d9c6]">Start the conversation</p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">
            We’ll tailor the setup to your event.
          </h2>
          <ul className="mt-8 space-y-4 text-sm leading-7 text-[#fff4ee]">
            <li>• A personalised quote based on your event type and date</li>
            <li>• Best booth setup and packaging suggestions</li>
            <li>• Guidance on layouts, themes, and guest experience</li>
            <li>• Quick confirmation from the Pixu team</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="mailto:info@pixustudios.com?subject=Pixu%20Studio%20Enquiry"
              className="inline-flex items-center justify-center rounded-full bg-[#fffaf6] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[color:var(--brand-red)] transition hover:bg-[#f8f3ee]"
            >
              Enquire now
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#fffaf6] transition hover:border-white/40 hover:bg-white/10"
            >
              Back home
            </Link>
          </div>
        </div>
        <div id="booking" className="mt-10"><EnquiryForm /></div>
      </section>
    </main>
  );
}
