import express from 'express';
import FormateurEvenement from '../models/FormateurEvenement.js';

const router = express.Router();

// GET /api/formateur-evenements/:formateurId - Récupérer tous les événements d'un formateur
router.get('/:formateurId', async (req, res) => {
  try {
    const { formateurId } = req.params;
    const { 
      type, 
      statut, 
      dateDebut, 
      dateFin, 
      programmeId,
      page = 1, 
      limit = 20 
    } = req.query;

    let filter = { formateurId, isActive: true };
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (statut && statut !== 'all') {
      filter.statut = statut;
    }
    
    if (programmeId) {
      filter.programmeId = programmeId;
    }
    
    // Filtrer par période
    if (dateDebut || dateFin) {
      filter.date = {};
      if (dateDebut) {
        filter.date.$gte = new Date(dateDebut);
      }
      if (dateFin) {
        filter.date.$lte = new Date(dateFin);
      }
    }

    const evenements = await FormateurEvenement.find(filter)
      .populate('programmeId', 'titre')
      .sort({ date: -1, heureDebut: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FormateurEvenement.countDocuments(filter);

    res.json({
      success: true,
      data: evenements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements'
    });
  }
});

// POST /api/formateur-evenements - Créer un nouvel événement
router.post('/', async (req, res) => {
  try {
    const {
      formateurId,
      programmeId,
      sujet,
      description,
      date,
      heureDebut,
      heureFin,
      type,
      lieu,
      lienVisio,
      participants,
      priorite,
      couleur,
      notes
    } = req.body;

    // Validation des champs requis
    if (!formateurId || !sujet || !date || !heureDebut || !heureFin) {
      return res.status(400).json({
        success: false,
        message: 'Formateur ID, sujet, date, heure de début et heure de fin sont requis'
      });
    }

    // Vérifier qu'il n'y a pas de conflit d'horaires
    const eventDate = new Date(date);
    const conflits = await FormateurEvenement.verifierConflits(
      formateurId, 
      eventDate, 
      heureDebut, 
      heureFin
    );

    if (conflits.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Conflit d\'horaires détecté avec un autre événement',
        conflits: conflits.map(c => ({
          sujet: c.sujet,
          date: c.date,
          heureDebut: c.heureDebut,
          heureFin: c.heureFin
        }))
      });
    }

    const nouvelEvenement = new FormateurEvenement({
      formateurId,
      programmeId,
      sujet,
      description,
      date: eventDate,
      heureDebut,
      heureFin,
      type: type || 'reunion',
      lieu: lieu || 'En ligne',
      lienVisio,
      participants: participants || [],
      priorite: priorite || 'normale',
      couleur: couleur || '#3B82F6',
      notes
    });

    await nouvelEvenement.save();
    
    if (programmeId) {
      await nouvelEvenement.populate('programmeId', 'titre');
    }

    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: nouvelEvenement
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'événement'
    });
  }
});

// PUT /api/formateur-evenements/:id - Mettre à jour un événement
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Si on modifie les horaires, vérifier les conflits
    if (updateData.date || updateData.heureDebut || updateData.heureFin) {
      const evenementActuel = await FormateurEvenement.findById(id);
      if (!evenementActuel) {
        return res.status(404).json({
          success: false,
          message: 'Événement non trouvé'
        });
      }

      const dateEvent = updateData.date ? new Date(updateData.date) : evenementActuel.date;
      const heureDebut = updateData.heureDebut || evenementActuel.heureDebut;
      const heureFin = updateData.heureFin || evenementActuel.heureFin;

      const conflits = await FormateurEvenement.verifierConflits(
        evenementActuel.formateurId,
        dateEvent,
        heureDebut,
        heureFin,
        id
      );

      if (conflits.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Conflit d\'horaires détecté avec un autre événement',
          conflits: conflits.map(c => ({
            sujet: c.sujet,
            date: c.date,
            heureDebut: c.heureDebut,
            heureFin: c.heureFin
          }))
        });
      }
    }

    const evenement = await FormateurEvenement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('programmeId', 'titre');

    if (!evenement) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Événement mis à jour avec succès',
      data: evenement
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'événement'
    });
  }
});

// DELETE /api/formateur-evenements/:id - Supprimer un événement
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const evenement = await FormateurEvenement.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!evenement) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'événement'
    });
  }
});

// GET /api/formateur-evenements/:formateurId/calendrier - Vue calendrier des événements
router.get('/:formateurId/calendrier', async (req, res) => {
  try {
    const { formateurId } = req.params;
    const { mois, annee } = req.query;

    let dateDebut, dateFin;
    
    if (mois && annee) {
      dateDebut = new Date(annee, mois - 1, 1);
      dateFin = new Date(annee, mois, 0, 23, 59, 59);
    } else {
      // Par défaut, mois actuel
      const maintenant = new Date();
      dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      dateFin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0, 23, 59, 59);
    }

    const evenements = await FormateurEvenement.find({
      formateurId,
      isActive: true,
      date: {
        $gte: dateDebut,
        $lte: dateFin
      }
    })
    .populate('programmeId', 'titre')
    .sort({ date: 1, heureDebut: 1 });

    // Grouper par date
    const evenementsParDate = {};
    evenements.forEach(event => {
      const dateKey = event.date.toISOString().split('T')[0];
      if (!evenementsParDate[dateKey]) {
        evenementsParDate[dateKey] = [];
      }
      evenementsParDate[dateKey].push(event);
    });

    res.json({
      success: true,
      data: {
        periode: {
          debut: dateDebut,
          fin: dateFin
        },
        evenements: evenementsParDate,
        total: evenements.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du calendrier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du calendrier'
    });
  }
});

export default router;
