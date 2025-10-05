// lib/serverActions.ts
"use server";

import { createClient } from "@supabase/supabase-js";

export async function getVehicleForSitemap() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! // Use service role key for server-side
    );

    const { data: vehicles, error } = await supabase
      .from("tb_vehicle")
      .select("id: vehicle_id");

    if (error) throw error;

    return JSON.parse(JSON.stringify(vehicles)) as Array<{
      id: number;
    }>;
  } catch (error) {
    console.error("Failed to load vehicles for sitemap:", error);
    return [];
  }
}

export async function getNewsForSitemap() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! // Use service role key for server-side
    );
    const { data: news, error } = await supabase
      .from("tb_news")
      .select("id: news_id, createdAt:created_at");

    if (error) throw error;

    return JSON.parse(JSON.stringify(news)) as Array<{
      id: number;
      createdAt: string | Date;
    }>;
  } catch (error) {
    console.error("Failed to load news for sitemap:", error);
    return [];
  }
}
