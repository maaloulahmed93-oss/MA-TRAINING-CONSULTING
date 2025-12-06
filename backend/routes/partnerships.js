import express from 'express';
import Partnership from '../models/Partnership.js';
import PartnershipSettings from '../models/PartnershipSettings.js';

const router = express.Router();

// PUT /api/partnerships/global-email - Update global contact email
router.put('/global-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required and must be a string'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Save to MongoDB
    const settings = await PartnershipSettings.updateGlobalEmail(email.trim());
    console.log('📧 Global contact email updated in DB:', settings.globalContactEmail);

    res.json({
      success: true,
      message: 'Global contact email updated successfully',
      data: { email: settings.globalContactEmail }
    });
    
  } catch (error) {
    console.error('Error updating global email:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating global email',
      error: error.message
    });
  }
});

// GET /api/partnerships/global-email - Get global contact email
router.get('/global-email', async (req, res) => {
  try {
    const settings = await PartnershipSettings.getSettings();
    console.log('📧 Returning global contact email from DB:', settings.globalContactEmail);

    res.json({
      success: true,
      message: 'Global contact email retrieved successfully',
      data: { email: settings.globalContactEmail }
    });

  } catch (error) {
    console.error('Error getting global email:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting global email',
      error: error.message
    });
  }
});

// PUT /api/partnerships/visibility - Update visibility settings from Admin Panel
router.put('/visibility', async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid visibility settings'
      });
    }

    // Save to MongoDB
    const updatedSettings = await PartnershipSettings.updateVisibility(settings);
    console.log('👁️ Visibility settings updated in DB:', updatedSettings.visibilitySettings);

    res.json({
      success: true,
      message: 'Visibility settings updated successfully',
      data: updatedSettings.visibilitySettings
    });

  } catch (error) {
    console.error('Error updating visibility settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating visibility settings',
      error: error.message
    });
  }
});

// GET /api/partnerships/visibility - Get current visibility settings
router.get('/visibility', async (req, res) => {
  try {
    const settings = await PartnershipSettings.getSettings();
    console.log('👁️ Returning visibility settings from DB:', settings.visibilitySettings);

    res.json({
      success: true,
      message: 'Visibility settings retrieved successfully',
      data: settings.visibilitySettings
    });

  } catch (error) {
    console.error('Error getting visibility settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting visibility settings',
      error: error.message
    });
  }
});

// GET /api/partnerships - Get all partnerships for frontend
router.get('/', async (req, res) => {
  try {
    console.log('🔄 Loading partnerships for frontend...');

    // Get visibility settings from DB (single query)
    const settings = await PartnershipSettings.getSettings();
    const visibilitySettings = settings.visibilitySettings;

    // OPTIMIZATION: Fetch all partnerships in ONE query instead of 4 separate queries
    const types = ['formateur', 'freelance', 'commercial', 'entreprise'];
    const dbPartnerships = await Partnership.find({ 
      type: { $in: types }, 
      isActive: true 
    }).lean(); // Use .lean() for read-only queries (faster)

    // Create a map for quick lookup
    const dbPartnershipMap = {};
    dbPartnerships.forEach(p => {
      dbPartnershipMap[p.type] = p;
    });

    // Create partnerships data with defaults
    const partnerships = [];
    const defaults = getDefaultPartnerships(visibilitySettings);
    
    for (const type of types) {
      const dbPartnership = dbPartnershipMap[type];
      const partnershipInfo = dbPartnership 
        ? {
            type: dbPartnership.type,
            title: dbPartnership.title,
            subtitle: dbPartnership.subtitle,
            intro: dbPartnership.intro,
            icon: dbPartnership.icon,
            color: dbPartnership.color,
            gradient: dbPartnership.gradient,
            details: dbPartnership.details,
            requirements: dbPartnership.requirements,
            ctaLabel: dbPartnership.ctaLabel,
            isVisible: visibilitySettings[type]?.isVisible !== false
          }
        : defaults[type];

      if (partnershipInfo && partnershipInfo.isVisible !== false) {
        partnerships.push(partnershipInfo);
      }
    }

    console.log(`✅ Partnerships loaded: ${partnerships.length}`);
    console.log('Partnership types:', partnerships.map(p => p.type));

    res.json({
      success: true,
      message: 'Partnerships loaded successfully',
      data: partnerships
    });

  } catch (error) {
    console.error('Error loading partnerships:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading partnerships',
      error: error.message
    });
  }
});

