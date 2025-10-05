// components/SEO.tsx
"use client";

import Head from "next/head";

type SEOJsonLdProps = {
  type: "Article" | "WebPage";
  title: string;
  description: string;
  url: string;
  image: string;
  publishedTime?: string;
  updatedTime?: string;
  authorName?: string;
};

export default function SEOJsonLd({
  type,
  title,
  description,
  url,
  image,
  publishedTime,
  updatedTime,
  authorName,
}: SEOJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type,
    headline: title,
    description,
    image: [image],
    url,
    ...(type === "Article"
      ? {
          datePublished: publishedTime,
          dateModified: updatedTime || publishedTime,
          author: authorName
            ? { "@type": "Person", name: authorName }
            : undefined,
          publisher: {
            "@type": "Organization",
            name: process.env.NEXT_PUBLIC_SITE_NAME || "GWM Kota Medan",
            logo: {
              "@type": "ImageObject",
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/upload/gwm.png`,
            },
          },
        }
      : {}),
  };

  return (
    <Head>
      <script type='application/ld+json'>{JSON.stringify(jsonLd)}</script>
    </Head>
  );
}
