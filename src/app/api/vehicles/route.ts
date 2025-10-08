import { VehicleFeature } from "@/app/vehicle/types/vehicle";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateRequest } from "@/lib/auth-utils";
import { del, put } from "@vercel/blob";
import { optimizeImageToBuffer } from "@/lib/image-utils";
import { getVehiclebyId } from "@/lib/vehicleActions";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET() {
  try {
    const supabase = await createClient();
    // Get all vehicles
    const { data: vehicles, error } = await supabase
      .from("tb_vehicle")
      .select("*")
      .order("vehicle_id", { ascending: true });

    if (error) {
      console.error("Failed to load vehicles:", error);
      return NextResponse.json(
        { error: "Failed to load vehicles" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      vehicles: vehicles || [],
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
    const files = formData.getAll("images") as File[];
    const descriptions = formData.getAll("description") as string[];
    const name = formData.get("nama") as string;
    const price = formData.get("harga") as string;
    const power = formData.get("tenaga") as string;
    const torsi = formData.get("torsi") as string;
    const machine = formData.get("mesin") as string;
    const date = String(Date.now());

    // Validate inputs
    if (files.length === 0) {
      return NextResponse.json(
        { error: "At least one file is required" },
        { status: 400 }
      );
    }

    if (files.length > 6) {
      return NextResponse.json(
        { error: "Maximum of 6 files allowed" },
        { status: 400 }
      );
    }

    const imageUrls: string[] = [];
    let vehicleBanner = "";
    let vehicleImage = "";
    let featureImage = "";
    let maxVehicleId = 0;

    // Create server client for database operations
    const supabase = await createClient();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const description = descriptions[i];

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}` },
          { status: 400 }
        );
      }

      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${ext}`;
      const folder = i < 2 ? "uploads" : "uploads/features";

      if (i === 0) {
        // Upload banner
        const { buffer: optimizedBuffer, mimeType } =
          await optimizeImageToBuffer(file);
        const { url } = await put(
          `${folder}/banner-${fileName}`,
          optimizedBuffer,
          {
            access: "public",
            contentType: mimeType,
          }
        );
        vehicleBanner = url;
      } else if (i === 1) {
        // Upload main image and create vehicle record
        const { buffer: optimizedBuffer, mimeType } =
          await optimizeImageToBuffer(file);
        const { url } = await put(
          `${folder}/image-${fileName}`,
          optimizedBuffer,
          {
            access: "public",
            contentType: mimeType,
          }
        );
        vehicleImage = url;

        // Insert vehicle record
        const { data, error } = await supabase
          .from("tb_vehicle")
          .insert({
            vehicle_name: name,
            vehicle_price: price,
            vehicle_power: power,
            vehicle_torsi: torsi,
            vehicle_machine: machine,
            vehicle_model: "2",
            vehicle_banner: vehicleBanner,
            vehicle_img: vehicleImage,
            created_at: date,
          })
          .select("vehicle_id");

        if (error) {
          console.error("Failed to create vehicle:", error);
          return NextResponse.json(
            { error: "Failed to create vehicle record" },
            { status: 500 }
          );
        }

        if (data && data.length > 0) {
          maxVehicleId = data[0].vehicle_id;
        }
      } else if (i > 1) {
        // Upload feature images
        const { buffer: optimizedBuffer, mimeType } =
          await optimizeImageToBuffer(file);
        const { url } = await put(
          `${folder}/feature-${fileName}`,
          optimizedBuffer,
          {
            access: "public",
            contentType: mimeType,
          }
        );
        featureImage = url;

        // Insert feature record
        const { error } = await supabase.from("tb_features").insert({
          featuresVehicle_id: maxVehicleId,
          feature_name: description,
          feature_img: featureImage,
        });

        if (error) {
          console.error("Failed to create feature:", error);
          return NextResponse.json(
            { error: "Failed to create feature record" },
            { status: 500 }
          );
        }
      }

      imageUrls.push(featureImage || vehicleImage || vehicleBanner);
    }

    return NextResponse.json({ success: true, imageUrls });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export interface VehicleResult {
  vehicle: Vehicle | null;
  features: Feature[] | null;
  error: string | null;
}
// export async function getVehiclebyId(id: number): Promise<VehicleResult> {
//   try {
//     const supabase = await createClient();
//     const { data: vehicle } = await supabase
//       .from("tb_vehicle")
//       .select("*")
//       .eq("vehicle_id", id);
//     // console.log(vehicle[0]);

//     const { data: features } = await supabase
//       .from("tb_features")
//       .select("*")
//       .eq("featuresVehicle_id", id)
//       .order("feature_id", { ascending: true });

//     // Explicit not-found check
//     if (!vehicle || vehicle.length === 0) {
//       return { vehicle: null, features: null, error: "Vehicle not found" };
//     }

//     return { vehicle: vehicle[0], features, error: null };
//   } catch (error) {
//     console.error("Data Not Found:", error);
//     return { vehicle: null, features: null, error: "Data Not Found" };
//   }
// }
export async function PUT(request: NextRequest) {
  try {
    // Validate authentication
    const { user } = await validateRequest();
    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return NextResponse.json(
        { error: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    const vehicleId = parseInt(id);
    const files = formData.getAll("images") as File[];
    const descriptions = formData.getAll("description") as string[];

    // Get current vehicle data
    const { vehicle } = await getVehiclebyId(vehicleId);
    if (!vehicle) {
      return NextResponse.json({
        vehicle: null,
        features: null,
        error: "Vehicle not found",
      });
    }

    if (files.length > 6) {
      return NextResponse.json(
        { error: "Maximum of 6 files allowed" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const imageUrls: string[] = [];

    const { data: currentFeatures } = await supabase
      .from("tb_features")
      .select("*")
      .eq("featuresVehicle_id", id);

    // Process main vehicle data
    const updateData = {
      name: formData.get("nama") as string,
      price: formData.get("harga") as string,
      power: formData.get("tenaga") as string,
      torsi: formData.get("torsi") as string,
      machine: formData.get("mesin") as string,
      model: (formData.get("model") as string) || "2",
    };

    // Process banner image (index 0)
    let bannerUrl;
    let bannerImage;
    if (vehicle) bannerImage = vehicle.vehicle_banner;
    if (files[0] && files[0].size > 0) {
      if (files[0].size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${files[0].name}` },
          { status: 400 }
        );
      }

      // Delete old banner if exists
      if (bannerImage) {
        await del(bannerImage);
      }

      // Process and save new banner
      const ext = files[0].name.split(".").pop();
      const bannerFileName = `banner-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${ext}`;

      const { buffer: optimizedBuffer, mimeType } = await optimizeImageToBuffer(
        files[0]
      );
      const { url } = await put(`uploads/${bannerFileName}`, optimizedBuffer, {
        access: "public",
        contentType: mimeType,
      });
      bannerUrl = url;
    }

    // Process main image (index 1)
    let mainUrl = vehicle.vehicle_img;
    if (files[1] && files[1].size > 0) {
      if (files[1].size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${files[1].name}` },
          { status: 400 }
        );
      }

      // Delete old main image if exists
      if (vehicle.vehicle_img) {
        await del(vehicle.vehicle_img);
      }

      // Process and save new main image
      const ext = files[1].name.split(".").pop();
      const mainFileName = `main-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${ext}`;

      const { buffer: optimizedBuffer, mimeType } = await optimizeImageToBuffer(
        files[1]
      );
      const { url } = await put(`uploads/${mainFileName}`, optimizedBuffer, {
        access: "public",
        contentType: mimeType,
      });
      mainUrl = url;
    }

    // Update vehicle record
    const { error: vehicleUpdateError } = await supabase
      .from("tb_vehicle")
      .update({
        vehicle_name: updateData.name,
        vehicle_price: updateData.price,
        vehicle_power: updateData.power,
        vehicle_torsi: updateData.torsi,
        vehicle_machine: updateData.machine,
        vehicle_model: updateData.model,
        vehicle_banner: bannerUrl,
        vehicle_img: mainUrl,
      })
      .eq("vehicle_id", vehicleId);

    if (vehicleUpdateError) {
      console.error("Failed to update vehicle:", vehicleUpdateError);
      return NextResponse.json(
        { error: "Failed to update vehicle record" },
        { status: 500 }
      );
    }

    const processedFeatureIds = new Set<number>();

    // Process features (starting from index 2)
    for (let i = 0; i < descriptions.length; i++) {
      const description = descriptions[i];
      const file = files[i + 2]; // Skip banner and main images
      const featureId = formData.get(`featureId_${i}`)?.toString();

      if (featureId) {
        // Update existing feature
        const numericId = Number(featureId);
        const existingFeature = currentFeatures?.find(
          (f: VehicleFeature) => f.feature_id === numericId
        );

        if (existingFeature) {
          processedFeatureIds.add(numericId);

          let featureImageUrl = existingFeature.feature_img;

          if (file?.size > 0) {
            if (file.size > MAX_FILE_SIZE) {
              return NextResponse.json(
                { error: `File too large: ${file.name}` },
                { status: 400 }
              );
            }

            // Delete old image
            if (existingFeature.feature_img) {
              await del(existingFeature.feature_img);
            }

            // Save new image
            const ext = file.name.split(".").pop();
            const featureFileName = `feature-${Date.now()}-${Math.random()
              .toString(36)
              .substring(7)}.${ext}`;

            const { buffer: optimizedBuffer, mimeType } =
              await optimizeImageToBuffer(file);
            const { url } = await put(
              `uploads/features/${featureFileName}`,
              optimizedBuffer,
              {
                access: "public",
                contentType: mimeType,
              }
            );
            featureImageUrl = url;
          }

          // Update feature record
          const { error: featureUpdateError } = await supabase
            .from("tb_features")
            .update({
              feature_name: description,
              feature_img: featureImageUrl,
            })
            .eq("feature_id", numericId);

          if (featureUpdateError) {
            console.error("Failed to update feature:", featureUpdateError);
            return NextResponse.json(
              { error: "Failed to update feature record" },
              { status: 500 }
            );
          }

          imageUrls.push(featureImageUrl);
        }
      } else {
        // Create new feature
        let featureImageUrl = "";

        if (file?.size > 0) {
          if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
              { error: `File too large: ${file.name}` },
              { status: 400 }
            );
          }

          const ext = file.name.split(".").pop();
          const featureFileName = `feature-${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}.${ext}`;

          const { buffer: optimizedBuffer, mimeType } =
            await optimizeImageToBuffer(file);
          const { url } = await put(
            `uploads/features/${featureFileName}`,
            optimizedBuffer,
            {
              access: "public",
              contentType: mimeType,
            }
          );
          featureImageUrl = url;
        }

        // Insert new feature record
        const { error: featureInsertError } = await supabase
          .from("tb_features")
          .insert({
            featuresVehicle_id: vehicleId,
            feature_name: description,
            feature_img: featureImageUrl,
          });

        if (featureInsertError) {
          console.error("Failed to create feature:", featureInsertError);
          return NextResponse.json(
            { error: "Failed to create feature record" },
            { status: 500 }
          );
        }

        if (featureImageUrl) {
          imageUrls.push(featureImageUrl);
        }
      }
    }

    // Delete features not present in form
    const featuresToDelete = currentFeatures?.filter(
      (f: VehicleFeature) => !processedFeatureIds.has(f.feature_id)
    );

    if (featuresToDelete && featuresToDelete.length > 0) {
      for (const feature of featuresToDelete) {
        await deleteFeature(feature.feature_id, feature.feature_img);
      }
    }

    return NextResponse.json({
      success: true,
      imageUrls: [...imageUrls, bannerUrl, mainUrl].filter((url) => url),
    });
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

async function deleteFeature(featureId: number, imagePath: string) {
  try {
    // Delete feature image file if it exists
    if (imagePath) {
      await del(imagePath);
    }

    // Delete feature from database
    const supabase = await createClient();
    await supabase.from("tb_features").delete().eq("feature_id", featureId);
  } catch (error) {
    console.error("Error deleting feature:", error);
    throw error;
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
  const banner = String(formData.get("banner"));
  const image = String(formData.get("image"));
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tb_features")
      .select("*")
      .eq("featuresVehicle_id", id);
    // console.log(data);
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        await del(data[i].feature_img);
        const supabase = await createClient();
        await supabase
          .from("tb_features")
          .delete()
          .eq("featuresVehicle_id", id);
      }
    }
    await supabase.from("tb_vehicle").delete().eq("vehicle_id", id);
    await del(banner);
    await del(image);
    return NextResponse.json({
      success: true,
      error: null,
      message: "data berhasil dihapus",
    });
    // } else {
    //   // Handle case where no data is found
    //   return NextResponse.json({
    //     success: false,
    //     error: "No data found",
    //     message: "Tidak ada data yang ditemukan untuk dihapus",
    //   });
    // }
  } catch (error) {
    console.error("Failed to delete item:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to delete item",
      message: "data gagal dihapus",
    });
  }
}

// Mark this route as dynamic since it uses cookies
export const dynamic = "force-dynamic";
