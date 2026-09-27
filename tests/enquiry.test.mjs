import assert from "node:assert/strict";
import { test } from "node:test";
import { validateEnquiry } from "../lib/enquiry.ts";
import { cameraErrorMessage } from "../lib/booth.ts";
const valid = {
  name: "Test Guest",
  email: "guest@example.com",
  phone: "+44 7700 900123",
  date: "2027-10-20",
  eventType: "Wedding",
  location: "London",
  eventTime: "7pm", duration: "3 hours", guestCount: "51-100", boothOption: "Digital Only", heardFrom: "Instagram", contactMethod: "Email",
  details: "",
};
test("booking is valid without optional location or message", () =>
  assert.equal(validateEnquiry({...valid, location: ""}, "2026-09-27").valid, true));
test("required fields, malformed email and invalid choices fail", () => {
  const result = validateEnquiry({
    ...valid,
    name: "",
    email: "bad",
    eventType: "invented",
    boothOption: "",
    location: "",
  });
  assert.deepEqual(Object.keys(result.errors), [
    "name",
    "email",
    "eventType",
    "boothOption",
  ]);
});
test("past and impossible calendar dates are rejected", () => {
  for (const date of ["2020-01-01", "2027-02-30", "tomorrow"])
    assert.equal(
      validateEnquiry({ ...valid, date }, "2026-09-27").valid,
      false,
    );
});
test("oversized message and invalid phone fail", () => {
  const result = validateEnquiry({
    ...valid,
    details: "x".repeat(2001),
    phone: "not a phone",
  });
  assert.ok(result.errors.details);
  assert.ok(result.errors.phone);
});
test("input is trimmed and unknown fields never enter delivery payload", () => {
  const result = validateEnquiry({
    ...valid,
    name: " Guest ",
    secret: "ignore",
  });
  assert.equal(result.data.name, "Guest");
  assert.equal("secret" in result.data, false);
});
test("camera errors provide useful recovery", () => {
  for (const [name, text] of [
    ["NotAllowedError", "site settings"],
    ["NotFoundError", "No available camera"],
    ["NotReadableError", "another app"],
  ]) {
    const error = new Error();
    error.name = name;
    assert.ok(cameraErrorMessage(error).includes(text));
  }
});

test("booking required fields and Other event responses are validated", () => {
  for (const key of ["phone", "eventTime", "duration", "guestCount", "boothOption"]) {
    assert.ok(validateEnquiry({ ...valid, [key]: "" }).errors[key], key);
  }
  assert.ok(validateEnquiry({ ...valid, eventType: "Other" }).errors.eventTypeOther);
  assert.equal(validateEnquiry({ ...valid, eventType: "Other", eventTypeOther: "Graduation" }).valid, true);
});
