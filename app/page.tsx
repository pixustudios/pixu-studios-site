import Image from "next/image";
import { experiences } from "@/lib/site";
import Reviews from "./components/Reviews";
import Link from "next/link";
import EnquiryForm from "./components/EnquiryForm";
import GalleryLightbox from "./components/GalleryLightbox";

const eventImageSources = ["/insta1.jpg", "/insta2.jpg", "/insta3.jpg", "/insta4.jpg", "/insta5.jpg", "/insta6.jpg", "/insta7.jpg"];
const galleryImages = Array.from({ length: 100 }, (_, index) => ({ src: eventImageSources[index % eventImageSources.length], label: "Event name" }));

function SectionShell({ id, children, alternate = false }: { id?: string; children: React.ReactNode; alternate?: boolean }) {
  return <section id={id} className={`border-b border-[color:var(--line)] ${alternate ? "bg-[color:var(--background-alt)]" : "bg-[color:var(--background)]"}`}><div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">{children}</div></section>;
}

export default function Home() {
  return <main id="main" className="bg-[color:var(--background)] text-[color:var(--foreground)]">
    <SectionShell alternate>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><div className="max-w-[620px]"><p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--brand-red)]">PIXÜ Studios</p><h1 className="mt-5 text-5xl leading-[0.9] text-[color:var(--heading)] sm:text-6xl lg:text-7xl xl:text-[5.1rem]">Where moments are happily documented.</h1><p className="mt-6 max-w-xl text-base leading-8 text-[color:var(--foreground-soft)] sm:text-lg">Vintage photobooth hire and 35mm film photography for events worth remembering.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="#booking" className="rounded-full bg-[color:var(--brand-red)] px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-[#f8f3ee] transition hover:bg-[color:var(--brand-red-deep)]">Book your experience</Link><Link href="/online-booth" className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-[color:var(--foreground)]">Online Photobooth</Link></div></div><div className="overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-3 shadow-[var(--shadow-soft)]"><Image src="/insta1.jpg" alt="PIXÜ event photograph" width={900} height={1000} priority className="h-[420px] w-full rounded-[1.4rem] object-cover sm:h-[520px]" /></div></div>
    </SectionShell>
    <SectionShell id="experiences">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--brand-action)]">The experiences</p>
      <h2 className="mt-4 text-5xl text-[color:var(--heading)] sm:text-6xl">Two ways to keep the moment.</h2>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {experiences.map(service => <article key={service.id}>
          <Image src={service.id === "photobooth" ? "/booth.jpeg" : service.image.src} alt={service.id === "photobooth" ? "PIXÜ vintage photobooth set up for an event" : service.image.alt} width={service.image.width} height={service.image.height} sizes="(max-width: 767px) 90vw, 45vw" className="h-[360px] w-full rounded-[1.4rem] object-cover" />
          <h3 className="mt-6 text-3xl text-[color:var(--heading)] sm:text-4xl">{service.name}</h3>
          <p className="mt-4 text-base leading-8 text-[color:var(--foreground-soft)]">{service.description}</p>
          <Link className="mt-5 inline-flex text-sm underline underline-offset-4" href={`/experiences#${service.id}`}>{service.link} ↗</Link>
        </article>)}
      </div>
    </SectionShell>
    <SectionShell id="about"><div className="mx-auto max-w-3xl text-center"><h2 className="text-5xl leading-[0.92] text-[color:var(--heading)] sm:text-6xl lg:text-7xl">A tale of Pixü Studios</h2><div className="mt-10 space-y-6 text-base leading-8 text-[color:var(--foreground-soft)] sm:text-lg"><p>In the heart of London, H &amp; D found delight in wandering from one photobooth to another, treasuring each fleeting smile, each captured embrace. From this fondness for photographs and the merriment they bring, a vision was born:</p><p>To fashion a booth not merely for pictures, but for moments — timeless, tender, and joyfully remembered. Thus, Pixü Studios came to be, where memories are not simply taken, but happily documented.</p></div></div></SectionShell>
    <SectionShell id="gallery" alternate><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--brand-red)]">PIXÜ gallery</p><h2 className="mt-4 text-5xl text-[color:var(--heading)] sm:text-6xl">Archive</h2></div><p className="max-w-sm text-sm leading-7 text-[color:var(--foreground-soft)]">Scroll through a collection of moments from the room.</p></div><div className="mt-10"><GalleryLightbox images={galleryImages} layout="filmstrip" /></div><a href="https://www.instagram.com/pixustudios" target="_blank" rel="noreferrer" className="mt-8 inline-flex text-[10px] uppercase tracking-[0.2em] text-[color:var(--brand-red)] underline-offset-4 hover:underline">See more on Instagram</a></SectionShell>
    <div className="pixu-modern"><Reviews /></div>
    <SectionShell id="booking"><div className="max-w-4xl"><p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--brand-red)]">Book now</p><h2 className="mt-4 text-4xl text-[color:var(--heading)] sm:text-5xl lg:text-6xl">Begin your PIXÜ experience.</h2><p className="mt-6 text-base leading-8 text-[color:var(--foreground-soft)] sm:text-lg">A few details are all we need to check your date and shape the right setup.</p></div><div className="booking-layout mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]"><div className="min-w-0"><EnquiryForm /></div><aside className="booking-support flex flex-col justify-center rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--brand-red)] p-6 text-[color:var(--foreground)] shadow-[var(--shadow-soft)] sm:p-8"><p className="text-[10px] uppercase tracking-[0.28em] text-[#f8d9c6]">What happens next</p><h3 className="mt-4 text-3xl text-[#fffaf6] sm:text-4xl">We&apos;ll tailor the setup to your event.</h3><ul className="mt-7 space-y-4 text-sm leading-7 text-[#fff4ee]"><li>• We check your date and venue</li><li>• We suggest the right booth setup</li><li>• You receive a tailored quote</li></ul><div className="mt-8 border-t border-white/15 pt-5"><a href="mailto:info@pixustudios.com" className="text-sm text-[#fffaf6] underline underline-offset-4">info@pixustudios.com</a></div></aside></div></SectionShell>
  </main>;
}
