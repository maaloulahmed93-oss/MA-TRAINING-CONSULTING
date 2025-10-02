import Partner from '../models/Partner.js';

/**
 * Middleware pour extraire et valider le partnerId depuis les paramètres de route
 * Utilisé pour s'assurer que chaque partenaire ne voit que ses propres données
 */
export const extractPartnerId = async (req, res, next) => {
  try {
    const partnerId = req.params.partnerId;
    
    if (!partnerId) {
      return res.status(400).json({
        success: false,
        message: 'ID de partenaire requis'
      });
    }
    
    // Vérifier que le partenaire existe et est actif
    const partner = await Partner.findOne({ 
      partnerId: partnerId.toUpperCase(), 
      isActive: true 
    });
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partenaire non trouvé ou inactif'
      });
    }
    
    // Ajouter les informations du partenaire à la requête
    req.partner = partner;
    req.partnerId = partner.partnerId;
    
    next();
  } catch (error) {
    console.error('Erreur middleware partnerId:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du partenaire'
    });
  }
};

/**
 * Middleware pour valider que le partenaire est de type entreprise
 */
export const requireEnterprisePartner = (req, res, next) => {
  if (!req.partner || req.partner.type !== 'entreprise') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux partenaires entreprise'
    });
  }
  next();
};

/**
 * Middleware pour valider que le partenaire est de type formateur
 */
export const requireFormateurPartner = (req, res, next) => {
  if (!req.partner || req.partner.type !== 'formateur') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux formateurs'
    });
  }
  next();
};

/**
 * Middleware pour valider que le partenaire est de type commercial
 */
export const requireCommercialPartner = (req, res, next) => {
  if (!req.partner || req.partner.type !== 'commercial') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux commerciaux'
    });
  }
  next();
};

/**
 * Middleware pour ajouter automatiquement le partnerId aux données de création
 */
export const addPartnerIdToBody = (req, res, next) => {
  if (req.partnerId && req.method === 'POST') {
    req.body.partnerId = req.partnerId;
  }
  next();
};

/**
 * Middleware pour filtrer les requêtes GET par partnerId
 */
export const filterByPartnerId = (req, res, next) => {
  if (req.partnerId) {
    // Ajouter le filtre partnerId aux query params pour les requêtes GET
    if (req.method === 'GET') {
      req.partnerFilter = { partnerId: req.partnerId };
    }
  }
  next();
};

export default {
  extractPartnerId,
  requireEnterprisePartner,
  requireFormateurPartner,
  requireCommercialPartner,
  addPartnerIdToBody,
  filterByPartnerId
};
