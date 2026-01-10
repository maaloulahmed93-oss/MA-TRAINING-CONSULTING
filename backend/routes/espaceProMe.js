import express from 'express';
import EspaceProDossier from '../models/EspaceProDossier.js';
import requireEspaceProParticipant from '../middleware/requireEspaceProParticipant.js';

const router = express.Router();

function normalizeParticipantDashboard(doc) {
  if (!doc) return null;

  const decisionsSorted = Array.isArray(doc.decisionsHistory)
    ? doc.decisionsHistory.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const lastDecision = decisionsSorted[0]
    ? {
        date: decisionsSorted[0].date,
        decisionType: decisionsSorted[0].decisionType,
        phaseId: decisionsSorted[0].phaseId,
      }
    : null;

  const history = decisionsSorted.map((d) => ({
    id: String(d._id),
    date: d.date,
    decisionType: d.decisionType,
    phaseId: d.phaseId,
  }));

  const documents = Array.isArray(doc.documents)
    ? doc.documents
        .filter((x) => x.visibility === 'PARTICIPANT')
        .slice()
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .map((x) => ({
          id: String(x._id),
          title: x.title,
          category: x.category,
          phaseId: x.phaseId,
          documentUrl: x.documentUrl,
          addedAt: x.addedAt,
        }))
    : [];

  const phases = Array.isArray(doc.phases)
    ? doc.phases.map((p) => ({
        phaseId: p.phaseId,
        status: p.status,
        shortDescription: p.shortDescription || '',
        externalLinkUrl: p.externalLinkUrl || '',
      }))
    : [];

  return {
    ownerAccountId: String(doc.ownerAccountId),
    situationCurrent: {
      levelLabel: doc.situationCurrent?.levelLabel || '',
      statusLabel: doc.situationCurrent?.statusLabel || '',
    },
    notesVisibleToParticipant: doc.notesVisibleToParticipant || '',
    currentPhaseId: doc.currentPhaseId || 1,
    phases,
    lastDecision,
    decisionsHistory: history,
    documents,
    updatedAt: doc.updatedAt,
  };
}

// GET /api/espace-pro/me/dashboard (participant)
router.get('/me/dashboard', requireEspaceProParticipant, async (req, res) => {
  try {
    const accountId = req.espaceProAccountId;
    const dossier = await EspaceProDossier.createDefaultForAccount(accountId);
    return res.json({ success: true, data: normalizeParticipantDashboard(dossier) });
  } catch (err) {
    console.error('Erreur participant dashboard:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
