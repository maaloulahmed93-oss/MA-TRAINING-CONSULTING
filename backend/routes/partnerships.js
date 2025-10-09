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
    
    const partnershipData = {
      formateur: {
        type: 'formateur',
        title: 'Formateur',
        icon: '📘',
        intro: 'Partagez vos connaissances avec nos apprenants et contribuez à leur réussite.',
        color: 'blue',
        gradient: 'from-blue-500 to-blue-600',
        details: [
          'Encadrer des sessions en présentiel et à distance',
          'Concevoir des supports pédagogiques de qualité',
          'Évaluer et suivre la progression des apprenants'
        ],
        requirements: [
          "Minimum 3 ans d'expérience dans votre domaine",
          'Diplôme ou certifications reconnues',
          'Excellentes compétences pédagogiques'
        ],
        isVisible: visibilitySettings.formateur?.isVisible !== false
      },
      freelance: {
        type: 'freelance',
        title: 'Freelance',
        icon: '💻',
        intro: 'Collaborez avec nous en tant que freelance pour des missions ponctuelles ou récurrentes.',
        color: 'green',
        gradient: 'from-green-500 to-green-600',
        details: [
          'Missions flexibles selon vos disponibilités',
          'Projets variés et stimulants',
          'Rémunération attractive et rapide'
        ],
        requirements: [
          'Portfolio démontrant vos compétences',
          'Expérience en freelancing ou projets indépendants',
          'Capacité à respecter les délais'
        ],
        isVisible: visibilitySettings.freelance?.isVisible !== false
      },
      commercial: {
        type: 'commercial',
        title: 'Commercial / Affilié',
        icon: '📈',
        intro: 'Devenez notre partenaire commercial et bénéficiez de commissions attractives sur les ventes.',
        color: 'orange',
        gradient: 'from-orange-500 to-orange-600',
        details: [
          'Commissions attractives sur chaque vente',
          'Support marketing et commercial',
          'Formation aux produits et services'
        ],
        requirements: [
          'Expérience en vente ou marketing',
          'Réseau professionnel développé',
          'Compétences en négociation'
        ],
        isVisible: visibilitySettings.commercial?.isVisible !== false
      },
      entreprise: {
        type: 'entreprise',
        title: 'Entreprise / École',
        icon: '🏢',
        intro: 'Établissez un partenariat institutionnel pour des formations sur mesure et des collaborations durables.',
        color: 'purple',
        gradient: 'from-purple-500 to-purple-600',
        details: [
          'Formations sur mesure pour vos équipes',
          'Partenariats à long terme',
          'Solutions adaptées à vos besoins'
        ],
        requirements: [
          'Entreprise ou institution éducative établie',
          'Besoin récurrent en formation',
          'Capacité de collaboration à long terme'
        ],
        isVisible: visibilitySettings.entreprise?.isVisible !== false
      }
    };

    // Add all partnerships to array (visibility will be filtered on frontend)
    Object.values(partnershipData).forEach(partnership => {
      partnerships.push(partnership);
    });

    console.log('✅ Partnerships loaded:', partnerships.length);

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

export default router;
