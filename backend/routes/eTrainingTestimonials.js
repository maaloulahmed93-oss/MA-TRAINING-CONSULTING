import express from 'express';
import ETrainingTestimonial from '../models/ETrainingTestimonial.js';

const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};

    if (status && status !== 'all') {
      if (status === 'published') filter.isPublished = true;
      if (status === 'unpublished') filter.isPublished = false;
    }

    if (search) {
      filter.$or = [
        { author: { $regex: search, $options: 'i' } },
        { initials: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { quote: { $regex: search, $options: 'i' } },
      ];
    }

    const testimonials = await ETrainingTestimonial.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: testimonials,
      count: testimonials.length,
    });
  } catch (error) {
    console.error('❌ Error fetching e-training testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des témoignages e-training',
      error: error.message,
    });
  }
});
router.get('/published', async (req, res) => {
  try {
    const testimonials = await ETrainingTestimonial.find({ isPublished: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('quote author initials role domain displayOrder createdAt')
      .lean();

    res.json({
      success: true,
      data: testimonials,
      count: testimonials.length,
    });
  } catch (error) {
    console.error('❌ Error fetching published e-training testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des témoignages e-training publiés',
      error: error.message,
    });
  }
});
router.post('/', async (req, res) => {
  try {
    const data = req.body || {};

    if (!data.quote || !data.author) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants: quote, author',
      });
    }

    if (!data.initials && data.author) {
      const parts = String(data.author)
        .split(' ')
        .filter(Boolean);
      data.initials = parts
        .map((p) => p[0])
        .join('')
        .substring(0, 3)
        .toUpperCase();
    }

    const created = await ETrainingTestimonial.create({
      quote: data.quote,
      author: data.author,
      initials: data.initials || '',
      role: data.role || '',
      domain: data.domain || '',
      isPublished: Boolean(data.isPublished),
      displayOrder: Number.isFinite(Number(data.displayOrder))
        ? Number(data.displayOrder)
        : 0,
    });

    res.status(201).json({
      success: true,
      data: created,
      message: 'Témoignage e-training créé avec succès',
    });
  } catch (error) {
    console.error('❌ Error creating e-training testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du témoignage e-training',
      error: error.message,
    });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await ETrainingTestimonial.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage e-training non trouvé',
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Témoignage e-training mis à jour avec succès',
    });
  } catch (error) {
    console.error('❌ Error updating e-training testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du témoignage e-training',
      error: error.message,
    });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ETrainingTestimonial.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage e-training non trouvé',
      });
    }

    res.json({
      success: true,
      message: 'Témoignage e-training supprimé avec succès',
    });
  } catch (error) {
    console.error('❌ Error deleting e-training testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du témoignage e-training',
      error: error.message,
    });
  }
});
router.patch('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await ETrainingTestimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage e-training non trouvé',
      });
    }

    testimonial.isPublished = !testimonial.isPublished;
    await testimonial.save();

    res.json({
      success: true,
      data: testimonial,
      message: `Témoignage e-training ${testimonial.isPublished ? 'publié' : 'dépublié'} avec succès`,
    });
  } catch (error) {
    console.error('❌ Error toggling publish status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message,
    });
  }
});
router.get('/stats/summary', async (req, res) => {
  try {
    const [total, published, unpublished] = await Promise.all([
      ETrainingTestimonial.countDocuments(),
      ETrainingTestimonial.countDocuments({ isPublished: true }),
      ETrainingTestimonial.countDocuments({ isPublished: false }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        published,
        unpublished,
      },
    });
  } catch (error) {
    console.error('❌ Error generating e-training testimonials stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des statistiques',
      error: error.message,
    });
  }
});

export default router;
