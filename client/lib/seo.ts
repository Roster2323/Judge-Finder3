/**
 * Comprehensive SEO utility for Judge Finder
 * Designed to dominate Google rankings for judge searches
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  structuredData?: any;
  noIndex?: boolean;
}

export class SEOManager {
  private static readonly BASE_URL =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://judgefinder.com";

  private static readonly DEFAULT_IMAGE = "/images/og-judge-finder.jpg";

  /**
   * Set comprehensive meta tags for a page
   */
  static setMetaTags(config: SEOConfig): void {
    if (typeof document === "undefined") return;

    // Set page title
    document.title = config.title;

    // Remove existing meta tags we'll be updating
    const existingMetas = document.querySelectorAll('meta[data-seo="true"]');
    existingMetas.forEach((meta) => meta.remove());

    // Create meta tags
    const metaTags = [
      // Basic meta tags
      { name: "description", content: config.description },
      { name: "keywords", content: config.keywords?.join(", ") || "" },
      {
        name: "robots",
        content: config.noIndex ? "noindex,nofollow" : "index,follow",
      },

      // Open Graph tags
      { property: "og:title", content: config.title },
      { property: "og:description", content: config.description },
      { property: "og:type", content: config.ogType || "website" },
      {
        property: "og:url",
        content: config.canonicalUrl || window.location.href,
      },
      { property: "og:image", content: config.ogImage || this.DEFAULT_IMAGE },
      { property: "og:site_name", content: "Judge Finder" },

      // Twitter Card tags
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: config.title },
      { name: "twitter:description", content: config.description },
      { name: "twitter:image", content: config.ogImage || this.DEFAULT_IMAGE },

      // Additional SEO tags
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1e293b" },
      { name: "msapplication-TileColor", content: "#1e293b" },
    ];

    // Add canonical link
    let canonical = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = config.canonicalUrl || window.location.href;

    // Add meta tags to head
    metaTags.forEach((tag) => {
      const meta = document.createElement("meta");
      if ("name" in tag) meta.name = tag.name;
      if ("property" in tag) meta.setAttribute("property", tag.property);
      meta.content = tag.content;
      meta.setAttribute("data-seo", "true");
      document.head.appendChild(meta);
    });

    // Add structured data
    if (config.structuredData) {
      this.addStructuredData(config.structuredData);
    }
  }

  /**
   * Add JSON-LD structured data
   */
  static addStructuredData(data: any): void {
    if (typeof document === "undefined") return;

    // Remove existing structured data
    const existing = document.querySelector(
      'script[data-structured-data="true"]',
    );
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-structured-data", "true");
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Generate judge-specific SEO config
   */
  static generateJudgeSEO(judge: any): SEOConfig {
    const judgeName = judge.name;
    const circuit = judge.circuit;
    const tier = judge.tier;

    const title = `${judgeName} - Judge Profile, Rulings & Attorney Directory | Judge Finder`;
    const description = `Complete profile of ${judgeName} from ${circuit}. View ruling history, legal background, and find experienced attorneys who know this ${tier} judge. Get insights for your case.`;

    const keywords = [
      judgeName,
      `judge ${judgeName}`,
      `${judgeName} rulings`,
      `${judgeName} profile`,
      `${judgeName} background`,
      `${judgeName} decisions`,
      `${circuit} judge`,
      `${tier} judge`,
      `find attorney ${judgeName}`,
      `lawyers ${judgeName}`,
      `legal representation ${judgeName}`,
      "judge finder",
      "judicial analytics",
      "court decisions",
      "legal research",
      "attorney directory",
      "judge background check",
      "ruling tendencies",
      "court statistics",
    ];

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: judgeName,
      jobTitle: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Judge`,
      worksFor: {
        "@type": "Organization",
        name: circuit,
      },
      alumniOf: judge.almaMater,
      description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} judge serving in ${circuit}`,
      url: `${this.BASE_URL}/judge/${judge.id}`,
      sameAs: [`${this.BASE_URL}/judge/${judge.id}`],
    };

    return {
      title,
      description,
      keywords,
      canonicalUrl: `${this.BASE_URL}/judge/${judge.id}`,
      structuredData,
    };
  }

  /**
   * Generate homepage SEO config
   */
  static generateHomepageSEO(): SEOConfig {
    const title =
      "Judge Finder - Find Your Assigned Judge & Hire Expert Attorneys | Free Judge Lookup";
    const description =
      "Got assigned a judge? Search 10,000+ judge profiles, view ruling patterns, and connect with experienced attorneys who know your judge. Free judge lookup & attorney directory.";

    const keywords = [
      "find my assigned judge",
      "judge lookup",
      "judge finder",
      "judge search",
      "assigned judge information",
      "judge background check",
      "judge ruling history",
      "find attorney for my judge",
      "hire lawyer",
      "attorney directory",
      "legal representation",
      "court case help",
      "judge profile",
      "judicial analytics",
      "legal research",
      "attorney referral",
      "lawyer finder",
      "legal help",
      "court preparation",
      "judge tendencies",
    ];

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Judge Finder",
      description:
        "Find your assigned judge and connect with experienced attorneys",
      url: this.BASE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${this.BASE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      publisher: {
        "@type": "Organization",
        name: "Judge Finder",
        description:
          "Legal intelligence platform connecting people with judicial information and experienced attorneys",
      },
    };

    return {
      title,
      description,
      keywords,
      canonicalUrl: this.BASE_URL,
      structuredData,
    };
  }

  /**
   * Generate search results SEO config
   */
  static generateSearchSEO(searchTerm: string, results: any[]): SEOConfig {
    const title = `"${searchTerm}" Judge Search Results - Find Your Judge | Judge Finder`;
    const description = `Search results for "${searchTerm}". Found ${results.length} judges. View profiles, ruling history, and find attorneys who know these judges.`;

    const keywords = [
      `${searchTerm} judge`,
      `find judge ${searchTerm}`,
      `${searchTerm} court`,
      `${searchTerm} rulings`,
      "judge search results",
      "judicial directory",
      "court information",
    ];

    return {
      title,
      description,
      keywords,
      canonicalUrl: `${this.BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`,
    };
  }

  /**
   * Generate attorney directory SEO config
   */
  static generateAttorneyDirectorySEO(): SEOConfig {
    const title =
      "Attorney Directory - Find Lawyers by Judge Experience | Judge Finder";
    const description =
      "Browse our directory of experienced attorneys organized by the judges they know. Find lawyers who have appeared before your assigned judge and understand courtroom dynamics.";

    const keywords = [
      "attorney directory",
      "lawyer directory",
      "find attorney",
      "hire lawyer",
      "legal representation",
      "attorney by judge",
      "experienced lawyers",
      "court attorneys",
      "legal help",
      "attorney referral",
    ];

    return {
      title,
      description,
      keywords,
      canonicalUrl: `${this.BASE_URL}/attorneys`,
    };
  }

  /**
   * Preload critical resources
   */
  static preloadCriticalResources(): void {
    if (typeof document === "undefined") return;

    const resources = [
      {
        href: "/fonts/inter.woff2",
        as: "font",
        type: "font/woff2",
        crossorigin: "anonymous",
      },
      { href: "/images/og-judge-finder.jpg", as: "image" },
    ];

    resources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "preload";
      Object.assign(link, resource);
      document.head.appendChild(link);
    });
  }

  /**
   * Add FAQ structured data for judge pages
   */
  static addJudgeFAQData(judgeName: string): void {
    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `How do I find information about ${judgeName}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `You can find comprehensive information about ${judgeName} including their background, ruling tendencies, and recent decisions on their Judge Finder profile page.`,
          },
        },
        {
          "@type": "Question",
          name: `What attorneys have experience with ${judgeName}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Our attorney directory shows lawyers who have appeared before ${judgeName} and understand their courtroom preferences and judicial style.`,
          },
        },
        {
          "@type": "Question",
          name: `How can I prepare for a case before ${judgeName}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Review ${judgeName}'s ruling history, understand their typical decisions in similar cases, and consider hiring an attorney with experience in their courtroom.`,
          },
        },
      ],
    };

    this.addStructuredData(faqData);
  }

  /**
   * Add local business schema for court locations
   */
  static addCourtLocationData(court: string, location?: string): void {
    if (!location) return;

    const locationData = {
      "@context": "https://schema.org",
      "@type": "Courthouse",
      name: court,
      address: location,
      description: `${court} courthouse information and judge directory`,
    };

    this.addStructuredData(locationData);
  }
}

/**
 * SEO Hook for React components
 */
export function useSEO(config: SEOConfig) {
  if (typeof window !== "undefined") {
    SEOManager.setMetaTags(config);
  }
}
