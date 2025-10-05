"use server";
import { validateRequest } from "./auth-utils";
import { del, put } from "@vercel/blob";
import { createClient } from "./supabase/server";
import { optimizeImageToBuffer } from "./image-utils";
import { createStaticClient } from "./supabase/static";
interface State {
  success: boolean;
  error: string | null;
  message: string;
}
interface NewsItem {
  news_id: number;
  news_title: string;
  news_body: string;
  news_image: string;
  created_at: string;
  // Add other fields from your tb_news table
}

export async function getNews(offset: number) {
  const pagOffset = offset || 0;
  try {
    const supabase = await createStaticClient();
    const { data } = await supabase.from("tb_news").select("*");
    if (data) {
      const paginatedNews = data.slice(pagOffset, pagOffset + 3);
      const hasMore = pagOffset + 3 < data.length;
      return {
        news: paginatedNews,
        hasMore,
        success: true,
      };
    } else {
      return {
        news: [],
        hasMore: false,
        success: false,
      };
    }
  } catch (error) {
    console.error("Failed to load news:", error);
    return { error: "Failed to load news" };
  }
}

export interface NewsResults {
  news: NewsItem[] | null;
  error: string | null;
}
export async function getNewsAdmin(): Promise<NewsResults> {
  const { user } = await validateRequest();

  if (!user || user.role !== "user") {
    throw new Error("Unauthorized");
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("tb_news").select("*");
    return { news: data, error: null };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { news: null, error: "Failed to fetch data" };
  }
}

export async function getNewsId(id: number): Promise<{
  data?: NewsItem;
  error?: string;
  success: boolean;
}> {
  try {
    if (!id || id <= 0) {
      return {
        success: false,
        error: "Invalid news ID provided",
      };
    }

    const supabase = await createClient();
    const { data } = await supabase
      .from("tb_news")
      .select("*")
      .eq("news_id", id);

    if (!data || data.length === 0) {
      return {
        success: false,
        error: "News article not found",
      };
    }

    return {
      success: true,
      data: data[0] as NewsItem,
    };
  } catch (error) {
    console.error("Database error in getNewsId:", error);

    // You could check for specific MySQL errors here
    if (error instanceof Error) {
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function deleteNews(prevState: State, formData: FormData) {
  const { user } = await validateRequest();
  console.log(user);
  if (!user || user.role !== "user") {
    throw new Error("Unauthorized");
  }
  const id = Number(formData.get("id"));
  const image = String(formData.get("image"));

  try {
    await del(image);
    const supabase = await createClient();
    await supabase.from("tb_news").delete().eq("news_id", id);
    return { success: true, error: null, message: "berita berhasil dihapus" };
  } catch (error) {
    console.error("Failed to delete item:", error);
    return {
      success: false,
      error: "Failed to delete item",
      message: "data gagal dihapus",
    };
  }
}

interface UploadState {
  success: boolean;
  imageUrl: string;
  error: string | undefined;
  status: number;
}

// lib/image-utils.ts

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB
export async function uploadNews(
  formData: FormData,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
  }
): Promise<UploadState> {
  const { user } = await validateRequest();
  console.log(user);
  if (!user || user.role !== "user") {
    throw new Error("Unauthorized");
  }
  console.log(navigator);
  try {
    const file = formData.get("image") as File;
    const title = formData.get("title") as string;
    const body = formData.get("body") as string;
    const date = String(Date.now()) as string;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        imageUrl: "",
        error: `File too large: ${file.name}`,
        status: 409,
      };
    }

    const { buffer: optimizedBuffer, mimeType } = await optimizeImageToBuffer(
      file,
      options
    );

    const ext = file.name.split(".").pop();
    const fileName = `news-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${ext}`;

    // Save the image URL and description to the appropriate table

    const { url } = await put(
      `news123/${fileName}`,
      optimizedBuffer, // Pass Buffer directly to Vercel Blob
      {
        access: "public",
        contentType: mimeType,
      }
    );
    const supabase = await createClient();
    const { status, error } = await supabase.from("tb_news").insert({
      news_title: title,
      news_body: body,
      news_image: url,
      created_at: date,
    });
    if (error) {
      // Rollback cleanup if Supabase insert fails
      await del(url);
      console.error("❌ Supabase insert failed, blob deleted");
      throw error;
    }

    return {
      success: true,
      imageUrl: "",
      error: undefined,
      status: status,
    };
  } catch (err: unknown) {
    let message = "❌ Upload failed";

    if (err instanceof Error) {
      if (err.message === "NO_INTERNET") {
        message = "⚠️ No internet connection. Please reconnect and try again.";
      } else {
        message = err.message;
      }
    }

    return {
      success: false,
      imageUrl: "",
      error: message,
      status: 409,
    };
  }
}

export async function updateNews(
  id: number,
  // prevState: UploadState,
  formData: FormData,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
  }
): Promise<UploadState> {
  const { user } = await validateRequest();
  console.log(user);
  if (!user || user.role !== "user") {
    throw new Error("Unauthorized");
  }
  try {
    const file = formData.get("image") as File;
    const { data } = await getNewsId(id); // Implement this function
    // Process main vehicle data
    const updateData = {
      title: formData.get("title") as string,
      body: formData.get("body") as string,
      date: String(Date.now()) as string,
    };
    const imageUrl: string = "";
    let newsImage;
    if (data) {
      newsImage = data.news_image;
    }
    if (file && file.size > 0) {
      // Delete old banner if exists
      if (newsImage) {
        await del(newsImage);
      }

      const { buffer: optimizedBuffer, mimeType } = await optimizeImageToBuffer(
        file,
        options
      );

      const ext = file.name.split(".").pop();
      newsImage = `news-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${ext}`;

      const { url } = await put(`news/${newsImage}`, optimizedBuffer, {
        access: "public",
        contentType: mimeType,
      });
      newsImage = url;
    }
    const supabase = await createClient();
    const { error } = await supabase
      .from("tb_news")
      .update({
        news_title: updateData.title,
        news_body: updateData.body,
        news_image: newsImage,
        created_at: updateData.date,
      })
      .eq("news_id", id);
    console.log(error);
    return { success: true, imageUrl, error: undefined, status: 201 };
  } catch (error) {
    console.error("Failed to upload images:", error);
    return {
      success: false,
      imageUrl: "",
      error: "Failed to upload images",
      status: 409,
    };
  }
}
