import { getNewsId } from "@/lib/newsAction";
import { createSEO } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: number }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { data } = await getNewsId(slug);

  if (!data) return {}; // Fallback metadata or redirect
  const publishedDate = new Date(Number(data.created_at)).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return createSEO({
    type: "article",
    title: `${data.news_title} | GWM Medan`,
    description:
      data.news_body || `${data.news_title} - Read more on GWM Medan`,
    keywords: [data.news_title, "news", "article"],
    image: `/uploads/news/${data.news_image}`,
    url: `/news/${slug}`,
    publishedTime: publishedDate,
    modifiedTime: publishedDate,
    author: { name: "Editorial Team" },
    canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/news/${slug}`,
  });
}

export default async function NewsDetail({ params }: Props) {
  const { slug } = await params;
  const { success, data } = await getNewsId(slug);
  if (!success || !data) {
    notFound();
  }
  const publishedDate = new Date(Number(data.created_at)).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: data.news_title,
            description: data.news_body,
            image: new URL(
              `/uploads/news/${data.news_image}`,
              process.env.NEXT_PUBLIC_SITE_URL
            ).toString(),
            datePublished: data.created_at,
            publisher: {
              "@type": "Organization",
              name: "GWM MOTOR",
              logo: {
                "@type": "ImageObject",
                url: new URL(
                  "/features/gwm.png",
                  process.env.NEXT_PUBLIC_SITE_URL
                ).toString(),
              },
            },
          }),
        }}
      />
      <div className="mt-14 bg-white text-gray-900 font-sans">
        <article className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          {/* Breadcrumb Navigation */}
          <nav
            className="flex mb-6 text-sm text-gray-600"
            aria-label="Breadcrumb"
          >
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <Link href="/" className="hover:text-blue-600">
                  Beranda
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
              <li aria-current="page">
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
                  <span className="text-gray-500">
                    {data.news_title.substring(0, 20)}...
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {data.news_title}
            </h1>

            <div className="flex items-center text-sm text-gray-500 mb-6">
              <span>By SomeOne</span>
              <span className="mx-2">•</span>
              <time dateTime={data.created_at}>{publishedDate}</time>
            </div>

            {/* Featured Image */}
            <div className="relative w-full h-64 sm:h-96 rounded-lg bg-slate-500 overflow-hidden mb-8">
              <Image
                src={`${data.news_image}`}
                alt="GWM ORA"
                // fill
                width={1200}
                height={800}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </header>

          {/* Article Content */}
          <div
            className="prose max-w-none prose-lg text-gray-700"
            dangerouslySetInnerHTML={{ __html: data.news_body }}
          />
          {/* Sharing Buttons */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Share this article
            </h3>
            <div className="flex space-x-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  data.news_title
                )}&url=${encodeURIComponent(
                  `https://yoursite.com/news/${data.news_id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              {/* Add more social sharing buttons as needed */}
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
