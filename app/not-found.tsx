import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container page-intro">
      <p className="eyebrow">404 / Out of frame</p>
      <h1>
        This moment
        <br />
        <em>got away.</em>
      </h1>
      <p>Let’s get you back to the good times.</p>
      <div className="actions">
        <Link href="/" className="button">
          Back to PIXÜ ↗
        </Link>
      </div>
    </main>
  );
}
