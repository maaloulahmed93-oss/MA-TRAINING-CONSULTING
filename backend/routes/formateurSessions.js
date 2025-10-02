import express from 'express';
import FormateurSession from '../models/FormateurSession.js';
import Partner from '../models/Partner.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuration Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/formateur-sessions/');
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

// GET /api/formateur-sessions/:formateurId - Sessions d'un formateur
router.get('/:formateurId', async (req, res) => {
  try {
    const { formateurId } = req.params;
    const { statut, page = 1, limit = 10 } = req.query;
    
    // Vérifier que le formateur existe
    const formateur = await Partner.findOne({ 
      partnerId: formateurId, 
      type: 'formateur',
      isActive: true 
    });
    
    if (!formateur) {
      return res.status(404).json({
        success: false,
        message: 'Formateur non trouvé'
      });
    }
    
    let filter = { formateurId };
    if (statut) {
      filter.statut = statut;
    }
    
    const skip = (page - 1) * limit;
    
    const sessions = await FormateurSession.find(filter)
      .populate('categorie', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await FormateurSession.countDocuments(filter);
    
    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions'
    });
  }
});

// POST /api/formateur-sessions - Créer une nouvelle session
router.post('/', async (req, res) => {
  try {
    const {
      formateurId,
      titre,
      description,
      categorie,
      niveau,
      duree,
      prix,
      dateDebut,
      dateFin
    } = req.body;
    
    // Validation des champs requis
    if (!formateurId || !titre || !description || !categorie || !niveau || !prix) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs requis doivent être remplis'
      });
    }
    
    // Vérifier que le formateur existe
    const formateur = await Partner.findOne({ 
      partnerId: formateurId, 
      type: 'formateur',
      isActive: true 
    });
    
    if (!formateur) {
      return res.status(404).json({
        success: false,
        message: 'Formateur non trouvé'
      });
    }
    
    const newSession = new FormateurSession({
      formateurId,
      titre,
      description,
      categorie,
      niveau,
      duree,
      prix,
      dateDebut: dateDebut ? new Date(dateDebut) : null,
      dateFin: dateFin ? new Date(dateFin) : null,
      revenus: {
        montantTotal: prix,
        commission: prix * 0.2, // 20% commission MATC
        montantFormateur: prix * 0.8 // 80% pour le formateur
      }
    });
    
    await newSession.save();
    
    const populatedSession = await FormateurSession.findById(newSession._id)
      .populate('categorie', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Session créée avec succès',
      data: populatedSession
    });
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la session'
    });
  }
});

// PUT /api/formateur-sessions/:id - Mettre à jour une session
router.put('/:id', async (req, res) => {
  try {
    const session = await FormateurSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }
    
    const updateData = { ...req.body };
    
    // Recalculer les revenus si le prix change
    if (updateData.prix) {
      updateData.revenus = {
        montantTotal: updateData.prix,
        commission: updateData.prix * 0.2,
        montantFormateur: updateData.prix * 0.8,
        statutPaiement: session.revenus.statutPaiement
      };
    }
    
    const updatedSession = await FormateurSession.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categorie', 'name');
    
    res.json({
      success: true,
      message: 'Session mise à jour avec succès',
      data: updatedSession
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la session'
    });
  }
});

// POST /api/formateur-sessions/:id/participants - Ajouter un participant
router.post('/:id/participants', async (req, res) => {
  try {
    const { nom, email, telephone } = req.body;
    
    if (!nom || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nom et email sont requis'
      });
    }
    
    const session = await FormateurSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }
    
    // Vérifier si le participant existe déjà
    const existingParticipant = session.participants.find(p => p.email === email);
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Ce participant est déjà inscrit à cette session'
      });
    }
    
    session.participants.push({
      nom,
      email,
      telephone,
      dateInscription: new Date(),
      statut: 'inscrit'
    });
    
    // Mettre à jour les statistiques
    session.stats.nombreParticipants = session.participants.length;
    
    await session.save();
    
    res.json({
      success: true,
      message: 'Participant ajouté avec succès',
      data: session
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du participant'
    });
  }
});

// POST /api/formateur-sessions/:id/documents - Upload de documents
router.post('/:id/documents', upload.fields([
  { name: 'attestations', maxCount: 10 },
  { name: 'evaluations', maxCount: 10 },
  { name: 'recommandations', maxCount: 10 },
  { name: 'supports', maxCount: 10 }
]), async (req, res) => {
  try {
    const session = await FormateurSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }
    
    // Traiter les fichiers uploadés
    const files = req.files;
    const documents = { ...session.documents };
    
    Object.keys(files).forEach(fieldName => {
      if (!documents[fieldName]) {
        documents[fieldName] = [];
      }
      files[fieldName].forEach(file => {
        documents[fieldName].push(file.path);
      });
    });
    
    session.documents = documents;
    await session.save();
    
    res.json({
      success: true,
      message: 'Documents uploadés avec succès',
      data: {
        sessionId: session._id,
        documents: session.documents
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

// GET /api/formateur-sessions/:formateurId/stats - Statistiques du formateur
router.get('/:formateurId/stats', async (req, res) => {
  try {
    const { formateurId } = req.params;
    
    const sessions = await FormateurSession.find({ formateurId });
    
    const stats = {
      totalSessions: sessions.length,
      sessionsTerminees: sessions.filter(s => s.statut === 'terminee').length,
      sessionsEnCours: sessions.filter(s => s.statut === 'en_cours').length,
      totalParticipants: sessions.reduce((sum, s) => sum + s.participants.length, 0),
      revenuTotal: sessions.reduce((sum, s) => sum + (s.revenus.montantFormateur || 0), 0),
      revenuEnAttente: sessions
        .filter(s => s.revenus.statutPaiement === 'en_attente')
        .reduce((sum, s) => sum + (s.revenus.montantFormateur || 0), 0),
      noteMoyenne: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.stats.noteMoyenne || 0), 0) / sessions.length 
        : 0
    };
    
    res.json({
      success: true,
      data: stats
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
