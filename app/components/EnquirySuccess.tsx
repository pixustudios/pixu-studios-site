"use client";
import Link from "next/link";
import { forwardRef } from "react";

const steps = [
  ["We check your date", "We’ll check availability for your event."],
  ["We find your perfect setup", "We’ll suggest a suitable package for your plans."],
  ["Your tailored quote arrives", "A quote shaped around your event, ready to explore."],
];

const EnquirySuccess = forwardRef<HTMLDivElement>(function EnquirySuccess(_, ref) {
  return (
    <div ref={ref} tabIndex={-1} className="success-panel enquiry-next" role="status">
      <p className="eyebrow">Enquiry received</p>
      <h2>A little closer to your moment.</h2>
      <p className="enquiry-next-intro">Thank you for getting in touch. Here’s what happens next.</p>
      <ol className="enquiry-next-steps" aria-label="What happens next">
        {steps.map(([title, description], index) => (
          <li key={title} style={{ animationDelay: `${180 + index * 220}ms` }}>
            <span className="enquiry-next-number" aria-hidden="true">0{index + 1}</span>
            <div><h3>{title}</h3><p>{description}</p></div>
          </li>
        ))}
      </ol>
      <p className="enquiry-next-note">Your date is confirmed once we’ve agreed the details and completed your booking.</p>
      <Link href="/#gallery" className="text-link">A little inspiration while you wait</Link>
    </div>
  );
});

export default EnquirySuccess;
