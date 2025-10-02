import express from 'express';
import FormateurParticipant from '../models/FormateurParticipant.js';
import FormateurProgramme from '../models/FormateurProgramme.js';

const router = express.Router();

// GET /api/formateur-participants/:formateurId - Récupérer tous les participants d'un formateur
router.get('/:formateurId', async (req, res) => {
  try {
    const { formateurId } = req.params;
    const { programmeId, statut, page = 1, limit = 20 } = req.query;

    let filter = { formateurId, isActive: true };
    
    if (programmeId) {
      filter.programmeId = programmeId;
    }
    
    if (statut && statut !== 'all') {
      filter.statut = statut;
    }

    const participants = await FormateurParticipant.find(filter)
      .populate('programmeId', 'titre dateDebut dateFin')
      .sort({ dateInscription: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FormateurParticipant.countDocuments(filter);

    res.json({
      success: true,
      data: participants,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des participants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des participants'
    });
  }
});

// POST /api/formateur-participants - Ajouter un nouveau participant
router.post('/', async (req, res) => {
  try {
    const {
      programmeId,
      formateurId,
      nom,
      prenom,
      email,
      telephone,
      informationsSupplementaires
    } = req.body;

    // Validation des champs requis
    if (!programmeId || !formateurId || !nom || !prenom || !email) {
      return res.status(400).json({
        success: false,
        message: 'Programme ID, formateur ID, nom, prénom et email sont requis'
      });
    }

    // Vérifier que le programme existe
    const programme = await FormateurProgramme.findById(programmeId);
    if (!programme) {
      return res.status(404).json({
        success: false,
        message: 'Programme non trouvé'
      });
    }

    // Vérifier si le participant existe déjà pour ce programme
    const participantExistant = await FormateurParticipant.findOne({
      programmeId,
      email: email.toLowerCase()
    });

    if (participantExistant) {
      return res.status(400).json({
        success: false,
        message: 'Un participant avec cet email est déjà inscrit à ce programme'
      });
    }

    // Vérifier la capacité maximale
    const participantsActuels = await FormateurParticipant.countDocuments({
      programmeId,
      isActive: true
    });

    if (participantsActuels >= programme.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Le nombre maximum de participants pour ce programme est atteint'
      });
    }

    const nouveauParticipant = new FormateurParticipant({
      programmeId,
      formateurId,
      nom,
      prenom,
      email: email.toLowerCase(),
      telephone,
      informationsSupplementaires
    });

    await nouveauParticipant.save();
    await nouveauParticipant.populate('programmeId', 'titre dateDebut dateFin');

    res.status(201).json({
      success: true,
      message: 'Participant ajouté avec succès',
      data: nouveauParticipant
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du participant'
    });
  }
});

// PUT /api/formateur-participants/:id - Mettre à jour un participant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updateData.email) {
      const participant = await FormateurParticipant.findById(id);
      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'Participant non trouvé'
        });
      }

      if (updateData.email.toLowerCase() !== participant.email) {
        const emailExistant = await FormateurParticipant.findOne({
          programmeId: participant.programmeId,
          email: updateData.email.toLowerCase(),
          _id: { $ne: id }
        });

        if (emailExistant) {
          return res.status(400).json({
            success: false,
            message: 'Un participant avec cet email existe déjà pour ce programme'
          });
        }
      }

      updateData.email = updateData.email.toLowerCase();
    }

    const participant = await FormateurParticipant.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('programmeId', 'titre dateDebut dateFin');

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Participant mis à jour avec succès',
      data: participant
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du participant'
    });
  }
});

// DELETE /api/formateur-participants/:id - Supprimer un participant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const participant = await FormateurParticipant.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Participant supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du participant'
    });
  }
});

// GET /api/formateur-participants/programme/:programmeId - Récupérer les participants d'un programme
router.get('/programme/:programmeId', async (req, res) => {
  try {
    const { programmeId } = req.params;

    const participants = await FormateurParticipant.find({ 
      programmeId, 
      isActive: true 
    })
    .populate('programmeId', 'titre')
    .sort({ dateInscription: -1 });

    res.json({
      success: true,
      data: participants
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des participants du programme:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des participants du programme'
    });
  }
});

// POST /api/formateur-participants/:id/evaluation - Ajouter une évaluation
router.post('/:id/evaluation', async (req, res) => {
  try {
    const { id } = req.params;
    const { seanceId, note, commentaire } = req.body;

    if (!note || note < 0 || note > 20) {
      return res.status(400).json({
        success: false,
        message: 'La note doit être comprise entre 0 et 20'
      });
    }

    const participant = await FormateurParticipant.findById(id);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }

    // Ajouter l'évaluation
    participant.evaluations.push({
      seanceId,
      note,
      commentaire,
      date: new Date()
    });

    // Recalculer la note finale
    participant.calculerNoteFinale();

    await participant.save();

    res.json({
      success: true,
      message: 'Évaluation ajoutée avec succès',
      data: participant
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'évaluation'
    });
  }
});

export default router;
