import { getContactParts } from "./helpers";

/**
 * Classic: traditional serif, black & white, conservative hierarchy. ATS-linear.
 */
export default function ClassicTemplate({
  personal,
  experiences,
  educations,
  skills,
}) {
  const contactParts = getContactParts(personal);

  return (
    <article
      className="font-serif text-black antialiased print:bg-white"
      style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
      itemScope
      itemType="https://schema.org/Person"
    >
      <header className="border-b-2 border-black pb-3 text-left">
        <h1 className="text-[26px] font-bold uppercase tracking-wide text-black" itemProp="name">
          {personal.fullName.trim() || (
            <span className="text-gray-500">Your Name</span>
          )}
        </h1>
        {contactParts.length > 0 ? (
          <p className="mt-2 text-sm leading-relaxed text-black">
            {contactParts.map((part, i) => (
              <span key={i}>
                {i > 0 ? <span aria-hidden="true"> · </span> : null}
                {part.startsWith("http") ? (
                  <a href={part} className="text-black underline">
                    LinkedIn
                  </a>
                ) : (
                  part
                )}
              </span>
            ))}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">Contact details appear here</p>
        )}
      </header>

      {personal.summary.trim() ? (
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="classic-summary">
          <h2
            id="classic-summary"
            className="mb-2 border-b border-black pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black"
          >
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed text-black whitespace-pre-wrap">
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
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="classic-exp">
          <h2
            id="classic-exp"
            className="mb-3 border-b border-black pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black"
          >
            Professional Experience
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
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                    <div>
                      <h3 className="text-sm font-bold text-black">
                        {exp.company.trim() || "Company"}
                      </h3>
                      {exp.jobTitle.trim() ? (
                        <p className="text-sm italic text-black">{exp.jobTitle}</p>
                      ) : null}
                    </div>
                    {exp.dates.trim() ? (
                      <p className="shrink-0 text-xs text-black sm:text-sm">{exp.dates}</p>
                    ) : null}
                  </div>
                  {bullets.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-black marker:text-black">
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
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="classic-edu">
          <h2
            id="classic-edu"
            className="mb-3 border-b border-black pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black"
          >
            Education
          </h2>
          <ul className="space-y-3">
            {educations.map((ed) => {
              if (!ed.school.trim() && !ed.degree.trim() && !ed.dates.trim()) return null;
              return (
                <li
                  key={ed.id}
                  className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline print:break-inside-avoid"
                >
                  <div>
                    <h3 className="text-sm font-bold text-black">
                      {ed.school.trim() || "School"}
                    </h3>
                    {ed.degree.trim() ? (
                      <p className="text-sm text-black">{ed.degree}</p>
                    ) : null}
                  </div>
                  {ed.dates.trim() ? (
                    <p className="shrink-0 text-xs text-black sm:text-sm">{ed.dates}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section className="mt-5 print:break-inside-avoid" aria-labelledby="classic-skills">
          <h2
            id="classic-skills"
            className="mb-2 border-b border-black pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black"
          >
            Skills
          </h2>
          <p className="text-sm leading-relaxed text-black">{skills.join(" · ")}</p>
        </section>
      ) : null}
    </article>
  );
}
