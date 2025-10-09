import express from 'express';
import Testimonial from '../models/Testimonial.js';

const router = express.Router();

// GET /api/testimonials - Récupérer tous les témoignages (pour Admin Panel)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Récupération de tous les témoignages...');
    
    const { status, category, level, search } = req.query;
    let filter = {};

    // Filtres
    if (status && status !== 'all') {
      if (status === 'published') filter.isPublished = true;
      if (status === 'unpublished') filter.isPublished = false;
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (level && level !== 'all') {
      filter.level = level;
    }

    // Recherche textuelle
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const testimonials = await Testimonial.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    console.log(`✅ ${testimonials.length} témoignages récupérés`);
    
    res.json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des témoignages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des témoignages',
      error: error.message
    });
  }
});

// GET /api/testimonials/published - Récupérer les témoignages publiés (pour site principal)
router.get('/published', async (req, res) => {
  try {
    console.log('🌐 Récupération des témoignages publiés pour le site principal...');
    
    const testimonials = await Testimonial.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .select('name position skills category level progress content badge rating company createdAt')
      .lean();

    console.log(`✅ ${testimonials.length} témoignages publiés récupérés`);
    
    res.json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des témoignages publiés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des témoignages publiés',
      error: error.message
    });
  }
});

// POST /api/testimonials - Créer un nouveau témoignage
router.post('/', async (req, res) => {
  try {
    console.log('➕ Création d\'un nouveau témoignage...');
    console.log('Données reçues:', req.body);
    
    const testimonialData = {
      ...req.body,
      createdBy: 'admin',
      updatedBy: 'admin'
    };

    const testimonial = new Testimonial(testimonialData);
    const savedTestimonial = await testimonial.save();
    
    console.log('✅ Témoignage créé avec succès:', savedTestimonial._id);
    
    res.status(201).json({
      success: true,
      data: savedTestimonial,
      message: 'Témoignage créé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création du témoignage:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création du témoignage',
      error: error.message
    });
  }
});

// PUT /api/testimonials/:id - Mettre à jour un témoignage
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Mise à jour du témoignage ${id}...`);
    
    const updateData = {
      ...req.body,
      updatedBy: 'admin'
    };

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé'
      });
    }

    console.log('✅ Témoignage mis à jour avec succès');
    
    res.json({
      success: true,
      data: testimonial,
      message: 'Témoignage mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du témoignage:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du témoignage',
      error: error.message
    });
  }
});

// DELETE /api/testimonials/:id - Supprimer un témoignage
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Suppression du témoignage ${id}...`);
    
    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé'
      });
    }

    console.log('✅ Témoignage supprimé avec succès');
    
    res.json({
      success: true,
      message: 'Témoignage supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du témoignage',
      error: error.message
    });
  }
});

// PATCH /api/testimonials/:id/publish - Basculer le statut de publication
router.patch('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📢 Basculement du statut de publication pour ${id}...`);
    
    const testimonial = await Testimonial.findById(id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé'
      });
    }

    testimonial.isPublished = !testimonial.isPublished;
    testimonial.updatedBy = 'admin';
    await testimonial.save();

    console.log(`✅ Statut changé: ${testimonial.isPublished ? 'Publié' : 'Non publié'}`);
    
    res.json({
      success: true,
      data: testimonial,
      message: `Témoignage ${testimonial.isPublished ? 'publié' : 'dépublié'} avec succès`
    });
  } catch (error) {
    console.error('❌ Erreur lors du changement de statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message
    });
  }
});

// GET /api/testimonials/stats - Statistiques des témoignages
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('📊 Génération des statistiques des témoignages...');
    
    const [
      total,
      published,
      unpublished,
      byLevel,
      byCategory,
      avgRating
    ] = await Promise.all([
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ isPublished: true }),
      Testimonial.countDocuments({ isPublished: false }),
      Testimonial.aggregate([
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]),
      Testimonial.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Testimonial.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    const stats = {
      total,
      published,
      unpublished,
      byLevel: byLevel.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      avgRating: avgRating[0]?.avgRating || 0
    };

    console.log('✅ Statistiques générées:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Erreur lors de la génération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des statistiques',
      error: error.message
    });
  }
});

// POST /api/testimonials/reset - Réinitialiser avec données par défaut
router.post('/reset', async (req, res) => {
  try {
    console.log('🔄 Réinitialisation des témoignages...');
    
    await Testimonial.deleteMany({});
    await Testimonial.createDefault();
    
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    
    console.log('✅ Témoignages réinitialisés avec succès');
    
    res.json({
      success: true,
      data: testimonials,
      message: 'Témoignages réinitialisés avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation',
      error: error.message
    });
  }
});

export default router;
