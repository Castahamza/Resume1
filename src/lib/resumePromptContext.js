import { normalizeResumeContent } from "@/lib/resumeContent";

/**
 * Compact plain-text summary of resume JSON for LLM prompts (ATS-style facts).
 */
export function buildResumeContextForPrompt(content) {
  const c = normalizeResumeContent(content);
  const lines = [];

  lines.push("=== CANDIDATE RESUME (verbatim facts; do not invent beyond this) ===");
  lines.push(`Name: ${c.personal.fullName.trim() || "(not provided)"}`);
  if (c.personal.email.trim()) lines.push(`Email: ${c.personal.email.trim()}`);
  if (c.personal.phone.trim()) lines.push(`Phone: ${c.personal.phone.trim()}`);
  if (c.personal.location.trim()) lines.push(`Location: ${c.personal.location.trim()}`);
  if (c.personal.linkedin.trim()) lines.push(`LinkedIn: ${c.personal.linkedin.trim()}`);

  if (c.personal.summary.trim()) {
    lines.push("");
    lines.push("Summary:");
    lines.push(c.personal.summary.trim());
  }

  const expBlocks = c.experiences.filter(
    (e) =>
      e.company.trim() ||
      e.jobTitle.trim() ||
      e.dates.trim() ||
      e.bullets.some((b) => b.trim())
  );
  if (expBlocks.length > 0) {
    lines.push("");
    lines.push("Experience:");
    for (const e of expBlocks) {
      lines.push(
        `- ${[e.jobTitle, e.company].filter(Boolean).join(" at ") || "Role"}${e.dates ? ` (${e.dates})` : ""}`
      );
      for (const b of e.bullets.map((x) => x.trim()).filter(Boolean)) {
        lines.push(`  • ${b}`);
      }
    }
  }

  const eduBlocks = c.educations.filter(
    (ed) => ed.school.trim() || ed.degree.trim() || ed.dates.trim()
  );
  if (eduBlocks.length > 0) {
    lines.push("");
    lines.push("Education:");
    for (const ed of eduBlocks) {
      lines.push(
        `- ${[ed.degree, ed.school].filter(Boolean).join(" — ") || "Education"}${ed.dates ? ` (${ed.dates})` : ""}`
      );
    }
  }

  if (c.skills.length > 0) {
    lines.push("");
    lines.push(`Skills: ${c.skills.join(", ")}`);
  }

  return lines.join("\n").trim();
}
