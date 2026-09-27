import Image from "next/image";
import { getReviews } from "@/lib/reviews";
export default async function Reviews() {
  const content = await getReviews();
  if (!content.reviews.length)
    return (
      <section id="reviews" className="container reviews-empty">
        <p className="eyebrow">From the room</p>
        <h2>
          Good company.
          <br />
          <em>Even better memories.</em>
        </h2>
        <p>
          The photographs tell the story. Take a look through our recent
          moments.
        </p>
        {content.url && (
          <a className="text-link" href={content.url}>
            Read all reviews on Google ↗
          </a>
        )}
      </section>
    );
  return (
    <section id="reviews" className="section container">
      <div className="section-heading">
        <p className="eyebrow">From the people who were there</p>
        <h2>A few kind words.</h2>
      </div>
      {content.google && (
        <p className="small">
          {content.rating} / 5 · {content.count} Google reviews. Selected by
          Google, ordered by relevance.{" "}
          <a
            href="https://support.google.com/contributionpolicy/answer/7400114"
            className="text-link"
          >
            About Google reviews
          </a>
        </p>
      )}
      <div className="review-grid">
        {content.reviews.map((review, i) => (
          <figure key={i}>
            <p aria-label={`${review.rating} out of 5 stars`}>
              {"★".repeat(Math.min(5, Math.max(0, Math.round(review.rating))))}
            </p>
            <blockquote>“{review.text}”</blockquote>
            <figcaption>
              {review.avatar && (
                <Image
                  src={review.avatar}
                  width={36}
                  height={36}
                  alt=""
                  unoptimized
                  referrerPolicy="no-referrer"
                />
              )}
              <span>
                {review.authorUrl ? (
                  <a href={review.authorUrl}>{review.name}</a>
                ) : (
                  review.name
                )}
                {review.date && <> · {review.date}</>}
                {review.source && review.url && (
                  <>
                    {" "}
                    · <a href={review.url}>Original review ↗</a>
                    <span className="google-attribution" translate="no">
                      Google Maps
                    </span>
                  </>
                )}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      {content.url && (
        <a href={content.url} className="text-link">
          Read all reviews on Google ↗
        </a>
      )}
    </section>
  );
}
