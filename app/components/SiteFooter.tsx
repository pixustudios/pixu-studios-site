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
        <a className="footer-google-review" href="https://www.google.com/maps/place//data=!4m3!3m2!1s0xa690fbe9dfcf0c17:0x783b12b4310897ae!12e1?source=g.page.m._&laa=merchant-review-solicitation" target="_blank" rel="noopener noreferrer" aria-label="Leave us a review on Google"><span>Leave us a review</span></a>
        <a className="social-link" href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram"><SiInstagram size={20} aria-hidden="true" /></a>
        <a className="social-link" href={site.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" title="TikTok"><SiTiktok size={20} aria-hidden="true" /></a>
        <a className="social-link" href={site.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook"><SiFacebook size={20} aria-hidden="true" /></a>
      </div>
      <div className="footer-bottom"><p className="copyright">
        © 2026 PIXU STUDIOS
      </p>
      <Link href="/privacy">Privacy & cookies</Link></div>
    </footer>
  );
}
