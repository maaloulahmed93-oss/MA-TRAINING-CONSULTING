import express from 'express';
import Joi from 'joi';
import DiagnosticQuestion from '../models/DiagnosticQuestion.js';
import requireExpert from '../middleware/requireExpert.js';

const router = express.Router();

const optionSchema = Joi.object({
  label: Joi.string().trim().min(1).required(),
  score: Joi.number().required(),
});

const questionSchema = Joi.object({
  text: Joi.string().trim().min(3).required(),
  category: Joi.string().trim().min(1).required(),
  options: Joi.array().items(optionSchema).min(2).required(),
  isActive: Joi.boolean().optional(),
  order: Joi.number().integer().optional(),
});

// Public: GET /api/diagnostic-questions
router.get('/', async (req, res) => {
  try {
    const activeOnly = String(req.query.activeOnly || '') === 'true';

    const filter = {};
    if (activeOnly) filter.isActive = true;

    const questions = await DiagnosticQuestion.find(filter).sort({ order: 1, createdAt: -1 });

    // Public payload must not expose option scores
    const safeQuestions = questions.map((q) => ({
      _id: q._id,
      text: q.text,
      category: q.category,
      options: Array.isArray(q.options) ? q.options.map((o) => ({ label: o.label })) : [],
      isActive: q.isActive,
      order: q.order,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));

    res.json({ success: true, data: safeQuestions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des questions',
      error: error.message,
    });
  }
});

// Admin: GET /api/diagnostic-questions/admin (full payload incl. scores)
router.get('/admin', requireExpert, async (req, res) => {
  try {
    const activeOnly = String(req.query.activeOnly || '') === 'true';

    const filter = {};
    if (activeOnly) filter.isActive = true;

    const questions = await DiagnosticQuestion.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des questions',
      error: error.message,
    });
  }
});

// Admin: POST /api/diagnostic-questions/seed
router.post('/seed', requireExpert, async (req, res) => {
  try {
    const existing = await DiagnosticQuestion.countDocuments({});
    if (existing > 0) {
      return res.json({ success: true, message: 'Seed ignoré (des questions existent déjà)', inserted: 0 });
    }

    const seed = [
      {
        category: 'Leadership',
        text: "Quand un objectif est flou, comment réagissez-vous en premier ?",
        order: 1,
        options: [
          { label: 'J’attends des instructions détaillées avant d’agir', score: 1 },
          { label: 'Je clarifie le besoin avec quelques questions puis j’avance', score: 3 },
          { label: 'Je structure le problème, propose un plan et je sécurise l’alignement', score: 5 },
          { label: 'Je délègue immédiatement sans cadrage', score: 2 },
        ],
      },
      {
        category: 'Planning',
        text: 'Quand vous avez plusieurs tâches urgentes, quelle est votre méthode ?',
        order: 2,
        options: [
          { label: 'Je traite au hasard selon la pression du moment', score: 1 },
          { label: 'Je commence par la tâche la plus facile', score: 2 },
          { label: 'Je priorise selon impact / urgence / dépendances', score: 5 },
          { label: 'Je fais tout en parallèle sans plan', score: 1 },
        ],
      },
      {
        category: 'Decision Making',
        text: 'Avant de prendre une décision importante, que vérifiez-vous ?',
        order: 3,
        options: [
          { label: 'Je décide vite sans données pour gagner du temps', score: 1 },
          { label: 'Je collecte quelques infos puis je tranche', score: 3 },
          { label: 'J’analyse options/risques, puis je valide avec les parties concernées', score: 5 },
          { label: 'Je reporte la décision le plus longtemps possible', score: 2 },
        ],
      },
      {
        category: 'Communication',
        text: 'Quand vous devez expliquer un sujet complexe à une équipe, que faites-vous ?',
        order: 4,
        options: [
          { label: 'Je donne tous les détails techniques d’un seul coup', score: 2 },
          { label: 'Je simplifie en étapes + exemples concrets', score: 5 },
          { label: 'Je préfère ne pas expliquer, chacun doit comprendre seul', score: 1 },
          { label: 'Je reste vague pour aller vite', score: 1 },
        ],
      },
      {
        category: 'Problem Solving',
        text: 'Quand un problème se répète, quelle est votre approche ?',
        order: 5,
        options: [
          { label: 'Je corrige rapidement sans chercher la cause', score: 2 },
          { label: 'Je cherche la cause principale et je mets une solution durable', score: 5 },
          { label: 'Je blâme l’environnement/les autres', score: 1 },
          { label: 'Je change de sujet et j’évite le problème', score: 1 },
        ],
      },
    ];

    const inserted = await DiagnosticQuestion.insertMany(seed);

    res.status(201).json({ success: true, inserted: inserted.length, data: inserted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur seed', error: error.message });
  }
});

// Admin: GET /api/diagnostic-questions/:id
router.get('/:id', requireExpert, async (req, res) => {
  try {
    const q = await DiagnosticQuestion.findById(req.params.id);
    if (!q) {
      return res.status(404).json({ success: false, message: 'Question introuvable' });
    }
    res.json({ success: true, data: q });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Admin: POST /api/diagnostic-questions
router.post('/', requireExpert, async (req, res) => {
  try {
    const { error, value } = questionSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides', error: error.details?.[0]?.message });
    }

    const created = await DiagnosticQuestion.create(value);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la création', error: error.message });
  }
});

// Admin: PUT /api/diagnostic-questions/:id
router.put('/:id', requireExpert, async (req, res) => {
  try {
    const { error, value } = questionSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides', error: error.details?.[0]?.message });
    }

    const updated = await DiagnosticQuestion.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Question introuvable' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour', error: error.message });
  }
});

// Admin: DELETE /api/diagnostic-questions/:id
router.delete('/:id', requireExpert, async (req, res) => {
  try {
    const deleted = await DiagnosticQuestion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Question introuvable' });
    }
    res.json({ success: true, data: { _id: deleted._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression', error: error.message });
  }
});

export default router;
