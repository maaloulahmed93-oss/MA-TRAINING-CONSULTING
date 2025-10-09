import express from 'express';
import WebsitePage from '../models/WebsitePage.js';

const router = express.Router();

// GET /api/website-pages - جلب جميع الصفحات
router.get('/', async (req, res) => {
  try {
    const { isActive, category } = req.query;
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const pages = await WebsitePage.find(filter).sort({ order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: pages,
      count: pages.length
    });
  } catch (error) {
    console.error('Error fetching website pages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des pages',
      error: error.message
    });
  }
});

// GET /api/website-pages/active - جلب الصفحات النشطة فقط للموقع الرئيسي
router.get('/active', async (req, res) => {
  try {
    const pages = await WebsitePage.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: pages,
      count: pages.length
    });
  } catch (error) {
    console.error('Error fetching active pages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des pages actives',
      error: error.message
    });
  }
});

// POST /api/website-pages - إنشاء صفحة جديدة (فقط للصفحات غير الافتراضية)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      icon,
      buttonText,
      buttonLink,
      backgroundColor,
      textColor,
      category,
      order
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!title || !description || !icon || !buttonLink) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    const newPage = new WebsitePage({
      title: title.trim(),
      description: description.trim(),
      icon: icon.trim(),
      buttonText: buttonText?.trim() || 'En savoir plus',
      buttonLink: buttonLink.trim(),
      backgroundColor: backgroundColor || '#3B82F6',
      textColor: textColor || '#FFFFFF',
      category: category || 'other',
      order: order || 0,
      isDefault: false // الصفحات الجديدة ليست افتراضية
    });

    const savedPage = await newPage.save();

    res.status(201).json({
      success: true,
      message: 'Page créée avec succès',
      data: savedPage
    });
  } catch (error) {
    console.error('Error creating website page:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la page',
      error: error.message
    });
  }
});

// PUT /api/website-pages/:id - تحديث صفحة
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPage = await WebsitePage.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedPage) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Page mise à jour avec succès',
      data: updatedPage
    });
  } catch (error) {
    console.error('Error updating website page:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la page',
      error: error.message
    });
  }
});

// DELETE /api/website-pages/:id - حذف صفحة (فقط الصفحات غير الافتراضية)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من أن الصفحة ليست افتراضية
    const page = await WebsitePage.findById(id);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée'
      });
    }

    if (page.isDefault) {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer une page par défaut'
      });
    }

    const deletedPage = await WebsitePage.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Page supprimée avec succès',
      data: deletedPage
    });
  } catch (error) {
    console.error('Error deleting website page:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la page',
      error: error.message
    });
  }
});

// PUT /api/website-pages/:id/toggle-status - تبديل حالة النشاط
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    const page = await WebsitePage.findById(id);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée'
      });
    }

    page.isActive = !page.isActive;
    page.updatedAt = new Date();
    await page.save();

    res.json({
      success: true,
      message: `Page ${page.isActive ? 'activée' : 'désactivée'} avec succès`,
      data: page
    });
  } catch (error) {
    console.error('Error toggling page status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message
    });
  }
});

// GET /api/website-pages/stats - إحصائيات الصفحات
router.get('/stats', async (req, res) => {
  try {
    const totalPages = await WebsitePage.countDocuments();
    const activePages = await WebsitePage.countDocuments({ isActive: true });
    const inactivePages = await WebsitePage.countDocuments({ isActive: false });
    const defaultPages = await WebsitePage.countDocuments({ isDefault: true });
    const customPages = await WebsitePage.countDocuments({ isDefault: false });
    
    const categoriesStats = await WebsitePage.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalPages,
        activePages,
        inactivePages,
        defaultPages,
        customPages,
        categoriesStats
      }
    });
  } catch (error) {
    console.error('Error fetching pages stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

// POST /api/website-pages/init-defaults - إنشاء الصفحات الافتراضية
router.post('/init-defaults', async (req, res) => {
  try {
    await WebsitePage.createDefaultPages();
    
    res.json({
      success: true,
      message: 'Initialisation des pages par défaut terminée'
    });
  } catch (error) {
    console.error('Error initializing default pages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation des pages par défaut',
      error: error.message
    });
  }
});

export default router;
