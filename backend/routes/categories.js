import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/categories - Requête reçue');
    
    const { search, activeOnly } = req.query;
    
    let query = {};
    
    // Filter by active status
    if (activeOnly === 'true') {
      query.isActive = true;
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    console.log('🔍 Query MongoDB:', query);
    const categories = await Category.find(query).sort({ name: 1 });
    console.log('📊 Catégories trouvées:', categories.length);
    
    // Log each category for debugging
    categories.forEach((category, index) => {
      console.log(`📋 Catégorie ${index + 1}: ${category.name}`);
    });
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: error.message
    });
  }
});

// POST /api/categories - Create a new category
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/categories - Données reçues:');
    console.log('📦 req.body:', JSON.stringify(req.body, null, 2));
    
    const { name, description } = req.body;
    
    // Basic validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la catégorie est requis'
      });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Une catégorie avec ce nom existe déjà'
      });
    }
    
    // Create new category
    const newCategory = new Category({
      name: name.trim(),
      description: description?.trim() || ''
    });
    
    const savedCategory = await newCategory.save();
    console.log('✅ Nouvelle catégorie créée:', savedCategory.name);
    
    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: savedCategory
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la catégorie:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Une catégorie avec ce nom existe déjà'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la catégorie',
      error: error.message
    });
  }
});

// PUT /api/categories/:id - Update a category
router.put('/:id', async (req, res) => {
  try {
    console.log('📝 PUT /api/categories/:id - Données reçues:');
    console.log('📦 req.body:', JSON.stringify(req.body, null, 2));
    
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    
    // Basic validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la catégorie est requis'
      });
    }
    
    // Check if another category with same name exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Une catégorie avec ce nom existe déjà'
      });
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description?.trim() || '',
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }
    
    console.log('✅ Catégorie mise à jour:', updatedCategory.name);
    
    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: updatedCategory
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la catégorie:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la catégorie',
      error: error.message
    });
  }
});

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/categories/:id - ID:', req.params.id);
    
    const { id } = req.params;
    
    const deletedCategory = await Category.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }
    
    console.log('✅ Catégorie supprimée:', deletedCategory.name);
    
    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès',
      data: deletedCategory
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la catégorie',
      error: error.message
    });
  }
});

export default router;
