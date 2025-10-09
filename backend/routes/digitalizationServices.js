import express from 'express';
import DigitalizationService from '../models/DigitalizationService.js';

const router = express.Router();

// GET /api/digitalization-services - Get all services (for main website)
router.get('/', async (req, res) => {
  try {
    console.log('📡 GET /api/digitalization-services - Fetching services...');
    
    let services = await DigitalizationService.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    // Create default if none exist
    if (!services) {
      console.log('🔄 No services found, creating default...');
      services = await DigitalizationService.createDefault();
    }
    
    console.log(`✅ Services found: ${services.title} with ${services.services.length} services`);
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('❌ Error fetching digitalization services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des services',
      error: error.message
    });
  }
});

// GET /api/digitalization-services/admin - Get services for admin panel
router.get('/admin', async (req, res) => {
  try {
    console.log('📡 GET /api/digitalization-services/admin - Fetching for admin...');
    
    let services = await DigitalizationService.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    if (!services) {
      services = await DigitalizationService.createDefault();
    }
    
    // Transform for admin panel format
    const adminData = {
      title: services.title,
      intro: services.intro,
      services: services.services.map(service => ({
        id: service.id,
        title: service.title,
        items: service.items
      }))
    };
    
    console.log(`✅ Admin data prepared: ${adminData.services.length} services`);
    
    res.json({
      success: true,
      data: adminData
    });
  } catch (error) {
    console.error('❌ Error fetching services for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des services pour admin',
      error: error.message
    });
  }
});

// POST /api/digitalization-services - Create or update services (from admin panel)
router.post('/', async (req, res) => {
  try {
    console.log('📡 POST /api/digitalization-services - Updating services...');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    
    const { title, intro, services } = req.body;
    
    // Validation
    if (!title || !intro || !services || !Array.isArray(services)) {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes: title, intro et services sont requis'
      });
    }
    
    // Transform services to include default styling
    const transformedServices = services.map((service, index) => {
      const defaultStyles = [
        { icon: 'Globe', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
        { icon: 'Bot', color: 'purple', gradient: 'from-purple-500 to-purple-600' },
        { icon: 'GraduationCap', color: 'green', gradient: 'from-green-500 to-green-600' },
        { icon: 'Database', color: 'orange', gradient: 'from-orange-500 to-orange-600' }
      ];
      
      const style = defaultStyles[index] || defaultStyles[0];
      
      return {
        id: service.id || `service-${index + 1}`,
        title: service.title,
        items: service.items.filter(item => item.trim() !== ''), // Remove empty items
        icon: style.icon,
        color: style.color,
        gradient: style.gradient
      };
    });
    
    // Find existing or create new
    let existingServices = await DigitalizationService.findOne({ isActive: true });
    
    if (existingServices) {
      // Update existing
      existingServices.title = title;
      existingServices.intro = intro;
      existingServices.services = transformedServices;
      existingServices.updatedAt = new Date();
      
      await existingServices.save();
      console.log('✅ Services updated successfully');
    } else {
      // Create new
      existingServices = new DigitalizationService({
        title,
        intro,
        services: transformedServices,
        isActive: true
      });
      
      await existingServices.save();
      console.log('✅ New services created successfully');
    }
    
    res.json({
      success: true,
      message: 'Services mis à jour avec succès',
      data: existingServices
    });
  } catch (error) {
    console.error('❌ Error updating digitalization services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des services',
      error: error.message
    });
  }
});

// PUT /api/digitalization-services/:id - Update specific service
router.put('/:id', async (req, res) => {
  try {
    console.log(`📡 PUT /api/digitalization-services/${req.params.id} - Updating specific service...`);
    
    const serviceId = req.params.id;
    const updateData = req.body;
    
    const services = await DigitalizationService.findOne({ isActive: true });
    if (!services) {
      return res.status(404).json({
        success: false,
        message: 'Services non trouvés'
      });
    }
    
    const serviceIndex = services.services.findIndex(s => s.id === serviceId);
    if (serviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Service spécifique non trouvé'
      });
    }
    
    // Update the specific service
    services.services[serviceIndex] = { ...services.services[serviceIndex], ...updateData };
    services.updatedAt = new Date();
    
    await services.save();
    
    console.log(`✅ Service ${serviceId} updated successfully`);
    
    res.json({
      success: true,
      message: 'Service mis à jour avec succès',
      data: services.services[serviceIndex]
    });
  } catch (error) {
    console.error('❌ Error updating specific service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du service',
      error: error.message
    });
  }
});

// DELETE /api/digitalization-services/reset - Reset to default (admin only)
router.delete('/reset', async (req, res) => {
  try {
    console.log('📡 DELETE /api/digitalization-services/reset - Resetting to default...');
    
    // Remove all existing
    await DigitalizationService.deleteMany({});
    
    // Create default
    const defaultServices = await DigitalizationService.createDefault();
    
    console.log('✅ Services reset to default successfully');
    
    res.json({
      success: true,
      message: 'Services remis à zéro avec succès',
      data: defaultServices
    });
  } catch (error) {
    console.error('❌ Error resetting services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la remise à zéro des services',
      error: error.message
    });
  }
});

// GET /api/digitalization-services/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📡 GET /api/digitalization-services/stats - Getting statistics...');
    
    const services = await DigitalizationService.findOne({ isActive: true });
    
    if (!services) {
      return res.json({
        success: true,
        data: {
          totalServices: 0,
          totalItems: 0,
          lastUpdated: null
        }
      });
    }
    
    const totalItems = services.services.reduce((sum, service) => sum + service.items.length, 0);
    
    const stats = {
      totalServices: services.services.length,
      totalItems: totalItems,
      lastUpdated: services.updatedAt,
      title: services.title,
      intro: services.intro
    };
    
    console.log('✅ Statistics calculated:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

export default router;
