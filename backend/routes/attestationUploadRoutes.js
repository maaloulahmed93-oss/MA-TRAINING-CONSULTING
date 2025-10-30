import express from 'express';
import upload from '../middlewares/uploadSupabase.js';
import {
  uploadAndSave,
  getUploadsByParticipant,
  deleteUpload,
  getAllUploads
} from '../controllers/attestationUploadController.js';

const router = express.Router();

/**
 * @route   POST /api/attestations/upload
 * @desc    Upload un fichier PDF vers Supabase Storage
 * @access  Public (à sécuriser en production)
 * @body    participantId (required), type (optional), uploadedBy (optional)
 * @file    file (PDF, max 10MB)
 */
router.post('/upload', upload.single('file'), uploadAndSave);

/**
 * @route   GET /api/attestations/uploads
 * @desc    Récupérer tous les uploads (admin)
 * @access  Public (à sécuriser en production)
 * @query   page, limit, type, participantId
 */
router.get('/uploads', getAllUploads);

/**
 * @route   GET /api/attestations/uploads/:participantId
 * @desc    Récupérer tous les uploads d'un participant
 * @access  Public (à sécuriser en production)
 */
router.get('/uploads/:participantId', getUploadsByParticipant);

/**
 * @route   DELETE /api/attestations/uploads/:uploadId
 * @desc    Supprimer un upload (soft delete)
 * @access  Public (à sécuriser en production)
 */
router.delete('/uploads/:uploadId', deleteUpload);

export default router;
