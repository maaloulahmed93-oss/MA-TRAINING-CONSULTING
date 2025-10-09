import express from 'express';
import DigitalizationTestimonials from '../models/DigitalizationTestimonials.js';

const router = express.Router();

// GET /api/digitalization-testimonials - للموقع الرئيسي
router.get('/', async (req, res) => {
  try {
    let testimonials = await DigitalizationTestimonials.findOne({ isActive: true });
    
    if (!testimonials) {
      testimonials = await DigitalizationTestimonials.createDefault();
    }
    
    // Transform data for main website
    const transformed = {
      title: testimonials.title,
      subtitle: testimonials.subtitle,
      testimonials: testimonials.testimonials.map(t => ({
        name: t.name,
        company: t.company,
        rating: t.rating,
        comment: t.comment,
        avatar: t.avatar
      }))
    };
    
    res.json({
      success: true,
      data: transformed
    });
    
  } catch (error) {
    console.error('❌ Error fetching digitalization testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des témoignages',
      error: error.message
    });
  }
});

// GET /api/digitalization-testimonials/admin - للـ Admin Panel
router.get('/admin', async (req, res) => {
  try {
    let testimonials = await DigitalizationTestimonials.findOne({ isActive: true });
    
    if (!testimonials) {
      testimonials = await DigitalizationTestimonials.createDefault();
    }
    
    // Transform data for admin panel (compatible with existing structure)
    const adminData = {
      title: testimonials.title,
      subtitle: testimonials.subtitle,
      items: testimonials.testimonials.map(t => ({
        author: t.name,
        role: t.company,
        quote: t.comment,
        rating: t.rating,
        avatar: t.avatar
      }))
    };
    
    res.json({
      success: true,
      data: adminData
    });
    
  } catch (error) {
    console.error('❌ Error fetching testimonials for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des témoignages pour admin',
      error: error.message
    });
  }
});

// PUT /api/digitalization-testimonials - حفظ التغييرات من Admin Panel
router.put('/', async (req, res) => {
  try {
    const { title, subtitle, items } = req.body;
    
    // Validate required fields
    if (!title || !subtitle || !items) {
      return res.status(400).json({
        success: false,
        message: 'Titre, subtitle et items sont requis'
      });
    }
    
    // Transform admin data to database format
    const transformedTestimonials = items.map(item => ({
      name: item.author || item.name,
      company: item.role || item.company,
      rating: item.rating || 5,
      comment: item.quote || item.comment,
      avatar: item.avatar || (item.author ? item.author.split(' ').map(n => n[0]).join('').toUpperCase() : 'CL')
    }));
    
    let testimonials = await DigitalizationTestimonials.findOne({ isActive: true });
    
    if (testimonials) {
      // Update existing
      testimonials.title = title;
      testimonials.subtitle = subtitle;
      testimonials.testimonials = transformedTestimonials;
      await testimonials.save();
    } else {
      // Create new
      testimonials = new DigitalizationTestimonials({
        title,
        subtitle,
        testimonials: transformedTestimonials
      });
      await testimonials.save();
    }
    
    console.log('✅ Testimonials updated successfully');
    
    res.json({
      success: true,
      message: 'Témoignages mis à jour avec succès',
      data: testimonials
    });
    
  } catch (error) {
    console.error('❌ Error updating testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des témoignages',
      error: error.message
    });
  }
});

// POST /api/digitalization-testimonials/testimonial - إضافة تيموين جديد
router.post('/testimonial', async (req, res) => {
  try {
    const { name, company, rating, comment } = req.body;
    
    if (!name || !company || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Name, company et comment sont requis'
      });
    }
    
    let testimonials = await DigitalizationTestimonials.findOne({ isActive: true });
    
    if (!testimonials) {
      testimonials = await DigitalizationTestimonials.createDefault();
    }
    
    const newTestimonial = {
      name,
      company,
      rating: rating || 5,
      comment,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
    };
    
    testimonials.testimonials.push(newTestimonial);
    await testimonials.save();
    
    res.json({
      success: true,
      message: 'Témoignage ajouté avec succès',
      data: newTestimonial
    });
    
  } catch (error) {
    console.error('❌ Error adding testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du témoignage',
      error: error.message
    });
  }
});

// DELETE /api/digitalization-testimonials/reset - إعادة تعيين للبيانات الافتراضية
router.delete('/reset', async (req, res) => {
  try {
    await DigitalizationTestimonials.deleteMany({});
    const defaultTestimonials = await DigitalizationTestimonials.createDefault();
    
    res.json({
      success: true,
      message: 'Témoignages réinitialisés aux valeurs par défaut',
      data: defaultTestimonials
    });
    
  } catch (error) {
    console.error('❌ Error resetting testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation des témoignages',
      error: error.message
    });
  }
});

// GET /api/digitalization-testimonials/stats - إحصائيات
router.get('/stats', async (req, res) => {
  try {
    const testimonials = await DigitalizationTestimonials.findOne({ isActive: true });
    
    if (!testimonials) {
      return res.json({
        success: true,
        data: {
          totalTestimonials: 0,
          averageRating: 0,
          lastUpdated: null
        }
      });
    }
    
    const totalTestimonials = testimonials.testimonials.length;
    const averageRating = totalTestimonials > 0 
      ? testimonials.testimonials.reduce((sum, t) => sum + t.rating, 0) / totalTestimonials 
      : 0;
    
    res.json({
      success: true,
      data: {
        totalTestimonials,
        averageRating: Math.round(averageRating * 10) / 10,
        lastUpdated: testimonials.updatedAt,
        title: testimonials.title
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching testimonials stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

export default router;
