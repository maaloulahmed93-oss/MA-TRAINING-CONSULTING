import express from 'express';
import Pack from '../models/Pack.js';
import { validatePackCreation, validatePackUpdate } from '../middleware/packValidation.js';

const router = express.Router();

// GET /api/packs - Récupérer tous les packs
router.get('/', async (req, res) => {
  console.log('📦 GET /api/packs - Récupération des packs');
  try {
    const packs = await Pack.find({ isActive: true }).sort({ createdAt: -1 });
    console.log(`✅ ${packs.length} packs trouvés`);
    
    res.json({
      success: true,
      data: packs,
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
    const pack = await Pack.findOne({ 
      $or: [
        { _id: req.params.id },
        { packId: req.params.id }
      ],
      isActive: true 
    });

    if (!pack) {
      console.log('❌ Pack non trouvé');
      return res.status(404).json({
        success: false,
        message: 'Pack non trouvé'
      });
    }

    console.log('✅ Pack trouvé:', pack.name);
    res.json({
      success: true,
      data: pack,
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

    res.status(201).json({
      success: true,
      data: savedPack,
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
    const pack = await Pack.findOneAndUpdate(
      { 
        $or: [
          { _id: req.params.id },
          { packId: req.params.id }
        ],
        isActive: true 
      },
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!pack) {
      console.log('❌ Pack non trouvé pour mise à jour');
      return res.status(404).json({
        success: false,
        message: 'Pack non trouvé'
      });
    }

    console.log('✅ Pack mis à jour avec succès:', pack.name);
    res.json({
      success: true,
      data: pack,
      message: 'Pack mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du pack:', error);
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
    const pack = await Pack.findOneAndUpdate(
      { 
        $or: [
          { _id: req.params.id },
          { packId: req.params.id }
        ],
        isActive: true 
      },
      { isActive: false },
      { new: true }
    );

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
