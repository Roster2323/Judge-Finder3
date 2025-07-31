import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatJudgeName } from "@/lib/judgeSearch";
import { JudgeSearch } from "@/components/JudgeSearch";
import { JudgeSearchResult } from "@/lib/judgeSearch";

import { SEOManager, useSEO } from "@/lib/seo";

export default function Index() {
  const navigate = useNavigate();

  // Implement comprehensive SEO
  useEffect(() => {
    const seoConfig = SEOManager.generateHomepageSEO();
    SEOManager.setMetaTags(seoConfig);
    SEOManager.preloadCriticalResources();
  }, []);

  const handleJudgeSelect = (judge: JudgeSearchResult) => {
    navigate(`/judge/${judge.id}`, {
      state: { 
        judge: {
          ...judge,
          name: formatJudgeName(judge)
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6" role="banner">
        <div className="text-xl font-semibold">
          <a href="/" className="text-white" aria-label="Judge Finder Homepage">
            <h1 className="sr-only">Judge Finder - Find Your Assigned Judge</h1>
            Judge Finder
          </a>
        </div>
        <nav
          className="flex items-center gap-4"
          role="navigation"
          aria-label="Main navigation"
        >
          <a
            href="/contact"
            className="text-sm text-gray-300 hover:text-white transition-colors"
            aria-label="Contact Judge Finder Support"
          >
            Contact Us
          </a>
          <a
            href="/login"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors"
            aria-label="Attorney Login Portal"
          >
            Login
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main
        className="flex flex-col items-center justify-center px-6"
        style={{ minHeight: "calc(100vh - 200px)" }}
        role="main"
      >
        <section className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-6xl font-bold mb-6">
            Find Your Assigned Judge & Hire Expert Attorneys
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Got assigned a judge for your case? Search our database of{" "}
            <strong>10,000+ judges</strong>, learn about their background and
            ruling patterns, and find experienced attorneys who know how to work
            with them. <em>Free judge lookup</em> - get the insights you need
            for your legal case.
          </p>
        </section>

        {/* Enhanced Search Component */}
        <section className="w-full max-w-4xl" aria-label="Judge Search">
          <JudgeSearch onJudgeSelect={handleJudgeSelect} />
        </section>

        {/* Benefits Content */}
        <section
          className="mt-16 text-center max-w-4xl mx-auto"
          aria-label="Judge Information Features"
        >
          <h2 className="text-2xl font-bold text-white mb-8">
            What You'll Learn About Your Judge
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-400">
            <article>
              <h3 className="text-white font-semibold mb-2">
                Judge Background & Experience
              </h3>
              <p>
                See where your judge went to law school, how long they've been
                on the bench, who appointed them, and their career history. Know
                exactly who you're dealing with in court and what their
                qualifications are.
              </p>
            </article>
            <article>
              <h3 className="text-white font-semibold mb-2">
                Ruling Patterns & Tendencies
              </h3>
              <p>
                Understand your judge's typical decisions in cases like yours.
                See if they tend to favor plaintiffs or defendants, their
                sentencing patterns, and how they rule on different types of
                legal matters.
              </p>
            </article>
            <article>
              <h3 className="text-white font-semibold mb-2">
                Expert Attorney Directory
              </h3>
              <p>
                Connect with experienced lawyers who know your judge and have
                appeared before them multiple times. Get representation from
                someone who understands the courtroom dynamics and judicial
                preferences.
              </p>
            </article>
          </div>

          {/* Additional SEO Content */}
          <div className="mt-12 text-left max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              Why Judge Research Matters for Your Case
            </h2>
            <div className="text-gray-300 space-y-3 text-sm">
              <p>
                When you're assigned a judge for your legal case, having
                comprehensive information about their background and ruling
                history can significantly impact your case strategy. Our judge
                database includes{" "}
                <strong>
                  federal judges, state court judges, and local magistrates
                </strong>{" "}
                from across the United States.
              </p>
              <p>
                Each judge profile includes their educational background, years
                of experience, appointment details, and most importantly - their{" "}
                <em>ruling tendencies based on recent case decisions</em>. This
                judicial intelligence helps you and your attorney prepare more
                effectively for court proceedings.
              </p>
              <p>
                Additionally, our <strong>Featured Attorney Slots</strong> show
                lawyers who have extensive experience appearing before specific
                judges.{" "}
                <em>These are paid advertisements by licensed attorneys.</em>
                This means you can find legal representation that already
                understands your judge's preferences, courtroom procedures, and
                decision-making patterns.
              </p>

              {/* Streamlined Legal Notice */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-xs">
                  Judge Finder does not endorse attorneys. All information is
                  for educational purposes only.
                  <a
                    href="/legal-disclosures"
                    className="text-cyan-400 hover:text-cyan-300 ml-1"
                  >
                    View full legal disclosures
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-6 mb-4">
          <a href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </a>
          <a
            href="/legal-disclosures"
            className="hover:text-white transition-colors"
          >
            Legal Disclosures
          </a>
        </div>
        <p>© 2025 Judge Finder. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
