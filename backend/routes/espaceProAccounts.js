import express from 'express';
import Joi from 'joi';
import requireExpert from '../middleware/requireExpert.js';
import EspaceProAccount from '../models/EspaceProAccount.js';
import EspaceProDossier from '../models/EspaceProDossier.js';
import { createEspaceProToken } from '../utils/espaceProToken.js';

const router = express.Router();

function normalizePhone(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function normalizeName(value) {
  return String(value || '').trim();
}

function toPublicAccount(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

const createSchema = Joi.object({
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  phone: Joi.string().trim().min(6).required(),
  password: Joi.string().min(1).required(),
  isActive: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  firstName: Joi.string().trim().min(1).optional(),
  lastName: Joi.string().trim().min(1).optional(),
  phone: Joi.string().trim().min(6).optional(),
  password: Joi.string().min(1).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

const loginSchema = Joi.object({
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  phone: Joi.string().trim().min(6).required(),
  password: Joi.string().min(1).required(),
});

// POST /api/espace-pro-accounts/login (public)
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

    const phoneNormalized = normalizePhone(value.phone);
    const firstNameNormalized = String(value.firstName).trim().toLowerCase();
    const lastNameNormalized = String(value.lastName).trim().toLowerCase();

    const account = await EspaceProAccount.findOne({
      phoneNormalized,
      firstNameNormalized,
      lastNameNormalized,
      isActive: true,
    });

    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    if (!account.verifyPassword(value.password)) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    try {
      await EspaceProDossier.createDefaultForAccount(account._id);
    } catch (err) {
      console.error('Erreur create default dossier (login):', err);
    }

    const token = createEspaceProToken(account._id);

    return res.json({
      success: true,
      data: {
        id: String(account._id),
        firstName: account.firstName,
        lastName: account.lastName,
        phone: account.phone,
        token,
      },
    });
  } catch (err) {
    console.error('Erreur login espace pro:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/espace-pro-accounts/:id/exists (public)
router.get('/:id/exists', async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[a-fA-F0-9]{24}$/.test(String(id))) {
      return res.json({ success: true, exists: false });
    }

    const found = await EspaceProAccount.exists({ _id: id, isActive: true });
    return res.json({ success: true, exists: Boolean(found) });
  } catch (err) {
    console.error('Erreur exists espace pro:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/espace-pro-accounts (admin)
router.get('/', requireExpert, async (req, res) => {
  try {
    const list = await EspaceProAccount.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: list.map(toPublicAccount) });
  } catch (err) {
    console.error('Erreur list espace pro:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/espace-pro-accounts (admin)
router.post('/', requireExpert, async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const account = new EspaceProAccount({
      firstName: normalizeName(value.firstName),
      lastName: normalizeName(value.lastName),
      phone: normalizePhone(value.phone),
      isActive: value.isActive ?? true,
      passwordHash: 'temp',
    });
    account.setPassword(value.password);

    await account.save();

    try {
      await EspaceProDossier.createDefaultForAccount(account._id);
    } catch (err) {
      console.error('Erreur create default dossier (create account):', err);
    }

    return res.status(201).json({
      success: true,
      data: toPublicAccount(account),
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Téléphone déjà utilisé' });
    }
    console.error('Erreur create espace pro:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/espace-pro-accounts/:id (admin)
router.put('/:id', requireExpert, async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const account = await EspaceProAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Compte introuvable' });
    }

    if (value.firstName !== undefined) account.firstName = normalizeName(value.firstName);
    if (value.lastName !== undefined) account.lastName = normalizeName(value.lastName);
    if (value.phone !== undefined) account.phone = normalizePhone(value.phone);
    if (value.isActive !== undefined) account.isActive = value.isActive;
    if (value.password !== undefined) account.setPassword(value.password);

    await account.save();

    return res.json({ success: true, data: toPublicAccount(account) });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Téléphone déjà utilisé' });
    }
    console.error('Erreur update espace pro:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/espace-pro-accounts/:id (admin)
router.delete('/:id', requireExpert, async (req, res) => {
  try {
    const deleted = await EspaceProAccount.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Compte introuvable' });
    }
    return res.json({ success: true, data: { id: String(deleted._id) } });
  } catch (err) {
    console.error('Erreur delete espace pro:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
