import VehicleLists from "./components/VehicleLists";
import ProfileSection from "./homeComponents/ProfileSection";
import QuoteBanner from "./homeComponents/QuoteBanner";
import { Suspense } from "react";
import VehicleListsSkeleton from "./homeComponents/VehicleListsSkeleton";
import { createSEO } from "@/lib/seo";

export async function generateMetadata() {
  return createSEO({
    type: "website",
    title: "GWM Kota Medan ",
    description:
      "Temukan mobil GWM terbaru di showroom resmi Kota Medan. Dapatkan harga spesial, dan test drive Great Wall Motor ORA, Haval, dan Tank.",
    keywords: [
      "GWM Medan",
      "Dealer GWM Medan",
      "Harga GWM Kota Medan",
      "Great Wall Motor Medan",
      "Showroom GWM",
    ],
    url: "/",
    image: "/features/GWM-Medan.png", // Your showroom image
    siteName: "GWM Dealer Medan",
  });
}
export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CarDealer",
    name: "GWM Dealer Medan",
    image: new URL(
      "/features/GWM-Medan.png",
      process.env.NEXT_PUBLIC_SITE_URL
    ).toString(),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Sisingamangaraja No.01 Km 5",
      addressLocality: "Medan",
      addressRegion: "Sumatera Utara",
      postalCode: "20227",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "3.5456401",
      longitude: "98.6981001",
    },
    telephone: "+628116378585",
    openingHours: "Mo-Fr 08:00-17:00",
    priceRange: "Rp200jt-Rp600jt",
    offers: {
      url: new URL(`/`, process.env.NEXT_PUBLIC_SITE_URL).toString(),
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div>
        <Suspense fallback={<VehicleListsSkeleton />}>
          <VehicleLists />
        </Suspense>
        {/* Main Content */}
        <div className="flex-grow w-full   ">
          <div className="grid grid-cols-1 sm:grid-cols-2 ">
            <div className="relative bg-[#333333] p-6 h-[500px] md:h-[550px] flex justify-center shadow-lg bg-cover sm:pr-0 sm:pt-0  bg-center bg-no-repeat">
              <div
                className="w-full bg-blue-500 relative  flex items-center justify-center max-w-sm md:max-w-full bg-center
            sm:[clip-path:polygon(00%_0%,100%_0%,100%_100%,0%_90%)]"
                style={{ backgroundImage: `url('/features/map.JPG')` }}
              >
                <div className="absolute bottom-5 sm:bottom-16 z-10">
                  <a
                    href="/contact"
                    className="text-sm sm:text-lg border-2 bg-[#d7000f] opacity-85 text-white px-7 py-2 sm:px-14 sm:py-3 font-semibold hover:bg-white hover:text-[#d7000f] hover:opacity-85 transition duration-300"
                  >
                    Jelajahi
                  </a>
                </div>
              </div>
            </div>
            <ProfileSection></ProfileSection>
          </div>
        </div>
        <QuoteBanner></QuoteBanner>

        {/* Footer */}
      </div>
    </>
  );
}
export const dynamic = "force-dynamic";
