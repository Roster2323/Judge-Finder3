import { useEffect } from "react";

interface JudgeFAQProps {
  judgeName: string;
  circuit: string;
  tier: "federal" | "state" | "local";
}

export default function JudgeFAQ({ judgeName, circuit, tier }: JudgeFAQProps) {
  // Add null checks to prevent errors when data is not yet loaded
  if (!judgeName || !circuit || !tier) {
    return null; // Don't render anything if required props are missing
  }
  
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

  useEffect(() => {
    // Add FAQ structured data for rich snippets
    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `Who is ${judgeName}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${judgeName} is a ${tier} judge serving in ${circuit}. You can find their complete judicial profile, ruling history, and background information on this page.`,
          },
        },
        {
          "@type": "Question",
          name: `How do I find attorneys who know ${judgeName}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Our attorney directory shows experienced lawyers who have appeared before ${judgeName} and understand their courtroom procedures and judicial preferences.`,
          },
        },
        {
          "@type": "Question",
          name: `What information is available about ${judgeName}'s rulings?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `You can view ${judgeName}'s ruling tendencies, recent case decisions, and judicial analytics to understand how they typically decide cases similar to yours.`,
          },
        },
        {
          "@type": "Question",
          name: `Is ${judgeName} a federal or state judge?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${judgeName} is a ${tier} judge. ${tierName} judges ${
              tier === "federal"
                ? "are appointed by the President and handle federal law cases"
                : tier === "state"
                  ? "handle state law matters and are typically elected or appointed by state governors"
                  : "handle local municipal and county matters"
            }.`,
          },
        },
        {
          "@type": "Question",
          name: `How can I prepare for a case before ${judgeName}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `To prepare for ${judgeName}'s court: 1) Review their ruling history and tendencies, 2) Understand their courtroom procedures, 3) Consider hiring an attorney with experience before this judge, 4) Study similar cases they've decided.`,
          },
        },
      ],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-structured-data";
    script.textContent = JSON.stringify(faqData);

    // Remove existing FAQ data
    const existing = document.getElementById("faq-structured-data");
    if (existing) existing.remove();

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById("faq-structured-data");
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [judgeName, circuit, tier]);

  return (
    <section className="mt-12 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Frequently Asked Questions About {judgeName}
      </h2>

      <div className="space-y-6">
        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-900 py-2">
            <span>Who is {judgeName}?</span>
            <span className="transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="mt-3 text-gray-600 text-sm">
            <p>
              {judgeName} is a {tier} judge serving in {circuit}. This page
              provides comprehensive information about their judicial
              background, ruling patterns, and case history to help you
              understand their approach to legal decisions.
            </p>
          </div>
        </details>

        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-900 py-2">
            <span>How do I find attorneys experienced with {judgeName}?</span>
            <span className="transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="mt-3 text-gray-600 text-sm">
            <p>
              Our attorney directory shows lawyers who have extensive experience
              appearing before {judgeName}. These attorneys understand the
              judge's preferences, courtroom procedures, and decision-making
              patterns, which can be crucial for your case strategy.
            </p>
          </div>
        </details>

        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-900 py-2">
            <span>What can I learn about {judgeName}'s ruling patterns?</span>
            <span className="transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="mt-3 text-gray-600 text-sm">
            <p>
              You can view {judgeName}'s ruling tendencies based on recent case
              decisions, including how they typically rule in different types of
              cases, their sentencing patterns, and their approach to various
              legal issues. This judicial intelligence helps you prepare
              effectively.
            </p>
          </div>
        </details>

        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-900 py-2">
            <span>How should I prepare for {judgeName}'s courtroom?</span>
            <span className="transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="mt-3 text-gray-600 text-sm">
            <p>
              Preparation tips for {judgeName}'s court: Review their ruling
              history and judicial analytics, understand their courtroom
              procedures and preferences, consider hiring an attorney with
              experience before this specific judge, and study how they've
              decided similar cases in the past.
            </p>
          </div>
        </details>

        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-900 py-2">
            <span>Is this information about {judgeName} up to date?</span>
            <span className="transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="mt-3 text-gray-600 text-sm">
            <p>
              Yes, we regularly update our judge profiles with the latest
              information including recent rulings, case decisions, and judicial
              analytics. Our database is continuously maintained to provide the
              most current insights about {judgeName} and other judges.
            </p>
          </div>
        </details>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Need Legal Help?</h3>
        <p className="text-blue-800 text-sm">
          If you have a case before {judgeName}, consider consulting with
          attorneys who have experience in their courtroom. Our directory shows
          qualified lawyers who understand this judge's preferences and can help
          with your legal matter.
        </p>
      </div>
    </section>
  );
}
