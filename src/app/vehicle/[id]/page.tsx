import React from "react";
// import { getVehiclebyId } from "@/lib/vehicleActions";
import VehicleFeatures from "./components/VehicleFeatures";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Props = {
  params: Promise<{ id: number }>;
};

export default async function Vehicle({ params }: Props) {
  const { id } = await params;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/vehicles/${id}`
  );
  const { vehicle, features } = await response.json();
  // const { vehicle, features } = await getVehiclebyId(id);
  if (!vehicle) {
    notFound(); // Triggers not-found if null returned
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `GWM ${vehicle.vehicle_name}`,
    image: new URL(
      `${vehicle.vehicle_img}`,
      process.env.NEXT_PUBLIC_SITE_URL
    ).toString(),
    description: vehicle.vehicle_name,
    brand: {
      "@type": "Brand",
      name: vehicle.vehicle_name,
    },
    offers: {
      "@type": "Offer",
      price: vehicle.vehicle_price,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      url: new URL(
        `/vehicle/${id}`,
        process.env.NEXT_PUBLIC_SITE_URL
      ).toString(),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className=" bg-white text-gray-900 font-sans">
        <div className="mt-24 mx-auto px-4 sm:px-6 lg:px-8">
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
              <li></li>
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
                    {vehicle.vehicle_name.substring(0, 20)}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        {/* Sticky Navbar (Updated in next component) */}
        <div
          className="relative h-[250px] sm:h-[350px] md:h-[550px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${vehicle.vehicle_banner}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Performance Highlights */}
        <div className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {vehicle.vehicle_name}
            </h2>

            <div className="flex flex-col md:flex-row-reverse text-center justify-evenly items-center">
              <div className="p-0 sm:p-6 ">
                {/* Car Image Over Price */}
                <div className="  grid text-center justify-center items-center   ">
                  {/* <img
                    src={`${vehicle.vehicle_img}`}
                    alt="NETA Car"
                    className="w-[350px] sm:w-[550px] h-auto"
                  /> */}
                  <Image
                    src={`${vehicle.vehicle_img}`}
                    alt="NETA Car"
                    width={350}
                    height={550}
                    className="w-[350px] sm:w-[550px] h-auto"
                    priority
                  />
                </div>
                <div className="mt-3">
                  {" "}
                  {/* Added margin to accommodate image */}
                  <div className="text-4xl font-bold text-red-600">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(Number(vehicle.vehicle_price))}
                  </div>
                  <div className="text-xl font-bold text-gray-600">
                    Harga OTR Medan
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-0">
                <div className="p-3 sm:p-6">
                  <div className="text-4xl font-bold text-red-600">Mesin</div>
                  <div className="text-4xl font-bold text-gray-600">
                    {vehicle.vehicle_machine} cc
                  </div>
                  {/* <div className="text-2xl font-bold text-gray-600">cc</div> */}
                </div>
                <div className="p-3 sm:p-6">
                  <div className="text-4xl font-bold text-red-600">Tenaga</div>
                  <div className="text-4xl font-bold text-gray-600">
                    {vehicle.vehicle_power} hp
                  </div>
                </div>
                <div className="p-3 sm:p-6">
                  <div className="text-4xl font-bold text-red-600">Torsi</div>
                  <div className="text-4xl font-bold text-gray-600">
                    {vehicle.vehicle_torsi} Nm
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <VehicleFeatures features={features}></VehicleFeatures>
      </div>
    </>
  );
}
