import Image from "next/image";
import { experiences, site } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import TrackedLink from "../components/TrackedLink";
import FinalCTA from "../components/FinalCTA";
export const metadata = pageMetadata(
  "The Experiences",
  "Vintage photobooth hire, instant prints and candid 35mm film photography. Discover what’s included in the PIXÜ event experience.",
  "/experiences",
);
export default function Experiences() {
  return (
    <main id="main">
      <header className="container page-intro">
        <p className="eyebrow">The PIXÜ experiences</p>
        <h1>
          A good night.
          <br />
          <em>A great keepsake.</em>
        </h1>
        <p>
          Two ways to happily document your event.
          <br />
          Choose one, or make a night of both.
        </p>
        <div className="actions">
          <a className="text-link" href="#photobooth">
            Vintage Photobooth
          </a>
          <a className="text-link" href="#film">
            35mm Film
          </a>
        </div>
      </header>
      {experiences.map((service) => (
        <section
          id={service.id}
          key={service.id}
          className="section container experience-detail"
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Service",
                name: service.name,
                description: service.description,
                areaServed: "London",
                provider: {
                  "@type": "Organization",
                  name: site.name,
                  url: site.url,
                },
              }).replace(/</g, "\\u003c"),
            }}
          />
          <div className="detail-photo">
            <Image
              src={service.image.src}
              alt={service.image.alt}
              fill
              sizes="(max-width: 767px) 92vw, 50vw"
            />
          </div>
          <div className="detail-copy">
            <p className="eyebrow">
              {service.number} /{" "}
              {service.id === "film" ? "On film" : "Behind the curtain"}
            </p>
            <h2>
              {service.name}
              {service.id === "photobooth" && " Hire"}
            </h2>
            <p className="serif-lead">{service.suffix}</p>
            <p>{service.detail}</p>
            <h3 className="eyebrow">The experience includes</h3>
            <ul className="inclusions">
              {service.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="small">{service.note}</p>
            <TrackedLink href={`/contact?experience=${service.id}`} />
          </div>
          <div className="supporting-photos">
            {service.supporting.map((photo) => (
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 767px) 44vw, 45vw"
              />
            ))}
          </div>
        </section>
      ))}
      <FinalCTA />
    </main>
  );
}
