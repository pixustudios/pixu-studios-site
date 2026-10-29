import Image from "next/image";
import { experiences } from "@/lib/site";
import Reviews from "./components/Reviews";
import Link from "next/link";
import BookingSection from "./components/BookingSection";
import GalleryLightbox from "./components/GalleryLightbox";

const eventImageSources = ["/insta1.jpg", "/insta2.jpg", "/insta3.jpg", "/insta4.jpg", "/insta5.jpg", "/insta6.jpg", "/insta7.jpg"];
const galleryImages = Array.from({ length: 100 }, (_, index) => ({ src: eventImageSources[index % eventImageSources.length], label: `Event photograph ${index + 1}` }));

function SectionShell({ id, children, alternate = false }: { id?: string; children: React.ReactNode; alternate?: boolean }) {
  return <section id={id} className={`border-b border-[color:var(--line)] ${alternate ? "bg-[color:var(--background-alt)]" : "bg-[color:var(--background)]"}`}><div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">{children}</div></section>;
}

export default function Home() {
  return <main id="main" className="home-page bg-[color:var(--background)] text-[color:var(--foreground)]">
    <SectionShell alternate>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><div className="max-w-[620px]"><h1 className="home-hero-title mt-5 text-5xl leading-[0.9] text-[color:var(--heading)] sm:text-6xl lg:text-7xl xl:text-[5.1rem]">Where moments are happily docümented.</h1><p className="mt-6 max-w-xl text-base leading-8 text-[color:var(--foreground-soft)] sm:text-lg">Vintage photobooth hire for events worth remembering.</p><div className="hero-links mt-8 flex flex-wrap gap-x-8 gap-y-2"><Link href="#booking" className="photobooth-explore"><span className="explore-bracket" aria-hidden="true">[</span><span>Book your experience</span><span className="explore-bracket" aria-hidden="true">]</span></Link><Link href="/online-booth" className="photobooth-explore"><span className="explore-bracket" aria-hidden="true">[</span><span>Online Photobooth</span><span className="explore-bracket" aria-hidden="true">]</span></Link></div></div><div className="overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-3 shadow-[var(--shadow-soft)]"><Image src="/insta1.jpg" alt="PIXÜ event photograph" width={900} height={1000} priority className="h-[420px] w-full rounded-[1.4rem] object-cover sm:h-[520px]" /></div></div>
    </SectionShell>
    <SectionShell id="experiences">
      <div>
        {experiences.map(service => <article key={service.id} className="grid items-center gap-8 md:grid-cols-[1.3fr_1fr] md:gap-12">
          <Image src="/pixu-photobooth-refined.png" alt="PIXÜ wooden photobooth with its illuminated camera ring and wooden tripod" width={640} height={1643} sizes="(max-width: 767px) 90vw, 45vw" className="photobooth-cutout h-[520px] w-full object-contain sm:h-[640px]" />
          <div>
          <h3 className="text-3xl text-[color:var(--heading)] sm:text-4xl">{service.name}</h3>
          <p className="mt-4 text-base leading-8 text-[color:var(--foreground-soft)]">{service.description}</p>
          <Link className="photobooth-explore" href={`/experiences#${service.id}`}><span className="explore-bracket" aria-hidden="true">[</span><span>{service.link}</span><span className="explore-bracket" aria-hidden="true">]</span></Link>
          </div>
        </article>)}
      </div>
    </SectionShell>
    <SectionShell id="about"><div className="mx-auto max-w-3xl text-center"><h2 className="text-5xl leading-[0.92] text-[color:var(--heading)] sm:text-6xl lg:text-7xl">A tale of Pixü Studios</h2><div className="mt-10 space-y-6 text-base leading-8 text-[color:var(--foreground-soft)] sm:text-lg"><p>In the heart of London, H &amp; D found delight in wandering from one photobooth to another, treasuring each fleeting smile, each captured embrace. From this fondness for photographs and the merriment they bring, a vision was born:</p><p>To fashion a booth not merely for pictures, but for moments — timeless, tender, and joyfully remembered. Thus, Pixü Studios came to be, where memories are not simply taken, but happily documented.</p></div></div></SectionShell>
    <SectionShell id="gallery" alternate><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><h2 className="text-5xl text-[color:var(--heading)] sm:text-6xl">Archives</h2></div><p className="max-w-sm text-sm leading-7 text-[color:var(--foreground-soft)]">Scroll through a collection of moments from the room.</p></div><div className="mt-10"><GalleryLightbox images={galleryImages} layout="filmstrip" footer={<a href="https://www.instagram.com/pixustudios" target="_blank" rel="noreferrer" className="inline-flex text-[10px] uppercase tracking-[0.2em] text-[color:var(--brand-red)] underline-offset-4 hover:underline">See more on Instagram</a>} /></div></SectionShell>
    <div className="pixu-modern"><Reviews /></div>
    <BookingSection />
    <SectionShell id="brands"><div className="client-brands"><div className="client-brand-row"><figure><div className="client-logo-surface"><Image src="/brands/on-the-run-official.png" alt="OTR Club — On The Run Club" width={600} height={95} className="client-logo-otr" /></div></figure><figure><div className="client-logo-surface"><Image src="/brands/wsl-airbnb.png" alt="Barclays Women’s Super League × Airbnb" width={720} height={317} /></div></figure><figure><div className="client-logo-surface"><Image src="/brands/lululemon.svg" alt="lululemon" width={240} height={34} /></div></figure></div></div></SectionShell>
  </main>;
}
