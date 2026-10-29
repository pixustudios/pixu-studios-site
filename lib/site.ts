export const site = {
  name: "PIXÜ Studios",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: "info@pixustudios.com",
  instagram: "https://www.instagram.com/pixustudios",
  tiktok: "https://www.tiktok.com/@pixustudios",
  facebook: "https://www.facebook.com/pixustudios",
  googleReviewsUrl: "",
  legalName: "",
  postalAddress: "",
  retention: "",
};
export type Review = {
  name: string;
  rating: number;
  text: string;
  source?: "Google";
  url?: string;
  authorUrl?: string;
  avatar?: string;
  date?: string;
};
// Only genuine reviews with permission to reproduce. No sample testimonials.
export const approvedReviews: Review[] = [];
export const googleRating: { rating: number; count: number } | null = null;
export const gallery = [
  {
    src: "/insta1.jpg",
    alt: "A kiss on the cheek, caught in black and white at a PIXÜ event",
    width: 1107,
    height: 806,
    caption: "The in-between moments",
  },
  {
    src: "/insta5.jpg",
    alt: "Friends laughing together at a PIXÜ event",
    width: 1219,
    height: 807,
    caption: "One more, together",
  },
  {
    src: "/insta7.jpg",
    alt: "Four friends posing outside a venue at night",
    width: 1118,
    height: 801,
    caption: "After dark",
  },
  {
    src: "/insta3.jpg",
    alt: "A printed portrait of two friends smiling in the booth",
    width: 932,
    height: 1109,
    caption: "A little something to keep",
  },
  {
    src: "/insta6.jpg",
    alt: "Black and white photo strips spread across a wooden table",
    width: 1206,
    height: 836,
    caption: "Memories, in print",
  },
  {
    src: "/insta2.jpg",
    alt: "Four candid photobooth poses on a SIP + BLING print",
    width: 902,
    height: 1150,
    caption: "Four frames. All you.",
  },
  {
    src: "/insta4.jpg",
    alt: "A collage of guests and printed portraits from SIP + BLING",
    width: 933,
    height: 1189,
    caption: "A room full of stories",
  },
];
export const experiences = [
  {
    id: "photobooth",
    number: "01",
    name: "Vintage Photobooth Hire",
    description:
      "Beautiful photographs and instant keepsakes, made for the people in the room.",
    image: gallery[3],
    supporting: [gallery[4], gallery[5]],
    link: "Explore the photobooth",
    includes: [
      "Unlimited booth sessions & instant prints",
      "Personalised print design",
      "Digital gallery",
      "Professional attendant, setup & pack down",
    ],
    detail:
      "DSLR photography, considered lighting and a vintage-style setup. We’ll shape the backdrop and print design around your event.",
    note: "Optional guestbooks, premium backdrops and bespoke styling can be discussed with your quote.",
  },
];
