import express from 'express';
import Joi from 'joi';
import ParticipationVerification from '../models/ParticipationVerification.js';
import requireExpert from '../middleware/requireExpert.js';

const router = express.Router();

const participationIdPattern = /^MTC-AP-\d{4}-\d{4}$/;

const DEFAULT_SERVICES_LIST = [
  'Diagnostic stratégique & positionnement professionnel',
  'Missions professionnelles encadrées (le cas échéant)',
];

const createSchema = Joi.object({
  participationId: Joi.string().trim().pattern(participationIdPattern).optional(),
  fullName: Joi.string().trim().min(2).max(120).required(),
  status: Joi.string().valid('Complétée', 'En cours', 'Active').optional(),
  servicesList: Joi.array().items(Joi.string().trim().min(1).max(200)).optional(),
  services: Joi.object({
    service1: Joi.boolean().optional(),
    service2: Joi.boolean().optional(),
  }).optional(),
  isActive: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).optional(),
  status: Joi.string().valid('Complétée', 'En cours', 'Active').optional(),
  servicesList: Joi.array().items(Joi.string().trim().min(1).max(200)).optional(),
  services: Joi.object({
    service1: Joi.boolean().optional(),
    service2: Joi.boolean().optional(),
  }).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

// Public: verify a participationId
router.get('/verify/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();

    const record = await ParticipationVerification.findOne({
      participationId: id,
      isActive: true,
    }).lean();

    if (!record) {
      return res.json({
        valid: false,
        message: 'Participation introuvable. Vérifiez l’identifiant saisi.',
      });
    }

    return res.json({
      valid: true,
      data: {
        participationId: record.participationId,
        fullName: record.fullName,
        status: record.status,
        servicesList: Array.isArray(record.servicesList) && record.servicesList.length > 0
          ? record.servicesList
          : DEFAULT_SERVICES_LIST,
        services: record.services,
        updatedAt: record.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error verifying participation:', error);
    return res.status(500).json({
      valid: false,
      message: 'Erreur serveur lors de la vérification',
    });
  }
});

router.use(requireExpert);

// Admin: list
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = { isActive: true };

    if (q && String(q).trim()) {
      const query = String(q).trim();
      filter.$or = [
        { participationId: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ];
    }

    const rows = await ParticipationVerification.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error listing participation verifications:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Admin: create
router.post('/', async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const year = new Date().getFullYear();

    const providedId = value.participationId;
    const participationId = providedId || (await ParticipationVerification.generateParticipationId(year));

    const exists = await ParticipationVerification.findOne({ participationId }).lean();
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Identifiant ${participationId} existe déjà`,
      });
    }

    const record = await ParticipationVerification.create({
      participationId,
      fullName: value.fullName,
      status: value.status || 'Complétée',
      servicesList:
        Array.isArray(value.servicesList) && value.servicesList.length > 0
          ? value.servicesList
          : DEFAULT_SERVICES_LIST,
      services: {
        service1: value.services?.service1 ?? true,
        service2: value.services?.service2 ?? false,
      },
      isActive: value.isActive ?? true,
    });

    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error('Error creating participation verification:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Admin: update by participationId
router.put('/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();

    const { error, value } = updateSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const update = {};
    if (value.fullName !== undefined) update.fullName = value.fullName;
    if (value.status !== undefined) update.status = value.status;
    if (value.isActive !== undefined) update.isActive = value.isActive;

    if (value.servicesList !== undefined) update.servicesList = value.servicesList;

    if (value.services !== undefined) {
      if (value.services.service1 !== undefined) update['services.service1'] = value.services.service1;
      if (value.services.service2 !== undefined) update['services.service2'] = value.services.service2;
    }

    const updated = await ParticipationVerification.findOneAndUpdate(
      { participationId: id },
      { $set: update },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Introuvable' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating participation verification:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Admin: soft delete
router.delete('/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();

    const updated = await ParticipationVerification.findOneAndUpdate(
      { participationId: id },
      { isActive: false },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Introuvable' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting participation verification:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
