"use client";
import Link from "next/link";
import { track, type AnalyticsEvent } from "@/lib/analytics";
export default function TrackedLink({
  href = "/contact",
  children = "Book your event",
  className = "button",
  event = "check_availability_clicked",
}: {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  event?: AnalyticsEvent;
}) {
  return (
    <Link href={href} className={className} onClick={() => track(event)}>
      {children}
      <span aria-hidden="true"> ↗</span>
    </Link>
  );
}
