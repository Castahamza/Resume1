import { HeroCtaRow } from "@/components/HeroCtaRow";

const trustItems = ["ATS-friendly", "PDF export", "Keyword scan"];

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b border-slate-200/70 bg-slate-50/80 dark:border-slate-800/80 dark:bg-slate-950"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[image:radial-gradient(circle_at_1px_1px,rgb(148_163_184_0.22)_1px,transparent_0)] bg-[size:32px_32px] dark:bg-[image:radial-gradient(circle_at_1px_1px,rgb(71_85_105_0.35)_1px,transparent_0)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-transparent to-slate-50/90 dark:from-slate-950 dark:via-transparent dark:to-slate-950"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-blue-500/[0.12] blur-3xl dark:bg-blue-500/[0.08]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-32 h-[26rem] w-[26rem] rounded-full bg-indigo-500/[0.1] blur-3xl dark:bg-indigo-400/[0.07]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="min-w-0">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-blue-800 shadow-sm shadow-blue-500/5 backdrop-blur-sm dark:border-blue-500/25 dark:bg-slate-900/60 dark:text-blue-200 dark:shadow-none">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.65)]"
                aria-hidden
              />
              AI-powered resume builder
            </p>
            <h1
              id="hero-heading"
              className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08] dark:text-white"
            >
              Land interviews{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
                faster
              </span>{" "}
              with resumes tailored by{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
                AI
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              ResumeAI helps you draft ATS-friendly content, sync across
              devices, and export polished PDFs—so you can focus on the roles
              you want, not formatting headaches.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Product highlights">
              {trustItems.map((label) => (
                <li
                  key={label}
                  className="rounded-lg border border-slate-200/90 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm dark:border-slate-700/90 dark:bg-slate-900/50 dark:text-slate-300"
                >
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <a
                href="#features"
                className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 transition hover:text-blue-800 hover:decoration-blue-700/60 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:text-blue-300 dark:hover:decoration-blue-400/50"
              >
                See features
              </a>
              <span className="hidden text-slate-300 sm:inline dark:text-slate-600" aria-hidden>
                ·
              </span>
              <a
                href="#pricing"
                className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 transition hover:text-blue-800 hover:decoration-blue-700/60 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:text-blue-300 dark:hover:decoration-blue-400/50"
              >
                View pricing
              </a>
            </div>
          </div>

          <div className="relative min-w-0 lg:justify-self-end lg:w-full lg:max-w-md">
            <div
              className="pointer-events-none absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-blue-500/25 via-indigo-500/15 to-transparent opacity-90 blur-xl dark:from-blue-500/20 dark:via-indigo-500/10"
              aria-hidden
            />
            <div className="relative rounded-[1.75rem] border border-slate-200/80 bg-white/75 p-6 shadow-xl shadow-slate-900/[0.06] ring-1 ring-white/60 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/65 dark:shadow-black/40 dark:ring-slate-800/80 sm:p-7">
              <p className="mb-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                Start in seconds
              </p>
              <HeroCtaRow />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
