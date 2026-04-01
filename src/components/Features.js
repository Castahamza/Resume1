import {
  Sparkles,
  FileCheck,
  ScanEye,
  FileDown,
  Cloud,
  ShieldCheck,
} from "lucide-react";

const items = [
  {
    icon: Sparkles,
    title: "AI writing assistance",
    description:
      "Generate bullet points and summaries tuned to your experience and target role.",
  },
  {
    icon: FileCheck,
    title: "ATS-ready templates",
    description:
      "Structured layouts that parse cleanly in applicant tracking systems.",
  },
  {
    icon: ScanEye,
    title: "Real-time preview",
    description:
      "See changes instantly as you edit—no surprises when you export.",
  },
  {
    icon: FileDown,
    title: "Export to PDF",
    description:
      "One-click professional PDFs ready to attach or share with recruiters.",
  },
  {
    icon: Cloud,
    title: "Cloud sync",
    description:
      "Secure cloud storage keeps drafts in sync wherever you work next.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-first",
    description:
      "Your data stays protected with modern security practices you can trust.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="border-b border-slate-200/70 bg-white py-16 md:py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Everything you need to stand out
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Built for job seekers who want speed, polish, and control—without
            sacrificing quality.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition hover:border-blue-200 hover:bg-blue-50/30"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
