import express from 'express';
import EspaceRessourcesSettings from '../models/EspaceRessourcesSettings.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let settings = await EspaceRessourcesSettings.getActiveSettings();

    if (!settings) {
      settings = await EspaceRessourcesSettings.createDefaultSettings();
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des paramètres (Espace Ressources)",
      error: error.message,
    });
  }
});

router.put('/', async (req, res) => {
  try {
    const { accessCode, bonusCode, updatedBy = 'admin' } = req.body;

    let settings = await EspaceRessourcesSettings.getActiveSettings();

    if (settings) {
      if (accessCode !== undefined) settings.accessCode = accessCode;
      if (bonusCode !== undefined) settings.bonusCode = bonusCode;

      settings.updatedBy = updatedBy;
      settings.updatedAt = new Date();

      await settings.save();
    } else {
      settings = new EspaceRessourcesSettings({
        accessCode: accessCode ?? '00000000',
        bonusCode: bonusCode ?? '00000000',
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
      message: "Erreur lors de l'enregistrement des paramètres (Espace Ressources)",
      error: error.message,
    });
  }
});

router.post('/validate-access', async (req, res) => {
  try {
    const { code } = req.body;

    const settings =
      (await EspaceRessourcesSettings.getActiveSettings()) ||
      (await EspaceRessourcesSettings.createDefaultSettings());

    const valid = String(code ?? '').trim() === String(settings.accessCode ?? '').trim();

    res.json({
      success: true,
      valid,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la validation du code d'accès",
      error: error.message,
    });
  }
});

router.post('/validate-bonus', async (req, res) => {
  try {
    const { code } = req.body;

    const settings =
      (await EspaceRessourcesSettings.getActiveSettings()) ||
      (await EspaceRessourcesSettings.createDefaultSettings());

    const valid = String(code ?? '').trim() === String(settings.bonusCode ?? '').trim();

    res.json({
      success: true,
      valid,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la validation du code bonus",
      error: error.message,
    });
  }
});

export default router;
