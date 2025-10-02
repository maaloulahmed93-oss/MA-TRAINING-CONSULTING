import express from 'express';
import Partner from '../models/Partner.js';
import EnterpriseProject from '../models/EnterpriseProject.js';
import EnterpriseFormation from '../models/EnterpriseFormation.js';
import EnterpriseEvent from '../models/EnterpriseEvent.js';
import EnterpriseParticipant from '../models/EnterpriseParticipant.js';
import { 
  extractPartnerId, 
  requireEnterprisePartner, 
  addPartnerIdToBody,
  filterByPartnerId 
} from '../middleware/partnerAuth.js';

const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use('/:partnerId/*', extractPartnerId, requireEnterprisePartner, addPartnerIdToBody, filterByPartnerId);

// Fonction pour générer des IDs uniques
const generateId = async (prefix, Model, field = 'projectId') => {
  let id;
  let exists = true;
  
  while (exists) {
    const digits = Math.floor(100000 + Math.random() * 900000);
    id = `${prefix}-${digits}`;
    
    const existing = await Model.findOne({ [field]: id });
    exists = !!existing;
  }
  
  return id;
};

// Calculer les statistiques d'une entreprise
const calculateEnterpriseStats = async (partnerId) => {
  const [projects, formations, events, participants] = await Promise.all([
    EnterpriseProject.find({ partnerId }),
    EnterpriseFormation.find({ partnerId }),
    EnterpriseEvent.find({ partnerId }),
    EnterpriseParticipant.find({ partnerId, status: 'active' })
  ]);

  const activeProjects = projects.filter(p => ['planning', 'in_progress'].includes(p.status));
  const completedProjects = projects.filter(p => p.status === 'completed');
  const upcomingEvents = events.filter(e => e.date >= new Date() && e.status === 'upcoming');
  
  // Calculer le taux de satisfaction basé sur les évaluations
  const completedFormations = formations.filter(f => f.evaluationScore);
  const averageScore = completedFormations.length > 0 
    ? completedFormations.reduce((sum, f) => sum + f.evaluationScore, 0) / completedFormations.length
    : 0;
  
  const satisfactionRate = Math.round((averageScore / 5) * 100);

  return {
    totalProjects: projects.length,
    activeProjects: activeProjects.length,
    completedProjects: completedProjects.length,
    totalFormations: formations.length,
    upcomingEvents: upcomingEvents.length,
    totalParticipants: participants.length,
    partnershipDuration: 12, // À calculer basé sur joinDate
    satisfactionRate: satisfactionRate || 85 // Valeur par défaut
  };
};

// GET /api/enterprise/:partnerId/profile - Profil de l'entreprise
router.get('/:partnerId/profile', async (req, res) => {
  try {
    const partner = await Partner.findOne({ 
      partnerId: req.params.partnerId, 
      type: 'entreprise',
      isActive: true 
    }).select('-password');
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

// PUT /api/enterprise/:partnerId/profile - Mise à jour du profil
router.put('/:partnerId/profile', async (req, res) => {
  try {
    const updated = await Partner.findOneAndUpdate(
      { partnerId: req.params.partnerId, type: 'entreprise' },
      { ...req.body, updatedAt: new Date() },
      { new: true, select: '-password' }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour'
    });
  }
});

// GET /api/enterprise/:partnerId/projects - Projets de l'entreprise
router.get('/:partnerId/projects', async (req, res) => {
  try {
    // Utiliser le partnerId du middleware pour garantir l'isolation des données
    const projects = await EnterpriseProject.findByPartnerId(req.partnerId);
    
    console.log(`📊 Projets trouvés pour ${req.partnerId}:`, projects.length);
    
    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets'
    });
  }
});

// POST /api/enterprise/:partnerId/projects - Créer un projet
router.post('/:partnerId/projects', async (req, res) => {
  try {
    const projectId = await generateId('PROJ', EnterpriseProject, 'projectId');
    
    // Le partnerId est automatiquement ajouté par le middleware addPartnerIdToBody
    const project = new EnterpriseProject({
      projectId,
      ...req.body // partnerId déjà inclus par le middleware
    });
    
    await project.save();
    
    console.log(`✅ Projet créé pour ${req.partnerId}:`, projectId);
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Erreur création projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet'
    });
  }
});

