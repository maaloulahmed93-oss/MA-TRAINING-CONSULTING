const express = require('express');
const router = express.Router();
const ParticipantSimple = require('../models/ParticipantSimple');

// Get all participants
router.get('/', async (req, res) => {
  try {
    const participants = await ParticipantSimple.find({}).sort({ id: 1 });
    res.json({
      success: true,
      data: participants
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des participants'
    });
  }
});

// Get single participant by ID
router.get('/:id', async (req, res) => {
  try {
    const participant = await ParticipantSimple.findOne({ id: req.params.id });
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }
    res.json({
      success: true,
      data: participant
    });
  } catch (error) {
    console.error('Error fetching participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du participant'
    });
  }
});

// Create new participant
router.post('/', async (req, res) => {
  try {
    const { id, role, situation, documentLink } = req.body;

    // Validation
    if (!id || !role || !situation) {
      return res.status(400).json({
        success: false,
        message: 'ID, rôle et situation sont obligatoires'
      });
    }

    // Check if ID already exists
    const existingParticipant = await ParticipantSimple.findOne({ id });
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Cet ID de participant existe déjà'
      });
    }

    const participant = new ParticipantSimple({
      id,
      role,
      situation,
      documentLink: documentLink || ''
    });

    await participant.save();

    res.status(201).json({
      success: true,
      message: 'Participant créé avec succès',
      data: participant
    });
  } catch (error) {
    console.error('Error creating participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du participant'
    });
  }
});

// Update participant
router.put('/:id', async (req, res) => {
  try {
    const { role, situation, documentLink } = req.body;

    const participant = await ParticipantSimple.findOneAndUpdate(
      { id: req.params.id },
      { role, situation, documentLink: documentLink || '' },
      { new: true, runValidators: true }
    );

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
    console.error('Error updating participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du participant'
    });
  }
});

// Delete participant
router.delete('/:id', async (req, res) => {
  try {
    const participant = await ParticipantSimple.findOneAndDelete({ id: req.params.id });

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
    console.error('Error deleting participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du participant'
    });
  }
});

module.exports = router;
