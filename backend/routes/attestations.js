import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Attestation from '../models/Attestation.js';
import Program from '../models/Program.js';
import Joi from 'joi';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'attestations');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and document type
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const docType = file.fieldname || 'document';
    cb(null, docType + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Configure multiple file upload for 3 document types
const uploadMultiple = upload.fields([
  { name: 'attestation', maxCount: 1 },
  { name: 'recommandation', maxCount: 1 },
  { name: 'evaluation', maxCount: 1 }
]);

// Validation schema
const attestationSchema = Joi.object({
  fullName: Joi.string().required().trim().min(2).max(100),
  programId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  dateObtention: Joi.date().optional(),
  note: Joi.number().required().min(0).max(20),
  niveau: Joi.string().required().valid('Débutant', 'Intermédiaire', 'Avancé'),
  skills: Joi.array().items(Joi.string().trim()).optional(),
  techniques: Joi.array().items(Joi.string().trim()).optional()
});

// POST /api/attestations - Create new attestation
router.post('/', uploadMultiple, async (req, res) => {
  try {
    console.log('Creating new attestation:', req.body);
    
    // Check if attestation file was uploaded (required)
    if (!req.files || !req.files.attestation) {
      return res.status(400).json({
        success: false,
        message: 'Fichier d\'attestation PDF requis'
      });
    }

    // Parse arrays from form data
    const requestData = {
      ...req.body,
      skills: req.body.skills ? JSON.parse(req.body.skills) : [],
      techniques: req.body.techniques ? JSON.parse(req.body.techniques) : []
    };

    // Validate request data
    const { error, value } = attestationSchema.validate(requestData);
    if (error) {
      // Delete uploaded files if validation fails
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if program exists
    const program = await Program.findById(value.programId);
    if (!program) {
      // Delete uploaded files if program not found
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(404).json({
        success: false,
        message: 'Programme non trouvé'
      });
    }

    // Generate unique attestation ID with fullName and program title
    const attestationId = await Attestation.generateAttestationId(
      value.fullName,
      program.title
    );

    // Prepare document paths
    const documents = {
      attestation: req.files.attestation[0].path
    };
    
    if (req.files.recommandation) {
      documents.recommandation = req.files.recommandation[0].path;
    }
    
    if (req.files.evaluation) {
      documents.evaluation = req.files.evaluation[0].path;
    }

    // Create attestation
    const attestation = new Attestation({
      attestationId,
      fullName: value.fullName,
      programId: value.programId,
      dateObtention: value.dateObtention || new Date(),
      note: value.note,
      niveau: value.niveau,
      skills: value.skills || [],
      techniques: value.techniques || [],
      documents: documents
    });

    await attestation.save();

    // Populate program data for response
    await attestation.populate('programId', 'title category level');

    res.status(201).json({
      success: true,
      message: 'Attestation créée avec succès',
      data: attestation
    });

  } catch (error) {
    console.error('Error creating attestation:', error);
    
    // Delete uploaded files if error occurs
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'attestation'
    });
  }
});

// GET /api/attestations - Get all attestations
router.get('/', async (req, res) => {
  try {
    const attestations = await Attestation.find({ isActive: true })
      .populate('programId', 'title category level')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: attestations
    });
  } catch (error) {
    console.error('Error fetching attestations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des attestations'
    });
  }
});

// GET /api/attestations/:id - Get specific attestation
router.get('/:id', async (req, res) => {
  try {
    const attestation = await Attestation.findOne({
      attestationId: req.params.id,
      isActive: true
    }).populate('programId', 'title description category level duration');

    if (!attestation) {
      return res.status(404).json({
        success: false,
        message: 'Attestation non trouvée'
      });
    }

    res.json({
      success: true,
      data: attestation
    });
  } catch (error) {
    console.error('Error fetching attestation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'attestation'
    });
  }
});

// GET /api/attestations/verify/:id - Verify attestation validity
router.get('/verify/:id', async (req, res) => {
  try {
    const attestation = await Attestation.findOne({
      attestationId: req.params.id,
      isActive: true
    }).populate('programId', 'title description category level duration');

    if (!attestation) {
      return res.json({
        valid: false,
        message: 'Attestation non trouvée ou invalide'
      });
    }

    res.json({
      valid: true,
      data: {
        attestationId: attestation.attestationId,
        fullName: attestation.fullName,
        program: attestation.programId,
        dateObtention: attestation.dateObtention,
        note: attestation.note,
        niveau: attestation.niveau,
        skills: attestation.skills,
        techniques: attestation.techniques
      }
    });
  } catch (error) {
    console.error('Error verifying attestation:', error);
    res.status(500).json({
      valid: false,
      message: 'Erreur serveur lors de la vérification'
    });
  }
});

