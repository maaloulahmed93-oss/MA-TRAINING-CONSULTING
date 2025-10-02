import express from 'express';
import CommercialDeal from '../models/CommercialDeal.js';
import Partner from '../models/Partner.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuration Multer pour l'upload de documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/commercial-deals/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF et images sont autorisés'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// GET /api/commercial-deals/:commercialId - Récupérer les deals d'un commercial
router.get('/:commercialId', async (req, res) => {
  try {
    const { commercialId } = req.params;
    const { statut, page = 1, limit = 10, sortBy = 'dateProspection', sortOrder = 'desc' } = req.query;
    
    // Vérifier que le commercial existe
    const commercial = await Partner.findOne({ 
      partnerId: commercialId, 
      type: 'commercial',
      isActive: true 
    });
    
    if (!commercial) {
      return res.status(404).json({
        success: false,
        message: 'Commercial non trouvé'
      });
    }
    
    let filter = { commercialId, isActive: true };
    if (statut) {
      filter.statutDeal = statut;
    }
    
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const deals = await CommercialDeal.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await CommercialDeal.countDocuments(filter);
    
    res.json({
      success: true,
      data: deals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des deals:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des deals'
    });
  }
});

// POST /api/commercial-deals - Créer une nouvelle deal
router.post('/', async (req, res) => {
  try {
    const {
      commercialId,
      dealTitle,
      clientName,
      clientType,
      clientEmail,
      clientPhone,
      clientAddress,
      serviceType,
      serviceDescription,
      montantTotal,
      devise,
      tauxCommission,
      dateDebutService,
      dateFinService,
      notes,
      tags,
      priorite
    } = req.body;
    
    // Validation des champs requis
    if (!commercialId || !dealTitle || !clientName || !clientEmail || !serviceType || !montantTotal) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs requis doivent être remplis'
      });
    }
    
    // Vérifier que le commercial existe
    const commercial = await Partner.findOne({ 
      partnerId: commercialId, 
      type: 'commercial',
      isActive: true 
    });
    
    if (!commercial) {
      return res.status(404).json({
        success: false,
        message: 'Commercial non trouvé'
      });
    }
    
    const newDeal = new CommercialDeal({
      commercialId,
      dealTitle,
      clientName,
      clientType,
      clientEmail,
      clientPhone,
      clientAddress,
      serviceType,
      serviceDescription,
      montantTotal,
      devise: devise || 'EUR',
      tauxCommission: tauxCommission || 10,
      dateDebutService: dateDebutService ? new Date(dateDebutService) : null,
      dateFinService: dateFinService ? new Date(dateFinService) : null,
      tags: tags || [],
      priorite: priorite || 'normale'
    });
    
    // Ajouter une note initiale si fournie
    if (notes) {
      newDeal.notes.push({
        contenu: notes,
        auteur: commercialId,
        dateAjout: new Date()
      });
    }
    
    await newDeal.save();
    
    res.status(201).json({
      success: true,
      message: 'Deal créée avec succès',
      data: newDeal
    });
  } catch (error) {
    console.error('Erreur lors de la création de la deal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la deal'
    });
  }
});

// PUT /api/commercial-deals/:id - Mettre à jour une deal
router.put('/:id', async (req, res) => {
  try {
    const deal = await CommercialDeal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal non trouvée'
      });
    }
    
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    // Si le statut change, utiliser la méthode spéciale
    if (updateData.statutDeal && updateData.statutDeal !== deal.statutDeal) {
      await deal.changerStatut(updateData.statutDeal, updateData.modifiePar || deal.commercialId);
      delete updateData.statutDeal;
    }
    
    const updatedDeal = await CommercialDeal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Deal mise à jour avec succès',
      data: updatedDeal
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la deal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la deal'
    });
  }
});

// POST /api/commercial-deals/:id/notes - Ajouter une note à une deal
router.post('/:id/notes', async (req, res) => {
  try {
    const { contenu, auteur } = req.body;
    
    if (!contenu) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu de la note est requis'
      });
    }
    
    const deal = await CommercialDeal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal non trouvée'
      });
    }
    
    await deal.ajouterNote(contenu, auteur || deal.commercialId);
    
    res.json({
      success: true,
      message: 'Note ajoutée avec succès',
      data: deal
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la note'
    });
  }
});

