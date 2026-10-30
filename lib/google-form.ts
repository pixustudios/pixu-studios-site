import type { Enquiry } from "./enquiry";

export const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSegu5GHrW3bZ1zhUnGvKod1n6-Izm8hxoDUWXaqkVsTFnv2NA/formResponse";
export function googleFormPrefillUrl(data: Enquiry) {
  const url = new URL(googleFormUrl.replace("/formResponse", "/viewform"));
  url.search = googleFormAnswers(data).toString();
  url.searchParams.set("entry.1800385611", data.date);
  url.searchParams.set("usp", "pp_url");
  url.searchParams.delete("fvv");
  url.searchParams.delete("pageHistory");
  return url.toString();
}

// Field IDs and choices verified from the public form on 29 October 2026.
export function googleFormAnswers(data: Enquiry) {
  const body = new URLSearchParams({
    "entry.434032452": data.name,
    "entry.1212460850": data.email,
    "entry.473720416": data.phone,
    "entry.1577066622": data.eventTime,
    "entry.1390643746": data.duration,
    "entry.1333492203": data.eventType === "Other" ? "__other_option__" : data.eventType,
    "entry.1688081254": data.location,
    "entry.1273815939": data.guestCount,
    "entry.1345294993": data.boothOption,
    "entry.1012614852": data.heardFrom === "Other" ? "__other_option__" : data.heardFrom,
    "entry.476307007": data.contactMethod,
    "entry.1331080719": data.details,
    "fvv": "1",
    "pageHistory": "0",
  });
  const [year, month, day] = data.date.split("-");
  body.set("entry.1800385611_year", year);
  body.set("entry.1800385611_month", String(Number(month)));
  body.set("entry.1800385611_day", String(Number(day)));
  if (data.eventType === "Other") body.set("entry.1333492203.other_option_response", data.eventTypeOther);
  if (data.heardFrom === "Other") body.set("entry.1012614852.other_option_response", data.heardFromOther);
  return body;
}
