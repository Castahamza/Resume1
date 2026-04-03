import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "AI resume builder",
  description:
    "ResumeAI helps you build ATS-friendly resumes with AI bullet points, keyword scanning, cover letters, and PDF export.",
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-0 flex-1 bg-white text-slate-900">
        <Hero />
        <StatsSection />
        <Features />
        <Pricing />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
