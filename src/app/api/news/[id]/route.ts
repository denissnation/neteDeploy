import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 }
      );
    }

    const newsId = parseInt(id);
    const supabase = await createClient();

    // Get vehicle data
    const { data } = await supabase
      .from("tb_news")
      .select("*")
      .eq("news_id", newsId);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: "News article not found" },
        { status: 404 }
      );
    }

    // Get features data

    return NextResponse.json({
      success: true,
      data: data[0] as NewsItem,
    });
  } catch (error) {
    console.error("GET request failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news data" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
