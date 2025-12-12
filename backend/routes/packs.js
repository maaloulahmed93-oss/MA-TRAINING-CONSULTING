import express from 'express';
import Pack from '../models/Pack.js';
import { validatePackCreation, validatePackUpdate } from '../middleware/packValidation.js';

const router = express.Router();

// Utility function to transform pack response
const transformPack = (pack) => {
  const packObj = pack.toObject ? pack.toObject() : pack;
  return {
    packId: packObj.packId,
    name: packObj.name,
    description: packObj.description,
    image: packObj.image,
    niveau: packObj.niveau || 'Débutant',
    resourcesCount: packObj.resourcesCount || 0,
    details: packObj.details,
    isActive: packObj.isActive,
    createdAt: packObj.createdAt,
    updatedAt: packObj.updatedAt
  };
};

// GET /api/packs - Récupérer tous les packs avec pagination
router.get('/', async (req, res) => {
  console.log('📦 GET /api/packs - Récupération des packs');
  try {
    // Pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const packs = await Pack.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Pack.countDocuments({ isActive: true });
    console.log(`✅ ${packs.length} packs trouvés (page ${page}/${Math.ceil(total / limit)})`);
    
    // Transform packs using utility function
    const transformedPacks = packs.map(transformPack);
    
    res.json({
      success: true,
      data: transformedPacks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      message: 'Packs récupérés avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des packs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des packs',
      error: error.message
    });
  }
});

// GET /api/packs/:id - Récupérer un pack spécifique
router.get('/:id', async (req, res) => {
  console.log(`📦 GET /api/packs/${req.params.id}`);
  try {
    let pack = null;
    
    // Essayer d'abord avec packId (plus probable)
    pack = await Pack.findOne({ 
      packId: req.params.id,
      isActive: true 
    });
    
    // Si pas trouvé et que l'ID ressemble à un ObjectId, essayer avec _id
    if (!pack && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      pack = await Pack.findOne({ 
        _id: req.params.id,
        isActive: true 
      });
    }

    if (!pack) {
      console.log('❌ Pack non trouvé');
      return res.status(404).json({
        success: false,
        message: 'Pack non trouvé'
      });
    }

    console.log('✅ Pack trouvé:', pack.name);
    
    // Transform pack using utility function
    const transformedPack = transformPack(pack);
    
    res.json({
      success: true,
      data: transformedPack,
      message: 'Pack récupéré avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du pack:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du pack',
      error: error.message
    });
  }
});

// POST /api/packs - Créer un nouveau pack
router.post('/', validatePackCreation, async (req, res) => {
  console.log('📦 POST /api/packs - Création d\'un nouveau pack');
  console.log('📄 Données reçues:', JSON.stringify(req.body, null, 2));

  try {
    // Générer un packId unique si non fourni
    if (!req.body.packId) {
      req.body.packId = `pack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const pack = new Pack(req.body);
    const savedPack = await pack.save();
    
    console.log('✅ Pack créé avec succès:', savedPack.name);
    console.log('🆔 ID du pack:', savedPack._id);

    // Transform pack using utility function
    const transformedPack = transformPack(savedPack);

    res.status(201).json({
      success: true,
      data: transformedPack,
      message: 'Pack créé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création du pack:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Un pack avec cet ID existe déjà',
        error: 'Duplicate packId'
      });
    }

    // Validation error from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation du pack',
        errors: messages
      });
    }

    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création du pack',
      error: error.message
    });
  }
});

// PUT /api/packs/:id - Mettre à jour un pack
router.put('/:id', validatePackUpdate, async (req, res) => {
  console.log(`📦 PUT /api/packs/${req.params.id} - Mise à jour du pack`);
  console.log('📄 Données de mise à jour:', JSON.stringify(req.body, null, 2));

  try {
    let pack = null;
    
    // Essayer d'abord avec packId (plus probable)
    pack = await Pack.findOneAndUpdate(
      { packId: req.params.id, isActive: true },
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    // Si pas trouvé et que l'ID ressemble à un ObjectId, essayer avec _id
    if (!pack && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      pack = await Pack.findOneAndUpdate(
        { _id: req.params.id, isActive: true },
        req.body,
        { 
          new: true, 
          runValidators: true 
        }
      );
    }

    if (!pack) {
      console.log('❌ Pack non trouvé pour mise à jour');
      return res.status(404).json({
        success: false,
        message: 'Pack non trouvé'
      });
    }

    console.log('✅ Pack mis à jour avec succès:', pack.name);
    
    // Transform pack using utility function
    const transformedPack = transformPack(pack);
    
    res.json({
      success: true,
      data: transformedPack,
      message: 'Pack mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du pack:', error);
    
    // Validation error from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation du pack',
        errors: messages
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du pack',
      error: error.message
    });
  }
});

// DELETE /api/packs/:id - Supprimer un pack (soft delete)
router.delete('/:id', async (req, res) => {
  console.log(`📦 DELETE /api/packs/${req.params.id} - Suppression du pack`);

  try {
    let pack = null;
    
    // Essayer d'abord avec packId (plus probable)
    pack = await Pack.findOneAndUpdate(
      { packId: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    
    // Si pas trouvé et que l'ID ressemble à un ObjectId, essayer avec _id
    if (!pack && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      pack = await Pack.findOneAndUpdate(
        { _id: req.params.id, isActive: true },
        { isActive: false },
        { new: true }
      );
    }

    if (!pack) {
      console.log('❌ Pack non trouvé pour suppression');
      return res.status(404).json({
        success: false,
        message: 'Pack non trouvé'
      });
    }

    console.log('✅ Pack supprimé avec succès:', pack.name);
    res.json({
      success: true,
      message: 'Pack supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du pack:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du pack',
      error: error.message
    });
  }
});

export default router;
