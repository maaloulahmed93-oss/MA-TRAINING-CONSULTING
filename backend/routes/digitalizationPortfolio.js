import express from 'express';
import DigitalizationPortfolio from '../models/DigitalizationPortfolio.js';

const router = express.Router();

// GET /api/digitalization-portfolio - للموقع الرئيسي
router.get('/', async (req, res) => {
  try {
    let portfolio = await DigitalizationPortfolio.findOne({ isActive: true });
    
    if (!portfolio) {
      portfolio = await DigitalizationPortfolio.createDefault();
    }
    
    // Transform data for main website
    const transformed = {
      title: portfolio.title,
      intro: portfolio.intro,
      portfolio: portfolio.cards.map(card => ({
        title: card.title,
        description: card.description,
        result: card.result,
        image: card.emoji
      })),
      portfolioExamples: {}
    };
    
    // Create portfolioExamples object
    portfolio.cards.forEach(card => {
      transformed.portfolioExamples[card.title] = card.examples.map(ex => ({
        name: ex.name,
        detail: ex.detail,
        link: ex.link,
        imageUrl: ex.imageUrl
      }));
    });
    
    res.json({
      success: true,
      data: transformed
    });
    
  } catch (error) {
    console.error('❌ Error fetching digitalization portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du portfolio',
      error: error.message
    });
  }
});

// GET /api/digitalization-portfolio/admin - للـ Admin Panel
router.get('/admin', async (req, res) => {
  try {
    let portfolio = await DigitalizationPortfolio.findOne({ isActive: true });
    
    if (!portfolio) {
      portfolio = await DigitalizationPortfolio.createDefault();
    }
    
    // Transform data for admin panel
    const adminData = {
      title: portfolio.title,
      intro: portfolio.intro,
      cards: portfolio.cards.map(card => ({
        title: card.title,
        description: card.description,
        result: card.result,
        emoji: card.emoji
      })),
      examples: {}
    };
    
    // Create examples object for admin
    portfolio.cards.forEach(card => {
      adminData.examples[card.title] = card.examples.map(ex => ({
        name: ex.name,
        detail: ex.detail,
        link: ex.link,
        imageUrl: ex.imageUrl
      }));
    });
    
    res.json({
      success: true,
      data: adminData
    });
    
  } catch (error) {
    console.error('❌ Error fetching portfolio for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du portfolio pour admin',
      error: error.message
    });
  }
});

// PUT /api/digitalization-portfolio - حفظ التغييرات من Admin Panel
router.put('/', async (req, res) => {
  try {
    const { title, intro, cards, examples } = req.body;
    
    // Validate required fields
    if (!title || !intro || !cards) {
      return res.status(400).json({
        success: false,
        message: 'Titre, intro et cards sont requis'
      });
    }
    
    // Transform cards with examples
    const transformedCards = cards.map(card => ({
      title: card.title,
      description: card.description,
      result: card.result,
      emoji: card.emoji,
      examples: (examples[card.title] || []).map(ex => ({
        name: ex.name,
        detail: ex.detail,
        link: ex.link || '',
        imageUrl: ex.imageUrl || ''
      }))
    }));
    
    let portfolio = await DigitalizationPortfolio.findOne({ isActive: true });
    
    if (portfolio) {
      // Update existing
      portfolio.title = title;
      portfolio.intro = intro;
      portfolio.cards = transformedCards;
      await portfolio.save();
    } else {
      // Create new
      portfolio = new DigitalizationPortfolio({
        title,
        intro,
        cards: transformedCards
      });
      await portfolio.save();
    }
    
    console.log('✅ Portfolio updated successfully');
    
    res.json({
      success: true,
      message: 'Portfolio mis à jour avec succès',
      data: portfolio
    });
    
  } catch (error) {
    console.error('❌ Error updating portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du portfolio',
      error: error.message
    });
  }
});

// POST /api/digitalization-portfolio/card - إضافة بطاقة جديدة
router.post('/card', async (req, res) => {
  try {
    const { title, description, result, emoji } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Titre et description sont requis'
      });
    }
    
    let portfolio = await DigitalizationPortfolio.findOne({ isActive: true });
    
    if (!portfolio) {
      portfolio = await DigitalizationPortfolio.createDefault();
    }
    
    const newCard = {
      title,
      description,
      result: result || '',
      emoji: emoji || '📊',
      examples: []
    };
    
    portfolio.cards.push(newCard);
    await portfolio.save();
    
    res.json({
      success: true,
      message: 'Carte ajoutée avec succès',
      data: newCard
    });
    
  } catch (error) {
    console.error('❌ Error adding card:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la carte',
      error: error.message
    });
  }
});

// DELETE /api/digitalization-portfolio/reset - إعادة تعيين للبيانات الافتراضية
router.delete('/reset', async (req, res) => {
  try {
    await DigitalizationPortfolio.deleteMany({});
    const defaultPortfolio = await DigitalizationPortfolio.createDefault();
    
    res.json({
      success: true,
      message: 'Portfolio réinitialisé aux valeurs par défaut',
      data: defaultPortfolio
    });
    
  } catch (error) {
    console.error('❌ Error resetting portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation du portfolio',
      error: error.message
    });
  }
});

// GET /api/digitalization-portfolio/stats - إحصائيات
router.get('/stats', async (req, res) => {
  try {
    const portfolio = await DigitalizationPortfolio.findOne({ isActive: true });
    
    if (!portfolio) {
      return res.json({
        success: true,
        data: {
          totalCards: 0,
          totalExamples: 0,
          lastUpdated: null
        }
      });
    }
    
    const totalExamples = portfolio.cards.reduce((sum, card) => sum + card.examples.length, 0);
    
    res.json({
      success: true,
      data: {
        totalCards: portfolio.cards.length,
        totalExamples,
        lastUpdated: portfolio.updatedAt,
        title: portfolio.title
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching portfolio stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

export default router;
