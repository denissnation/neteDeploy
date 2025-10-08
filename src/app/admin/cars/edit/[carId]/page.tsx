// app/admin/cars/edit/[id]/page.tsx
"use client"; // This needs to be a Client Component
import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";

interface ImagePreview {
  url: string;
  file?: File;
}

export default function EditCarPage() {
  const { carId } = useParams();
  const carsId = parseInt(carId as string);
  const router = useRouter();
  const [car, setCar] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    harga: "",
    mesin: "",
    tenaga: "",
    torsi: "",
    model: "",
  });
  const [bannerPreview, setBannerPreview] = useState<ImagePreview | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<ImagePreview | null>(
    null
  );
  const [featurePreviews, setFeaturePreviews] = useState<
    Array<{
      id?: number;
      name: string;
      image: ImagePreview;
    }>
  >([]);

  // Fetch car data
  useEffect(() => {
    document.title = "Form Edit Mobil";
    const fetchCar = async () => {
      try {
        const response = await fetch(`/api/vehicles/${carsId}`);
        const { vehicle, features } = await response.json();

        if (!vehicle) {
          notFound();
        }

        setCar(vehicle);
        setFormData({
          name: vehicle.vehicle_name,
          harga: vehicle.vehicle_price,
          mesin: vehicle.vehicle_machine,
          tenaga: vehicle.vehicle_power,
          torsi: vehicle.vehicle_torsi,
          model: vehicle.vehicle_model,
        });
        // Set image previews
        setBannerPreview({
          url: vehicle.vehicle_banner
            ? `${vehicle.vehicle_banner}`
            : "/placeholder.jpg",
        });

        setMainImagePreview({
          url: vehicle.vehicle_img
            ? `${vehicle.vehicle_img}`
            : "/placeholder.jpg",
        });

        // Set feature previews
        if (features && features.length > 0) {
          setFeaturePreviews(
            features.map((feature: Feature) => ({
              id: feature.feature_id,
              name: feature.feature_name,
              image: {
                url: `${feature.feature_img}`,
              },
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching car:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [carsId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "banner" | "main" | "feature",
    index?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;

      if (type === "banner") {
        setBannerPreview({ url, file });
      } else if (type === "main") {
        setMainImagePreview({ url, file });
      } else if (type === "feature" && index !== undefined) {
        const updatedFeatures = [...featurePreviews];
        updatedFeatures[index] = {
          ...updatedFeatures[index],
          image: { url, file },
        };
        setFeaturePreviews(updatedFeatures);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFeatureNameChange = (index: number, value: string) => {
    const updatedFeatures = [...featurePreviews];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      name: value,
    };
    setFeaturePreviews(updatedFeatures);
  };

  const addFeature = () => {
    setFeaturePreviews([
      ...featurePreviews,
      {
        name: "",
        image: { url: "/placeholder.jpg" },
      },
    ]);
  };

  const removeFeature = (index: number) => {
    if (!confirm("Are you sure you want to remove this feature?")) return;

    const updatedFeatures = [...featurePreviews];
    updatedFeatures.splice(index, 1);
    setFeaturePreviews(updatedFeatures);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formDatas = new FormData();

    try {
      formDatas.append("id", carsId.toString());
      // Append text data
      formDatas.append("nama", formData.name);
      formDatas.append("harga", formData.harga);
      formDatas.append("tenaga", formData.tenaga);
      formDatas.append("torsi", formData.torsi);
      formDatas.append("mesin", formData.mesin);
      formDatas.append("model", formData.model);

      // Append banner image (index 0)
      if (bannerPreview?.file) {
        formDatas.append("images", bannerPreview.file);
      } else {
        formDatas.append("images", new Blob()); // Empty blob for unchanged image
      }

      // Append main image (index 1)
      if (mainImagePreview?.file) {
        formDatas.append("images", mainImagePreview.file);
      } else {
        formDatas.append("images", new Blob()); // Empty blob for unchanged image
      }

      // Append feature images and descriptions (index 2+)
      featurePreviews.forEach((feature, index) => {
        if (feature.id) {
          formDatas.append(`featureId_${index}`, feature.id.toString());
        }
        if (feature.image.file) {
          formDatas.append("images", feature.image.file);
        } else {
          formDatas.append("images", new Blob());
        }
        formDatas.append("description", feature.name);
      });

      const response = await fetch("/api/vehicles", {
        method: "PUT",
        body: formDatas,
      });

      const result = await response.json();

      if (result.success) {
        router.push("/admin/cars?update=success"); // Redirect to homepage after successful upload
      } else {
        router.push("/admin/cars?update=error");
        setIsLoading(false); // Reset loading state if upload fails
        console.error("Failed to update vehicle");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white text-gray-900 font-sans">
        <div className="pt-24 pb-16 bg-gray-100">
          <div className="max-w-2xl mx-auto px-4">
            {/* Skeleton Header */}
            <div className="text-center mb-8">
              <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-32 mx-auto animate-pulse"></div>
            </div>
            {/* Skeleton Form */}
            <div className="space-y-6">
              {/* Input Skeletons */}
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-300 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-12 bg-gray-300 rounded animate-pulse"></div>
                </div>
              ))}

              {/* Image Skeletons */}
              <div>
                <div className="h-4 bg-gray-300 rounded w-32 mb-2 animate-pulse"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-24 w-48 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-300 rounded w-32 animate-pulse"></div>
                </div>
              </div>

              {/* Features Skeletons */}
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2 animate-pulse"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 mb-4">
                    <div className="flex-1 h-10 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-12 w-16 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Submit Button Skeleton */}
              <div className="h-12 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
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
              Oops! Vehicle Missing
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              We searched everywhere but couldnt find this vehicle in our
              showroom.
            </p>

            <div className="space-y-4">
              <a
                href="/admin/cars"
                className="block w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition shadow-lg"
              >
                Explore Our Vehicles
              </a>
              <button
                onClick={() => window.history.back()}
                className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 font-sans">
      {}
      <div className="pt-28 pb-16 bg-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">EDIT MOBIL</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Kendaraan*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
            </div>

            {/* Vehicle Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="harga"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Harga*
                </label>
                <input
                  type="text"
                  id="harga"
                  name="harga"
                  value={formData.harga}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="mesin"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mesin*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="mesin"
                    name="mesin"
                    value={formData.mesin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    required
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center text-white font-bold text-sm bg-slate-400 rounded-r-lg border p-4">
                    CC
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tenaga"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tenaga (HP)*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="tenaga"
                    name="tenaga"
                    value={formData.tenaga}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    required
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center text-white font-bold text-sm bg-slate-400 rounded-r-lg border p-4">
                    Hp
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="torsi"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Torsi (Nm)*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="torsi"
                    name="torsi"
                    value={formData.torsi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    required
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center text-white font-bold text-sm bg-slate-400 rounded-r-lg border p-4">
                    Nm
                  </span>
                </div>
              </div>
            </div>

            {/* Engine */}

            {/* Model Selection */}
            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Model*
              </label>
              <select
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all appearance-none"
                required
              >
                <option value="">Pilih Model</option>
                <option value="NETA V">NETA V</option>
                <option value="NETA S">NETA S</option>
                <option value="NETA U">NETA U</option>
              </select>
            </div>

            {/* Banner Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Mobil
              </label>
              <div className="flex items-center">
                <Image
                  src={bannerPreview?.url || "/placeholder.jpg"}
                  alt={bannerPreview?.url || "/placeholder.jpg"}
                  width={192}
                  height={96}
                  className="h-24 w-48 object-cover rounded-md mr-4"
                  priority
                />
                <div>
                  <input
                    type="file"
                    id="banner"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "banner")}
                    className="hidden"
                  />
                  <label
                    htmlFor="banner"
                    className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Change Banner
                  </label>
                </div>
              </div>
            </div>

            {/* Main Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gambar Utama Mobil
              </label>
              <div className="flex items-center">
                <Image
                  src={mainImagePreview?.url || "/placeholder.jpg"}
                  alt={mainImagePreview?.url || "/placeholder.jpg"}
                  width={143}
                  height={109}
                  className="h-24 w-32 object-cover rounded-md mr-4"
                  priority
                />
                <div>
                  <input
                    type="file"
                    id="mainImage"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "main")}
                    className="hidden"
                  />
                  <label
                    htmlFor="mainImage"
                    className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Change Image
                  </label>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fitur Mobil
              </label>
              {featurePreviews.map((feature, index) => (
                <div key={index} className="mb-4 flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={feature.name}
                      onChange={(e) =>
                        handleFeatureNameChange(index, e.target.value)
                      }
                      placeholder="Nama fitur"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      <Image
                        src={feature.image.url}
                        alt={`Feature ${index}`}
                        width={80}
                        height={63}
                        className="h-12 w-16 object-cover rounded-md"
                        priority
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        id={`feature-${index}`}
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "feature", index)}
                        className="hidden"
                      />
                      <label
                        htmlFor={`feature-${index}`}
                        className="cursor-pointer bg-white py-1 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Change
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-gray-200 transition"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {featurePreviews.length < 4 && (
                <button
                  type="button"
                  onClick={addFeature}
                  className="mt-2 flex items-center text-sm text-red-600 hover:text-red-800"
                >
                  <FiPlus className="mr-1" />
                  Tambah Fitur
                </button>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                disabled={isLoading}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <span>Menyimpan...</span>
                    <svg
                      className="animate-spin ml-2 h-5 w-5 text-white"
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
                  </div>
                ) : (
                  "SIMPAN PERUBAHAN"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {}
    </div>
  );
}
export const dynamic = "force-dynamic";
