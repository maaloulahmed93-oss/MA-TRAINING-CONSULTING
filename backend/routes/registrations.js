import express from 'express';
import Registration from '../models/Registration.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema
const registrationSchema = Joi.object({
  type: Joi.string().valid('program', 'pack').required(),
  itemId: Joi.string().required(),
  itemName: Joi.string().required(),
  price: Joi.number().min(0).allow(null),
  currency: Joi.string().default('€'),
  sessionId: Joi.string().when('type', {
    is: 'program',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  user: Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    email: Joi.string().email().trim().lowercase().required(),
    whatsapp: Joi.string().trim().optional(),
    phone: Joi.string().trim().optional(),
    message: Joi.string().trim().optional()
  }).required()
});

// GET /api/registrations - Get all registrations with filtering
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching registrations...');
    
    const { type, status, page = 1, limit = 50, search } = req.query;
    
    // Build filter
    const filter = {};
    if (type && ['program', 'pack'].includes(type)) {
      filter.type = type;
    }
    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { 'user.firstName': { $regex: search, $options: 'i' } },
        { 'user.lastName': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get registrations
    const registrations = await Registration.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Registration.countDocuments(filter);
    
    console.log(`✅ Found ${registrations.length} registrations (${total} total)`);
    
    res.json({
      success: true,
      data: registrations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des inscriptions',
      error: error.message
    });
  }
});

// POST /api/registrations - Create new registration
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating new registration...');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    // Validate request body
    const { error, value } = registrationSchema.validate(req.body);
    if (error) {
      console.log('❌ Validation error:', error.details[0].message);
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        error: error.details[0].message
      });
    }
    
    // Create registration
    const registration = new Registration(value);
    await registration.save();
    
    console.log('✅ Registration created:', registration._id);
    
    res.status(201).json({
      success: true,
      message: 'Inscription créée avec succès',
      data: registration
    });
  } catch (error) {
    console.error('❌ Error creating registration:', error);
    
    // Handle duplicate email for same program
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Une inscription existe déjà pour cet email et ce programme'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'inscription',
      error: error.message
    });
  }
});

// GET /api/registrations/:id - Get single registration
router.get('/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Inscription non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('❌ Error fetching registration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'inscription',
      error: error.message
    });
  }
});

// PUT /api/registrations/:id - Update registration status
router.put('/:id', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    // Validate status
    if (status && !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    const updateData = {};
    if (status) {
      updateData.status = status;
      updateData.processedAt = new Date();
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Inscription non trouvée'
      });
    }
    
    console.log(`✅ Registration ${req.params.id} updated`);
    
    res.json({
      success: true,
      message: 'Inscription mise à jour avec succès',
      data: registration
    });
  } catch (error) {
    console.error('❌ Error updating registration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'inscription',
      error: error.message
    });
  }
});

// DELETE /api/registrations/:id - Delete registration
router.delete('/:id', async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Inscription non trouvée'
      });
    }
    
    console.log(`✅ Registration ${req.params.id} deleted`);
    
    res.json({
      success: true,
      message: 'Inscription supprimée avec succès'
    });
  } catch (error) {
    console.error('❌ Error deleting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'inscription',
      error: error.message
    });
  }
});

// GET /api/registrations/stats/summary - Get registration statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Registration.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          programs: { $sum: { $cond: [{ $eq: ['$type', 'program'] }, 1, 0] } },
          packs: { $sum: { $cond: [{ $eq: ['$type', 'pack'] }, 1, 0] } }
        }
      }
    ]);
    
    const result = stats[0] || {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      programs: 0,
      packs: 0
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error fetching registration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

export default router;
