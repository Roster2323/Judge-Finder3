import { RequestHandler } from "express";
import { DatabaseService } from "../lib/database";

/**
 * Generate XML sitemap for SEO
 * GET /sitemap.xml
 */
export const generateSitemap: RequestHandler = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || "https://judgefinder.com";

    // Get all judges for individual sitemaps
    const judges = await DatabaseService.searchJudges(""); // Get all judges

    const currentDate = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage - Highest Priority -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/attorneys</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/dashboard</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/register</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
`;

    // Add individual judge pages - Very important for SEO
    for (const judge of judges) {
      sitemap += `
  <url>
    <loc>${baseUrl}/judge/${judge.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }

    // Add judge search variations for SEO
    const commonJudgeSearches = [
      "federal-judges",
      "state-judges",
      "local-judges",
      "magistrate-judges",
      "district-judges",
      "circuit-judges",
      "supreme-court-judges",
      "bankruptcy-judges",
      "appellate-judges",
    ];

    for (const searchTerm of commonJudgeSearches) {
      sitemap += `
  <url>
    <loc>${baseUrl}/search?q=${searchTerm}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    sitemap += `
</urlset>`;

    res.set({
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    });

    res.send(sitemap);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
};

/**
 * Generate robots.txt for SEO
 * GET /robots.txt
 */
export const generateRobots: RequestHandler = async (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || "https://judgefinder.com";

  const robotsTxt = `User-agent: *
Allow: /

# Allow all search engines to crawl
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for politeness
Crawl-delay: 1

# Disallow admin/private areas
Disallow: /api/
Disallow: /dashboard/admin
Disallow: /payment/

# Allow important legal directories
Allow: /judge/
Allow: /attorneys/
Allow: /search/
`;

  res.set({
    "Content-Type": "text/plain",
    "Cache-Control": "public, max-age=86400",
  });

  res.send(robotsTxt);
};
