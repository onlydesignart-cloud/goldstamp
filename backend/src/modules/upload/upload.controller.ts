import { Request, Response, NextFunction } from 'express';
import { uploadImageBuffer } from '../../lib/cloudinary';
import { sendSuccess, sendError } from '../../utils/response';

export class UploadController {
  async uploadSingle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'BAD_REQUEST', 'No image file provided for upload', 400);
        return;
      }

      // Allowed mime types
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
      if (!allowedMimes.includes(req.file.mimetype)) {
        sendError(
          res,
          'INVALID_FILE_TYPE',
          'Only JPEG, PNG, WEBP, GIF, and SVG images are permitted.',
          400
        );
        return;
      }

      const folder = (req.body.folder || req.query.folder || 'general') as string;

      const result = await uploadImageBuffer(req.file.buffer, {
        folder,
      });

      sendSuccess(
        res,
        {
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        },
        'Image uploaded successfully to Cloudinary'
      );
    } catch (err: any) {
      console.error('Upload Error:', err);
      sendError(res, 'UPLOAD_FAILED', err.message || 'Image upload failed', 500);
    }
  }
}

export const uploadController = new UploadController();
