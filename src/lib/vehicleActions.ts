"use server";
import { VehicleFeature } from "@/app/vehicle/types/vehicle";
import { validateRequest } from "./auth-utils";
import { createClient } from "./supabase/server";
import { del, put } from "@vercel/blob";
import { optimizeImageToBuffer } from "./image-utils";
interface State {
  success: boolean;
  error: string | null;
  message: string;
}
export interface VehicleResults {
  vehicles: Vehicle[] | null;
  error: string | null;
}
export async function getVehicle(): Promise<VehicleResults> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tb_vehicle")
      .select("*")
      .order("vehicle_id", { ascending: false });
    return { vehicles: data, error: null };
  } catch (error) {
    console.error("Failed to load vehicle:", error);
    return { vehicles: null, error: "Failed to load vehicle" };
  }
}

export interface VehicleResult {
  vehicle: Vehicle | null;
  features: Feature[] | null;
  error: string | null;
}
export async function getVehiclebyId(id: number): Promise<VehicleResult> {
  try {
    const supabase = await createClient();
    const { data: vehicle } = await supabase
      .from("tb_vehicle")
      .select("*")
      .eq("vehicle_id", id);
    // console.log(vehicle[0]);

    const { data: features } = await supabase
      .from("tb_features")
      .select("*")
      .eq("featuresVehicle_id", id)
      .order("feature_id", { ascending: true });

    // Explicit not-found check
    if (!vehicle || vehicle.length === 0) {
      return { vehicle: null, features: null, error: "Vehicle not found" };
    }

    return { vehicle: vehicle[0], features, error: null };
  } catch (error) {
    console.error("Data Not Found:", error);
    return { vehicle: null, features: null, error: "Data Not Found" };
  }
}
export async function deleteVehicle(
  prevState: State,
  formData: FormData
): Promise<State> {
  const { user } = await validateRequest();
  if (!user || user.role !== "user") {
    throw new Error("Unauthorized");
  }
  const id = Number(formData.get("id"));
  const banner = String(formData.get("banner"));
  const image = String(formData.get("image"));

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tb_features")
      .select("*")
      .eq("featuresVehicle_id", id);
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        await del(data[i].feature_img);
        const supabase = await createClient();
        await supabase
          .from("tb_features")
          .delete()
          .eq("featuresVehicle_id", id);
      }
      const supabase = await createClient();
      await supabase.from("tb_vehicle").delete().eq("vehicle_id", id);
      await del(banner);
      await del(image);
      return { success: true, error: null, message: "data berhasil dihapus" };
    } else {
      // Handle case where no data is found
      return {
        success: false,
        error: "No data found",
        message: "Tidak ada data yang ditemukan untuk dihapus",
      };
    }
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
  imageUrls: string[];
  error: string | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB

