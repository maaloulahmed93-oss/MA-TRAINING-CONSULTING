import express from 'express';
import Joi from 'joi';
import crypto from 'crypto';
import requireExpert from '../middleware/requireExpert.js';
import requireConsultingOperationnelParticipant from '../middleware/requireConsultingOperationnelParticipant.js';
import ConsultingOperationnelAccount from '../models/ConsultingOperationnelAccount.js';
import ConsultingOperationnelAnswers from '../models/ConsultingOperationnelAnswers.js';
import { createConsultingOperationnelToken } from '../utils/consultingOperationnelToken.js';

const router = express.Router();

function normalizeParticipantId(value) {
  return String(value || '').trim().toUpperCase();
}

function generatePassword() {
  // 12 chars, url-safe
  return crypto.randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
}

function toPublicAccount(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    participantId: doc.participantId,
    isActive: doc.isActive,
    firstName: doc.firstName || '',
    lastName: doc.lastName || '',
    email: doc.email || '',
    entreprise: doc.entreprise || '',
    notesAdmin: doc.notesAdmin || '',
    situation: doc.situation || {},
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

const situationSchema = Joi.object({
  posteIntitule: Joi.string().allow('').optional(),
  entrepriseSecteur: Joi.string().allow('').optional(),
  element1: Joi.string().allow('').optional(),
  element2: Joi.string().allow('').optional(),
  difficulte1: Joi.string().allow('').optional(),
  difficulte2: Joi.string().allow('').optional(),
  demandeDirection: Joi.string().allow('').optional(),
  session1DateTime: Joi.string().allow('').optional(),
  session1VideoUrl: Joi.string().allow('').optional(),
  session2DateTime: Joi.string().allow('').optional(),
  session2VideoUrl: Joi.string().allow('').optional(),
  session3DateTime: Joi.string().allow('').optional(),
  session3VideoUrl: Joi.string().allow('').optional(),
}).optional();

const adminCreateSchema = Joi.object({
  participantId: Joi.string().trim().min(2).required(),
  password: Joi.string().min(1).optional(),
  isActive: Joi.boolean().optional(),
  firstName: Joi.string().allow('').optional(),
  lastName: Joi.string().allow('').optional(),
  email: Joi.string().allow('').optional(),
  entreprise: Joi.string().allow('').optional(),
  notesAdmin: Joi.string().allow('').optional(),
  situation: situationSchema,
});

const adminUpdateSchema = Joi.object({
  participantId: Joi.string().trim().min(2).optional(),
  password: Joi.string().min(1).optional(),
  isActive: Joi.boolean().optional(),
  firstName: Joi.string().allow('').optional(),
  lastName: Joi.string().allow('').optional(),
  email: Joi.string().allow('').optional(),
  entreprise: Joi.string().allow('').optional(),
  notesAdmin: Joi.string().allow('').optional(),
  situation: situationSchema,
}).min(1);

const loginSchema = Joi.object({
  participantId: Joi.string().trim().min(2).required(),
  password: Joi.string().min(1).required(),
});

const answersSchema = Joi.object({
  answers: Joi.object().required(),
});

// =====================
// Participant endpoints
// =====================

// POST /api/consulting-operationnel-accounts/login (public)
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const participantIdNormalized = normalizeParticipantId(value.participantId);

    const account = await ConsultingOperationnelAccount.findOne({
      participantIdNormalized,
      isActive: true,
    });

    if (!account || !account.verifyPassword(value.password)) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    const token = createConsultingOperationnelToken(account._id);

    return res.json({
      success: true,
      data: {
        account: toPublicAccount(account),
        token,
        expiresInDays: 10,
      },
    });
  } catch (err) {
    console.error('Erreur login consulting operationnel:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/consulting-operationnel-accounts/me (participant)
router.get('/me', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const accountId = req.consultingOperationnelAccountId;
    const account = await ConsultingOperationnelAccount.findById(accountId);

    if (!account || !account.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    return res.json({ success: true, data: { account: toPublicAccount(account) } });
  } catch (err) {
    console.error('Erreur me consulting operationnel:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/consulting-operationnel-accounts/situation (participant)
router.get('/situation', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const accountId = req.consultingOperationnelAccountId;
    const account = await ConsultingOperationnelAccount.findById(accountId);

    if (!account || !account.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    return res.json({ success: true, data: { situation: account.situation || {} } });
  } catch (err) {
    console.error('Erreur situation consulting operationnel:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/consulting-operationnel-accounts/answers (participant)
router.get('/answers', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const ownerAccountId = req.consultingOperationnelAccountId;
    const account = await ConsultingOperationnelAccount.findById(ownerAccountId);
    if (!account || !account.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const doc = await ConsultingOperationnelAnswers.findOne({ ownerAccountId });
    return res.json({ success: true, data: doc?.answers ?? {} });
  } catch (err) {
    console.error('Erreur get answers consulting operationnel:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/consulting-operationnel-accounts/answers (participant)
router.put('/answers', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const { error, value } = answersSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const ownerAccountId = req.consultingOperationnelAccountId;

    const account = await ConsultingOperationnelAccount.findById(ownerAccountId);
    if (!account || !account.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const updated = await ConsultingOperationnelAnswers.findOneAndUpdate(
      { ownerAccountId },
      { $set: { answers: value.answers } },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: updated.answers });
  } catch (err) {
    console.error('Erreur save answers consulting operationnel:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// =================
// Admin endpoints
// =================

// GET /api/consulting-operationnel-accounts (admin)
router.get('/', requireExpert, async (req, res) => {
  try {
    const list = await ConsultingOperationnelAccount.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: list.map(toPublicAccount) });
  } catch (err) {
    console.error('Erreur list accounts consulting operationnel:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/consulting-operationnel-accounts (admin)
router.post('/', requireExpert, async (req, res) => {
  try {
    const { error, value } = adminCreateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const participantId = normalizeParticipantId(value.participantId);
    const password = value.password ? String(value.password) : generatePassword();

    const account = new ConsultingOperationnelAccount({
      participantId,
      isActive: value.isActive ?? true,
      firstName: String(value.firstName ?? ''),
      lastName: String(value.lastName ?? ''),
      email: String(value.email ?? ''),
      entreprise: String(value.entreprise ?? ''),
      notesAdmin: String(value.notesAdmin ?? ''),
      passwordHash: 'temp',
    });

    if (value.situation) {
      account.situation = {
        ...(account.situation || {}),
        ...value.situation,
      };
    }
    account.setPassword(password);

    await account.save();

    return res.status(201).json({
      success: true,
      data: {
        account: toPublicAccount(account),
        ...(value.password ? {} : { generatedPassword: password }),
      },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Identifiant déjà utilisé' });
    }
    console.error('Erreur create account consulting operationnel:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/consulting-operationnel-accounts/:id (admin)
router.put('/:id', requireExpert, async (req, res) => {
  try {
    const { error, value } = adminUpdateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const account = await ConsultingOperationnelAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Compte introuvable' });
    }

    if (value.participantId !== undefined) account.participantId = normalizeParticipantId(value.participantId);
    if (value.isActive !== undefined) account.isActive = value.isActive;
    if (value.firstName !== undefined) account.firstName = String(value.firstName);
    if (value.lastName !== undefined) account.lastName = String(value.lastName);
    if (value.email !== undefined) account.email = String(value.email);
    if (value.entreprise !== undefined) account.entreprise = String(value.entreprise);
    if (value.notesAdmin !== undefined) account.notesAdmin = String(value.notesAdmin);
    if (value.password !== undefined) account.setPassword(value.password);

    if (value.situation !== undefined) {
      account.situation = {
        ...(account.situation || {}),
        ...value.situation,
      };
    }

    await account.save();

    return res.json({ success: true, data: { account: toPublicAccount(account) } });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Identifiant déjà utilisé' });
    }
    console.error('Erreur update account consulting operationnel:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/consulting-operationnel-accounts/:id (admin)
router.delete('/:id', requireExpert, async (req, res) => {
  try {
    const deleted = await ConsultingOperationnelAccount.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Compte introuvable' });
    }

    await ConsultingOperationnelAnswers.deleteOne({ ownerAccountId: deleted._id });

    return res.json({ success: true, data: { id: String(deleted._id) } });
  } catch (err) {
    console.error('Erreur delete account consulting operationnel:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
