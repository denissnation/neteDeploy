// lib/seo.ts
import type { Metadata } from "next";

type SEOType = "website" | "article" | "product";

interface SEOProps {
  type?: SEOType;
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url: string;
  siteName?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: { name: string; url?: string };
  price?: string;
  currency?: string;
  sku?: string;
  canonicalUrl?: string;
}
const METADATA_BASE = new URL(process.env.SITE_URL || "https://gwm-medan.com");
export function createSEO(props: SEOProps): Metadata {
  const {
    type = "website",
    title,
    description,
    keywords = [],
    image,
    url,
    canonicalUrl = url,
    siteName = "Your Brand",
    publishedTime,
    modifiedTime,
    author,
    price,
    currency,
    sku,
  } = props;

  const fullImageUrl = image
    ? new URL(image, METADATA_BASE).toString()
    : undefined;

  const openGraphImages = image
    ? [
        {
          url: new URL(image, METADATA_BASE).toString(),
          width: 1200,
          height: 630,
          alt: title,
        },
      ]
    : undefined;

  // Base OpenGraph configuration
  const openGraph: {
    type?: "website" | "article";
    title: string;
    description: string;
    url: string;
    siteName: string;
    publishedTime?: string;
    modifiedTime?: string;
    images?: { url: string; width?: number; height?: number; alt?: string }[];
  } = {
    title,
    description,
    url: new URL(url, METADATA_BASE).toString(),
    siteName,
    images: openGraphImages,
  };

  // Set OpenGraph type and article-specific fields

  if (props.url === "/") {
    openGraph!.type = "website";
    openGraph!.images = [
      {
        url: props.image || "/default-homepage.jpg", // Fallback image
        width: 1200,
        height: 630,
        alt: props.title,
      },
    ];
  }
  if (type === "article") {
    openGraph.type = "article";
    if (publishedTime) openGraph.publishedTime = publishedTime;
    if (modifiedTime) openGraph.modifiedTime = modifiedTime;
  } else {
    openGraph.type = "website";
  }

  // Prepare additional meta tags
  const other: Record<string, string> = {};

  // Article-specific meta tags
  if (type === "article") {
    if (author?.name) other["article:author"] = author.name;
    if (publishedTime) other["article:published_time"] = publishedTime;
    if (modifiedTime) other["article:modified_time"] = modifiedTime;
  }

  // Product-specific meta tags
  if (type === "product") {
    if (price) other["product:price:amount"] = price;
    if (currency) other["product:price:currency"] = currency;
    if (sku) other["product:retailer_item_id"] = sku;
  }

  // Twitter card configuration
  const twitter = {
    card: "summary_large_image" as const,
    title,
    description,
    ...(fullImageUrl && { images: [fullImageUrl] }),
  };

  // Final metadata object
  return {
    metadataBase: METADATA_BASE,
    title,
    description,
    ...(keywords.length > 0 && { keywords }),
    alternates: {
      canonical: new URL(canonicalUrl, METADATA_BASE).toString(),
    },
    openGraph,
    twitter,
    other,
  };
}
