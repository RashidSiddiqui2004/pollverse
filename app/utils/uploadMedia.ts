import "server-only";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

type ResourceType = "image" | "video" | "raw" | "auto";

export async function uploadMedia(
  file: Buffer | string,
  folder = "socials",
  resourceType: ResourceType = "auto"
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: resourceType,
    };

    if (Buffer.isBuffer(file)) {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload returned empty result."));
        resolve(result);
      });

      uploadStream.end(file);
      return;
    }

    if (typeof file === "string") {
      cloudinary.uploader.upload(file, options, (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload returned empty result."));
        resolve(result);
      });
      return;
    }

    reject(new Error("Unsupported file type. Must be a Buffer or string."));
  });
}

export async function uploadNextFile(
  file: File | Blob,
  folder = "socials",
  resourceType: ResourceType = "auto"
): Promise<UploadApiResponse> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return uploadMedia(buffer, folder, resourceType);
}