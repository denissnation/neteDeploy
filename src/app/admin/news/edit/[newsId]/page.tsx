// app/components/NewsForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { News } from "@/app/vehicle/types/vehicle";

// Validation schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  body: z.string().min(20, "Content must be at least 20 characters"),
  image: z
    .any()
    .optional() // Make image optional
    .refine(
      (files) => !files?.[0] || files?.[0]?.size < 5_000_000,
      "Max image size is 5MB"
    )
    .refine(
      (files) =>
        !files?.[0] ||
        ["image/jpeg", "image/png", "image/webp"].includes(files?.[0]?.type),
      "Only .jpg, .png, and .webp formats are supported"
    ),
});

type FormData = z.infer<typeof formSchema>;

export default function EditNews() {
  const { newsId } = useParams();
  const router = useRouter();
  const [News, setNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    news_id: "",
    news_title: "",
    news_body: "",
    created_at: "",
  });
  interface ImagePreview {
    url: string;
    file?: File;
  }
  const [previewImage, setPreviewImage] = useState<ImagePreview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: News?.news_title || "",
      body: News?.news_body || "",
    },
  });

  const imageFile = watch("image");

  useEffect(() => {
    if (imageFile?.[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage({
          url: reader.result as string,
          file: imageFile[0],
        });
      };
      reader.readAsDataURL(imageFile[0]);
    }
  }, [imageFile]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`/api/news/${newsId}`);
        const { data } = await response.json();
        if (data) {
          setNews(data);
          reset({
            title: data.news_title,
            body: data.news_body,
          });
          setPreviewImage({
            url: data.news_image ? data.news_image : "/placeholder.jpg",
          });
        }
      } catch (error) {
        console.error("Error fetching News:", error);
      } finally {
        setIsLoading(false);
        setFormData({
          news_id: "",
          news_title: "",
          news_body: "",
          created_at: "",
        });
      }
    };

    fetchNews();
  }, [newsId, reset]); // Add reset to dependencies
  // Generate image preview
  if (imageFile?.[0] && !previewImage) {
    const reader = new FileReader();
    reader.onload = () =>
      setPreviewImage({
        url: reader.result
          ? `/uploads/news/${reader.result}`
          : "/placeholder.jpg",
      });
    reader.readAsDataURL(imageFile[0]);
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (newsId) {
        formData.append("id", newsId.toString());
      }
      formData.append("title", data.title);
      formData.append("body", data.body);
      // Only append image if a new one was selected
      if (data.image?.[0]) {
        formData.append("image", data.image[0]);
      }

      // const response = await updateNews(Number(newsId), formData);
      const response = await fetch("/api/news", {
        method: "PUT",
        body: formData,
      });
      const { success } = await response.json();
      if (success) {
        router.push("/admin/news?update=success"); // or wherever you want to redirect
      } else {
        router.push("/admin/news?update=error"); // or wherever you want to redirect
        console.log(isLoading);
        throw new Error("Failed to update news");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating news");
    } finally {
      setIsSubmitting(false);
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
  if (!News) {
    return (
      <div className="bg-white text-gray-900 font-sans">
        <div className="pt-24 pb-16 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="max-w-lg mx-auto px-4 text-center">
            {/* Car Illustration */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  className="w-20 h-20 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
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
      <div className="pt-24 pb-16 bg-gray-100">
        {" "}
        {/* Added pt-24 to account for fixed navbar */}
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">TAMBAH MOBIL</h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Create New News
            </h2>

            {/* Title Field */}
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                News Title *
              </label>
              <input
                id="title"
                type="text"
                defaultValue={formData.news_title}
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
                News Content *
              </label>
              <textarea
                id="body"
                rows={6}
                defaultValue={formData.news_body}
                {...register("body")}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.body ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Write your news content here..."
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
                News Image *
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
                  {typeof errors.image.message === "string"
                    ? errors.image.message
                    : "Invalid image"}
                </p>
              )}

              {/* Image Preview */}
              {previewImage && (
                <div className="mt-4">
                  <div className="relative md:h-96 h-80 w-full rounded-md overflow-hidden border">
                    <Image
                      src={previewImage.url}
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
                  Submitting...
                </span>
              ) : (
                "Publish News"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
