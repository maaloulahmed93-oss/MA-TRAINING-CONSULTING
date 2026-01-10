import express from 'express';
import Joi from 'joi';
import requireExpert from '../middleware/requireExpert.js';
import EspaceProDossier from '../models/EspaceProDossier.js';
import EspaceProAccount from '../models/EspaceProAccount.js';

const router = express.Router();

function isValidObjectId(id) {
  return /^[a-fA-F0-9]{24}$/.test(String(id));
}

function normalizeDossier(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    ownerAccountId: String(doc.ownerAccountId),
    situationCurrent: {
      levelLabel: doc.situationCurrent?.levelLabel || '',
      statusLabel: doc.situationCurrent?.statusLabel || '',
    },
    notesVisibleToParticipant: doc.notesVisibleToParticipant || '',
    currentPhaseId: doc.currentPhaseId || 1,
    phases: Array.isArray(doc.phases)
      ? doc.phases.map((p) => ({
          phaseId: p.phaseId,
          status: p.status,
          shortDescription: p.shortDescription || '',
          externalLinkUrl: p.externalLinkUrl || '',
        }))
      : [],
    decisionsHistory: Array.isArray(doc.decisionsHistory)
      ? doc.decisionsHistory
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((d) => ({
            id: String(d._id),
            date: d.date,
            decisionType: d.decisionType,
            phaseId: d.phaseId,
            noteInternal: d.noteInternal || '',
          }))
      : [],
    documents: Array.isArray(doc.documents)
      ? doc.documents
          .slice()
          .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
          .map((x) => ({
            id: String(x._id),
            title: x.title,
            category: x.category,
            phaseId: x.phaseId,
            documentUrl: x.documentUrl,
            visibility: x.visibility,
            addedAt: x.addedAt,
          }))
      : [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

const situationSchema = Joi.object({
  levelLabel: Joi.string().allow('').required(),
  statusLabel: Joi.string().allow('').required(),
});

const notesSchema = Joi.object({
  notesVisibleToParticipant: Joi.string().allow('').required(),
});

const phaseSchema = Joi.object({
  status: Joi.string().valid('A_VENIR', 'EN_COURS', 'TERMINEE').required(),
  shortDescription: Joi.string().allow('').required(),
  externalLinkUrl: Joi.string().allow('').required(),
  setAsCurrent: Joi.boolean().optional(),
});

const decisionSchema = Joi.object({
  date: Joi.date().required(),
  decisionType: Joi.string().min(1).required(),
  phaseId: Joi.number().integer().min(1).max(5).required(),
  noteInternal: Joi.string().allow('').optional(),
});

const documentSchema = Joi.object({
  title: Joi.string().min(1).required(),
  category: Joi.string().valid('DIAGNOSTIC', 'PHASE').required(),
  phaseId: Joi.number().integer().min(1).max(5).optional(),
  documentUrl: Joi.string().uri().required(),
  visibility: Joi.string().valid('PARTICIPANT', 'INTERNAL').required(),
});

// GET /api/espace-pro-dossiers (admin)
router.get('/', requireExpert, async (req, res) => {
  try {
    const dossiers = await EspaceProDossier.find({}).sort({ updatedAt: -1 }).lean();
    const ownerIds = dossiers.map((d) => d.ownerAccountId).filter(Boolean);
    const accounts = await EspaceProAccount.find({ _id: { $in: ownerIds } }).lean();
    const map = new Map(accounts.map((a) => [String(a._id), a]));

    const data = dossiers.map((d) => ({
      id: String(d._id),
      ownerAccountId: String(d.ownerAccountId),
      owner: (() => {
        const acc = map.get(String(d.ownerAccountId));
        if (!acc) return null;
        return {
          id: String(acc._id),
          firstName: acc.firstName,
          lastName: acc.lastName,
          phone: acc.phone,
          isActive: acc.isActive,
        };
      })(),
      currentPhaseId: d.currentPhaseId || 1,
      updatedAt: d.updatedAt,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Erreur list dossiers:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/espace-pro-dossiers/:accountId (admin)
router.get('/:accountId', requireExpert, async (req, res) => {
  try {
    const { accountId } = req.params;
    if (!isValidObjectId(accountId)) {
      return res.status(400).json({ success: false, message: 'Id invalide' });
    }

    const dossier = await EspaceProDossier.createDefaultForAccount(accountId);
    return res.json({ success: true, data: normalizeDossier(dossier) });
  } catch (err) {
    console.error('Erreur get dossier:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/espace-pro-dossiers/:accountId/situation (admin)
router.put('/:accountId/situation', requireExpert, async (req, res) => {
  try {
    const { accountId } = req.params;
    if (!isValidObjectId(accountId)) {
      return res.status(400).json({ success: false, message: 'Id invalide' });
    }

    const { error, value } = situationSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides', errors: error.details.map((d) => d.message) });
    }

    const dossier = await EspaceProDossier.createDefaultForAccount(accountId);
    dossier.situationCurrent = { levelLabel: value.levelLabel, statusLabel: value.statusLabel };
    await dossier.save();

    return res.json({ success: true, data: normalizeDossier(dossier) });
  } catch (err) {
    console.error('Erreur update situation:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/espace-pro-dossiers/:accountId/notes-visible (admin)
router.put('/:accountId/notes-visible', requireExpert, async (req, res) => {
  try {
    const { accountId } = req.params;
    if (!isValidObjectId(accountId)) {
      return res.status(400).json({ success: false, message: 'Id invalide' });
    }

    const { error, value } = notesSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides', errors: error.details.map((d) => d.message) });
    }

    const dossier = await EspaceProDossier.createDefaultForAccount(accountId);
    dossier.notesVisibleToParticipant = value.notesVisibleToParticipant;
    await dossier.save();

    return res.json({ success: true, data: normalizeDossier(dossier) });
  } catch (err) {
    console.error('Erreur update notes visible:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/espace-pro-dossiers/:accountId/phases/:phaseId (admin)
router.put('/:accountId/phases/:phaseId', requireExpert, async (req, res) => {
  try {
    const { accountId, phaseId } = req.params;
    const phaseNum = Number(phaseId);

    if (!isValidObjectId(accountId)) {
      return res.status(400).json({ success: false, message: 'Id invalide' });
    }

    if (!Number.isInteger(phaseNum) || phaseNum < 1 || phaseNum > 5) {
      return res.status(400).json({ success: false, message: 'Phase invalide' });
    }

    const { error, value } = phaseSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides', errors: error.details.map((d) => d.message) });
    }

    const dossier = await EspaceProDossier.createDefaultForAccount(accountId);
    const idx = dossier.phases.findIndex((p) => p.phaseId === phaseNum);

    if (idx === -1) {
      dossier.phases.push({
        phaseId: phaseNum,
        status: value.status,
        shortDescription: value.shortDescription,
        externalLinkUrl: value.externalLinkUrl,
      });
    } else {
      dossier.phases[idx].status = value.status;
      dossier.phases[idx].shortDescription = value.shortDescription;
      dossier.phases[idx].externalLinkUrl = value.externalLinkUrl;
    }

    if (value.setAsCurrent) {
      dossier.currentPhaseId = phaseNum;
    }

    await dossier.save();

    return res.json({ success: true, data: normalizeDossier(dossier) });
  } catch (err) {
    console.error('Erreur update phase:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/espace-pro-dossiers/:accountId/decisions (admin)
router.post('/:accountId/decisions', requireExpert, async (req, res) => {
  try {
    const { accountId } = req.params;
    if (!isValidObjectId(accountId)) {
      return res.status(400).json({ success: false, message: 'Id invalide' });
    }

    const { error, value } = decisionSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides', errors: error.details.map((d) => d.message) });
    }

    const dossier = await EspaceProDossier.createDefaultForAccount(accountId);
    dossier.decisionsHistory.push({
      date: value.date,
      decisionType: value.decisionType,
      phaseId: value.phaseId,
      noteInternal: value.noteInternal || '',
    });

    dossier.currentPhaseId = value.phaseId;

    await dossier.save();

    return res.status(201).json({ success: true, data: normalizeDossier(dossier) });
  } catch (err) {
    console.error('Erreur add decision:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/espace-pro-dossiers/:accountId/documents (admin)
router.post('/:accountId/documents', requireExpert, async (req, res) => {
  try {
    const { accountId } = req.params;
    if (!isValidObjectId(accountId)) {
      return res.status(400).json({ success: false, message: 'Id invalide' });
    }

    const { error, value } = documentSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides', errors: error.details.map((d) => d.message) });
    }

    if (value.category === 'PHASE' && !value.phaseId) {
      return res.status(400).json({ success: false, message: 'phaseId requis pour category PHASE' });
    }

    if (value.category === 'DIAGNOSTIC' && value.phaseId) {
      return res.status(400).json({ success: false, message: 'phaseId interdit pour category DIAGNOSTIC' });
    }

    const dossier = await EspaceProDossier.createDefaultForAccount(accountId);
    dossier.documents.push({
      title: value.title,
      category: value.category,
      phaseId: value.phaseId,
      documentUrl: value.documentUrl,
      visibility: value.visibility,
    });

    await dossier.save();

    return res.status(201).json({ success: true, data: normalizeDossier(dossier) });
  } catch (err) {
    console.error('Erreur add document:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/espace-pro-dossiers/:accountId/documents/:docId (admin)
router.put('/:accountId/documents/:docId', requireExpert, async (req, res) => {
  try {
    const { accountId, docId } = req.params;
    if (!isValidObjectId(accountId) || !isValidObjectId(docId)) {
      return res.status(400).json({ success: false, message: 'Id invalide' });
    }

    const { error, value } = documentSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides', errors: error.details.map((d) => d.message) });
    }

    if (value.category === 'PHASE' && !value.phaseId) {
      return res.status(400).json({ success: false, message: 'phaseId requis pour category PHASE' });
    }

    if (value.category === 'DIAGNOSTIC' && value.phaseId) {
      return res.status(400).json({ success: false, message: 'phaseId interdit pour category DIAGNOSTIC' });
    }

    const dossier = await EspaceProDossier.createDefaultForAccount(accountId);
    const doc = dossier.documents.id(docId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document introuvable' });
    }

    doc.title = value.title;
    doc.category = value.category;
    doc.phaseId = value.phaseId;
    doc.documentUrl = value.documentUrl;
    doc.visibility = value.visibility;

    await dossier.save();

    return res.json({ success: true, data: normalizeDossier(dossier) });
  } catch (err) {
    console.error('Erreur update document:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/espace-pro-dossiers/:accountId/documents/:docId (admin)
router.delete('/:accountId/documents/:docId', requireExpert, async (req, res) => {
  try {
    const { accountId, docId } = req.params;
    if (!isValidObjectId(accountId) || !isValidObjectId(docId)) {
      return res.status(400).json({ success: false, message: 'Id invalide' });
    }

    const dossier = await EspaceProDossier.createDefaultForAccount(accountId);
    const doc = dossier.documents.id(docId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document introuvable' });
    }

    doc.deleteOne();
    await dossier.save();

    return res.json({ success: true, data: normalizeDossier(dossier) });
  } catch (err) {
    console.error('Erreur delete document:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
