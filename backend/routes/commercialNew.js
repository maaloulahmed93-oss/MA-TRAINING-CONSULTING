import express from 'express';
import CommercialNew from '../models/CommercialNew.js';
import CommercialService from '../models/CommercialService.js';
import Partner from '../models/Partner.js';

const router = express.Router();

// POST /api/commercial-new/create-direct - Créer commercial directement (pour fix)
router.post('/create-direct', async (req, res) => {
  try {
    const commercialData = req.body;
    
    // Vérifier si le commercial existe déjà
    const existingCommercial = await CommercialNew.findOne({ 
      partnerId: commercialData.partnerId 
    });
    
    if (existingCommercial) {
      return res.json({
        success: true,
        message: 'Commercial existe déjà',
        data: existingCommercial
      });
    }
    
    // Créer nouveau commercial
    const newCommercial = new CommercialNew(commercialData);
    await newCommercial.save();
    
    res.json({
      success: true,
      message: 'Commercial créé avec succès',
      data: newCommercial
    });
  } catch (error) {
    console.error('Erreur création commercial direct:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création',
      error: error.message
    });
  }
});

// GET /api/commercial-new/sync-all-partners - Synchroniser tous les commerciaux depuis Partners
router.get('/sync-all-partners', async (req, res) => {
  try {
    console.log('🔄 Synchronisation des commerciaux depuis Partners...');
    
    // Importer le modèle Partner
    const Partner = (await import('../models/Partner.js')).default;
    
    // Récupérer tous les partners de type commercial
    const commercialPartners = await Partner.find({ type: 'commercial' });
    console.log(`📊 Trouvé ${commercialPartners.length} commerciaux dans Partners`);
    
    let created = 0;
    let existing = 0;
    
    for (const partner of commercialPartners) {
      // Vérifier si existe déjà dans CommercialNew
      const existingCommercial = await CommercialNew.findOne({ partnerId: partner.partnerId });
      
      if (existingCommercial) {
        existing++;
        continue;
      }
      
      // Créer nouveau commercial
      const commercialData = {
        partnerId: partner.partnerId,
        fullName: partner.fullName,
        email: partner.email,
        phone: partner.phone || '',
        niveau: 1,
        points: 0,
        pointsHistoriques: 0,
        chiffreAffaires: 0,
        commissionTotale: 0,
        transfertEffectue: false,
        montantTransfert: 0,
        clients: [],
        ventes: [],
        servicesAttribues: [],
        cadeauxMensuels: [],
        historiqueNiveaux: [],
        dateInscription: partner.createdAt || new Date(),
        dernierActivite: new Date(),
        isActive: partner.isActive
      };
      
      const newCommercial = new CommercialNew(commercialData);
      await newCommercial.save();
      created++;
      
      console.log(`✅ Créé: ${partner.partnerId} - ${partner.fullName}`);
    }
    
    res.json({
      success: true,
      message: `Synchronisation terminée: ${created} créés, ${existing} existants`,
      data: {
        created,
        existing,
        total: commercialPartners.length
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la synchronisation',
      error: error.message
    });
  }
});

// GET /api/commercial-new/fix-com-923432 - Fix rapide pour COM-923432
router.get('/fix-com-923432', async (req, res) => {
  try {
    console.log('🔧 Tentative de fix pour COM-923432...');
    
    // Importer le modèle Partner
    const Partner = (await import('../models/Partner.js')).default;
    
    // Chercher dans Partners d'abord
    const partner = await Partner.findOne({ partnerId: 'COM-923432', type: 'commercial' });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'COM-923432 non trouvé dans Partners'
      });
    }
    
    // Vérifier si COM-923432 existe déjà dans CommercialNew
    const existing = await CommercialNew.findOne({ partnerId: 'COM-923432' });
    if (existing) {
      return res.json({
        success: true,
        message: 'COM-923432 existe déjà',
        data: existing
      });
    }
    
    // Créer COM-923432 depuis les données Partner
    const commercialData = {
      partnerId: partner.partnerId,
      fullName: partner.fullName,
      email: partner.email,
      phone: partner.phone || '',
      niveau: 1,
      points: 0,
      pointsHistoriques: 0,
      chiffreAffaires: 0,
      commissionTotale: 0,
      transfertEffectue: false,
      montantTransfert: 0,
      clients: [],
      ventes: [],
      servicesAttribues: [],
      cadeauxMensuels: [],
      historiqueNiveaux: [],
      dateInscription: partner.createdAt || new Date(),
      dernierActivite: new Date(),
      isActive: partner.isActive
    };
    
    const newCommercial = new CommercialNew(commercialData);
    await newCommercial.save();
    
    console.log('✅ COM-923432 créé avec succès depuis Partners!');
    
    res.json({
      success: true,
      message: 'COM-923432 créé avec succès depuis Partners!',
      data: newCommercial
    });
    
  } catch (error) {
    console.error('❌ Erreur fix COM-923432:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du fix',
      error: error.message
    });
  }
});

