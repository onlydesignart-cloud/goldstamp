import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary with User Credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'tgrexudv',
  api_key: process.env.CLOUDINARY_API_KEY || '393523574812444',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'vx9H1tRJBbmamaxZi-Au-9lf8fA',
  secure: true,
});

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: any;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Uploads an image buffer directly to Cloudinary with automatic optimization
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<UploadResult> {
  const folder = options.folder ? `goldstamp/${options.folder}` : 'goldstamp/uploads';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        tags: options.tags || ['goldstamp'],
        resource_type: 'image',
        // Auto-optimize quality and modern format (WebP/AVIF) for lightning-fast mobile loading
        quality: 'auto',
        fetch_format: 'auto',
        transformation: options.transformation,
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned empty response'));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes an image from Cloudinary by its public ID
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
    return false;
  }
}

export { cloudinary };
