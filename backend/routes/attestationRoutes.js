import express from 'express';
import upload from '../middlewares/upload.js';
import { uploadAndSave } from '../controllers/attestationController.js';

const router = express.Router();

// Upload single PDF to Cloudinary and save minimal record
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Fichier PDF requis' });
  }
  return uploadAndSave(req, res);
});

export default router;


