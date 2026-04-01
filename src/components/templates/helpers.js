/** Contact line helpers — text stays as text for ATS parsers. */

export function getContactParts(personal) {
  if (!personal || typeof personal !== "object") return [];
  return [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
  ].filter((p) => typeof p === "string" && p.trim().length > 0);
}
