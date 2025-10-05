import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = Number(searchParams.get("offset")) || 0;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("tb_news").select("*");
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({
        news: [],
        hasMore: false,
        success: false,
      });
    }
    if (data) {
      const paginatedNews = data.slice(offset, offset + 3);
      const hasMore = offset + 3 < data.length;
      return NextResponse.json({
        news: paginatedNews,
        hasMore,
        success: true,
      });
    } else {
      return NextResponse.json({
        news: [],
        hasMore: false,
        success: false,
      });
    }
  } catch (error) {
    console.error("Failed to load news:", error);
    return NextResponse.json({ error: "Failed to load news" });
  }

  //   console.log("Returning:", { paginatedNews, hasMore }); // Debug log

  // Add artificial delay to simulate network request
}
export const dynamic = "force-dynamic";