// GET /api/commercial-new/fix-com-451764 - Fix rapide pour COM-451764
router.get('/fix-com-451764', async (req, res) => {
  try {
    console.log('🔧 Tentative de fix pour COM-451764...');
    
    // Importer le modèle Partner
    const Partner = (await import('../models/Partner.js')).default;
    
    // Chercher dans Partners d'abord
    const partner = await Partner.findOne({ partnerId: 'COM-451764', type: 'commercial' });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'COM-451764 non trouvé dans Partners'
      });
    }
    
    console.log(`✅ COM-451764 trouvé dans Partners: ${partner.fullName} - ${partner.email}`);
    
    // Vérifier si COM-451764 existe déjà dans CommercialNew
    const existing = await CommercialNew.findOne({ partnerId: 'COM-451764' });
    if (existing) {
      console.log('ℹ️ COM-451764 existe déjà dans CommercialNew');
      return res.json({
        success: true,
        message: 'COM-451764 existe déjà dans CommercialNew',
        data: existing
      });
    }
    
    // Créer COM-451764 depuis les données Partner
    const commercialData = {
      partnerId: partner.partnerId,
      fullName: partner.fullName,
      email: partner.email,
      phone: partner.phone || '',
      niveau: 1,
      points: 0,
      pointsHistoriques: 0,
      chiffreAffaires: 0,
      commissionTotale: 0,
      transfertEffectue: false,
      montantTransfert: 0,
      clients: [],
      ventes: [],
      servicesAttribues: [],
      cadeauxMensuels: [],
      historiqueNiveaux: [],
      dateInscription: partner.createdAt || new Date(),
      dernierActivite: new Date(),
      isActive: partner.isActive
    };
    
    const newCommercial = new CommercialNew(commercialData);
    await newCommercial.save();
    
    console.log('✅ COM-451764 créé avec succès depuis Partners!');
    
    res.json({
      success: true,
      message: 'COM-451764 créé avec succès depuis Partners!',
      data: newCommercial
    });
    
  } catch (error) {
    console.error('❌ Erreur fix COM-451764:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du fix',
      error: error.message
    });
  }
});


