// app/sitemap.xml/route.ts
import { getNewsForSitemap, getVehicleForSitemap } from "@/lib/serverActions"; // Your server actions

interface VehicleSitemapEntry {
  url: string;
  lastModified: Date; // Required
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
}
export async function GET() {
  try {
    const [vehicles, news] = await Promise.all([
      getVehicleForSitemap(),
      getNewsForSitemap(),
    ]);

    const baseUrl = process.env.SITE_URL || "https://gwm-medan.com";

    const sitemapEntries: VehicleSitemapEntry[] = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      // Dynamic car pages
      ...vehicles.map((car) => ({
        url: `${baseUrl}/cars/${car.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      // Dynamic news pages

      ...news.map((article) => ({
        url: `${baseUrl}/news/${article.id}`,
        lastModified: article.createdAt
          ? new Date(Number(article.createdAt))
          : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];

    const sitemapXml = generateSitemapXml(sitemapEntries);
    return new Response(sitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=86400", // 24h cache
      },
    });
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    // Return minimal sitemap with just static pages

    const fallbackSitemap = generateFallbackSitemap();
    return new Response(fallbackSitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}

function generateSitemapXml(entries: VehicleSitemapEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${entries
    .map(
      (entry) => `
  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
    )
    .join("")}
</urlset>`;
}

function generateFallbackSitemap(): string {
  const baseUrl = process.env.SITE_URL || "https://gwm-medan.com";
  const fallbackEntries = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/news`, lastModified: new Date() },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${fallbackEntries
    .map(
      (entry) => `
  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
  </url>`
    )
    .join("")}
</urlset>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
