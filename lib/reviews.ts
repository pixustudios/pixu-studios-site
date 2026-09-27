import { approvedReviews, site, type Review } from "./site";
export type ReviewContent = {
  reviews: Review[];
  google: boolean;
  url: string;
  rating?: number;
  count?: number;
};
type PlaceReview = {
  rating: number;
  originalText?: { text: string };
  text?: { text: string };
  authorAttribution?: { displayName: string; uri?: string; photoUri?: string };
  googleMapsUri?: string;
  relativePublishTimeDescription?: string;
};
export async function getReviews(): Promise<ReviewContent> {
  const fallback = {
    reviews: approvedReviews,
    google: false,
    url: site.googleReviewsUrl,
  };
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const place = process.env.GOOGLE_PLACE_ID;
  if (process.env.GOOGLE_REVIEWS_ENABLED !== "true" || !key || !place)
    return fallback;
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(place)}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "reviews,rating,userRatingCount,googleMapsUri",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!response.ok) return fallback;
    const data = await response.json();
    const reviews = (data.reviews || [])
      .map((review: PlaceReview): Review => ({
        name: review.authorAttribution?.displayName || "Google reviewer",
        rating: review.rating,
        text: review.originalText?.text || review.text?.text || "",
        source: "Google",
        url: review.googleMapsUri,
        authorUrl: review.authorAttribution?.uri,
        avatar: review.authorAttribution?.photoUri,
        date: review.relativePublishTimeDescription,
      }))
      .filter((review: Review) => review.text && review.url);
    return {
      reviews,
      google: true,
      url: site.googleReviewsUrl || data.googleMapsUri || "",
      rating: data.rating,
      count: data.userRatingCount,
    };
  } catch {
    return fallback;
  }
}
