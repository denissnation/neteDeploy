// app/components/NewsForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Validation schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  body: z.string().min(20, "Content must be at least 20 characters"),
  image: z
    .any()
    .refine((files) => files?.length > 0, "Image is required")
    .refine((files) => files?.[0]?.size <= 5_000_000, "Max image size is 5MB")
    .refine(
      (files) =>
        ["image/jpeg", "image/png", "image/webp"].includes(files?.[0]?.type),
      "Only .jpg, .png, and .webp formats are supported"
    ),
});

type FormData = z.infer<typeof formSchema>;

export default function NewsForm() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.title = "Form Tambah Berita";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const imageFile = watch("image");

  // Generate image preview
  if (imageFile?.[0] && !previewImage) {
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(imageFile[0]);
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("body", data.body);
      formData.append("image", data.image[0]);

      // Replace with your API endpoint
      const response = await fetch("/api/news", {
        method: "POST",
        body: formData,
      });
      const { success, error } = await response.json();
      if (!success) throw new Error(error);
      reset();
      router.push("/admin/news?update=success");
      setPreviewImage(null);
    } catch (error) {
      console.error(error);
      router.push("/admin/news?update=error");
      alert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-gray-900 font-sans">
      <div className="pt-24 pb-16 bg-gray-100">
        {" "}
        {/* Added pt-24 to account for fixed navbar */}
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">TAMBAH BERITA</h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Buat Berita Baru
            </h2>
            {/* Title Field */}
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Judul Berita *
              </label>
              <input
                id="title"
                type="text"
                {...register("title")}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter news title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Content Field */}
            <div className="mb-4">
              <label
                htmlFor="body"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Isi Berita *
              </label>
              <textarea
                id="body"
                rows={6}
                {...register("body")}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.body ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Tulis isi berita anda disini..."
              />
              {errors.body && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.body.message}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gambar Berita *
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                {...register("image")}
                className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
              />
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.image.message as string}
                </p>
              )}

              {/* Image Preview */}
              {previewImage && (
                <div className="mt-4">
                  <div className="relative md:h-96 h-80 w-full rounded-md overflow-hidden border">
                    <Image
                      src={previewImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Menyimpan...
                </span>
              ) : (
                "Terbitkan Berita"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