// Helper function to get default partnership data (OPTIMIZATION: Synchronous, no DB calls)
const getDefaultPartnerships = (visibilitySettings) => {
  return {
    formateur: {
      type: 'formateur',
      title: 'Formateur',
      subtitle: 'Rejoignez notre équipe de formateurs experts',
      intro: 'Partagez vos connaissances avec nos apprenants et contribuez à leur réussite.',
      icon: '📘',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      details: [
        'Encadrer des sessions en présentiel et à distance',
        'Concevoir des supports pédagogiques de qualité',
        'Évaluer et suivre la progression des apprenants'
      ],
      requirements: [
        'Minimum 5 ans d\'expérience dans votre domaine',
        'Diplôme ou certifications reconnues',
        'Excellentes compétences pédagogiques',
        'Disponibilité flexible pour les formations',
        'Maîtrise des outils numériques'
      ],
      ctaLabel: 'Rejoindre l\'équipe',
      isVisible: visibilitySettings.formateur?.isVisible !== false
    },
    freelance: {
      type: 'freelance',
      title: 'Freelance',
      subtitle: 'Collaborez avec nous en tant que freelance',
      intro: 'Collaborez avec nous en tant que freelance pour des missions ponctuelles ou récurrentes.',
      icon: '💻',
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      details: [
        'Missions de développement et design',
        'Projets de marketing digital',
        'Consulting et formation'
      ],
      requirements: [
        'Portfolio démontrant vos compétences',
        'Expérience en freelance',
        'Capacité à respecter les délais',
        'Communication efficace'
      ],
      ctaLabel: 'Proposer vos services',
      isVisible: visibilitySettings.freelance?.isVisible !== false
    },
    commercial: {
      type: 'commercial',
      title: 'Commercial',
      subtitle: 'Développez votre carrière commerciale',
      intro: 'Rejoignez notre équipe commerciale et développez vos compétences en vente.',
      icon: '📈',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      details: [
        'Prospection et développement client',
        'Négociation et closing',
        'Suivi et fidélisation'
      ],
      requirements: [
        'Expérience en vente',
        'Excellent relationnel',
        'Motivation et ambition',
        'Maîtrise des outils CRM'
      ],
      ctaLabel: 'Postuler',
      isVisible: visibilitySettings.commercial?.isVisible !== false
    },
    entreprise: {
      type: 'entreprise',
      title: 'Entreprise',
      subtitle: 'Partenariat entreprise',
      intro: 'Développez vos opportunités de collaboration et développez votre carrière avec nos apprenants.',
      icon: '🏢',
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      details: [
        'Accès privilégié aux talents formés',
        'Programmes de formation sur mesure',
        'Partenariats stratégiques'
      ],
      requirements: [
        'Entreprise établie',
        'Besoins en formation identifiés',
        'Engagement long terme',
        'Ressources dédiées'
      ],
      ctaLabel: 'Devenir partenaire',
      isVisible: visibilitySettings.entreprise?.isVisible !== false
    }
  };
};

// PUT /api/partnerships/:type - Update specific partnership data
router.put('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const partnershipData = req.body;
    
    console.log(`📝 Updating ${type} partnership data:`, partnershipData);
    
    // Validate partnership type
    const validTypes = ['formateur', 'freelance', 'commercial', 'entreprise'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid partnership type: ${type}`
      });
    }
    
    // Save to MongoDB (upsert: create if doesn't exist, update if exists)
    const partnership = await Partnership.findOneAndUpdate(
      { type },
      {
        ...partnershipData,
        type,
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );
    
    console.log(`✅ ${type} partnership data saved to DB successfully`);
    
    res.json({
      success: true,
      message: `${type} partnership updated successfully`,
      data: partnership
    });
    
  } catch (error) {
    console.error(`Error updating ${req.params.type} partnership:`, error);
    res.status(500).json({
      success: false,
      message: 'Error updating partnership',
      error: error.message
    });
  }
});

// GET /api/partnerships/:type - Get specific partnership data
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    console.log(`📖 Getting ${type} partnership data`);
    
    // Validate partnership type
    const validTypes = ['formateur', 'freelance', 'commercial', 'entreprise'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid partnership type: ${type}`
      });
    }
    
    // Get from MongoDB
    const partnership = await Partnership.findOne({ type, isActive: true });
    const settings = await PartnershipSettings.getSettings();
    
    if (partnership) {
      res.json({
        success: true,
        message: `${type} partnership data retrieved from DB`,
        data: {
          ...partnership.toObject(),
          isVisible: settings.visibilitySettings[type]?.isVisible !== false
        }
      });
    } else {
      // Return default data if not in DB
      const defaultData = {
        type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        subtitle: `Partenariat ${type}`,
        intro: `Description du partenariat ${type}`,
        details: [],
        requirements: [],
        isVisible: settings.visibilitySettings[type]?.isVisible !== false
      };
      
      res.json({
        success: true,
        message: `${type} partnership data retrieved (default)`,
        data: defaultData
      });
    }
    
  } catch (error) {
    console.error(`Error getting ${req.params.type} partnership:`, error);
    res.status(500).json({
      success: false,
      message: 'Error getting partnership',
      error: error.message
    });
  }
});

export default router;
