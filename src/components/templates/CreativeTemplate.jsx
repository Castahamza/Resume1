import { getContactParts } from "./helpers";

/**
 * Creative: bold accent strip + strong typography while staying a single
 * linear document (no tables / multi-column text) for ATS compatibility.
 */
export default function CreativeTemplate({
  personal,
  experiences,
  educations,
  skills,
}) {
  const contactParts = getContactParts(personal);

  return (
    <article
      className="relative border-l-[6px] border-violet-600 pl-5 font-sans text-slate-900 antialiased print:border-l-black print:bg-white print:pl-4 print:text-black"
      itemScope
      itemType="https://schema.org/Person"
    >
      <header className="border-b border-violet-200 pb-4 print:border-gray-300">
        <h1
          className="text-[26px] font-extrabold tracking-tight text-violet-950 print:text-black"
          itemProp="name"
        >
          {personal.fullName.trim() || (
            <span className="text-violet-400 print:text-gray-500">Your Name</span>
          )}
        </h1>
        {contactParts.length > 0 ? (
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-slate-600 sm:text-sm print:text-black">
            {contactParts.map((part, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {i > 0 ? (
                  <span className="text-violet-300 print:text-gray-400" aria-hidden="true">
                    •
                  </span>
                ) : null}
                {part.startsWith("http") ? (
                  <a
                    href={part}
                    className="text-teal-700 underline decoration-2 underline-offset-2 print:text-black"
                  >
                    LinkedIn
                  </a>
                ) : (
                  part
                )}
              </span>
            ))}
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">Contact details appear here</p>
        )}
      </header>

      {personal.summary.trim() ? (
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="cre-summary">
          <h2
            id="cre-summary"
            className="mb-2 inline-block rounded-r-md bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-900 print:bg-gray-200 print:text-black"
          >
            Summary
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap print:text-black">
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
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="cre-exp">
          <h2
            id="cre-exp"
            className="mb-3 inline-block rounded-r-md bg-teal-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-900 print:bg-gray-200 print:text-black"
          >
            Experience
          </h2>
          <ul className="mt-2 space-y-4">
            {experiences.map((exp) => {
              const hasContent =
                exp.company.trim() ||
                exp.jobTitle.trim() ||
                exp.dates.trim() ||
                exp.bullets.some((b) => b.trim());
              if (!hasContent) return null;
              const bullets = exp.bullets.map((b) => b.trim()).filter(Boolean);
              return (
                <li
                  key={exp.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 print:border-gray-300 print:bg-transparent print:break-inside-avoid"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-violet-950 print:text-black">
                        {exp.company.trim() || "Company"}
                      </h3>
                      {exp.jobTitle.trim() ? (
                        <p className="text-sm font-medium text-teal-800 print:text-black">
                          {exp.jobTitle}
                        </p>
                      ) : null}
                    </div>
                    {exp.dates.trim() ? (
                      <p className="shrink-0 text-xs font-semibold text-slate-500 sm:text-sm print:text-black">
                        {exp.dates}
                      </p>
                    ) : null}
                  </div>
                  {bullets.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 print:text-black">
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
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="cre-edu">
          <h2
            id="cre-edu"
            className="mb-3 inline-block rounded-r-md bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-900 print:bg-gray-200 print:text-black"
          >
            Education
          </h2>
          <ul className="mt-2 space-y-3">
            {educations.map((ed) => {
              if (!ed.school.trim() && !ed.degree.trim() && !ed.dates.trim()) return null;
              return (
                <li
                  key={ed.id}
                  className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 print:break-inside-avoid"
                >
                  <div>
                    <h3 className="text-sm font-bold text-violet-950 print:text-black">
                      {ed.school.trim() || "School"}
                    </h3>
                    {ed.degree.trim() ? (
                      <p className="text-sm text-slate-700 print:text-black">{ed.degree}</p>
                    ) : null}
                  </div>
                  {ed.dates.trim() ? (
                    <p className="shrink-0 text-xs font-semibold text-slate-500 sm:text-sm print:text-black">
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
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="cre-skills">
          <h2
            id="cre-skills"
            className="mb-2 inline-block rounded-r-md bg-teal-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-900 print:bg-gray-200 print:text-black"
          >
            Skills
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 print:text-black">
            {skills.join(" · ")}
          </p>
        </section>
      ) : null}
    </article>
  );
}
