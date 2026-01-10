import express from 'express';
import Partner from '../models/Partner.js';
import FormateurSession from '../models/FormateurSession.js';

const router = express.Router();

const normalizePhone = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
};

// Fonction pour générer un ID unique selon le type
const generatePartnerId = async (type) => {
  const prefixMap = {
    formateur: 'FOR',
    freelancer: 'FRE',
    commercial: 'COM',
    entreprise: 'ENT'
  };
  
  const prefix = prefixMap[type];
  let partnerId;
  let exists = true;
  
  while (exists) {
    const digits = Math.floor(100000 + Math.random() * 900000);
    partnerId = `${prefix}-${digits}`;
    
    const existing = await Partner.findOne({ partnerId });
    exists = !!existing;
  }
  
  return partnerId;
};

// GET /api/partners - Récupérer tous les partenaires
router.get('/', async (req, res) => {
  try {
    const { type, active } = req.query;
    
    let filter = {};
    if (type && type !== 'all') {
      filter.type = type;
    }
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }
    
    const partners = await Partner.find(filter)
      .select('-password') // Exclure le mot de passe
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: partners,
      count: partners.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des partenaires'
    });
  }
});

router.post('/register-formateur', async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nom, prénom, email et téléphone sont requis'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Téléphone invalide'
      });
    }

    const existingPartner = await Partner.findOne({ email: normalizedEmail });
    if (existingPartner) {
      if (existingPartner.type !== 'formateur') {
        return res.status(400).json({
          success: false,
          message: 'Un compte existe déjà avec cet email'
        });
      }

      if (!existingPartner.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Compte désactivé'
        });
      }

      const storedPhone = normalizePhone(existingPartner.phone);
      if (!storedPhone || storedPhone !== normalizedPhone) {
        return res.status(401).json({
          success: false,
          message: 'Téléphone ne correspond pas à l\'email fourni'
        });
      }

      existingPartner.lastLogin = new Date();
      await existingPartner.save();

      const partnerResponse = existingPartner.toObject();
      delete partnerResponse.password;

      return res.json({
        success: true,
        message: 'Connexion réussie',
        data: partnerResponse
      });
    }

    const partnerId = await generatePartnerId('formateur');
    const fullName = `${String(firstName).trim()} ${String(lastName).trim()}`.trim();

    const newPartner = new Partner({
      partnerId,
      fullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      type: 'formateur',
      password: null,
      isActive: true
    });

    await newPartner.save();

    const partnerResponse = newPartner.toObject();
    delete partnerResponse.password;

    return res.status(201).json({
      success: true,
      message: 'Compte formateur créé avec succès',
      data: partnerResponse
    });
  } catch (error) {
    console.error('Erreur lors de la création du compte formateur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte formateur'
    });
  }
});

router.post('/login-formateur', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email et téléphone requis'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    const partner = await Partner.findOne({
      email: normalizedEmail,
      type: 'formateur',
      isActive: true
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Compte formateur introuvable'
      });
    }

    if (!partner.phone) {
      return res.status(401).json({
        success: false,
        message: 'Aucun téléphone associé à ce compte'
      });
    }

    const storedPhone = normalizePhone(partner.phone);
    if (!storedPhone || storedPhone !== normalizedPhone) {
      return res.status(401).json({
        success: false,
        message: 'Téléphone ne correspond pas à l\'email fourni'
      });
    }

    partner.lastLogin = new Date();
    await partner.save();

    const partnerResponse = partner.toObject();
    delete partnerResponse.password;

    return res.json({
      success: true,
      message: 'Connexion réussie',
      data: partnerResponse
    });
  } catch (error) {
    console.error('Erreur lors de la connexion formateur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
});

// GET /api/partners/:id - Récupérer un partenaire par ID
router.get('/:id', async (req, res) => {
  try {
    const partner = await Partner.findOne({ partnerId: req.params.id })
      .select('-password');
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partenaire non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du partenaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du partenaire'
    });
  }
});

// POST /api/partners - Créer un nouveau partenaire
router.post('/', async (req, res) => {
  try {
    const { fullName, email, type, password, formateurInfo, phone } = req.body;
    
    // Validation des champs requis
    if (!fullName || !email || !type) {
      return res.status(400).json({
        success: false,
        message: 'Nom complet, email et type sont requis'
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: 'Un partenaire avec cet email existe déjà'
      });
    }
    
    // Générer un ID unique
    const partnerId = await generatePartnerId(type);
    
    // Créer le nouveau partenaire
    const newPartner = new Partner({
      partnerId,
      fullName,
      email,
      type,
      password,
      phone,
      formateurInfo: type === 'formateur' ? formateurInfo : undefined
    });
    
    await newPartner.save();
    
    // Retourner sans le mot de passe
    const partnerResponse = newPartner.toObject();
    delete partnerResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Partenaire créé avec succès',
      data: partnerResponse
    });
  } catch (error) {
    console.error('Erreur lors de la création du partenaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du partenaire'
    });
  }
});

