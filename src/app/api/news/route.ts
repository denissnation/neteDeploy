// app/api/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import { createClient } from "@/lib/supabase/server";
import { validateRequest } from "@/lib/auth-utils";
import { optimizeImageToBuffer } from "@/lib/image-utils";
import { getNewsId } from "@/lib/newsAction";

// const allNews = [
//   {
//     id: 1,
//     title: "NETA Meluncurkan Model Terbaru dengan Teknologi Canggih",
//     date: "15 Juni 2023",
//     excerpt:
//       "NETA resmi memperkenalkan model terbaru mereka yang dilengkapi dengan teknologi baterai generasi terbaru dan fitur autonomous driving level 2.",
//     image: "/news-1.jpg",
//   },
//   {
//     id: 2,
//     title: "Showroom NETA Resmi Dibuka di 5 Kota Besar Indonesia",
//     date: "2 Juni 2023",
//     excerpt:
//       "NETA memperluas jaringan showroomnya di Indonesia dengan membuka 5 lokasi baru di Jakarta, Bandung, Surabaya, Medan, dan Bali.",
//     image: "/news-2.jpg",
//   },
//   {
//     id: 3,
//     title: "NETA Raih Penghargaan 'Best EV Value 2023'",
//     date: "20 Mei 2023",
//     excerpt:
//       "Mobil listrik NETA berhasil meraih penghargaan 'Best EV Value 2023' untuk kategori kendaraan listrik dengan nilai terbaik.",
//     image: "/news-3.jpg",
//   },
//   {
//     id: 4,
//     title: "NETA Buka Pusat Servis Resmi di Jawa Barat",
//     date: "10 Mei 2023",
//     excerpt:
//       "Pusat servis resmi NETA kini hadir di Bandung dengan fasilitas lengkap dan teknisi bersertifikat.",
//     image: "/news-4.jpg",
//   },
//   {
//     id: 5,
//     title: "Program Test Drive Gratis Selama Bulan Juni",
//     date: "1 Mei 2023",
//     excerpt:
//       "Nikmati pengalaman mengendarai NETA secara gratis di showroom terdekat selama bulan Juni 2023.",
//     image: "/news-5.jpg",
//   },
//   {
//     id: 6,
//     title: "Kerjasama NETA dengan Perusahaan Charging Nasional",
//     date: "25 April 2023",
//     excerpt:
//       "NETA menjalin kerjasama strategis dengan perusahaan charging station untuk perluasan infrastruktur EV.",
//     image: "/news-6.jpg",
//   },
// ];

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const offset = Number(searchParams.get("offset")) || 0;

//   //   console.log(`Fetching news with offset: ${offset}`); // Debug log

//   const paginatedNews = allNews.slice(offset, offset + 3);
//   const hasMore = offset + 3 < allNews.length;

//   //   console.log("Returning:", { paginatedNews, hasMore }); // Debug log

//   // Add artificial delay to simulate network request
//   await new Promise((resolve) => setTimeout(resolve, 500));

//   return NextResponse.json({
//     news: paginatedNews,
//     hasMore,
//   });
// }
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB
export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = await createClient();
    const { data } = await supabase.from("tb_news").select("*");

    return NextResponse.json({
      news: data,
      error: null,
    });
  } catch (error) {
    console.error("GET request failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const { user } = await validateRequest();
    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const title = formData.get("title") as string;
    const body = formData.get("body") as string;
    const date = String(Date.now()) as string;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large: ${file.name}`,
        },
        { status: 400 } // Changed from 409 to 400 for better semantics
      );
    }

    const { buffer: optimizedBuffer, mimeType } = await optimizeImageToBuffer(
      file
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
    const { error } = await supabase.from("tb_news").insert({
      news_title: title,
      news_body: body,
      news_image: url,
      created_at: date,
    });
    if (error) {
      // Rollback cleanup if Supabase insert fails
      await del(url);
      console.error("❌ Supabase insert failed, blob deleted");
      return NextResponse.json(
        { error: "Failed to save news to database" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      error: undefined,
      message: "News uploaded successfully",
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate authentication
    const { user } = await validateRequest();
    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const file = formData.get("image") as File;
    const { data } = await getNewsId(Number(id));

    if (!id) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 }
      );
    }
    const updateData = {
      title: formData.get("title") as string,
      body: formData.get("body") as string,
      date: String(Date.now()) as string,
    };
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
        file
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
    // Process banner image (index 0)

    return NextResponse.json({
      success: true,
      error: undefined,
      status: 201,
    });
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { user } = await validateRequest();
  if (!user || user.role !== "user") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Delete feature image file if it exists
  const formData = await request.formData();
  const id = Number(formData.get("id"));
  const image = String(formData.get("image"));
  try {
    await del(image);
    const supabase = await createClient();
    await supabase.from("tb_news").delete().eq("news_id", id);
    return NextResponse.json({
      success: true,
      error: null,
      message: "berita berhasil dihapus",
    });
  } catch (error) {
    console.error("Failed to delete item:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to delete news",
      message: "berita gagal dihapus",
    });
  }
}

export const dynamic = "force-dynamic";
