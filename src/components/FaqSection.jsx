"use client";

import { useId, useState } from "react";

function Accent({ children }) {
  return (
    <strong className="font-semibold text-blue-600 dark:text-blue-400">
      {children}
    </strong>
  );
}

const FAQ_TABS = [
  {
    id: "templates",
    label: "Choosing a Template",
    items: [
      {
        q: "Which resume template is best for my industry?",
        a: (
          <>
            Most roles benefit from a clean,{" "}
            <Accent>single-column layout</Accent> with clear headings. Zoru
            templates prioritize <Accent>ATS compatibility</Accent> first—then
            you can pick the style that matches your field, from minimal to
            slightly more structured.
          </>
        ),
      },
      {
        q: "Should I use a one-column or two-column resume?",
        a: (
          <>
            For maximum <Accent>ATS parsing</Accent>, a{" "}
            <Accent>one-column resume template</Accent> is the safest default.
            Two-column designs can confuse some parsers if content sits in side
            panels—stick to one column unless a recruiter specifically asks
            otherwise.
          </>
        ),
      },
      {
        q: "How do I know if a template is ATS-friendly?",
        a: (
          <>
            ATS tools read simple structure best: standard section titles,
            normal fonts, and no text hidden in graphics. Our templates avoid
            those pitfalls and use <Accent>ATS-friendly</Accent> spacing and
            hierarchy so your content stays machine-readable.
          </>
        ),
      },
    ],
  },
  {
    id: "docs",
    label: "Word & Google Doc",
    items: [
      {
        q: "Can I export my resume to Word or Google Docs?",
        a: (
          <>
            You can <Accent>export a polished PDF</Accent> from Zoru for
            applications. For Word or Google Docs, copy sections from the editor
            or upload a <Accent>.doc / .docx</Accent> file to import and refine
            inside Zoru—then export PDF when you&apos;re ready to submit.
          </>
        ),
      },
      {
        q: "How do I import an existing resume from a file?",
        a: (
          <>
            On the home page, use <Accent>Import your resume</Accent> and
            choose a <Accent>PDF, Word, or .txt</Accent> file. You&apos;ll be
            guided to sign in if needed, then you can edit and restructure
            content in the builder.
          </>
        ),
      },
      {
        q: "Does formatting carry over from PDF or Word uploads?",
        a: (
          <>
            We focus on pulling in your <Accent>text and sections</Accent> so
            you can rebuild cleanly. Heavy design from an old file may not
            transfer 1:1—that actually helps you land on a simpler, more{" "}
            <Accent>ATS-compatible</Accent> layout.
          </>
        ),
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing & Usage",
    items: [
      {
        q: "What’s included in the Free plan vs Pro?",
        a: (
          <>
            <Accent>Free</Accent> is great to try the product: limited templates,
            basic AI help, and watermarked PDFs. <Accent>Pro</Accent> unlocks
            unlimited resumes, richer AI, premium templates, cloud sync, and
            full-quality exports.
          </>
        ),
      },
      {
        q: "How does billing work for Pro and Lifetime?",
        a: (
          <>
            <Accent>Pro</Accent> is billed monthly through Stripe.{" "}
            <Accent>Lifetime</Accent> is a one-time payment for ongoing access
            to Pro-level features without a subscription—check the pricing
            section for current rates.
          </>
        ),
      },
      {
        q: "Can I cancel Pro anytime?",
        a: (
          <>
            Yes. You can cancel your <Accent>subscription</Accent> when you
            like; you&apos;ll keep access through the end of the paid period
            according to Stripe. Your data stays associated with your account
            based on your plan rules at that time.
          </>
        ),
      },
    ],
  },
  {
    id: "custom",
    label: "Customization",
    items: [
      {
        q: "Can I change colors, fonts, and sections?",
        a: (
          <>
            You can adjust <Accent>sections</Accent>, reorder blocks, and tune
            content inside the editor. Visual options depend on the template
            you choose—everything stays aligned with readable, professional{" "}
            <Accent>defaults</Accent> so exports stay sharp.
          </>
        ),
      },
      {
        q: "How does AI help customize my bullets?",
        a: (
          <>
            AI suggests <Accent>impact-focused bullet points</Accent> tailored
            to your role and keywords. You stay in control: edit, accept, or
            rewrite—then run <Accent>keyword scanning</Accent> to align with
            job descriptions when you use those features.
          </>
        ),
      },
      {
        q: "Can I reorder or hide resume sections?",
        a: (
          <>
            Yes. Toggle or reorder sections such as{" "}
            <Accent>Experience, Education, and Skills</Accent> to match your
            story. Keeping only relevant sections often improves both clarity
            and <Accent>ATS</Accent> performance.
          </>
        ),
      },
    ],
  },
];

export default function FaqSection() {
  const [active, setActive] = useState(FAQ_TABS[0].id);
  const baseId = useId().replace(/:/g, "");
  const panel = FAQ_TABS.find((t) => t.id === active) ?? FAQ_TABS[0];

  return (
    <section
      id="faq"
      className="border-b border-slate-200/70 bg-white py-16 md:py-24 dark:border-slate-800 dark:bg-slate-950"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Support
          </p>
          <h2
            id="faq-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
          >
            Frequently Asked Questions (FAQs)
          </h2>
        </header>

        <div
          role="tablist"
          aria-label="FAQ categories"
          className="mt-10 flex flex-wrap justify-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/90 sm:flex-nowrap"
        >
          {FAQ_TABS.map((tab) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.id)}
                className={`rounded-lg px-3 py-2.5 text-center text-xs font-medium transition sm:flex-1 sm:px-4 sm:text-sm ${
                  selected
                    ? "border border-slate-200 bg-white text-blue-600 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-blue-400"
                    : "border border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`${baseId}-panel-${panel.id}`}
          aria-labelledby={`${baseId}-tab-${panel.id}`}
          className="mt-10 space-y-5"
        >
          {panel.items.map((item) => (
            <article
              key={item.q}
              className="rounded-xl border border-slate-200/80 bg-slate-50/90 px-5 py-5 sm:px-6 sm:py-6 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                {item.q}
              </h3>
              <div className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.a}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
