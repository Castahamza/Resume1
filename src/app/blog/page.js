import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Blog",
  description:
    "Resume tips, ATS guidance, and job-search advice from ResumeAI. New articles coming soon.",
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-0 flex-1 bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <header className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-14 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Blog
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Guides &amp; insights
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Resume strategies, ATS-friendly writing, and career tips. More
              posts will appear here as we publish them.
            </p>
          </div>
        </header>

        <section
          className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
          aria-label="Articles"
        >
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-600 dark:bg-slate-900/40">
            <p className="text-base font-medium text-slate-800 dark:text-slate-200">
              No articles yet
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              We&apos;re preparing content for this space. Check back soon, or
              start building your resume today.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Get started free
            </Link>
          </div>

          {/* Future: list <article> cards from CMS / MDX / DB */}
        </section>
      </main>
      <Footer />
    </>
  );
}
