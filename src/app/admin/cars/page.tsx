// app/admin/cars/page.tsx
"use client";
import Link from "next/link";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import { Suspense, useEffect, useState } from "react";
import { Vehicle } from "../../vehicle/types/vehicle";
import NotificationBanner from "../../components/NotificationBanner";
import AdminTableSkeleton from "../../components/AdminTableSkeleton";
import Image from "next/image";

type Notification = {
  message: string;
  type: "success" | "error";
  show: boolean;
};

function AdminCarList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [notification, setNotification] = useState<Notification>({
    message: "",
    type: "success",
    show: false,
  });
  const initialState = {
    success: false,
    error: null,
    message: "",
  };
  interface State {
    success: boolean;
    error: string | null;
    message: string;
  }
  const { page, per_page } = useParams();
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [state, formAction] = useFormState<State, FormData>(
    async (prevState, formData) => {
      try {
        // await deleteVehicle(prevState, formData);
        const response = await fetch("/api/vehicles", {
          method: "DELETE",
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          setNotification({
            message: "Vehicle deleted successfully!",
            type: "success",
            show: true,
          });
        }
        return { ...prevState, success: true };
      } catch (error) {
        console.error(error);
        setNotification({
          message: "Failed to delete vehicle",
          type: "error",
          show: true,
        });
        return { ...prevState, error: "Delete failed" };
      }
    },
    initialState
  );

  useEffect(() => {
    const updateStatus = searchParams.get("update");
    if (updateStatus === "success") {
      setNotification({
        message: "Vehicle updated successfully!",
        type: "success",
        show: true,
      });

      // Clear the query parameter
      router.replace("/admin/cars", undefined);
    } else if (updateStatus === "error") {
      setNotification({
        message: "Failed to update vehicle",
        type: "error",
        show: true,
      });
      router.replace("/admin/cars", undefined);
    }
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
    const fetchCar = async () => {
      try {
        // const { vehicles } = await getVehicle();
        const response = await fetch("/api/vehicles");
        const { vehicles } = await response.json();
        console.log(vehicles);
        if (vehicles) {
          setCars(vehicles);
        }
      } catch (error) {
        console.error("Error fetching car:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [state, notification.show, router, searchParams]);

  let currentPage = Number(page) || 1;
  const perPage = Number(per_page) || 10;

  if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

  // Calculate pagination
  const totalItems = cars?.length;
  const totalPages = Math.ceil(totalItems / perPage);

  // Ensure currentPage doesn't exceed totalPages
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedCars = cars?.slice(startIndex, endIndex);
  console.log(paginatedCars);

  // Function to generate pagination links
  const generatePageLink = (page: number) => {
    return {
      pathname: "/admin",
      query: {
        page: page > 1 ? page.toString() : undefined,
        per_page: perPage !== 10 ? perPage.toString() : undefined,
      },
    };
  };

  // Generate visible page numbers
  const getVisiblePages = () => {
    const visiblePages = [];
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > 5) {
      if (currentPage <= 3) {
        endPage = 5;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  };

  return (
    <div>
      <div className="pt-20 pb-16 bg-gray-100">
        {/* <Toaster position='top-right' /> */}

        {/* Header */}
        <NotificationBanner notification={notification} />
        {/* <Toaster></Toaster> */}
        <header className="bg-white ">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <Link
              href="/admin/cars/add"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              <FiPlus /> Add New Car
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {/* Table */}
              <div className="overflow-x-auto">
                {isLoading ? (
                  <AdminTableSkeleton />
                ) : paginatedCars.length > 0 ? (
                  <div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Image
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Brand
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Harga
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mesin
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tenaga
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Torsi
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedCars.map((car) => (
                          <tr key={car.vehicle_id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-14 w-24 flex-shrink-0">
                                <Image
                                  src={`${car.vehicle_img}`}
                                  alt={car.vehicle_model}
                                  width={114}
                                  height={96}
                                  className="h-14 w-24 object-cover rounded"
                                />
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {car.vehicle_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                maximumFractionDigits: 0,
                              }).format(Number(car.vehicle_price))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {car.vehicle_machine}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {car.vehicle_power}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {car.vehicle_torsi}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <Link
                                  href={`/admin/cars/edit/${car.vehicle_id}`}
                                  className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                >
                                  <FiEdit /> Edit
                                </Link>
                                <form action={formAction}>
                                  <input
                                    type="hidden"
                                    name="id"
                                    value={car.vehicle_id}
                                  />
                                  <input
                                    type="hidden"
                                    name="banner"
                                    value={car.vehicle_banner}
                                  />
                                  <input
                                    type="hidden"
                                    name="image"
                                    value={car.vehicle_img}
                                  />
                                  <button
                                    type="submit"
                                    className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                  >
                                    <FiTrash2 /> Delete
                                  </button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <Link
                          href={generatePageLink(Math.max(1, currentPage - 1))}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            currentPage === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Previous
                        </Link>
                        <Link
                          href={generatePageLink(
                            Math.min(totalPages, currentPage + 1)
                          )}
                          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            currentPage === totalPages
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Next
                        </Link>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing{" "}
                            <span className="font-medium">
                              {startIndex + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(endIndex, totalItems)}
                            </span>{" "}
                            of <span className="font-medium">{totalItems}</span>{" "}
                            results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <Link
                              href={generatePageLink(
                                Math.max(1, currentPage - 1)
                              )}
                              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                                currentPage === 1
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-white text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              <span className="sr-only">Previous</span>
                              <FiChevronLeft className="h-5 w-5" />
                            </Link>

                            {getVisiblePages().map((page) => (
                              <Link
                                key={page}
                                href={generatePageLink(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === page
                                    ? "z-10 bg-red-50 border-red-500 text-red-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </Link>
                            ))}

                            <Link
                              href={generatePageLink(
                                Math.min(totalPages, currentPage + 1)
                              )}
                              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                                currentPage === totalPages
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-white text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              <span className="sr-only">Next</span>
                              <FiChevronRight className="h-5 w-5" />
                            </Link>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // No Data Found Section
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 mb-4 text-gray-400">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Vehicles Found
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      No vehicles are currently available in the database. Add
                      your first vehicle to get started.
                    </p>
                    <Link
                      href="/admin/cars/add"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FiPlus className="mr-2" />
                      Add First Vehicle
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CarlistPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <AdminCarList />
    </Suspense>
  );
}