// POST /api/commercial-deals/:id/documents - Upload de documents
router.post('/:id/documents', upload.fields([
  { name: 'contrats', maxCount: 10 },
  { name: 'factures', maxCount: 10 },
  { name: 'devis', maxCount: 10 },
  { name: 'autres', maxCount: 10 }
]), async (req, res) => {
  try {
    const deal = await CommercialDeal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal non trouvée'
      });
    }
    
    // Traiter les fichiers uploadés
    const files = req.files;
    const documents = { ...deal.documents };
    
    Object.keys(files).forEach(fieldName => {
      if (!documents[fieldName]) {
        documents[fieldName] = [];
      }
      files[fieldName].forEach(file => {
        documents[fieldName].push(file.path);
      });
    });
    
    deal.documents = documents;
    await deal.save();
    
    res.json({
      success: true,
      message: 'Documents uploadés avec succès',
      data: {
        dealId: deal._id,
        documents: deal.documents
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload des documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload des documents'
    });
  }
});

// GET /api/commercial-deals/:commercialId/stats - Statistiques du commercial
router.get('/:commercialId/stats', async (req, res) => {
  try {
    const { commercialId } = req.params;
    const { periode = 'mois' } = req.query;
    
    // Statistiques générales
    const stats = await CommercialDeal.getStatistiquesCommercial(commercialId);
    
    // Statistiques par période
    let dateFilter = {};
    const now = new Date();
    
    switch (periode) {
      case 'semaine':
        dateFilter = {
          dateProspection: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'mois':
        dateFilter = {
          dateProspection: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        };
        break;
      case 'trimestre':
        const quarter = Math.floor(now.getMonth() / 3);
        dateFilter = {
          dateProspection: {
            $gte: new Date(now.getFullYear(), quarter * 3, 1)
          }
        };
        break;
      case 'annee':
        dateFilter = {
          dateProspection: {
            $gte: new Date(now.getFullYear(), 0, 1)
          }
        };
        break;
    }
    
    const statsPeriode = await CommercialDeal.aggregate([
      { 
        $match: { 
          commercialId, 
          isActive: true,
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: null,
          totalDealsPeriode: { $sum: 1 },
          chiffreAffairePeriode: { $sum: '$montantTotal' },
          commissionPeriode: { $sum: '$montantCommission' }
        }
      }
    ]);
    
    const statsComplete = {
      ...stats,
      periode: {
        type: periode,
        totalDeals: statsPeriode[0]?.totalDealsPeriode || 0,
        chiffreAffaire: statsPeriode[0]?.chiffreAffairePeriode || 0,
        commission: statsPeriode[0]?.commissionPeriode || 0
      }
    };
    
    res.json({
      success: true,
      data: statsComplete
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// GET /api/commercial-deals/:commercialId/clients - Liste des clients du commercial
router.get('/:commercialId/clients', async (req, res) => {
  try {
    const { commercialId } = req.params;
    
    const clients = await CommercialDeal.aggregate([
      { $match: { commercialId, isActive: true } },
      {
        $group: {
          _id: '$clientEmail',
          clientName: { $first: '$clientName' },
          clientType: { $first: '$clientType' },
          clientPhone: { $first: '$clientPhone' },
          totalDeals: { $sum: 1 },
          chiffreAffaireTotal: { $sum: '$montantTotal' },
          derniereDeal: { $max: '$dateProspection' }
        }
      },
      { $sort: { derniereDeal: -1 } }
    ]);
    
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clients'
    });
  }
});

// DELETE /api/commercial-deals/:id - Supprimer une deal (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const deal = await CommercialDeal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal non trouvée'
      });
    }
    
    deal.isActive = false;
    await deal.save();
    
    res.json({
      success: true,
      message: 'Deal supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la deal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la deal'
    });
  }
});

export default router;