// GET /api/enterprise/:partnerId/formations - Formations de l'entreprise
router.get('/:partnerId/formations', async (req, res) => {
  try {
    const formations = await EnterpriseFormation.findByPartnerId(req.partnerId);
    
    console.log(`📚 Formations trouvées pour ${req.partnerId}:`, formations.length);
    
    res.json({
      success: true,
      data: formations,
      count: formations.length
    });
  } catch (error) {
    console.error('Erreur récupération formations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formations'
    });
  }
});

// POST /api/enterprise/:partnerId/formations - Créer une formation
router.post('/:partnerId/formations', async (req, res) => {
  try {
    const formationId = await generateId('FORM', EnterpriseFormation, 'formationId');
    
    const formation = new EnterpriseFormation({
      formationId,
      ...req.body // partnerId déjà inclus par le middleware
    });
    
    await formation.save();
    
    console.log(`✅ Formation créée pour ${req.partnerId}:`, formationId);
    
    res.status(201).json({
      success: true,
      data: formation
    });
  } catch (error) {
    console.error('Erreur création formation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la formation'
    });
  }
});

// GET /api/enterprise/:partnerId/events - Événements de l'entreprise
router.get('/:partnerId/events', async (req, res) => {
  try {
    const events = await EnterpriseEvent.findByPartnerId(req.partnerId);
    
    console.log(`📅 Événements trouvés pour ${req.partnerId}:`, events.length);
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Erreur récupération événements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements'
    });
  }
});

// POST /api/enterprise/:partnerId/events - Créer un événement
router.post('/:partnerId/events', async (req, res) => {
  try {
    const eventId = await generateId('EVT', EnterpriseEvent, 'eventId');
    
    const event = new EnterpriseEvent({
      eventId,
      ...req.body // partnerId déjà inclus par le middleware
    });
    
    await event.save();
    
    console.log(`✅ Événement créé pour ${req.partnerId}:`, eventId);
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Erreur création événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'événement'
    });
  }
});

// GET /api/enterprise/:partnerId/participants - Participants de l'entreprise
router.get('/:partnerId/participants', async (req, res) => {
  try {
    const participants = await EnterpriseParticipant.findByPartnerId(req.partnerId);
    
    console.log(`👥 Participants trouvés pour ${req.partnerId}:`, participants.length);
    
    res.json({
      success: true,
      data: participants,
      count: participants.length
    });
  } catch (error) {
    console.error('Erreur récupération participants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des participants'
    });
  }
});

// POST /api/enterprise/:partnerId/participants - Ajouter un participant
router.post('/:partnerId/participants', async (req, res) => {
  try {
    const participantId = await generateId('PART', EnterpriseParticipant, 'participantId');
    
    const participant = new EnterpriseParticipant({
      participantId,
      ...req.body // partnerId déjà inclus par le middleware
    });
    
    await participant.save();
    
    console.log(`✅ Participant ajouté pour ${req.partnerId}:`, participantId);
    
    res.status(201).json({
      success: true,
      data: participant
    });
  } catch (error) {
    console.error('Erreur ajout participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du participant'
    });
  }
});

// GET /api/enterprise/:partnerId/stats - Statistiques de l'entreprise
router.get('/:partnerId/stats', async (req, res) => {
  try {
    const stats = await calculateEnterpriseStats(req.partnerId);
    
    console.log(`📊 Statistiques calculées pour ${req.partnerId}:`, stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur calcul statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques'
    });
  }
});

// PUT /api/enterprise/:partnerId/projects/:projectId - Mettre à jour un projet
router.put('/:partnerId/projects/:projectId', async (req, res) => {
  try {
    const project = await EnterpriseProject.findOneAndUpdate(
      { projectId: req.params.projectId, partnerId: req.partnerId }, // Utiliser req.partnerId du middleware
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé ou accès non autorisé'
      });
    }
    
    console.log(`✅ Projet mis à jour pour ${req.partnerId}:`, req.params.projectId);
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du projet'
    });
  }
});

// PUT /api/enterprise/:partnerId/participants/:participantId - Mettre à jour un participant
router.put('/:partnerId/participants/:participantId', async (req, res) => {
  try {
    const participant = await EnterpriseParticipant.findOneAndUpdate(
      { participantId: req.params.participantId, partnerId: req.partnerId }, // Utiliser req.partnerId du middleware
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé ou accès non autorisé'
      });
    }
    
    console.log(`✅ Participant mis à jour pour ${req.partnerId}:`, req.params.participantId);
    
    res.json({
      success: true,
      data: participant
    });
  } catch (error) {
    console.error('Erreur mise à jour participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du participant'
    });
  }
});

export default router;
