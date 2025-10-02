import express from 'express';
import CommercialService from '../models/CommercialService.js';
import CommercialNew from '../models/CommercialNew.js';

const router = express.Router();

// GET /api/commercial-services - Liste tous les services
router.get('/', async (req, res) => {
  try {
    console.log('🔍 GET /api/commercial-services - Récupération des services...');
    
    // Debug: Check all services first
    const allServices = await CommercialService.find({});
    console.log(`🔍 Total services in DB: ${allServices.length}`);
    allServices.forEach(service => {
      console.log(`  - ${service.titre} (isActive: ${service.isActive})`);
    });
    
    // Get active services
    let services = await CommercialService.find({ isActive: true });
    console.log(`📊 ${services.length} services actifs trouvés`);
    
    // Fallback: if no active services, get all services
    if (services.length === 0) {
      console.log('⚠️ Aucun service actif, récupération de tous les services...');
      services = await CommercialService.find({});
      console.log(`📊 ${services.length} services totaux récupérés`);
    }
    
    // Create default services if none exist
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
    
    console.log(`🎯 Retour de ${services.length} services au frontend`);
    
    res.json({
      success: true,
      data: services,
      message: `${services.length} services récupérés avec succès`
    });
    
  } catch (error) {
    console.error('❌ Erreur GET /api/commercial-services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des services',
      error: error.message
    });
  }
});

// POST /api/commercial-services - Créer un nouveau service
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/commercial-services - Création d\'un nouveau service...');
    console.log('📋 Data reçue:', req.body);
    
    const { titre, description, categorie, prixPublic, prixCommercial, commission, duree } = req.body;
    
    // Validation des champs requis
    if (!titre || !prixPublic || !prixCommercial || !commission) {
      console.log('❌ Validation échouée - champs manquants');
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
      isActive: true // 🔥 IMPORTANT: Explicitly set isActive
    });
    
    const serviceSauve = await nouveauService.save();
    console.log(`✅ Service créé avec succès: ${serviceSauve.titre}`);
    console.log(`📊 Service ID: ${serviceSauve._id}`);
    console.log(`🔧 isActive: ${serviceSauve.isActive}`);
    
    res.status(201).json({
      success: true,
      message: 'Service créé avec succès',
      data: serviceSauve
    });
    
  } catch (error) {
    console.error('❌ Erreur POST /api/commercial-services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du service',
      error: error.message
    });
  }
});

// POST /api/commercial-services/assign - Assigner un service à un commercial
router.post('/assign', async (req, res) => {
  try {
    console.log('🔗 POST /api/commercial-services/assign - Assignment service...');
    console.log('📋 Data reçue:', req.body);
    
    const { serviceId, commercialId } = req.body;
    console.log(`🔍 Recherche commercial avec ID/PartnerID: ${commercialId}`);
    
    if (!serviceId || !commercialId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID et Commercial ID sont requis'
      });
    }
    
    // Vérifier que le service existe
    const service = await CommercialService.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    // Vérifier que le commercial existe
    // Try to find by _id first, then by partnerId if it fails
    let commercial;
    try {
      commercial = await CommercialNew.findById(commercialId);
      console.log(`✅ Commercial trouvé par _id: ${commercial?.partnerId}`);
    } catch (castError) {
      console.log(`⚠️ Cast error pour _id, recherche par partnerId: ${commercialId}`);
      // If commercialId is not a valid ObjectId, try to find by partnerId
      commercial = await CommercialNew.findOne({ partnerId: commercialId });
      if (commercial) {
        console.log(`✅ Commercial trouvé par partnerId: ${commercial.partnerId}`);
      }
    }
    
    if (!commercial) {
      return res.status(404).json({
        success: false,
        message: 'Commercial non trouvé'
      });
    }
    
    // Vérifier si déjà assigné
    const dejaAssigne = service.commerciauxAutorises.some(c => c.partnerId === commercial.partnerId);
    
    if (dejaAssigne) {
      return res.json({
        success: true,
        message: 'Service déjà assigné à ce commercial',
        data: { service, commercial }
      });
    }
    
    // Ajouter l'assignment
    service.commerciauxAutorises.push({
      partnerId: commercial.partnerId,
      ajoutePar: 'ADMIN',
      dateAjout: new Date()
    });
    
    await service.save();
    
    console.log(`✅ Service "${service.titre}" assigné au commercial ${commercial.partnerId}`);
    
    res.json({
      success: true,
      message: 'Service assigné avec succès',
      data: {
        service: service.titre,
        commercial: commercial.partnerId,
        assignedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur assignment service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'assignment',
      error: error.message
    });
  }
});

// GET /api/commercial-services/commercial/:partnerId - Services d'un commercial
router.get('/commercial/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    console.log(`🔍 GET services pour commercial: ${partnerId}`);
    
    // Trouver tous les services assignés à ce commercial
    const services = await CommercialService.find({
      'commerciauxAutorises.partnerId': partnerId,
      isActive: true
    });
    
    console.log(`📊 ${services.length} services trouvés pour ${partnerId}`);
    
    res.json({
      success: true,
      data: services,
      message: `${services.length} services assignés trouvés`
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération services commercial:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// DELETE /api/commercial-services/:id - Supprimer un service
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ DELETE service: ${id}`);
    
    // Vérifier que le service existe
    const service = await CommercialService.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    console.log(`🗑️ Suppression du service: ${service.titre}`);
    
    // Supprimer le service
    await CommercialService.findByIdAndDelete(id);
    
    console.log(`✅ Service "${service.titre}" supprimé avec succès`);
    
    res.json({
      success: true,
      message: `Service "${service.titre}" supprimé avec succès`,
      data: {
        id: id,
        titre: service.titre
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
});

export default router;
