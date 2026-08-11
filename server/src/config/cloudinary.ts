import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_secret',
});

/**
 * Upload base64 or buffer media to Cloudinary.
 * Falls back to mock URL if Cloudinary is not configured.
 */
export const uploadToCloudinary = async (
  fileStr: string,
  folder: string
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    // If not properly configured, mock it for offline/dev speed
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud'
    ) {
      console.log(`[Cloudinary Mock Upload] Saving file to folder: ${folder}`);
      const mockId = Math.random().toString(36).substring(7);
      return {
        secure_url: `https://res.cloudinary.com/mock_cloud/image/upload/v123456/${folder}/${mockId}.jpg`,
        public_id: `${folder}/${mockId}`,
      };
    }

    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder,
      resource_type: 'auto',
    });
    return {
      secure_url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Cloudinary upload failed.');
  }
};

export default cloudinary;