// GET /api/attestations/:id/download/:type - Download specific document type
router.get('/:id/download/:type?', async (req, res) => {
  try {
    console.log('Download request:', { id: req.params.id, type: req.params.type });
    const attestation = await Attestation.findOne({
      attestationId: req.params.id,
      isActive: true
    });

    if (!attestation) {
      console.log('Attestation not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Attestation non trouvée'
      });
    }

    // Determine which document type to download
    const docType = req.params.type || 'attestation';
    const validTypes = ['attestation', 'recommandation', 'evaluation'];
    
    if (!validTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        message: 'Type de document invalide. Types valides: attestation, recommandation, evaluation'
      });
    }

    // Resolve document path or URL
    const filePath = attestation.documents[docType];
    console.log('=== DOWNLOAD DEBUG ===');
    console.log('Attestation ID:', req.params.id);
    console.log('Document type:', docType);
    console.log('Full documents object:', JSON.stringify(attestation.documents, null, 2));
    console.log('Document path for', docType, ':', filePath);
    
    if (!filePath) {
      console.log('❌ Document not found for type:', docType);
      return res.status(404).json({
        success: false,
        message: `Fichier de ${docType} non trouvé`
      });
    }

    // If stored as a Cloudinary URL, redirect to it
    if (typeof filePath === 'string' && /^https?:\/\//i.test(filePath)) {
      console.log('Redirecting to Cloudinary URL:', filePath);
      return res.redirect(filePath);
    }

    // Otherwise, treat as local file path
    console.log('Checking local file:', filePath);
    console.log('Current working directory:', process.cwd());
    console.log('File exists:', fs.existsSync(filePath));
    console.log('Uploads directory exists:', fs.existsSync('./uploads'));
    
    if (fs.existsSync('./uploads')) {
      console.log('Uploads directory contents:', fs.readdirSync('./uploads'));
    }
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Local file not found:', filePath);
      console.log('❌ Absolute path:', path.resolve(filePath));
      return res.status(404).json({
        success: false,
        message: `Fichier de ${docType} non trouvé`
      });
    }

    console.log('Serving local file:', filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${docType}-${attestation.attestationId}.pdf"`);
    fs.createReadStream(filePath).pipe(res);

  } catch (error) {
    console.error('Error downloading attestation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du téléchargement'
    });
  }
});

// PUT /api/attestations/:id - Update attestation
router.put('/:id', uploadMultiple, async (req, res) => {
  try {
    console.log('Updating attestation:', req.params.id, req.body);
    
    // Find existing attestation
    const existingAttestation = await Attestation.findOne({
      attestationId: req.params.id,
      isActive: true
    });

    if (!existingAttestation) {
      return res.status(404).json({
        success: false,
        message: 'Attestation non trouvée'
      });
    }

    // Parse arrays from form data
    const requestData = {
      ...req.body,
      skills: req.body.skills ? JSON.parse(req.body.skills) : existingAttestation.skills,
      techniques: req.body.techniques ? JSON.parse(req.body.techniques) : existingAttestation.techniques
    };

    // Validate request data
    const { error, value } = attestationSchema.validate(requestData);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if program exists
    const program = await Program.findById(value.programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programme non trouvé'
      });
    }

    // Update documents if new files uploaded
    const documents = { ...existingAttestation.documents };
    
    if (req.files && req.files.attestation) {
      documents.attestation = req.files.attestation[0].path;
    }
    
    if (req.files && req.files.recommandation) {
      documents.recommandation = req.files.recommandation[0].path;
    }
    
    if (req.files && req.files.evaluation) {
      documents.evaluation = req.files.evaluation[0].path;
    }

    // Update attestation
    const updatedAttestation = await Attestation.findOneAndUpdate(
      { attestationId: req.params.id },
      {
        fullName: value.fullName,
        programId: value.programId,
        dateObtention: value.dateObtention || existingAttestation.dateObtention,
        note: value.note,
        niveau: value.niveau,
        skills: value.skills || [],
        techniques: value.techniques || [],
        documents: documents
      },
      { new: true }
    ).populate('programId', 'title category level');

    res.json({
      success: true,
      message: 'Attestation mise à jour avec succès',
      data: updatedAttestation
    });

  } catch (error) {
    console.error('Error updating attestation:', error);
    
    // Delete uploaded files if error occurs
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'attestation'
    });
  }
});

// DELETE /api/attestations/:id - Soft delete attestation
router.delete('/:id', async (req, res) => {
  try {
    const attestation = await Attestation.findOneAndUpdate(
      { attestationId: req.params.id },
      { isActive: false },
      { new: true }
    );

    if (!attestation) {
      return res.status(404).json({
        success: false,
        message: 'Attestation non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Attestation supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting attestation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression'
    });
  }
});

export default router;
