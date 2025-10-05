import sharp from "sharp";

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

export async function optimizeImageToBuffer(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<{ buffer: Buffer; format: string; mimeType: string }> {
  const {
    maxWidth = 1400,
    maxHeight = 1000,
    quality = 80,
    format = "webp",
  } = options;
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const optimizedBuffer = await sharp(uint8Array)
    .resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat(format, {
      quality,
      progressive: format === "jpeg",
    })
    .toBuffer();

  return {
    buffer: optimizedBuffer,
    format,
    mimeType: `image/${format}`,
  };
}

// Get image dimensions
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const metadata = await sharp(uint8Array).metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  } catch (error) {
    console.error("Failed to get image dimensions:", error);
    return { width: 0, height: 0 };
  }
}
