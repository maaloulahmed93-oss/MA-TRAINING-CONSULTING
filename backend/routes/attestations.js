import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Attestation from '../models/Attestation.js';
import Program from '../models/Program.js';
import Joi from 'joi';
import cloudinary from '../config/cloudinary.js';

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

// Helper function to upload PDF to Cloudinary
const uploadToCloudinary = async (filePath, attestationId, docType) => {
  try {
    console.log(`📤 Uploading ${docType} to Cloudinary...`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'matc/attestations',
      public_id: `${attestationId}-${docType}`,
      resource_type: 'raw', // Pour les PDFs
      format: 'pdf',
      overwrite: true
    });
    
    console.log(`✅ ${docType} uploaded to Cloudinary:`, result.secure_url);
    
    // Supprimer le fichier local après upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Local file deleted: ${filePath}`);
    }
    
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading ${docType} to Cloudinary:`, error);
    throw error;
  }
};

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
    
    // Check if attestation file was uploaded OR URL provided (required)
    if ((!req.files || !req.files.attestation) && !req.body.attestationUrl) {
      return res.status(400).json({
        success: false,
        message: 'Fichier d\'attestation PDF ou URL requis'
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

    console.log('📤 Processing files and URLs...');
    
    // Upload files to Cloudinary or use provided URLs
    const documents = {};
    
    try {
      // Attestation (required - either file or URL)
      if (req.files && req.files.attestation) {
        documents.attestation = await uploadToCloudinary(
          req.files.attestation[0].path,
          attestationId,
          'attestation'
        );
      } else if (req.body.attestationUrl) {
        documents.attestation = req.body.attestationUrl;
        console.log('✅ Using provided URL for attestation:', req.body.attestationUrl);
      }
      
      // Recommandation (optional - either file or URL)
      if (req.files && req.files.recommandation) {
        documents.recommandation = await uploadToCloudinary(
          req.files.recommandation[0].path,
          attestationId,
          'recommandation'
        );
      } else if (req.body.recommandationUrl) {
        documents.recommandation = req.body.recommandationUrl;
        console.log('✅ Using provided URL for recommandation:', req.body.recommandationUrl);
      }
      
      // Evaluation (optional - either file or URL)
      if (req.files && req.files.evaluation) {
        documents.evaluation = await uploadToCloudinary(
          req.files.evaluation[0].path,
          attestationId,
          'evaluation'
        );
      } else if (req.body.evaluationUrl) {
        documents.evaluation = req.body.evaluationUrl;
        console.log('✅ Using provided URL for evaluation:', req.body.evaluationUrl);
      }
      
      console.log('✅ All documents processed successfully');
    } catch (uploadError) {
      console.error('❌ Error uploading to Cloudinary:', uploadError);
      
      // Clean up local files
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'upload des fichiers vers Cloudinary',
        error: uploadError.message
      });
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
// FIXED: Support new ID format CERT-2025-M-M-001 (with multiple hyphens)
router.get('/:id/download/:type?', async (req, res) => {
  try {
    const attestationId = req.params.id;
    const docType = req.params.type || 'attestation';
    
    console.log('=== DOWNLOAD REQUEST ===');
    console.log('Full URL:', req.originalUrl);
    console.log('Attestation ID:', attestationId);
    console.log('Document Type:', docType);
    console.log('ID Format Check:', /^CERT-\d{4}-[A-Z]-[A-Z]-\d{3}$/i.test(attestationId));
    
    const attestation = await Attestation.findOne({
      attestationId: attestationId,
      isActive: true
    });

    if (!attestation) {
      console.log('❌ Attestation not found in database');
      console.log('Searched for ID:', attestationId);
      
      // Debug: List similar attestations
      const similarAttestations = await Attestation.find({
        attestationId: { $regex: `^CERT-${new Date().getFullYear()}` }
      }).limit(5).select('attestationId fullName');
      
      console.log('Recent attestations in DB:', similarAttestations.map(a => a.attestationId));
      
      return res.status(404).json({
        success: false,
        message: 'Aucune attestation trouvée pour cet ID',
        id: attestationId,
        hint: 'Vérifiez que l\'attestation existe dans la base de données'
      });
    }
    
    console.log('✅ Attestation found:', attestation.attestationId);

    // Validate document type
    const validTypes = ['attestation', 'recommandation', 'evaluation'];
    
    if (!validTypes.includes(docType)) {
      console.log('❌ Invalid document type:', docType);
      return res.status(400).json({
        success: false,
        message: 'Type de document invalide. Types valides: attestation, recommandation, evaluation',
        requestedType: docType,
        validTypes: validTypes
      });
    }

    // Resolve document path or URL
    const filePath = attestation.documents[docType];
    
    console.log('=== DOCUMENT RESOLUTION ===');
    console.log('Documents object:', JSON.stringify(attestation.documents, null, 2));
    console.log('Requested type:', docType);
    console.log('File path/URL:', filePath);
    console.log('Available documents:', Object.keys(attestation.documents).filter(k => attestation.documents[k]));
    
    if (!filePath) {
      console.log('❌ Document not found for type:', docType);
      const availableDocs = Object.keys(attestation.documents).filter(k => attestation.documents[k]);
      return res.status(404).json({
        success: false,
        message: `Fichier de ${docType} non trouvé pour cette attestation`,
        attestationId: attestationId,
        requestedType: docType,
        availableDocuments: availableDocs
      });
    }

    // If stored as a Cloudinary URL, generate signed URL with validation
    if (typeof filePath === 'string' && /^https?:\/\//i.test(filePath)) {
      console.log('✅ Cloudinary URL detected:', filePath);
      
      // Check if it's a Cloudinary URL
      if (filePath.includes('cloudinary.com')) {
        try {
          // Use improved helper for extraction and validation
          const cloudinaryHelper = (await import('../utils/cloudinaryHelper.js')).default;
          
          // Extract public_id
          const extraction = cloudinaryHelper.extractPublicId(filePath);
          
          if (!extraction.success) {
            console.error('❌ Failed to extract public_id:', extraction.error);
            return res.status(400).json({
              success: false,
              message: 'Invalid Cloudinary URL format',
              error: extraction.error
            });
          }
          
          console.log('📝 Extracted public_id:', extraction.publicId);
          console.log('📦 Resource type:', extraction.resourceType);
          
          // Generate signed URL with validation
          const signedUrlResult = await cloudinaryHelper.generateSignedUrl(
            extraction.publicId,
            extraction.resourceType,
            3600 // 1 hour
          );
          
          if (!signedUrlResult.success) {
            console.error('❌ File not found on Cloudinary:', signedUrlResult.error);
            return res.status(404).json({
              success: false,
              message: 'File missing on Cloudinary',
              error: signedUrlResult.error,
              publicId: extraction.publicId,
              hint: 'The file may have been deleted or moved. Please re-upload the document.'
            });
          }
          
          console.log('✅ Generated signed URL (valid for 1 hour)');
          console.log('🔐 Access mode:', signedUrlResult.accessMode);
          console.log('📊 File size:', signedUrlResult.fileDetails.bytes, 'bytes');
          
          return res.redirect(signedUrlResult.url);
          
        } catch (error) {
          console.error('❌ Error processing Cloudinary URL:', error);
          return res.status(500).json({
            success: false,
            message: 'Error generating download link',
            error: error.message
          });
        }
      }
      
      // For non-Cloudinary URLs, redirect directly
      return res.redirect(filePath);
    }

    // Otherwise, treat as local file path
    console.log('=== LOCAL FILE CHECK ===');
    console.log('File path:', filePath);
    console.log('Current working directory:', process.cwd());
    console.log('Absolute path:', path.resolve(filePath));
    console.log('File exists:', fs.existsSync(filePath));
    
    // Check uploads directory
    const uploadsPath = path.join(process.cwd(), 'uploads', 'attestations');
    console.log('Uploads directory:', uploadsPath);
    console.log('Uploads exists:', fs.existsSync(uploadsPath));
    
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      console.log('Files in uploads/attestations:', files.length);
      if (files.length > 0) {
        console.log('Sample files:', files.slice(0, 5));
      }
    }
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Local file not found');
      return res.status(404).json({
        success: false,
        message: `Fichier de ${docType} non trouvé sur le serveur`,
        attestationId: attestationId,
        hint: 'Le fichier peut avoir été supprimé ou déplacé. Contactez l\'administrateur.',
        filePath: filePath
      });
    }

    console.log('✅ Serving local file:', filePath);
    const filename = `${docType}-${attestation.attestationId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Attestation-ID', attestation.attestationId);
    fs.createReadStream(filePath).pipe(res);

  } catch (error) {
    console.error('❌ Error downloading attestation:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du téléchargement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Update documents if new files uploaded or URLs provided
    const documents = { ...existingAttestation.documents };
    
    try {
      // Attestation - file or URL
      if (req.files && req.files.attestation) {
        console.log('📤 Updating attestation file...');
        documents.attestation = await uploadToCloudinary(
          req.files.attestation[0].path,
          req.params.id,
          'attestation'
        );
      } else if (req.body.attestationUrl) {
        documents.attestation = req.body.attestationUrl;
        console.log('✅ Using provided URL for attestation:', req.body.attestationUrl);
      }
      
      // Recommandation - file or URL
      if (req.files && req.files.recommandation) {
        console.log('📤 Updating recommandation file...');
        documents.recommandation = await uploadToCloudinary(
          req.files.recommandation[0].path,
          req.params.id,
          'recommandation'
        );
      } else if (req.body.recommandationUrl) {
        documents.recommandation = req.body.recommandationUrl;
        console.log('✅ Using provided URL for recommandation:', req.body.recommandationUrl);
      }
      
      // Evaluation - file or URL
      if (req.files && req.files.evaluation) {
        console.log('📤 Updating evaluation file...');
        documents.evaluation = await uploadToCloudinary(
          req.files.evaluation[0].path,
          req.params.id,
          'evaluation'
        );
      } else if (req.body.evaluationUrl) {
        documents.evaluation = req.body.evaluationUrl;
        console.log('✅ Using provided URL for evaluation:', req.body.evaluationUrl);
      }
    } catch (uploadError) {
      console.error('❌ Error uploading to Cloudinary:', uploadError);
      
      // Clean up local files
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'upload des fichiers vers Cloudinary',
        error: uploadError.message
      });
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
