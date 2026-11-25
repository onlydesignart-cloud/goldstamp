import { Router } from 'express';
import multer from 'multer';
import { uploadController } from './upload.controller';

const router = Router();

// Store files in memory buffer for direct stream upload to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum file size
  },
});

// Single image upload endpoint: POST /api/v1/upload
router.post('/', upload.single('file'), uploadController.uploadSingle);

export default router;
