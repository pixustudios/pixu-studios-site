export type AnalyticsEvent =
  | "check_availability_clicked"
  | "enquiry_started"
  | "enquiry_submitted"
  | "gallery_opened"
  | "instagram_clicked"
  | "online_booth_started"
  | "online_booth_completed"
  | "online_booth_booking_clicked";
// No network requests or personal data. A provider adapter subscribes after consent.
export function track(name: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem("pixu-analytics-consent") !== "granted") return;
    window.dispatchEvent(
      new CustomEvent("pixu:analytics", { detail: { name } }),
    );
  } catch {
    /* Tracking must never break a user action. */
  }
}
