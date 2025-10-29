import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

/**
 * Middleware d'upload PDF vers Cloudinary
 * Utilise CloudinaryStorage pour upload direct
 */

// Configuration du storage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'matc_attestations', // Dossier dans Cloudinary
    format: async (req, file) => 'pdf', // Forcer format PDF
    resource_type: 'raw', // Type 'raw' pour les PDFs
    access_mode: 'public', // IMPORTANT: Rendre les fichiers publiquement accessibles
    type: 'upload', // Type d'upload standard (public)
    public_id: (req, file) => {
      // Générer un public_id unique basé sur la date et le nom du fichier
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/\.[^/.]+$/, ''); // Sans extension
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9-_]/g, '_'); // Caractères sûrs
      return `${sanitizedName}_${timestamp}`;
    },
    allowed_formats: ['pdf'], // Seulement les PDFs
  },
});

// Filtre pour vérifier le type de fichier
const fileFilter = (req, file, cb) => {
  // Vérifier le mimetype
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite 10MB
  },
});

export default upload;
