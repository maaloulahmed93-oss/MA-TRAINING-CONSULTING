import express from 'express';
import Joi from 'joi';
import DiagnosticSession from '../models/DiagnosticSession.js';
import requireExpert from '../middleware/requireExpert.js';

const router = express.Router();

const submitSchema = Joi.object({
  participant: Joi.object({
    firstName: Joi.string().trim().min(2).required(),
    email: Joi.string().email().trim().lowercase().required(),
    situation: Joi.string().trim().min(1).required(),
  }).required(),

  responses: Joi.object().required(),

  scores: Joi.object({
    perBlock: Joi.object().required(),
    total: Joi.number().required(),
    orientation: Joi.string().required(),
  }).required(),

  metadata: Joi.object({
    source: Joi.string().optional(),
    userAgent: Joi.string().optional(),
    ip: Joi.string().optional(),
  }).optional(),
});

// GET /api/diagnostic-sessions
router.get('/', requireExpert, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50, scoreMin, scoreMax, from, to } = req.query;

    const filter = {};
    if (status && ['draft', 'submitted', 'reviewed', 'pending', 'validated'].includes(String(status))) {
      filter.status = String(status);
    }

    if (scoreMin !== undefined || scoreMax !== undefined) {
      filter['scores.total'] = {};
      if (scoreMin !== undefined) filter['scores.total'].$gte = Number(scoreMin);
      if (scoreMax !== undefined) filter['scores.total'].$lte = Number(scoreMax);
    }

    if (from || to) {
      filter.submittedAt = {};
      if (from) filter.submittedAt.$gte = new Date(String(from));
      if (to) filter.submittedAt.$lte = new Date(String(to));
    }

    if (search) {
      const q = String(search);
      filter.$or = [
        { 'participant.firstName': { $regex: q, $options: 'i' } },
        { 'participant.email': { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (parseInt(String(page), 10) - 1) * parseInt(String(limit), 10);

    const sessions = await DiagnosticSession.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(String(limit), 10));

    const total = await DiagnosticSession.countDocuments(filter);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(String(page), 10),
        limit: parseInt(String(limit), 10),
        total,
        pages: Math.ceil(total / parseInt(String(limit), 10)),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching diagnostic sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions de diagnostic',
      error: error.message,
    });
  }
});

// DELETE /api/diagnostic-sessions/:id
router.delete('/:id', requireExpert, async (req, res) => {
  try {
    const deleted = await DiagnosticSession.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Session de diagnostic introuvable',
      });
    }

    res.json({
      success: true,
      message: 'Session supprimée',
      data: { _id: deleted._id },
    });
  } catch (error) {
    console.error('❌ Error deleting diagnostic session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la session',
      error: error.message,
    });
  }
});

// GET /api/diagnostic-sessions/:id
router.get('/:id', requireExpert, async (req, res) => {
  try {
    const session = await DiagnosticSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session de diagnostic introuvable',
      });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('❌ Error fetching diagnostic session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la session de diagnostic',
      error: error.message,
    });
  }
});

// POST /api/diagnostic-sessions
router.post('/', async (req, res) => {
  try {
    const { error, value } = submitSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        error: error.details?.[0]?.message || 'Validation error',
      });
    }

    const session = new DiagnosticSession({
      status: 'pending',
      participant: value.participant,
      responses: value.responses,
      scores: value.scores,
      metadata: {
        source: value.metadata?.source || 'web',
        userAgent: value.metadata?.userAgent || req.headers['user-agent'] || '',
        ip: value.metadata?.ip || req.ip || '',
      },
      submittedAt: new Date(),
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session de diagnostic enregistrée',
      data: session,
    });
  } catch (error) {
    console.error('❌ Error creating diagnostic session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la session de diagnostic',
      error: error.message,
    });
  }
});

const reviewSchema = Joi.object({
  orientation_finale: Joi.string().trim().required(),
  domaine: Joi.string().allow('').default(''),
  role: Joi.string().allow('').default(''),
  decision: Joi.string().valid('service1', 'orientation', 'echange', 'no-go').required(),
  notes: Joi.string().allow('').default(''),
  expertId: Joi.string().allow('').default(''),
  expertEmail: Joi.string().allow('').default(''),
});

const handleReview = async (req, res) => {
  try {
    const { error, value } = reviewSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        error: error.details?.[0]?.message || 'Validation error',
      });
    }

    const expertEmailFromHeader = req.header('x-expert-email') || '';
    const expertIdFromHeader = req.header('x-expert-id') || '';
    const expertEmail = value.expertEmail || expertEmailFromHeader;
    const expertId = value.expertId || expertIdFromHeader;

    const session = await DiagnosticSession.findByIdAndUpdate(
      req.params.id,
      {
        status: 'validated',
        'analysis.humanReviewed': true,
        'analysis.finalOrientation': value.orientation_finale,
        'analysis.domain': value.domaine,
        'analysis.recommendedRole': value.role,
        'analysis.decision': value.decision,
        'analysis.expertId': expertId,
        'analysis.expertEmail': expertEmail,
        'analysis.notes': value.notes,
        'analysis.reviewedAt': new Date(),
        $push: {
          reviewHistory: {
            at: new Date(),
            expertId,
            expertEmail,
            payload: value,
          },
        },
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session de diagnostic introuvable',
      });
    }

    res.json({
      success: true,
      message: 'Session de diagnostic mise à jour',
      data: session,
    });
  } catch (error) {
    console.error('❌ Error reviewing diagnostic session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la session de diagnostic',
      error: error.message,
    });
  }
};

// POST /api/diagnostic-sessions/:id/review (expert decision)
router.post('/:id/review', requireExpert, handleReview);

// PATCH /api/diagnostic-sessions/:id/review (backward compatibility)
router.patch('/:id/review', requireExpert, handleReview);

export default router;
