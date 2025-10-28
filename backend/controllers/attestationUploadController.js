import AttestationUpload from '../models/AttestationUpload.js';
import Participant from '../models/Participant.js';

/**
 * Controller pour l'upload de PDF vers Cloudinary
 */

/**
 * Upload un fichier PDF vers Cloudinary
 * @route POST /api/attestations/upload
 */
export const uploadAndSave = async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    // Vérifier que le fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    // Récupérer les données du formulaire
    const { participantId, type = 'attestation', uploadedBy } = req.body;

    // Vérifier que participantId est fourni
    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'participantId est requis'
      });
    }

    // Vérifier que le participant existe
    const participant = await Participant.findOne({ participantId: participantId });
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: `Participant ${participantId} non trouvé`
      });
    }

    console.log('✅ Participant trouvé:', participant.fullName);

    // Le fichier a déjà été uploadé vers Cloudinary par multer
    // req.file.path contient l'URL Cloudinary
    const cloudinaryUrl = req.file.path;
    const cloudinaryPublicId = req.file.filename;

    console.log('✅ Fichier uploadé vers Cloudinary:', cloudinaryUrl);

    // Créer l'enregistrement dans MongoDB
    const attestationUpload = new AttestationUpload({
      participantId: participantId,
      type: type,
      url: cloudinaryUrl,
      cloudinaryPublicId: cloudinaryPublicId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: uploadedBy || 'admin'
    });

    await attestationUpload.save();

    console.log('✅ Enregistrement sauvegardé dans MongoDB');

    // Réponse succès
    res.status(201).json({
      success: true,
      message: 'Fichier uploadé avec succès',
      data: {
        url: cloudinaryUrl,
        publicId: cloudinaryPublicId,
        participantId: participantId,
        type: type,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        uploadId: attestationUpload._id
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupérer tous les uploads d'un participant
 * @route GET /api/attestations/uploads/:participantId
 */
export const getUploadsByParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;

    const uploads = await AttestationUpload.getByParticipant(participantId);

    res.status(200).json({
      success: true,
      count: uploads.length,
      data: uploads
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Supprimer un upload
 * @route DELETE /api/attestations/uploads/:uploadId
 */
export const deleteUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;

    const upload = await AttestationUpload.findById(uploadId);

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload non trouvé'
      });
    }

    // Soft delete
    upload.isActive = false;
    await upload.save();

    res.status(200).json({
      success: true,
      message: 'Upload supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupérer tous les uploads (admin)
 * @route GET /api/attestations/uploads
 */
export const getAllUploads = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, participantId } = req.query;

    const query = { isActive: true };
    
    if (type) query.type = type;
    if (participantId) query.participantId = participantId;

    const uploads = await AttestationUpload.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AttestationUpload.countDocuments(query);

    res.status(200).json({
      success: true,
      count: uploads.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: uploads
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
