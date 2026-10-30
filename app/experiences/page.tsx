import Image from "next/image";
import { experiences, site } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import TrackedLink from "../components/TrackedLink";
import FinalCTA from "../components/FinalCTA";
import TiltPhoto from "../components/TiltPhoto";
export const metadata = pageMetadata(
  "Vintage Photobooth Hire",
  "Vintage photobooth hire with instant prints and personalised keepsakes. Discover what’s included in the PIXÜ photobooth experience.",
  "/experiences",
);
export default function Experiences() {
  return (
    <main id="main" className="experiences-page">
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
          <TiltPhoto>
            <Image
              src="/pixu-photobooth-refined.png"
              alt="PIXÜ wooden photobooth on its wooden tripod"
              fill
              sizes="(max-width: 767px) 92vw, 50vw"
            />
          </TiltPhoto>
          <div className="detail-copy">
            <h2>
              {service.name}
            </h2>
            <p>{service.detail}</p>
            <h3 className="eyebrow">The experience includes</h3>
            <ul className="inclusions">
              {service.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="small">{service.note}</p>
            <TrackedLink className="sketch-booking-link" href="#booking" />
          </div>
          <div className="supporting-photos">
            {[{ src: "/pixu-heart-strip-new.png", alt: "An I love pixü strip with four black-and-white group portraits", width: 304, height: 912 }, { src: "/pixu-pattern-strip-new.png", alt: "A patterned pixü strip with three portraits of two friends", width: 298, height: 913 }, { src: "/pixu-red-strip.png", alt: "A red pixü photo strip with four group portraits", width: 306, height: 919 }, { src: "/pixu-friends-black-strip.png", alt: "A black pixü photo strip with four portraits of three friends", width: 311, height: 936 }].map((photo) => (
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
