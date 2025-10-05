// app/news/page.tsx

import { getNews } from "@/lib/newsAction";
import NewsList from "../components/NewsList";
import { createSEO } from "@/lib/seo";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  return createSEO({
    type: "website",
    title: "Berita & Promo Terbaru GWM Medan",
    description:
      "Update terbaru seputar produk, promo, dan event GWM di dealer resmi Kota Medan",
    keywords: ["berita GWM", "promo mobil Medan", "event GWM"],
    url: "/news",
    image: "/features/office.jpg",
  });
}

export default async function NewsPage() {
  const initialNews = await getNews(0);

  if (!initialNews.news || initialNews.news.length === 0) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: initialNews.news.map((news: NewsItem, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "NewsArticle",
        headline: news.news_title,
        url: new URL(
          `/news/${news.news_id}`,
          process.env.NEXT_PUBLIC_SITE_URL
        ).toString(),
        datePublished: new Date(Number(news.created_at)).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ),
        image: new URL(
          `${news.news_image}`,
          process.env.NEXT_PUBLIC_SITE_URL
        ).toString(),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mt-12 bg-white text-gray-900 font-sans">
        {/* <Navbar /> */}
        <NewsList initialNews={initialNews.news} />
        {/* <Footer /> */}
      </div>
    </>
  );
}
