// components/NewsList.tsx
"use client";
// import { getNews } from "@/lib/newsAction";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function NewsList({ initialNews }: { initialNews: NewsItem[] }) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/newsPublic?offset=${news.length}`);
      const data = await response.json();
      if (!data.success) throw new Error("Failed to fetch");

      if (data.news && data.news.length > 0) {
        setNews((prev) => [...prev, ...data.news]);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
      // setHasMore(hasMore);
    } catch (error) {
      console.error("Failed to load more news:", error);
      alert("Gagal memuat berita tambahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex mb-6 text-sm text-gray-600"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 mx-1 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <Link href="/news" className="hover:text-blue-600">
                  Berita
                </Link>
              </div>
            </li>
          </ol>
        </nav>
        <h2 className="text-3xl font-bold text-center mb-4">BERITA TERBARU</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Temukan berita terupdate seputar GWM dan industri otomotif elektrik
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <div
              key={item.news_id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={`${item.news_image}`}
                  alt="GWM ORA"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  priority
                />

                <div className="absolute bottom-0 left-0 bg-red-600 text-white px-3 py-1 text-sm font-medium">
                  {new Date(Number(item.created_at)).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 line-clamp-2">
                  {item.news_title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {item.news_body}
                </p>
                <a
                  href={`/news/${item.news_id}`}
                  className="text-red-600 font-medium hover:text-red-800 inline-flex items-center"
                >
                  Baca Selengkapnya
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="border-2 border-red-600 text-red-600 px-8 py-3 rounded-full font-medium hover:bg-red-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memuat...
                </span>
              ) : (
                "Lihat Berita Lainnya"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
