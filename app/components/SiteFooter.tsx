import Link from "next/link";
import { SiFacebook, SiInstagram, SiTiktok } from "react-icons/si";
import { site } from "@/lib/site";
export default function SiteFooter() {
  return (
    <footer className="container site-footer">
      <div>
        <p className="footer-enquiry-line">For collaboration and other enquiries, please email us at <a href="mailto:info@pixustudios.com">info@pixustudios.com</a></p>
      </div>
      <div className="footer-links">
        <a className="social-link" href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram"><SiInstagram size={20} aria-hidden="true" /></a>
        <a className="social-link" href={site.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" title="TikTok"><SiTiktok size={20} aria-hidden="true" /></a>
        <a className="social-link" href={site.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook"><SiFacebook size={20} aria-hidden="true" /></a>
      </div>
      <div className="footer-bottom"><p className="copyright">
        © 2025–{new Date().getFullYear()} PIXUSTUDIOS
      </p>
      <Link href="/privacy">Privacy & cookies</Link></div>
    </footer>
  );
}
