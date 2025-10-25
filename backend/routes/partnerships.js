import express from 'express';
const router = express.Router();

// Global variable to store contact email (can be enhanced with database)
let globalContactEmail = 'ahmedmaalou78l@gmail.com';

// Global variable to store visibility settings
let visibilitySettings = {
  formateur: { isVisible: true },
  freelance: { isVisible: true },
  commercial: { isVisible: true },
  entreprise: { isVisible: true }
};

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

    // Store in global variable (can be enhanced with database later)
    globalContactEmail = email.trim();
    console.log('📧 Global contact email updated:', globalContactEmail);

    res.json({
      success: true,
      message: 'Global contact email updated successfully',
      data: { email: globalContactEmail }
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
    console.log('📧 Returning global contact email:', globalContactEmail);

    res.json({
      success: true,
      message: 'Global contact email retrieved successfully',
      data: { email: globalContactEmail }
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

    // Update visibility settings
    visibilitySettings = { ...visibilitySettings, ...settings };
    console.log('👁️ Visibility settings updated:', visibilitySettings);

    res.json({
      success: true,
      message: 'Visibility settings updated successfully',
      data: visibilitySettings
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
    console.log('👁️ Returning visibility settings:', visibilitySettings);

    res.json({
      success: true,
      message: 'Visibility settings retrieved successfully',
      data: visibilitySettings
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

    // Create partnerships data based on visibility settings
    const partnerships = [];
    
    // Use stored data from Admin Panel if available, otherwise use defaults
    const getPartnershipData = (type) => {
      if (storedPartnerships[type]) {
        console.log(`📝 Using Admin Panel data for ${type}`);
        return storedPartnerships[type];
      }
      
      // Return default data if no Admin Panel data
      const defaults = {
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
      
      return defaults[type] || null;
    };
    
    // Get partnership data (Admin Panel data takes priority)
    const types = ['formateur', 'freelance', 'commercial', 'entreprise'];
    
    types.forEach(type => {
      const partnershipInfo = getPartnershipData(type);
      if (partnershipInfo && partnershipInfo.isVisible !== false) {
        partnerships.push(partnershipInfo);
      }
    });

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

// Store partnership data in memory (will be replaced by database later)
let storedPartnerships = {};

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
    
    // Store the partnership data in memory
    storedPartnerships[type] = {
      ...partnershipData,
      type,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`✅ ${type} partnership data stored successfully`);
    
    res.json({
      success: true,
      message: `${type} partnership updated successfully`,
      data: storedPartnerships[type]
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
    
    // Return default partnership data (Admin Panel manages the actual data)
    const defaultData = {
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      subtitle: `Partenariat ${type}`,
      intro: `Description du partenariat ${type}`,
      details: [],
      requirements: [],
      isVisible: visibilitySettings[type]?.isVisible !== false
    };
    
    res.json({
      success: true,
      message: `${type} partnership data retrieved`,
      data: defaultData
    });
    
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