export async function uploadImages(
  formData: FormData,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
  }
): Promise<UploadState> {
  const { user } = await validateRequest();

  if (!user || user.role !== "user") {
    throw new Error("Unauthorized");
  }
  try {
    const files = formData.getAll("images") as File[];
    const descriptions = formData.getAll("description") as string[];
    const name = formData.get("nama") as string;
    const price = formData.get("harga") as string;
    const power = formData.get("tenaga") as string;
    const torsi = formData.get("torsi") as string;
    const machine = formData.get("mesin") as string;
    const date = String(Date.now()) as string;

    // Validate at least one file is uploaded
    if (files.length === 0) {
      return {
        success: false,
        imageUrls: [],
        error: "At least one file is required",
      };
    }

    // Validate file count (max 4)
    if (files.length > 6) {
      return {
        success: false,
        imageUrls: [],
        error: "Maximum of 4 files allowed",
      };
    }

    const imageUrls: string[] = [];
    let vehicleBanner = "";
    let vehicleImage = "";
    let featureImage = "";
    let maxVehicleId = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const description = descriptions[i];

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          imageUrls: [],
          error: `File too large: ${file.name}`,
        };
      }
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${ext}`;

      // Determine the folder and table based on the file index
      const folder = i < 2 ? "uploads" : "uploads/features";

      // Save the image URL and description to the appropriate table
      const imageUrl = `/${folder}/${file.name}`;
      if (i == 0) {
        const { buffer: optimizedBuffer, mimeType } =
          await optimizeImageToBuffer(file, options);

        const { url } = await put(
          `${folder}/banner-${fileName}`,
          optimizedBuffer,
          {
            access: "public",
            contentType: mimeType,
          }
        );
        vehicleBanner = url;
      }
      if (i == 1) {
        const { buffer: optimizedBuffer, mimeType } =
          await optimizeImageToBuffer(file, options);

        const { url } = await put(
          `${folder}/image-${fileName}`,
          optimizedBuffer,
          {
            access: "public",
            contentType: mimeType,
          }
        );
        vehicleImage = url;

        const supabase = await createClient();
        const { data } = await supabase
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

        if (data && data.length > 0) {
          maxVehicleId = data[0].vehicle_id; // Return the ID of the last record
        }
      }
      if (i > 1) {
        const { buffer: optimizedBuffer, mimeType } =
          await optimizeImageToBuffer(file, options);
        const { url } = await put(
          `${folder}/feature-${fileName}`,
          optimizedBuffer,
          {
            access: "public",
            contentType: mimeType,
          }
        );
        featureImage = url;

        const supabase = await createClient();
        await supabase.from("tb_features").insert({
          featuresVehicle_id: maxVehicleId,
          feature_name: description,
          feature_img: featureImage,
        });
      }

      imageUrls.push(imageUrl);
    }

    return { success: true, imageUrls, error: null };
  } catch (error) {
    console.error("Failed to upload images:", error);
    return { success: false, imageUrls: [], error: "Failed to upload images" };
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

export async function updateVehicle(
  id: number,
  formData: FormData,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
  }
): Promise<UploadState> {
  const { user } = await validateRequest();

  if (!user || user.role !== "user") {
    throw new Error("Unauthorized");
  }
  try {
    const files = formData.getAll("images") as File[];
    const descriptions = formData.getAll("description") as string[];
    const { vehicle } = await getVehiclebyId(id); // Implement this function
    if (files.length > 6) {
      return {
        success: false,
        imageUrls: [],
        error: "Maximum of 4 files allowed",
      };
    }

    const supabase = await createClient();

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
      model: formData.get("model") as string,
    };
    const imageUrls: string[] = [];

    // Process banner image (index 0)
    let bannerUrl;
    let bannerImage;
    if (vehicle) bannerImage = vehicle.vehicle_banner;
    if (files[0] && files[0].size > 0) {
      // Delete old banner if exists
      if (files[0].size > MAX_FILE_SIZE) {
        return {
          success: false,
          imageUrls: [],
          error: `File too large: ${files[0].name}`,
        };
      }
      if (bannerImage) {
        await del(bannerImage);
      }

      // Process and save new banner
      const ext = files[0].name.split(".").pop();
      bannerImage = `banner-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${ext}`;
      const { buffer: optimizedBuffer, mimeType } = await optimizeImageToBuffer(
        files[0],
        options
      );

      const { url } = await put(`uploads/${bannerImage}`, optimizedBuffer, {
        access: "public",
        contentType: mimeType,
      });
      bannerUrl = url;

      // Process main image (index 1)
    }
    let mainUrl;
    let mainImage;
    if (vehicle) mainImage = vehicle.vehicle_img;
    if (files[1] && files[1].size > 0) {
      // Delete old main image if exists
      if (files[1].size > MAX_FILE_SIZE) {
        return {
          success: false,
          imageUrls: [],
          error: `File too large: ${files[1].name}`,
        };
      }
      if (mainImage) {
        await del(mainImage);
      }

      // Process and save new main image
      const ext = files[1].name.split(".").pop();
      mainImage = `main-${Date.now()}.${ext}`;
      const { buffer: optimizedBuffer, mimeType } = await optimizeImageToBuffer(
        files[1],
        options
      );
      const { url } = await put(`uploads/${mainImage}`, optimizedBuffer, {
        access: "public",
        contentType: mimeType,
      });
      mainUrl = url;
    }

    await supabase
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
      .eq("vehicle_id", id);

    const processedFeatureIds = new Set<number>();

    for (let i = 0; i < descriptions.length; i++) {
      const description = descriptions[i];
      const file = files[i + 2]; // Skip banner and main images
      const featureId = formData.get(`featureId_${i}`)?.toString();

      if (featureId) {
        // Update existing feature
        const numericId = Number(featureId);
        let existingFeature;
        if (currentFeatures) {
          existingFeature = currentFeatures.find(
            (f: VehicleFeature) => f.feature_id === numericId
          );
        }

        if (existingFeature) {
          processedFeatureIds.add(numericId);

          let featureImage = existingFeature.feature_img;
          let featureUrl;
          if (file?.size > 0) {
            if (file.size > MAX_FILE_SIZE) {
              return {
                success: false,
                imageUrls: [],
                error: `File too large: ${file.name}`,
              };
            }
            // Delete old image
            if (featureImage) {
              await del(featureImage);
            }
            // Save new image
            const ext = file.name.split(".").pop();
            featureImage = `feature-${Date.now()}-${i}.${ext}`;
            const {
              buffer: optimizedBuffer,
              // format,
              mimeType,
            } = await optimizeImageToBuffer(file, options);

            const { url } = await put(
              `uploads/features/${featureImage}`,
              optimizedBuffer,
              {
                access: "public",
                contentType: mimeType,
              }
            );
            featureUrl = url;
          }
          await supabase
            .from("tb_features")
            .update({
              feature_name: description,
              feature_img: featureUrl || existingFeature.feature_img,
            })
            .eq("feature_id", numericId);
        }
      } else {
        // Create new feature
        let featureUrl;
        let featureImage = "";
        if (file?.size > 0) {
          if (file.size > MAX_FILE_SIZE) {
            return {
              success: false,
              imageUrls: [],
              error: `File too large: ${files[1].name}`,
            };
          }
          const ext = file.name.split(".").pop();
          featureImage = `feature-${Date.now()}-${i}.${ext}`;
          const { buffer: optimizedBuffer, mimeType } =
            await optimizeImageToBuffer(file, options);

          const { url } = await put(
            `uploads/features/${featureImage}`,
            optimizedBuffer,
            {
              access: "public",
              contentType: mimeType,
            }
          );
          featureUrl = url;
        }
        await supabase.from("tb_features").insert({
          featuresVehicle_id: id,
          feature_name: description,
          feature_img: featureUrl,
        });
      }
    }

    // Delete features not present in form
    let featuresToDelete;
    if (currentFeatures) {
      featuresToDelete = currentFeatures.filter(
        (f: VehicleFeature) => !processedFeatureIds.has(f.feature_id)
      );
    }

    if (featuresToDelete) {
      for (const feature of featuresToDelete) {
        await deleteFeature(feature.feature_id, feature.feature_img);
      }
    }
    return { success: true, imageUrls, error: null };
  } catch (error) {
    console.error("Failed to upload images:", error);
    return { success: false, imageUrls: [], error: "Failed to upload images" };
  }
}
