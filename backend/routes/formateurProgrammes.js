import express from 'express';
import FormateurProgramme from '../models/FormateurProgramme.js';
import FormateurSeance from '../models/FormateurSeance.js';
import FormateurParticipant from '../models/FormateurParticipant.js';
import { 
  extractPartnerId, 
  requireFormateurPartner, 
  addPartnerIdToBody,
  filterByPartnerId 
} from '../middleware/partnerAuth.js';

const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes formateur
router.use('/:formateurId/*', (req, res, next) => {
  // Renommer formateurId en partnerId pour compatibilité avec le middleware
  req.params.partnerId = req.params.formateurId;
  next();
}, extractPartnerId, requireFormateurPartner, addPartnerIdToBody, filterByPartnerId);

// GET /api/formateur-programmes/:formateurId - Récupérer tous les programmes d'un formateur
router.get('/:formateurId', async (req, res) => {
  try {
    const { formateurId } = req.params;
    const { statut, page = 1, limit = 10 } = req.query;

    let filter = { formateurId, isActive: true };
    if (statut && statut !== 'all') {
      filter.statut = statut;
    }

    const programmes = await FormateurProgramme.find(filter)
      .sort({ dateDebut: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Ajouter les statistiques pour chaque programme
    const programmesAvecStats = await Promise.all(
      programmes.map(async (programme) => {
        const seancesCount = await FormateurSeance.countDocuments({ 
          programmeId: programme._id, 
          isActive: true 
        });
        
        const participantsCount = await FormateurParticipant.countDocuments({ 
          programmeId: programme._id, 
          isActive: true 
        });

        return {
          ...programme.toObject(),
          statistiques: {
            totalSeances: seancesCount,
            totalParticipants: participantsCount
          }
        };
      })
    );

    const total = await FormateurProgramme.countDocuments(filter);

    res.json({
      success: true,
      data: programmesAvecStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des programmes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des programmes'
    });
  }
});

// POST /api/formateur-programmes - Créer un nouveau programme
router.post('/', async (req, res) => {
  try {
    const {
      formateurId,
      titre,
      description,
      dateDebut,
      dateFin,
      prix,
      maxParticipants,
      lieu,
      notes
    } = req.body;

    // Validation des champs requis
    if (!formateurId || !titre || !dateDebut || !dateFin) {
      return res.status(400).json({
        success: false,
        message: 'Formateur ID, titre, date de début et date de fin sont requis'
      });
    }

    // Vérifier que la date de fin est après la date de début
    if (new Date(dateFin) <= new Date(dateDebut)) {
      return res.status(400).json({
        success: false,
        message: 'La date de fin doit être après la date de début'
      });
    }

    const nouveauProgramme = new FormateurProgramme({
      formateurId,
      titre,
      description,
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      prix: prix || 0,
      maxParticipants: maxParticipants || 20,
      lieu: lieu || 'En ligne',
      notes
    });

    await nouveauProgramme.save();

    res.status(201).json({
      success: true,
      message: 'Programme créé avec succès',
      data: nouveauProgramme
    });
  } catch (error) {
    console.error('Erreur lors de la création du programme:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du programme'
    });
  }
});

// PUT /api/formateur-programmes/:id - Mettre à jour un programme
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier que la date de fin est après la date de début si elles sont modifiées
    if (updateData.dateDebut && updateData.dateFin) {
      if (new Date(updateData.dateFin) <= new Date(updateData.dateDebut)) {
        return res.status(400).json({
          success: false,
          message: 'La date de fin doit être après la date de début'
        });
      }
    }

    const programme = await FormateurProgramme.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: 'Programme non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Programme mis à jour avec succès',
      data: programme
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du programme:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du programme'
    });
  }
});

// DELETE /api/formateur-programmes/:id - Supprimer un programme
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier s'il y a des séances ou participants associés
    const seancesCount = await FormateurSeance.countDocuments({ 
      programmeId: id, 
      isActive: true 
    });
    
    const participantsCount = await FormateurParticipant.countDocuments({ 
      programmeId: id, 
      isActive: true 
    });

    if (seancesCount > 0 || participantsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer ce programme car il a ${seancesCount} séance(s) et ${participantsCount} participant(s) associé(s)`
      });
    }

    const programme = await FormateurProgramme.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: 'Programme non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Programme supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du programme:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du programme'
    });
  }
});

// GET /api/formateur-programmes/:id/details - Récupérer les détails complets d'un programme
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;

    const programme = await FormateurProgramme.findById(id);
    if (!programme) {
      return res.status(404).json({
        success: false,
        message: 'Programme non trouvé'
      });
    }

    // Récupérer les séances
    const seances = await FormateurSeance.find({ 
      programmeId: id, 
      isActive: true 
    }).sort({ date: 1, heureDebut: 1 });

    // Récupérer les participants
    const participants = await FormateurParticipant.find({ 
      programmeId: id, 
      isActive: true 
    }).sort({ dateInscription: -1 });

    res.json({
      success: true,
      data: {
        programme: programme.toObject(),
        seances,
        participants,
        statistiques: {
          totalSeances: seances.length,
          totalParticipants: participants.length,
          seancesTerminees: seances.filter(s => s.statut === 'terminee').length,
          participantsActifs: participants.filter(p => p.statut === 'en_cours').length
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du programme:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails du programme'
    });
  }
});

export default router;
