import { getVehicle } from "@/lib/vehicleActions";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function VehicleLists() {
  const { vehicles, error } = await getVehicle();
  if (error) {
    return (
      <div className="bg-white text-gray-900 font-sans">
        <div className="pt-24 pb-16 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="max-w-lg mx-auto px-4 text-center">
            {/* Car Illustration */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center">
                <svg
                  className="w-20 h-20 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Something unexpected
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              We searched everywhere but couldn`&apos;`t find this vehicle in
              our showroom.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    notFound();
  }
  return (
    <div>
      {vehicles.map((vehicle: Vehicle) => (
        <div
          key={vehicle.vehicle_id}
          className="relative h-[250px] sm:h-[350px] md:h-[650px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        >
          <Image
            src={`${vehicle.vehicle_banner}`}
            alt={`${vehicle.vehicle_name} banner`}
            width={1400}
            height={1000}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute bottom-5 sm:bottom-12 z-10">
            <Link
              href={`/vehicle/${vehicle.vehicle_id}`}
              className="text-sm sm:text-lg border-2 bg-white opacity-85 text-[#d7000f] px-7 py-2 sm:px-14 sm:py-3 font-semibold hover:bg-[#d7000f] hover:text-white hover:opacity-85 transition duration-300"
            >
              Jelajahi
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
