import { v2 as cloudinary } from "cloudinary";

const isMock = !process.env.CLOUDINARY_CLOUD_NAME;

if (!isMock) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export { cloudinary };

export async function uploadImage(
  file: string,
  folder: string = "artesao"
): Promise<string> {
  if (isMock) {
    // Retorna placeholder enquanto Cloudinary não está configurado
    const seed = Math.random().toString(36).slice(2, 8);
    return `https://placehold.co/800x600/e8d5c4/8b5e3c?text=Produto+${seed}`;
  }

  const result = await cloudinary.uploader.upload(file, {
    folder,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return result.secure_url;
}

export async function deleteImage(publicId: string): Promise<void> {
  if (isMock) return;
  await cloudinary.uploader.destroy(publicId);
}
