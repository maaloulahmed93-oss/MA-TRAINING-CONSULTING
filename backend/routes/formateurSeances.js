import express from 'express';
import FormateurSeance from '../models/FormateurSeance.js';
import FormateurProgramme from '../models/FormateurProgramme.js';

const router = express.Router();

// GET /api/formateur-seances/:formateurId - Récupérer toutes les séances d'un formateur
router.get('/:formateurId', async (req, res) => {
  try {
    const { formateurId } = req.params;
    const { programmeId, statut, date, page = 1, limit = 20 } = req.query;

    let filter = { formateurId, isActive: true };
    
    if (programmeId) {
      filter.programmeId = programmeId;
    }
    
    if (statut && statut !== 'all') {
      filter.statut = statut;
    }
    
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    const seances = await FormateurSeance.find(filter)
      .populate('programmeId', 'titre')
      .sort({ date: -1, heureDebut: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FormateurSeance.countDocuments(filter);

    res.json({
      success: true,
      data: seances,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des séances:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des séances'
    });
  }
});

// POST /api/formateur-seances - Créer une nouvelle séance
router.post('/', async (req, res) => {
  try {
    const {
      programmeId,
      formateurId,
      numero,
      module,
      titre,
      description,
      date,
      heureDebut,
      heureFin,
      lieu,
      lienVisio,
      notes
    } = req.body;

    // Validation des champs requis
    if (!programmeId || !formateurId || !numero || !module || !date || !heureDebut || !heureFin) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs requis doivent être remplis'
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

    // Vérifier que la séance est dans les dates du programme
    const seanceDate = new Date(date);
    if (seanceDate < programme.dateDebut || seanceDate > programme.dateFin) {
      return res.status(400).json({
        success: false,
        message: 'La date de la séance doit être comprise entre les dates du programme'
      });
    }

    // Vérifier qu'il n'y a pas de conflit d'horaires
    const conflits = await FormateurSeance.find({
      formateurId,
      date: seanceDate,
      statut: { $ne: 'annulee' },
      $or: [
        {
          $and: [
            { heureDebut: { $lte: heureDebut } },
            { heureFin: { $gt: heureDebut } }
          ]
        },
        {
          $and: [
            { heureDebut: { $lt: heureFin } },
            { heureFin: { $gte: heureFin } }
          ]
        }
      ]
    });

    if (conflits.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Conflit d\'horaires détecté avec une autre séance'
      });
    }

    const nouvelleSeance = new FormateurSeance({
      programmeId,
      formateurId,
      numero,
      module,
      titre,
      description,
      date: seanceDate,
      heureDebut,
      heureFin,
      lieu: lieu || 'En ligne',
      lienVisio,
      notes
    });

    await nouvelleSeance.save();

    // Populer le programme pour la réponse
    await nouvelleSeance.populate('programmeId', 'titre');

    res.status(201).json({
      success: true,
      message: 'Séance créée avec succès',
      data: nouvelleSeance
    });
  } catch (error) {
    console.error('Erreur lors de la création de la séance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la séance'
    });
  }
});

// PUT /api/formateur-seances/:id - Mettre à jour une séance
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Si on modifie les horaires, vérifier les conflits
    if (updateData.date || updateData.heureDebut || updateData.heureFin) {
      const seanceActuelle = await FormateurSeance.findById(id);
      if (!seanceActuelle) {
        return res.status(404).json({
          success: false,
          message: 'Séance non trouvée'
        });
      }

      const dateSeance = updateData.date ? new Date(updateData.date) : seanceActuelle.date;
      const heureDebut = updateData.heureDebut || seanceActuelle.heureDebut;
      const heureFin = updateData.heureFin || seanceActuelle.heureFin;

      const conflits = await FormateurSeance.find({
        _id: { $ne: id },
        formateurId: seanceActuelle.formateurId,
        date: dateSeance,
        statut: { $ne: 'annulee' },
        $or: [
          {
            $and: [
              { heureDebut: { $lte: heureDebut } },
              { heureFin: { $gt: heureDebut } }
            ]
          },
          {
            $and: [
              { heureDebut: { $lt: heureFin } },
              { heureFin: { $gte: heureFin } }
            ]
          }
        ]
      });

      if (conflits.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Conflit d\'horaires détecté avec une autre séance'
        });
      }
    }

    const seance = await FormateurSeance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('programmeId', 'titre');

    if (!seance) {
      return res.status(404).json({
        success: false,
        message: 'Séance non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Séance mise à jour avec succès',
      data: seance
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la séance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la séance'
    });
  }
});

// DELETE /api/formateur-seances/:id - Supprimer une séance
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const seance = await FormateurSeance.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!seance) {
      return res.status(404).json({
        success: false,
        message: 'Séance non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Séance supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la séance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la séance'
    });
  }
});

// GET /api/formateur-seances/programme/:programmeId - Récupérer les séances d'un programme
router.get('/programme/:programmeId', async (req, res) => {
  try {
    const { programmeId } = req.params;

    const seances = await FormateurSeance.find({ 
      programmeId, 
      isActive: true 
    })
    .populate('programmeId', 'titre')
    .sort({ date: 1, heureDebut: 1 });

    res.json({
      success: true,
      data: seances
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des séances du programme:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des séances du programme'
    });
  }
});

export default router;