// GET /api/commercial-new/:partnerId - Récupérer données commercial
router.get('/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    const commercial = await CommercialNew.findOne({ 
      partnerId, 
      isActive: true 
    });
    
    if (!commercial) {
      return res.status(404).json({
        success: false,
        message: 'Commercial non trouvé'
      });
    }
    
    // Récupérer services attribués
    const services = await CommercialService.getServicesCommercial(partnerId);
    
    res.json({
      success: true,
      data: {
        commercial,
        services
      }
    });
  } catch (error) {
    console.error('Erreur récupération commercial:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// POST /api/commercial-new/:partnerId/login - Authentification commercial (HYBRID)
router.post('/:partnerId/login', async (req, res) => {
  try {
    const { partnerId } = req.params;
    console.log(`🔍 Tentative de login pour: ${partnerId}`);
    
    // ÉTAPE 1: Chercher d'abord dans CommercialNew (nouveau système)
    let commercial = await CommercialNew.findOne({ 
      partnerId, 
      isActive: true 
    });
    
    if (commercial) {
      console.log(`✅ Trouvé dans CommercialNew: ${partnerId}`);
      // Mettre à jour dernière activité
      commercial.dernierActivite = new Date();
      await commercial.save();
      
      return res.json({
        success: true,
        data: {
          partnerId: commercial.partnerId,
          fullName: commercial.fullName,
          email: commercial.email,
          niveau: commercial.niveau,
          points: commercial.points,
          chiffreAffaires: commercial.chiffreAffaires,
          commissionTotale: commercial.commissionTotale
        }
      });
    }
    
    // ÉTAPE 2: Si pas trouvé, chercher dans Partners (ancien système)
    console.log(`🔍 Recherche dans Partners pour: ${partnerId}`);
    const Partner = (await import('../models/Partner.js')).default;
    
    const partner = await Partner.findOne({ 
      partnerId, 
      type: 'commercial',
      isActive: true 
    });
    
    if (!partner) {
      console.log(`❌ ${partnerId} non trouvé dans Partners`);
      return res.status(404).json({
        success: false,
        message: 'Commercial non trouvé'
      });
    }
    
    console.log(`✅ Trouvé dans Partners: ${partnerId}, création automatique...`);
    
    // ÉTAPE 3: Créer automatiquement dans CommercialNew depuis Partners
    const newCommercial = new CommercialNew({
      partnerId: partner.partnerId,
      fullName: partner.fullName,
      email: partner.email,
      phone: partner.phone || '',
      niveau: 1, // Niveau débutant
      points: 0,
      pointsHistoriques: 0,
      chiffreAffaires: 0,
      commissionTotale: 0,
      transfertEffectue: false,
      montantTransfert: 0,
      clients: [],
      ventes: [],
      servicesAttribues: [],
      cadeauxMensuels: [],
      historiqueNiveaux: [],
      dateInscription: partner.createdAt || new Date(),
      dernierActivite: new Date(),
      isActive: partner.isActive
    });
    
    await newCommercial.save();
    console.log(`✅ ${partnerId} créé automatiquement dans CommercialNew`);
    
    // ÉTAPE 4: Retourner les données du nouveau commercial
    res.json({
      success: true,
      data: {
        partnerId: newCommercial.partnerId,
        fullName: newCommercial.fullName,
        email: newCommercial.email,
        niveau: newCommercial.niveau,
        points: newCommercial.points,
        chiffreAffaires: newCommercial.chiffreAffaires,
        commissionTotale: newCommercial.commissionTotale
      }
    });
    
  } catch (error) {
    console.error('Erreur login commercial:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/commercial-new/:partnerId/services - Services attribués
router.get('/:partnerId/services', async (req, res) => {
  try {
    const { partnerId } = req.params;
    console.log(`🔍 GET services pour commercial: ${partnerId}`);
    
    const services = await CommercialService.getServicesCommercial(partnerId);
    console.log(`📊 ${services.length} services trouvés pour ${partnerId}`);
    
    // Log des services trouvés
    services.forEach(service => {
      console.log(`  - ${service.titre} (${service.commission}€)`);
    });
    
    res.json({
      success: true,
      data: services,
      message: `${services.length} services assignés trouvés`
    });
  } catch (error) {
    console.error('Erreur récupération services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// POST /api/commercial-new/:partnerId/vente - Ajouter une vente
router.post('/:partnerId/vente', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { serviceId, client, clientEmail, montant, commission, methodePaiement } = req.body;
    
    const commercial = await CommercialNew.findOne({ 
      partnerId, 
      isActive: true 
    });
    
    if (!commercial) {
      return res.status(404).json({
        success: false,
        message: 'Commercial non trouvé'
      });
    }
    
    // Vérifier accès au service
    const acces = await CommercialService.verifierAcces(serviceId, partnerId);
    if (!acces) {
      return res.status(403).json({
        success: false,
        message: 'Accès au service non autorisé'
      });
    }
    
    // Récupérer info service
    const service = await CommercialService.findById(serviceId);
    
    // Ajouter la vente
    await commercial.ajouterVente({
      client,
      clientEmail,
      programme: service.titre,
      montant,
      commission,
      status: 'confirmé',
      methodePaiement
    });
    
    // Mettre à jour statistiques du service
    await service.mettreAJourStatistiques(montant, commission);
    
    res.json({
      success: true,
      message: 'Vente ajoutée avec succès',
      data: {
        pointsGagnes: 5,
        nouveauNiveau: commercial.niveau,
        totalPoints: commercial.points
      }
    });
  } catch (error) {
    console.error('Erreur ajout vente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// POST /api/commercial-new/:partnerId/client - Ajouter un client (niveau 2+)
router.post('/:partnerId/client', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const clientData = req.body;
    
    const commercial = await CommercialNew.findOne({ 
      partnerId, 
      isActive: true 
    });
    
    if (!commercial) {
      return res.status(404).json({
        success: false,
        message: 'Commercial non trouvé'
      });
    }
    
    if (commercial.niveau < 2) {
      return res.status(403).json({
        success: false,
        message: 'Fonctionnalité disponible à partir du niveau 2'
      });
    }
    
    await commercial.ajouterClient(clientData);
    
    res.json({
      success: true,
      message: 'Client ajouté avec succès'
    });
  } catch (error) {
    console.error('Erreur ajout client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// POST /api/commercial-new/:partnerId/transfert - Effectuer transfert (niveau 2)
router.post('/:partnerId/transfert', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { montant } = req.body;
    
    const commercial = await CommercialNew.findOne({ 
      partnerId, 
      isActive: true 
    });
    
    if (!commercial) {
      return res.status(404).json({
        success: false,
        message: 'Commercial non trouvé'
      });
    }
    
    if (commercial.niveau !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Transfert disponible uniquement au niveau 2'
      });
    }
    
    if (commercial.chiffreAffaires < 500) {
      return res.status(400).json({
        success: false,
        message: 'Chiffre d\'affaires insuffisant (minimum 500€)'
      });
    }
    
    await commercial.effectuerTransfert(montant);
    
    res.json({
      success: true,
      message: 'Transfert effectué avec succès',
      data: {
        nouveauNiveau: commercial.niveau,
        montantTransfert: montant
      }
    });
  } catch (error) {
    console.error('Erreur transfert:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur serveur'
    });
  }
});

// GET /api/commercial-new/:partnerId/stats - Statistiques
router.get('/:partnerId/stats', async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    const stats = await CommercialNew.getStatistiques(partnerId);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Commercial non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ADMIN ROUTES - Gestion des services avec secret code

// POST /api/commercial-new/admin/service - Créer service (Admin)
router.post('/admin/service', async (req, res) => {
  try {
    const { titre, description, categorie, prixPublic, prixCommercial, commission, duree, adminId } = req.body;
    
    const service = new CommercialService({
      titre,
      description,
      categorie,
      prixPublic,
      prixCommercial,
      commission,
      duree,
      creePar: adminId || 'admin'
    });
    
    await service.save();
    
    res.status(201).json({
      success: true,
      message: 'Service créé avec succès',
      data: service
    });
  } catch (error) {
    console.error('Erreur création service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// POST /api/commercial-new/admin/assign-service - Attribuer service à commercial  
router.post('/admin/assign-service-old', async (req, res) => {
  try {
    const { serviceId, partnerId, adminId } = req.body;
    
    const service = await CommercialService.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    await service.ajouterCommercial(partnerId, adminId || 'admin');
    
    res.json({
      success: true,
      message: 'Service attribué avec succès'
    });
  } catch (error) {
    console.error('Erreur attribution service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/commercial-new/admin/services - Liste tous les services (Admin)
router.get('/admin/services', async (req, res) => {
  try {
    console.log('🔍 Récupération des services commerciaux...');
    
    // 🔍 Debug: Check all services first
    const allServices = await CommercialService.find({});
    console.log(`🔍 Total services in DB: ${allServices.length}`);
    allServices.forEach(service => {
      console.log(`  - ${service.titre} (isActive: ${service.isActive})`);
    });
    
    let services = await CommercialService.find({ isActive: true });
    console.log(`📊 ${services.length} services actifs trouvés dans la DB`);
    
    // 🔥 FALLBACK: If no active services, try all services
    if (services.length === 0) {
      console.log('⚠️ Aucun service actif, essai avec tous les services...');
      services = await CommercialService.find({});
      console.log(`📊 ${services.length} services totaux trouvés`);
    }
    
    // Si aucun service, créer des services par défaut
    if (services.length === 0) {
      console.log('📝 Aucun service trouvé, création des services par défaut...');
      
      const servicesParDefaut = [
        {
          titre: 'Formation Leadership',
          description: 'Formation complète en leadership et management d\'équipe',
          categorie: 'Management',
          prixPublic: 1500,
          prixCommercial: 1200,
          commission: 300,
          duree: '3 jours',
          creePar: 'SYSTEM',
          commerciauxAutorises: [],
          isActive: true
        },
        {
          titre: 'Coaching Personnel',
          description: 'Sessions de coaching individuel pour développement personnel',
          categorie: 'Coaching',
          prixPublic: 800,
          prixCommercial: 650,
          commission: 150,
          duree: '2 heures',
          creePar: 'SYSTEM',
          commerciauxAutorises: [],
          isActive: true
        },
        {
          titre: 'Formation Communication',
          description: 'Améliorer ses compétences en communication professionnelle',
          categorie: 'Communication',
          prixPublic: 1200,
          prixCommercial: 950,
          commission: 250,
          duree: '2 jours',
          creePar: 'SYSTEM',
          commerciauxAutorises: [],
          isActive: true
        },
        {
          titre: 'Gestion de Projet',
          description: 'Méthodologies et outils de gestion de projet moderne',
          categorie: 'Management',
          prixPublic: 2000,
          prixCommercial: 1600,
          commission: 400,
          duree: '5 jours',
          creePar: 'SYSTEM',
          commerciauxAutorises: [],
          isActive: true
        },
        {
          titre: 'Marketing Digital',
          description: 'Stratégies et techniques du marketing digital',
          categorie: 'Marketing',
          prixPublic: 1800,
          prixCommercial: 1440,
          commission: 360,
          duree: '4 jours',
          creePar: 'SYSTEM',
          commerciauxAutorises: [],
          isActive: true
        }
      ];
      
      try {
        const servicesCreated = await CommercialService.insertMany(servicesParDefaut);
        console.log(`✅ ${servicesCreated.length} services par défaut créés`);
        services = servicesCreated;
      } catch (insertError) {
        console.error('❌ Erreur création services par défaut:', insertError);
      }
    }
    
    res.json({
      success: true,
      data: services,
      message: services.length === 0 ? 'Aucun service disponible' : `${services.length} services trouvés`
    });
  } catch (error) {
    console.error('❌ Erreur récupération services admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// POST /api/commercial-new/admin/services - Créer un nouveau service (Admin)
router.post('/admin/services', async (req, res) => {
  try {
    console.log('📝 Création d\'un nouveau service...');
    const { titre, description, categorie, prixPublic, prixCommercial, commission, duree } = req.body;
    
    // Validation des champs requis
    if (!titre || !prixPublic || !prixCommercial || !commission) {
      return res.status(400).json({
        success: false,
        message: 'Titre, prix public, prix commercial et commission sont requis'
      });
    }
    
    // Créer le nouveau service
    const nouveauService = new CommercialService({
      titre: titre.trim(),
      description: description?.trim() || '',
      categorie: categorie?.trim() || 'Général',
      prixPublic: Number(prixPublic),
      prixCommercial: Number(prixCommercial),
      commission: Number(commission),
      duree: duree?.trim() || '',
      creePar: 'ADMIN',
      commerciauxAutorises: [],
      isActive: true // 🔥 FIX: Explicitly set isActive
    });
    
    await nouveauService.save();
    console.log(`✅ Service créé: ${nouveauService.titre}`);
    
    res.status(201).json({
      success: true,
      message: 'Service créé avec succès',
      data: nouveauService
    });
    
  } catch (error) {
    console.error('❌ Erreur création service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du service',
      error: error.message
    });
  }
});

// POST /api/commercial-new/admin/assign-service - Assigner un service à un commercial
router.post('/admin/assign-service', async (req, res) => {
  try {
    console.log('🔗 Attribution d\'un service à un commercial...');
    const { serviceId, partnerId } = req.body;
    
    // Validation
    if (!serviceId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID et Partner ID requis'
      });
    }
    
    // Trouver le service
    const service = await CommercialService.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    // Vérifier si le commercial existe
    const Partner = (await import('../models/Partner.js')).default;
    const commercial = await Partner.findOne({ partnerId, type: 'commercial' });
    if (!commercial) {
      return res.status(404).json({
        success: false,
        message: 'Commercial non trouvé'
      });
    }
    
    // Ajouter le commercial au service
    await service.ajouterCommercial(partnerId, 'ADMIN');
    console.log(`✅ Service ${service.titre} attribué à ${partnerId}`);
    
    res.json({
      success: true,
      message: `Service "${service.titre}" attribué à ${commercial.fullName}`,
      data: {
        service: service.titre,
        commercial: commercial.fullName,
        partnerId: partnerId
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur attribution service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'attribution',
      error: error.message
    });
  }
});

// CRON Job - Ajouter cadeaux mensuels automatiquement
router.post('/admin/cadeaux-mensuels', async (req, res) => {
  try {
    const nombreCommerciauxTraites = await CommercialNew.ajouterCadeauxMensuelsAuto();
    
    res.json({
      success: true,
      message: `Cadeaux mensuels ajoutés pour ${nombreCommerciauxTraites} commerciaux niveau 3`
    });
  } catch (error) {
    console.error('Erreur cadeaux mensuels:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

export default router;