// PUT /api/partners/:id - Mettre à jour un partenaire
router.put('/:id', async (req, res) => {
  try {
    const { fullName, email, formateurInfo, isActive } = req.body;
    
    const partner = await Partner.findOne({ partnerId: req.params.id });
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partenaire non trouvé'
      });
    }
    
    // Mettre à jour les champs
    if (fullName) partner.fullName = fullName;
    if (email) partner.email = email;
    if (isActive !== undefined) partner.isActive = isActive;
    if (formateurInfo && partner.type === 'formateur') {
      partner.formateurInfo = { ...partner.formateurInfo, ...formateurInfo };
    }
    
    await partner.save();
    
    // Retourner sans le mot de passe
    const partnerResponse = partner.toObject();
    delete partnerResponse.password;
    
    res.json({
      success: true,
      message: 'Partenaire mis à jour avec succès',
      data: partnerResponse
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du partenaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du partenaire'
    });
  }
});

// DELETE /api/partners/:id - Supprimer un partenaire
router.delete('/:id', async (req, res) => {
  try {
    const partner = await Partner.findOne({ partnerId: req.params.id });
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partenaire non trouvé'
      });
    }
    
    // Vérifier s'il y a des sessions associées (pour les formateurs)
    if (partner.type === 'formateur') {
      const sessions = await FormateurSession.find({ formateurId: req.params.id });
      if (sessions.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer ce formateur car il a des sessions associées'
        });
      }
    }
    
    await Partner.deleteOne({ partnerId: req.params.id });
    
    res.json({
      success: true,
      message: 'Partenaire supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du partenaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du partenaire'
    });
  }
});

// POST /api/partners/login - Vérification d'un partenaire par ID
router.post('/login', async (req, res) => {
  try {
    const { partnerId, partnerType, email } = req.body;
    
    if (!partnerId) {
      return res.status(400).json({
        success: false,
        message: 'ID de partenaire requis'
      });
    }
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }
    
    const partner = await Partner.findOne({ partnerId: partnerId.toUpperCase(), isActive: true });
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'ID de partenaire invalide'
      });
    }
    
    // Vérification de l'email (obligatoire)
    if (!partner.email) {
      return res.status(401).json({
        success: false,
        message: 'Aucun email associé à ce compte formateur'
      });
    }
    
    if (partner.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: 'Email ne correspond pas à l\'ID fourni'
      });
    }
    
    // Validation spécifique du type si fourni
    if (partnerType && partner.type !== partnerType) {
      const typeMessages = {
        'freelancer': 'ID de freelancer invalide',
        'entreprise': 'ID d\'entreprise invalide',
        'formateur': 'ID de formateur invalide',
        'commercial': 'ID commercial invalide'
      };
      
      return res.status(403).json({
        success: false,
        message: typeMessages[partnerType] || 'Type de partenaire invalide'
      });
    }
    
    // Mettre à jour la dernière connexion
    partner.lastLogin = new Date();
    await partner.save();
    
    // Retourner les informations du partenaire sans le mot de passe
    const partnerResponse = partner.toObject();
    delete partnerResponse.password;
    
    res.json({
      success: true,
      message: 'Partenaire trouvé',
      data: partnerResponse
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
});

// GET /api/partners/stats/overview - Statistiques générales
router.get('/stats/overview', async (req, res) => {
  try {
    const totalPartners = await Partner.countDocuments({ isActive: true });
    const formateurCount = await Partner.countDocuments({ type: 'formateur', isActive: true });
    const freelancerCount = await Partner.countDocuments({ type: 'freelancer', isActive: true });
    const commercialCount = await Partner.countDocuments({ type: 'commercial', isActive: true });
    const entrepriseCount = await Partner.countDocuments({ type: 'entreprise', isActive: true });
    
    res.json({
      success: true,
      data: {
        total: totalPartners,
        formateurs: formateurCount,
        freelancers: freelancerCount,
        commerciaux: commercialCount,
        entreprises: entrepriseCount
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

export default router;
