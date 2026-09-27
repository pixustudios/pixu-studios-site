import Link from "next/link";
import { site } from "@/lib/site";
export default function SiteFooter() {
  return (
    <footer className="container site-footer">
      <div>
        <p className="footer-label">Enquiries</p>
        <a className="footer-email" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      </div>
      <div className="footer-links">
        <p className="footer-label">Follow</p>
        <a href={site.instagram} target="_blank" rel="noreferrer">Instagram ↗</a>
        <a href={site.tiktok} target="_blank" rel="noreferrer">TikTok ↗</a>
        <Link href="/privacy">Privacy & cookies</Link>
      </div>
      <p className="copyright">
        © 2025–{new Date().getFullYear()} PIXÜ Studios
      </p>
    </footer>
  );
}
