import TrackedLink from "./TrackedLink";
export default function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="container">
        <p className="eyebrow">Let’s make a memory</p>
        <h2>
          Your event.
          <br />
          <em>Happily documented.</em>
        </h2>
        <TrackedLink className="button button-light" />
      </div>
    </section>
  );
}
