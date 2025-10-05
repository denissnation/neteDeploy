// app/contact/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

export default function UploadForm() {
  const [isLoading, setIsLoading] = useState(false); // Loading state for the button
  const router = useRouter(); // Router for redirection
  const [fileInputs, setFileInputs] = useState([0]); // Start with one file input

  const handleAddFileInput = () => {
    if (fileInputs.length < 4) {
      setFileInputs([...fileInputs, fileInputs.length]);
    }
  };

  const handleRemoveFileInput = (index: number) => {
    if (fileInputs.length > 1) {
      setFileInputs(fileInputs.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (const file of files) {
        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          alert(`Invalid file type: ${file.name}`);
          e.target.value = ""; // Clear the input
          return;
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true); // Set loading state to true

    const formData = new FormData(e.currentTarget); // Get form data

    try {
      // Call the Server Action with the form data
      const response = await fetch("/api/vehicles/", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        router.push("/admin/cars?update=success"); // Redirect to homepage after successful upload
      } else {
        router.push("/admin/cars?update=error"); // Redirect to homepage after successful upload
        setIsLoading(false); // Reset loading state if upload fails
      }
    } catch (error) {
      console.error("Failed to upload images:", error);
      setIsLoading(false); // Reset loading state on error
    }
  };

  return (
    <div className="mt-12 bg-white text-gray-900 font-sans">
      {}

      <div className="pt-24 pb-16 bg-gray-100">
        {" "}
        {/* Added pt-24 to account for fixed navbar */}
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            TAMBAH MOBIL BARU
          </h2>

          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <div>
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Kendaraan*
              </label>
              <input
                type="nama"
                id="nama"
                name="nama"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="harga"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Harga
              </label>
              <input
                type="harga"
                id="harga"
                name="harga"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="500"
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
              <input
                type="mesin"
                id="mesin"
                name="mesin"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="tenaga"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                tenaga*
              </label>
              <input
                type="tenaga"
                id="tenaga"
                name="tenaga"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="torsi"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Torsi*
              </label>
              <input
                type="torsi"
                id="torsi"
                name="torsi"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="500"
                required
              />
            </div>

            {/* Car Selection */}
            <div>
              <label
                htmlFor="car-model"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Model*
              </label>
              <select
                id="car-model"
                name="model"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all appearance-none"
                required
              >
                <option value="">Pilih Model</option>
                <option value="NETA V">NETA V</option>
                <option value="NETA S">NETA S</option>
                <option value="NETA U">NETA U</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Car Banner
              </label>
              <input
                type="file"
                name="images"
                onChange={handleFileChange}
                className="block rounded-lg focus:ring-2 focus:ring-red-500 border border-gray-300 w-full text-md text-gray-500 bg-white file:h-full file:mr-4  file:py-2 file:px-4 file:rounded-s-none file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                // multiple={index === 0} // Allow multiple files only in the first input
                required // Only the first input is required
              />
              <div className="flex-1">
                <input
                  type="text"
                  name="description"
                  placeholder="Image description"
                  className="hidden w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  hidden // Only the first description is required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Car Image
              </label>
              <input
                type="file"
                name="images"
                onChange={handleFileChange}
                className="block rounded-lg focus:ring-2 focus:ring-red-500 border border-gray-300 w-full text-md text-gray-500 bg-white file:h-full file:mr-4  file:py-2 file:px-4 file:rounded-s-none file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                // multiple={index === 0} // Allow multiple files only in the first input
                required // Only the first input is required
              />
              <div className="flex-1">
                <input
                  type="text"
                  name="description"
                  placeholder="Image description"
                  className="hidden w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  hidden // Only the first description is required
                />
              </div>
            </div>
            {fileInputs.map((_, index) => (
              <div key={index} className="mt-4 flex gap-2  ">
                <div className="flex-1 ">
                  <label className="block text-sm font-medium text-gray-700">
                    Car Feature {index + 1}
                  </label>
                  <input
                    type="file"
                    name="images"
                    onChange={handleFileChange}
                    className="block rounded-lg focus:ring-2 focus:ring-red-500 border border-gray-300 w-full text-md text-gray-500 bg-white file:h-full file:mr-4  file:py-2 file:px-4 file:rounded-s-none file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    multiple={index === 0} // Allow multiple files only in the first input
                    required={index === 0} // Only the first input is required
                  />
                </div>
                <div className="flex-1 self-end  ">
                  <input
                    type="text"
                    name="description"
                    placeholder="Image description"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm  focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    required={index === 0} // Only the first description is required
                  />
                </div>
                {fileInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFileInput(index)}
                    className="mt-1 p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-gray-200 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {fileInputs.length < 4 && (
              <button
                type="button"
                onClick={handleAddFileInput}
                className="mt-2 flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Fitur lainnya
              </button>
            )}
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <span>Uploading...</span>
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
                  "SIMPAN"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
