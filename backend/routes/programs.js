import express from 'express';
import Program from '../models/Program.js';
import { validateProgramCreation, validateProgramUpdate } from '../middleware/validation.js';

const router = express.Router();

// GET /api/programs - Get all programs
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/programs - Requête reçue');
    console.log('📋 Query params:', req.query);
    
    const { category, level, search } = req.query;
    
    // Pour l'admin panel, on récupère TOUS les programmes (pas seulement isActive: true)
    let query = {};
    
    // Only apply isActive filter if explicitly requested
    if (req.query.activeOnly === 'true') {
      query.isActive = true;
    }

    // Filter by category
    if (category && category !== 'Tous') {
      query.category = category;
    }

    // Filter by level
    if (level && level !== 'Tous niveaux') {
      query.level = level;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    console.log('🔍 Query MongoDB:', query);
    const programs = await Program.find(query).populate('category', 'name').sort({ createdAt: -1 });
    console.log('📊 Programmes trouvés:', programs.length);
    
    // Debug populate results
    programs.forEach((program, index) => {
      console.log(`🔍 Program ${index + 1} category:`, program.category);
    });
    
    // Log each program for debugging
    programs.forEach((program, index) => {
      console.log(`📋 Programme ${index + 1}: ${program.title} (${program.price}€)`);
    });
    
    res.json({
      success: true,
      data: programs,
      count: programs.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des programmes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des programmes',
      error: error.message
    });
  }
});

// GET /api/programs/:id - Get single program
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programme non trouvé'
      });
    }

    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du programme',
      error: error.message
    });
  }
});

// POST /api/programs - Create new program
router.post('/', validateProgramCreation, async (req, res) => {
  try {
    console.log('📝 POST /api/programs - Données reçues:');
    console.log('📦 req.body:', JSON.stringify(req.body, null, 2));
    console.log('📋 Headers:', req.headers);
    
    const program = new Program(req.body);
    console.log('🔄 Programme créé en mémoire, tentative de sauvegarde...');
    
    const savedProgram = await program.save();
    console.log('✅ Programme sauvegardé avec succès dans MongoDB:');
    console.log('🆔 ID:', savedProgram._id);
    console.log('📄 Programme complet:', JSON.stringify(savedProgram, null, 2));

    res.status(201).json({
      success: true,
      message: 'Programme créé avec succès',
      data: savedProgram
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création du programme:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du programme',
      error: error.message
    });
  }
});

// PUT /api/programs/:id - Update program
router.put('/:id', validateProgramUpdate, async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programme non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Programme mis à jour avec succès',
      data: program
    });
  } catch (error) {
    console.error('Error updating program:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du programme',
      error: error.message
    });
  }
});

// DELETE /api/programs/:id - Delete program (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programme non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Programme supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du programme',
      error: error.message
    });
  }
});

// GET /api/programs/categories/list - Get available categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Program.distinct('category', { isActive: true });
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: error.message
    });
  }
});

export default router;
