import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload une image base64 vers Cloudinary
 */
export async function uploadBase64ToCloudinary(
  base64Data: string,
  folder: string = 'landing-pages'
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return result.secure_url;
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    throw new Error(`Échec upload Cloudinary: ${error}`);
  }
}

/**
 * Upload un buffer image vers Cloudinary
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  filename: string,
  folder: string = 'products'
): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: filename.split('.')[0],
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('No result from Cloudinary'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    throw new Error(`Échec upload Cloudinary: ${error}`);
  }
}

/**
 * Supprimer une image de Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Erreur suppression Cloudinary:', error);
    throw new Error(`Échec suppression Cloudinary: ${error}`);
  }
}

/**
 * Extraire le public_id d'une URL Cloudinary
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  const match = cloudinaryUrl.match(/\/v\d+\/(.+)\.[^.]+$/);
  return match ? match[1] : null;
}

export default cloudinary;
