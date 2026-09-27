import Image from "next/image";
import { gallery } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import FinalCTA from "../components/FinalCTA";
export const metadata = pageMetadata(
  "A Tale of PIXÜ",
  "Born from H & D’s love of London photobooths. Meet the idea behind PIXÜ Studios and the moments we happily document.",
  "/about",
);
export default function About() {
  return (
    <main id="main">
      <section className="container about-layout section">
        <div>
          <p className="eyebrow">A tale of PIXÜ Studios</p>
          <h1>
            It started
            <br />
            <em>with a strip.</em>
          </h1>
          <p className="serif-lead">
            A fondness for photographs.
            <br />
            And the merriment they bring.
          </p>
          <p>
            In the heart of London, H &amp; D found delight in wandering from
            one photobooth to another, treasuring each fleeting smile, each
            captured embrace.
          </p>
          <p>
            From that fondness, a vision was born: a booth not merely for
            pictures, but for moments — timeless, tender, and joyfully
            remembered.
          </p>
          <p>
            That’s PIXÜ. Where memories are not simply taken, but happily
            documented.
          </p>
        </div>
        <figure>
          <Image
            src={gallery[4].src}
            alt={gallery[4].alt}
            width={1206}
            height={836}
            sizes="(max-width: 767px) 92vw, 48vw"
          />
          <figcaption>A few little reasons to do it all again.</figcaption>
        </figure>
      </section>
      <FinalCTA />
    </main>
  );
}
