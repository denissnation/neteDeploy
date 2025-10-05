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
        { error: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    const vehicleId = parseInt(id);
    const supabase = await createClient();

    // Get vehicle data
    const { data: vehicle, error: vehicleError } = await supabase
      .from("tb_vehicle")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Get features data
    const { data: features, error: featuresError } = await supabase
      .from("tb_features")
      .select("*")
      .eq("featuresVehicle_id", vehicleId)
      .order("feature_id", { ascending: true });

    if (featuresError) {
      console.error("Failed to load features:", featuresError);
    }

    return NextResponse.json({
      vehicle,
      features: features || [],
      error: null,
    });
  } catch (error) {
    console.error("GET request failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle data" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
