const stats = [
  { label: "Total Users", value: "4,005,400" },
  { label: "Interview Rate", value: "62.18%" },
  { label: "Avg. User Review", value: "8.23/10" },
];

export default function StatsSection() {
  return (
    <section
      className="border-b border-slate-200/70 bg-slate-50 py-12 md:py-16 dark:border-slate-800 dark:bg-slate-900/40"
      aria-label="ResumeAI at a glance"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {stats.map(({ label, value }) => (
            <li
              key={label}
              className="rounded-xl border border-slate-200/90 bg-white px-6 py-8 text-center shadow-md shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
            >
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {label}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-blue-600 tabular-nums sm:text-4xl dark:text-blue-400">
                {value}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
