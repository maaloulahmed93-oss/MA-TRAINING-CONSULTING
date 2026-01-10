import express from 'express';
import ConsultingOperationnelSettings from '../models/ConsultingOperationnelSettings.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let settings = await ConsultingOperationnelSettings.getActiveSettings();

    if (!settings) {
      settings = await ConsultingOperationnelSettings.createDefaultSettings();
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des paramètres (Consulting Opérationnel)",
      error: error.message,
    });
  }
});

router.put('/', async (req, res) => {
  try {
    const {
      posteIntitule,
      entrepriseSecteur,
      element1,
      element2,
      difficulte1,
      difficulte2,
      demandeDirection,
      session1DateTime,
      session1VideoUrl,
      session2DateTime,
      session2VideoUrl,
      session3DateTime,
      session3VideoUrl,
      updatedBy = 'admin',
    } = req.body;

    let settings = await ConsultingOperationnelSettings.getActiveSettings();

    if (settings) {
      if (posteIntitule !== undefined) settings.posteIntitule = posteIntitule;
      if (entrepriseSecteur !== undefined) settings.entrepriseSecteur = entrepriseSecteur;
      if (element1 !== undefined) settings.element1 = element1;
      if (element2 !== undefined) settings.element2 = element2;
      if (difficulte1 !== undefined) settings.difficulte1 = difficulte1;
      if (difficulte2 !== undefined) settings.difficulte2 = difficulte2;
      if (demandeDirection !== undefined) settings.demandeDirection = demandeDirection;

      if (session1DateTime !== undefined) settings.session1DateTime = session1DateTime;
      if (session1VideoUrl !== undefined) settings.session1VideoUrl = session1VideoUrl;
      if (session2DateTime !== undefined) settings.session2DateTime = session2DateTime;
      if (session2VideoUrl !== undefined) settings.session2VideoUrl = session2VideoUrl;
      if (session3DateTime !== undefined) settings.session3DateTime = session3DateTime;
      if (session3VideoUrl !== undefined) settings.session3VideoUrl = session3VideoUrl;

      settings.updatedBy = updatedBy;
      settings.updatedAt = new Date();

      await settings.save();
    } else {
      settings = new ConsultingOperationnelSettings({
        posteIntitule: posteIntitule ?? '',
        entrepriseSecteur: entrepriseSecteur ?? '',
        element1: element1 ?? '',
        element2: element2 ?? '',
        difficulte1: difficulte1 ?? '',
        difficulte2: difficulte2 ?? '',
        demandeDirection: demandeDirection ?? '',
        session1DateTime: session1DateTime ?? '',
        session1VideoUrl: session1VideoUrl ?? '',
        session2DateTime: session2DateTime ?? '',
        session2VideoUrl: session2VideoUrl ?? '',
        session3DateTime: session3DateTime ?? '',
        session3VideoUrl: session3VideoUrl ?? '',
        isActive: true,
        updatedBy,
      });

      await settings.save();
    }

    res.json({
      success: true,
      message: 'Paramètres enregistrés',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement des paramètres (Consulting Opérationnel)",
      error: error.message,
    });
  }
});

export default router;
