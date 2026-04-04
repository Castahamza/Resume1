import { getContactParts } from "./helpers";

/**
 * Modern: clean sans layout, blue accents. Single-column flow for ATS.
 */
export default function ModernTemplate({
  personal,
  experiences,
  educations,
  skills,
}) {
  const contactParts = getContactParts(personal);

  return (
    <article
      className="font-sans text-slate-900 antialiased print:bg-white"
      itemScope
      itemType="https://schema.org/Person"
    >
      <header className="border-b-2 border-blue-600 pb-3 text-center">
        <h1
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[26px]"
          itemProp="name"
        >
          {personal.fullName.trim() || (
            <span className="text-slate-400">Your Name</span>
          )}
        </h1>
        {contactParts.length > 0 ? (
          <p
            className="mt-2 flex flex-wrap justify-center gap-x-2 gap-y-1 text-xs text-slate-600 sm:text-sm"
            aria-label="Contact"
          >
            {contactParts.map((part, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {i > 0 ? (
                  <span className="text-slate-300" aria-hidden="true">
                    |
                  </span>
                ) : null}
                {part.startsWith("http") ? (
                  <a href={part} className="font-medium text-blue-700 underline">
                    LinkedIn
                  </a>
                ) : (
                  <span itemProp={part.includes("@") ? "email" : undefined}>{part}</span>
                )}
              </span>
            ))}
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">Contact details appear here</p>
        )}
      </header>

      {personal.summary.trim() ? (
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="modern-summary">
          <h2
            id="modern-summary"
            className="mb-2 border-b border-blue-200 pb-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-800"
          >
            Summary
          </h2>
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
            {personal.summary}
          </p>
        </section>
      ) : null}

      {experiences.some(
        (e) =>
          e.company.trim() ||
          e.jobTitle.trim() ||
          e.dates.trim() ||
          e.bullets.some((b) => b.trim())
      ) ? (
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="modern-exp">
          <h2
            id="modern-exp"
            className="mb-3 border-b border-blue-200 pb-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-800"
          >
            Experience
          </h2>
          <ul className="space-y-4">
            {experiences.map((exp) => {
              const hasContent =
                exp.company.trim() ||
                exp.jobTitle.trim() ||
                exp.dates.trim() ||
                exp.bullets.some((b) => b.trim());
              if (!hasContent) return null;
              const bullets = exp.bullets.map((b) => b.trim()).filter(Boolean);
              return (
                <li key={exp.id} className="print:break-inside-avoid">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {exp.company.trim() || "Company"}
                      </h3>
                      {exp.jobTitle.trim() ? (
                        <p className="text-sm italic text-slate-700">
                          {exp.jobTitle}
                        </p>
                      ) : null}
                    </div>
                    {exp.dates.trim() ? (
                      <p className="shrink-0 text-xs text-slate-600 sm:text-sm sm:text-right">
                        {exp.dates}
                      </p>
                    ) : null}
                  </div>
                  {bullets.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {educations.some((ed) => ed.school.trim() || ed.degree.trim() || ed.dates.trim()) ? (
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="modern-edu">
          <h2
            id="modern-edu"
            className="mb-3 border-b border-blue-200 pb-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-800"
          >
            Education
          </h2>
          <ul className="space-y-3">
            {educations.map((ed) => {
              if (!ed.school.trim() && !ed.degree.trim() && !ed.dates.trim()) return null;
              return (
                <li
                  key={ed.id}
                  className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4 print:break-inside-avoid"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {ed.school.trim() || "School"}
                    </h3>
                    {ed.degree.trim() ? (
                      <p className="text-sm text-slate-700">{ed.degree}</p>
                    ) : null}
                  </div>
                  {ed.dates.trim() ? (
                    <p className="shrink-0 text-xs text-slate-600 sm:text-sm">
                      {ed.dates}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="modern-skills">
          <h2
            id="modern-skills"
            className="mb-2 border-b border-blue-200 pb-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-800"
          >
            Skills
          </h2>
          <p className="text-sm leading-relaxed text-slate-700">
            {skills.join(" · ")}
          </p>
        </section>
      ) : null}
    </article>
  );
}
