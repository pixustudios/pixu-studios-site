// Questions verified against the public PIXÜ Google booking form on 27 September 2026.
export const eventTypes = ["Birthday", "Wedding", "Corporate", "Brand Activation", "Private Event/Party", "Other"];
export const guestCounts = ["Less than 50", "51-100", "101-200", "More than 200"];
export const boothOptions = ["Digital Only", "Unlimited Prints + Digital"];
export type Enquiry = {
  name: string; email: string; phone: string; date: string; eventTime: string;
  duration: string; eventType: string; eventTypeOther: string; location: string;
  guestCount: string; boothOption: string; details: string;
};
export const enquiryLabels: Record<keyof Enquiry, string> = {
  name: "Full Name", email: "Email", phone: "Phone", date: "Event Date",
  eventTime: "Event Time", duration: "Photobooth Hire Duration", eventType: "Type of Event",
  eventTypeOther: "Other event type", location: "Location", guestCount: "Estimated Number of Guests",
  boothOption: "Photobooth option",
  details: "Anything else we should know?",
};
export function validateEnquiry(raw: Record<string, unknown>, today = new Date().toISOString().slice(0, 10)) {
  const data = Object.fromEntries(Object.keys(enquiryLabels).map(key => [key, typeof raw[key] === "string" ? raw[key].trim() : ""])) as Enquiry;
  const errors: Partial<Record<keyof Enquiry, string>> = {};
  if (data.name.length < 2 || data.name.length > 100) errors.name = "Please enter your full name (2–100 characters).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254) errors.email = "Please enter a valid email address.";
  if (!/^[+\d\s().-]{7,30}$/.test(data.phone)) errors.phone = "Please enter your phone number.";
  const date = new Date(data.date + "T12:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(date.getTime()) || date.toISOString().slice(0,10) !== data.date || data.date < today) errors.date = "Choose today or a future event date.";
  for (const key of ["eventTime", "duration"] as const) if (!data[key] || data[key].length > 100) errors[key] = `Please enter ${enquiryLabels[key].toLowerCase()} (up to 100 characters).`;
  const choices = { eventType: eventTypes, guestCount: guestCounts, boothOption: boothOptions };
  for (const [key, values] of Object.entries(choices)) if (!values.includes(data[key as keyof Enquiry])) errors[key as keyof Enquiry] = "Please choose an option.";
  for (const [choice, other] of [["eventType", "eventTypeOther"]] as const) {
    if (data[choice] !== "Other") data[other] = "";
    else if (!data[other] || data[other].length > 200) errors[other] = "Please specify (up to 200 characters).";
  }
  if (data.location.length > 200) errors.location = "Please keep the location under 200 characters.";
  if (data.details.length > 2000) errors.details = "Please keep your message under 2,000 characters.";
  return { data, errors, valid: Object.keys(errors).length === 0 };
}
