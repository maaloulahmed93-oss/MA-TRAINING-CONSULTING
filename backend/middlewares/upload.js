import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure Cloudinary storage for PDFs
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const baseName = (file.originalname || 'document').replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-');
    const docType = file.fieldname || 'file';
    const timestamp = Date.now();
    return {
      folder: 'matc_attestations',
      format: 'pdf',
      public_id: `${docType}-${timestamp}-${baseName}`,
      resource_type: 'raw',
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') return cb(null, true);
  cb(new Error('Seuls les fichiers PDF sont autorisés'));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default upload;


