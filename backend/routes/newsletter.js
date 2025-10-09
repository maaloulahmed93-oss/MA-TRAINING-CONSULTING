import express from 'express';
import Newsletter from '../models/Newsletter.js';

const router = express.Router();

// GET /api/newsletter - Get all subscribers (Admin Panel)
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    
    // Build filter
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.email = { $regex: search, $options: 'i' };
    }
    
    // Get subscribers with pagination
    const skip = (page - 1) * limit;
    const subscribers = await Newsletter.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Newsletter.countDocuments(filter);
    
    // Get statistics
    const stats = await Newsletter.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statsObj = {
      total: total,
      subscribed: 0,
      unsubscribed: 0
    };
    
    stats.forEach(stat => {
      statsObj[stat._id] = stat.count;
    });
    
    res.json({
      success: true,
      data: subscribers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statsObj
    });
    
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des abonnés',
      error: error.message
    });
  }
});

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email est requis'
      });
    }
    
    // Get client info
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Find or create subscriber
    const subscriber = await Newsletter.findOrCreateSubscriber(email, 'website');
    
    // Update client info
    if (ipAddress) subscriber.ipAddress = ipAddress;
    if (userAgent) subscriber.userAgent = userAgent;
    await subscriber.save();
    
    res.json({
      success: true,
      message: 'Inscription réussie!',
      data: {
        email: subscriber.email,
        status: subscriber.status,
        subscribedAt: subscriber.subscribedAt
      }
    });
    
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    
    if (error.code === 11000) {
      // Duplicate email - this shouldn't happen with findOrCreateSubscriber, but just in case
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà inscrit'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
});

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email est requis'
      });
    }
    
    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email non trouvé dans notre liste'
      });
    }
    
    if (subscriber.status === 'unsubscribed') {
      return res.json({
        success: true,
        message: 'Cet email était déjà désabonné',
        data: {
          email: subscriber.email,
          status: subscriber.status
        }
      });
    }
    
    await subscriber.unsubscribe();
    
    res.json({
      success: true,
      message: 'Désabonnement réussi',
      data: {
        email: subscriber.email,
        status: subscriber.status,
        unsubscribedAt: subscriber.unsubscribedAt
      }
    });
    
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du désabonnement',
      error: error.message
    });
  }
});

// PUT /api/newsletter/:id/status - Update subscriber status (Admin Panel)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['subscribed', 'unsubscribed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    const subscriber = await Newsletter.findById(id);
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Abonné non trouvé'
      });
    }
    
    if (status === 'subscribed') {
      await subscriber.subscribe();
    } else {
      await subscriber.unsubscribe();
    }
    
    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: subscriber
    });
    
  } catch (error) {
    console.error('Error updating subscriber status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
});

// DELETE /api/newsletter/:id - Delete subscriber (Admin Panel)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscriber = await Newsletter.findByIdAndDelete(id);
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Abonné non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Abonné supprimé avec succès',
      data: subscriber
    });
    
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
});

// GET /api/newsletter/stats - Get newsletter statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Newsletter.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Newsletter.countDocuments();
    
    const statsObj = {
      total,
      subscribed: 0,
      unsubscribed: 0
    };
    
    stats.forEach(stat => {
      statsObj[stat._id] = stat.count;
    });
    
    // Recent subscriptions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSubscriptions = await Newsletter.countDocuments({
      status: 'subscribed',
      subscribedAt: { $gte: thirtyDaysAgo }
    });
    
    statsObj.recentSubscriptions = recentSubscriptions;
    
    res.json({
      success: true,
      data: statsObj
    });
    
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

export default router;
