import express from 'express';
import Joi from 'joi';
import mongoose from 'mongoose';
import multer from 'multer';
import pdfParse from 'pdf-parse';

import requireExpert from '../middleware/requireExpert.js';
import requireConsultingOperationnelParticipant from '../middleware/requireConsultingOperationnelParticipant.js';

import Service2Exam from '../models/Service2Exam.js';
import Service2Submission from '../models/Service2Submission.js';
import Service2FinalReport from '../models/Service2FinalReport.js';
import Service2FinishSlot from '../models/Service2FinishSlot.js';
import Service2ActionPlan from '../models/Service2ActionPlan.js';
import ConsultingOperationnelAccount from '../models/ConsultingOperationnelAccount.js';

import { analyzeService2Submission, generateService2AccountFullReport } from '../utils/service2AiClient.js';

const router = express.Router();

const createExamSchema = Joi.object({
  title: Joi.string().allow('').optional(),
  scenarioBrief: Joi.string().trim().min(10).required(),
  constraints: Joi.array().items(Joi.string().allow('')).default([]),
  successCriteria: Joi.array().items(Joi.string().allow('')).default([]),
  tasks: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().trim().min(1).required(),
        title: Joi.string().allow('').optional(),
        prompt: Joi.string().allow('').optional(),
      })
    )
    .default([]),
  verdictRules: Joi.array().items(Joi.object()).default([]),
  assignedAccountId: Joi.string().trim().max(80).allow('').optional(),
  isActive: Joi.boolean().optional(),
});

const submitTaskSchema = Joi.object({
  examId: Joi.string().trim().min(10).required(),
  taskId: Joi.string().trim().default('main'),
  submissionText: Joi.string().allow('').max(50000).required(),
});

const analyzeTaskSchema = Joi.object({
  examId: Joi.string().trim().min(10).required(),
  taskId: Joi.string().trim().default('main'),
  submissionText: Joi.string().allow('').max(50000).required(),
  submissionId: Joi.string().allow('').optional(),
});

const generateVerdictSchema = Joi.object({
  examId: Joi.string().trim().min(10).required(),
});

const createSlotSchema = Joi.object({
  title: Joi.string().allow('').optional(),
  startAt: Joi.date().required(),
  endAt: Joi.date().optional(),
  isActive: Joi.boolean().optional(),
  assignedAccountId: Joi.string().trim().min(2).required(),
});

const adminAccountReportSchema = Joi.object({
  assignedAccountId: Joi.string().trim().min(2).required(),
  examId: Joi.string().trim().allow('').optional(),
});

const upsertActionPlanSchema = Joi.object({
  examId: Joi.string().trim().min(10).required(),
  tasks: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().min(1).max(200).required(),
        dueAt: Joi.date().optional(),
      })
    )
    .min(1)
    .max(50)
    .required(),
});

function safeEvalCondition(condition, ctx) {
  const allowed = String(condition || '').trim();
  if (!allowed) return false;

  // very small safe subset: numbers, operators, identifiers, spaces, parentheses, dots
  if (!/^[0-9a-zA-Z_\s<>=!&|().+-/*]+$/.test(allowed)) return false;

  const fn = new Function(
    'ctx',
    `"use strict"; const score = ctx.score; const constraint_violations = ctx.constraint_violations; const submissions_count = ctx.submissions_count; return (${allowed});`
  );

  try {
    return Boolean(fn(ctx));
  } catch {
    return false;
  }

 }

function toPublicActionPlan(plan) {
  const doc = plan && typeof plan.toObject === 'function' ? plan.toObject() : plan;
  return {
    id: String(doc?._id || ''),
    examId: doc?.examId ? String(doc.examId) : '',
    accountId: doc?.accountId ? String(doc.accountId) : '',
    tasks: Array.isArray(doc?.tasks)
      ? doc.tasks.map((t) => ({
          id: String(t?._id || ''),
          title: String(t?.title || ''),
          dueAt: t?.dueAt ? new Date(t.dueAt).toISOString() : null,
          status: String(t?.status || 'todo'),
          completedAt: t?.completedAt ? new Date(t.completedAt).toISOString() : null,
          aiFeedback: t?.aiFeedback
            ? {
                score: Number(t.aiFeedback.score) || 0,
                summary: String(t.aiFeedback.summary || ''),
                warnings: Array.isArray(t.aiFeedback.warnings) ? t.aiFeedback.warnings : [],
                tips: Array.isArray(t.aiFeedback.tips) ? t.aiFeedback.tips : [],
                strengths: Array.isArray(t.aiFeedback.strengths) ? t.aiFeedback.strengths : [],
                weaknesses: Array.isArray(t.aiFeedback.weaknesses) ? t.aiFeedback.weaknesses : [],
                recommendations: Array.isArray(t.aiFeedback.recommendations) ? t.aiFeedback.recommendations : [],
                analyzedAt: t.aiFeedback.analyzedAt ? new Date(t.aiFeedback.analyzedAt).toISOString() : null,
              }
            : null,
        }))
      : [],
    createdAt: doc?.createdAt,
    updatedAt: doc?.updatedAt,
  };
}

async function ensureExamAccess({ examId, accountId }) {
  const exam = await Service2Exam.findById(examId).lean();
  if (!exam || !exam.isActive) return { ok: false, status: 404, message: 'Exam introuvable', exam: null };
  if (exam.assignedAccountId && String(exam.assignedAccountId) !== String(accountId)) {
    return { ok: false, status: 403, message: 'Accès refusé', exam: null };
  }
  return { ok: true, status: 200, message: 'ok', exam };
}

const planUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const name = String(file?.originalname || '').toLowerCase();
    const mime = String(file?.mimetype || '').toLowerCase();
    const looksLikePdf = name.endsWith('.pdf') || mime.includes('pdf');
    if (looksLikePdf) return cb(null, true);
    return cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
  },
});

const planUploadPdf = (req, res, next) => {
  const handler = planUpload.single('pdf');
  handler(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: [String(err?.message || err)],
      });
    }
    return next();
  });
};

function applyVerdictRules({ rules, score, constraintViolationsCount, submissionsCount }) {
  const ctx = {
    score: Number(score) || 0,
    constraint_violations: Number(constraintViolationsCount) || 0,
    submissions_count: Number(submissionsCount) || 0,
  };

  let status = 'À retravailler';
  let message = '';

  const list = Array.isArray(rules) ? rules : [];
  for (const rule of list) {
    const ifExpr = String(rule?.if || '').trim();
    const thenObj = rule?.then && typeof rule.then === 'object' ? rule.then : null;
    if (!ifExpr || !thenObj) continue;

    const ok = safeEvalCondition(ifExpr, ctx);
    if (!ok) continue;

    if (thenObj.status) status = String(thenObj.status);
    if (thenObj.message) message = String(thenObj.message);

    // first-match wins
    break;
  }

  // default fallback if no rules matched
  if (!message) {
    message = status === 'Validé' ? 'Mission validée' : 'Mission à retravailler';
  }

  return { status, message, ctx };
}

function buildFinalReportFromSubmissions({ exam, subs }) {
  const scores = (subs || [])
    .map((s) => Number(s?.aiAnalysis?.score))
    .filter((n) => Number.isFinite(n));

  const globalScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  let constraintViolationsCount = 0;
  for (const s of subs || []) {
    const arr = Array.isArray(s?.aiAnalysis?.constraintViolations) ? s.aiAnalysis.constraintViolations : [];
    constraintViolationsCount += arr.length;
  }

  const verdict = applyVerdictRules({
    rules: exam?.verdictRules,
    score: globalScore,
    constraintViolationsCount,
    submissionsCount: Array.isArray(subs) ? subs.length : 0,
  });

  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  for (const s of subs || []) {
    const raw = s?.aiAnalysis?.raw;
    if (raw && typeof raw === 'object') {
      if (Array.isArray(raw.strengths)) strengths.push(...raw.strengths.map(String));
      if (Array.isArray(raw.weaknesses)) weaknesses.push(...raw.weaknesses.map(String));
      if (Array.isArray(raw.recommendations)) recommendations.push(...raw.recommendations.map(String));
    }
  }

  const reportText =
    `Score global: ${globalScore}/100\n` +
    `Violations contraintes: ${constraintViolationsCount}\n` +
    `Statut: ${verdict.status}\n` +
    (verdict.message ? `Message: ${verdict.message}\n` : '');

  return {
    globalScore,
    constraintViolationsCount,
    status: verdict.status,
    message: verdict.message,
    strengths,
    weaknesses,
    recommendations,
    reportText,
    inputs: {
      ctx: verdict.ctx,
      submissions: (subs || []).map((s) => ({ id: String(s._id), taskId: s.taskId, score: s.aiAnalysis?.score })),
    },
  };
}

function toPublicExam(exam) {
  return {
    id: String(exam._id),
    title: exam.title || '',
    scenarioBrief: exam.scenarioBrief || '',
    constraints: Array.isArray(exam.constraints) ? exam.constraints : [],
    successCriteria: Array.isArray(exam.successCriteria) ? exam.successCriteria : [],
    tasks: Array.isArray(exam.tasks) ? exam.tasks : [],
    verdictRules: Array.isArray(exam.verdictRules) ? exam.verdictRules : [],
    assignedAccountId: exam.assignedAccountId ? String(exam.assignedAccountId) : null,
    isActive: Boolean(exam.isActive),
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
  };
}

// =================
// Admin endpoints
// =================

router.post('/create-exam', requireExpert, async (req, res) => {
  try {
    const { error, value } = createExamSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const assignedAccountInput = String(value.assignedAccountId || '').trim();
    let assignedAccountId = '';
    if (assignedAccountInput) {
      if (mongoose.isValidObjectId(assignedAccountInput)) {
        const exists = await ConsultingOperationnelAccount.findById(assignedAccountInput).select('_id').lean();
        if (!exists) {
          return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: ['assignedAccountId introuvable (aucun compte S2 avec cet id)'],
          });
        }
        assignedAccountId = assignedAccountInput;
      } else {
        const normalized = assignedAccountInput.toUpperCase();
        const account = await ConsultingOperationnelAccount.findOne({ participantIdNormalized: normalized }).select('_id').lean();
        if (!account?._id) {
          return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: ['assignedAccountId invalide: fournissez un ObjectId MongoDB OU un participantId existant (ex: PRT-045)'],
          });
        }
        assignedAccountId = String(account._id);
      }
    }

    const created = await Service2Exam.create({
      title: String(value.title ?? ''),
      scenarioBrief: String(value.scenarioBrief),
      constraints: (value.constraints || []).map((x) => String(x)).filter((x) => x.trim() !== ''),
      successCriteria: (value.successCriteria || []).map((x) => String(x)).filter((x) => x.trim() !== ''),
      tasks: (value.tasks || []).map((t) => ({
        id: String(t.id),
        title: String(t.title ?? ''),
        prompt: String(t.prompt ?? ''),
      })),
      verdictRules: Array.isArray(value.verdictRules) ? value.verdictRules : [],
      assignedAccountId: assignedAccountId || undefined,
      isActive: value.isActive ?? true,
    });

    return res.status(201).json({ success: true, data: { exam: toPublicExam(created) } });
  } catch (err) {
    if (err?.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: [String(err?.message || 'CastError')],
      });
    }
    console.error('Service2 create-exam error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.get('/exams', requireExpert, async (req, res) => {
  try {
    const list = await Service2Exam.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: list.map((e) => toPublicExam(e)) });
  } catch (err) {
    console.error('Service2 list exams error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.post('/finish-slots', requireExpert, async (req, res) => {
  try {
    const { error, value } = createSlotSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const assignedAccountInput = String(value.assignedAccountId || '').trim();
    let assignedAccountId = '';
    if (mongoose.isValidObjectId(assignedAccountInput)) {
      const exists = await ConsultingOperationnelAccount.findById(assignedAccountInput).select('_id').lean();
      if (!exists) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: ['assignedAccountId introuvable (aucun compte S2 avec cet id)'],
        });
      }
      assignedAccountId = assignedAccountInput;
    } else {
      const normalized = assignedAccountInput.toUpperCase();
      const account = await ConsultingOperationnelAccount.findOne({ participantIdNormalized: normalized }).select('_id').lean();
      if (!account?._id) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: ['assignedAccountId invalide: fournissez un ObjectId MongoDB OU un participantId existant (ex: PRT-045)'],
        });
      }
      assignedAccountId = String(account._id);
    }

    const slot = await Service2FinishSlot.create({
      title: String(value.title ?? ''),
      startAt: new Date(value.startAt),
      endAt: value.endAt ? new Date(value.endAt) : undefined,
      isActive: value.isActive ?? true,
      assignedAccountId,
      createdBy: 'admin',
    });

    return res.status(201).json({
      success: true,
      data: {
        slot: {
          ...slot.toObject(),
          assignedAccountId: slot.assignedAccountId ? String(slot.assignedAccountId) : null,
        },
      },
    });
  } catch (err) {
    console.error('Service2 create slot error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.get('/admin/finish-slots', requireExpert, async (req, res) => {
  try {
    const slots = await Service2FinishSlot.find({}).sort({ startAt: 1 }).lean();
    return res.json({
      success: true,
      data: {
        slots: slots.map((s) => ({
          ...s,
          assignedAccountId: s.assignedAccountId ? String(s.assignedAccountId) : null,
        })),
      },
    });
  } catch (err) {
    console.error('Service2 admin finish-slots error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.get('/admin/account-history', requireExpert, async (req, res) => {
  try {
    const { error, value } = adminAccountReportSchema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const assignedAccountInput = String(value.assignedAccountId || '').trim();
    let accountId = '';
    if (mongoose.isValidObjectId(assignedAccountInput)) {
      accountId = assignedAccountInput;
    } else {
      const normalized = assignedAccountInput.toUpperCase();
      const account = await ConsultingOperationnelAccount.findOne({ participantIdNormalized: normalized }).select('_id').lean();
      if (!account?._id) {
        return res.status(404).json({ success: false, message: 'Compte introuvable' });
      }
      accountId = String(account._id);
    }

    const account = await ConsultingOperationnelAccount.findById(accountId)
      .select('_id participantId isActive firstName lastName email entreprise notesAdmin createdAt updatedAt')
      .lean();
    if (!account) return res.status(404).json({ success: false, message: 'Compte introuvable' });

    const examIdInput = String(value.examId || '').trim();
    let exam = null;
    if (examIdInput) {
      exam = await Service2Exam.findById(examIdInput).lean();
    } else {
      exam = await Service2Exam.findOne({ assignedAccountId: accountId }).sort({ createdAt: -1 }).lean();
    }

    if (!exam) return res.status(404).json({ success: false, message: 'Exam introuvable' });
    if (exam.assignedAccountId && String(exam.assignedAccountId) !== String(accountId)) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const submissions = await Service2Submission.find({ examId: exam._id, accountId }).sort({ createdAt: 1 }).lean();
    const actionPlan = await Service2ActionPlan.findOne({ examId: exam._id, accountId }).lean();
    const finalReport = await Service2FinalReport.findOne({ examId: exam._id, accountId }).lean();

    return res.json({
      success: true,
      data: {
        account: {
          id: String(account._id),
          participantId: account.participantId,
          isActive: Boolean(account.isActive),
          notesAdmin: String(account.notesAdmin || ''),
          createdAt: account.createdAt,
        },
        exam: toPublicExam(exam),
        submissions: submissions.map((s) => ({
          id: String(s._id),
          taskId: String(s.taskId || 'main'),
          attempt: Number(s.attempt) || 1,
          submissionText: String(s.submissionText || ''),
          aiAnalysis: s.aiAnalysis || null,
          createdAt: s.createdAt,
        })),
        actionPlan: actionPlan ? toPublicActionPlan(actionPlan) : null,
        finalReport: finalReport || null,
      },
    });
  } catch (err) {
    console.error('Service2 admin account-history error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.post('/admin/generate-account-report', requireExpert, async (req, res) => {
  try {
    const { error, value } = adminAccountReportSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const assignedAccountInput = String(value.assignedAccountId || '').trim();
    let accountId = '';
    if (mongoose.isValidObjectId(assignedAccountInput)) {
      accountId = assignedAccountInput;
    } else {
      const normalized = assignedAccountInput.toUpperCase();
      const account = await ConsultingOperationnelAccount.findOne({ participantIdNormalized: normalized }).select('_id').lean();
      if (!account?._id) {
        return res.status(404).json({ success: false, message: 'Compte introuvable' });
      }
      accountId = String(account._id);
    }

    const account = await ConsultingOperationnelAccount.findById(accountId)
      .select('_id participantId isActive firstName lastName email entreprise notesAdmin createdAt updatedAt')
      .lean();
    if (!account) return res.status(404).json({ success: false, message: 'Compte introuvable' });

    const examIdInput = String(value.examId || '').trim();
    let exam = null;
    if (examIdInput) {
      exam = await Service2Exam.findById(examIdInput).lean();
    } else {
      exam = await Service2Exam.findOne({ assignedAccountId: accountId }).sort({ createdAt: -1 }).lean();
    }

    if (!exam) return res.status(404).json({ success: false, message: 'Exam introuvable' });
    if (exam.assignedAccountId && String(exam.assignedAccountId) !== String(accountId)) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const submissions = await Service2Submission.find({ examId: exam._id, accountId }).sort({ createdAt: 1 }).lean();
    const actionPlanDoc = await Service2ActionPlan.findOne({ examId: exam._id, accountId }).lean();
    const computedFinal = submissions.length ? buildFinalReportFromSubmissions({ exam, subs: submissions }) : null;
    const existingFinal = await Service2FinalReport.findOne({ examId: exam._id, accountId }).lean();
    const finalVerdict = computedFinal || existingFinal || null;

    const full = await generateService2AccountFullReport({
      exam: toPublicExam(exam),
      account: {
        id: String(account._id),
        participantId: account.participantId,
        isActive: Boolean(account.isActive),
        notesAdmin: String(account.notesAdmin || ''),
        createdAt: account.createdAt,
      },
      submissions: submissions.map((s) => ({
        id: String(s._id),
        taskId: String(s.taskId || 'main'),
        attempt: Number(s.attempt) || 1,
        submissionText: String(s.submissionText || ''),
        aiAnalysis: s.aiAnalysis || null,
        createdAt: s.createdAt,
      })),
      actionPlan: actionPlanDoc ? toPublicActionPlan(actionPlanDoc) : null,
      finalVerdict: finalVerdict || null,
    });

    const updated = await Service2FinalReport.findOneAndUpdate(
      { examId: exam._id, accountId },
      {
        $set: {
          ...(computedFinal || {}),
          aiFullReportText: String(full.reportText || ''),
          aiFullReportRaw: full.raw || null,
          aiFullReportModel: String(full.model || ''),
          aiFullReportGeneratedAt: new Date(),
        },
        $setOnInsert: { examId: exam._id, accountId },
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: { report: updated } });
  } catch (err) {
    if (err?.code === 'MISSING_KEY') {
      return res.status(503).json({ success: false, message: 'IA non configurée: veuillez ajouter SK_API_KEY dans backend/.env puis redémarrer le serveur.' });
    }
    console.error('Service2 admin generate-account-report error:', err);
    return res.status(500).json({ success: false, message: String(err?.message || 'Erreur serveur') });
  }
});

router.delete('/finish-slots/:id', requireExpert, async (req, res) => {
  try {
    const deleted = await Service2FinishSlot.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Slot introuvable' });
    return res.json({ success: true, data: { id: String(deleted._id) } });
  } catch (err) {
    console.error('Service2 delete slot error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// =====================
// Participant endpoints
// =====================

router.get('/my-exam', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const accountId = req.consultingOperationnelAccountId;
    const exam = await Service2Exam.findOne({ assignedAccountId: accountId, isActive: true }).sort({ createdAt: -1 });
    if (!exam) return res.status(404).json({ success: false, message: 'Aucun exam' });
    return res.json({ success: true, data: { exam: toPublicExam(exam) } });
  } catch (err) {
    console.error('Service2 my-exam error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.post('/submit-task', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const { error, value } = submitTaskSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const accountId = req.consultingOperationnelAccountId;
    const exam = await Service2Exam.findById(value.examId);
    if (!exam || !exam.isActive) return res.status(404).json({ success: false, message: 'Exam introuvable' });

    if (exam.assignedAccountId && String(exam.assignedAccountId) !== String(accountId)) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const previousCount = await Service2Submission.countDocuments({
      examId: exam._id,
      accountId,
      taskId: value.taskId,
    });

    const submission = await Service2Submission.create({
      examId: exam._id,
      accountId,
      taskId: value.taskId,
      submissionText: String(value.submissionText || ''),
      attempt: Number(previousCount) + 1,
    });

    return res.status(201).json({ success: true, data: { submissionId: String(submission._id) } });
  } catch (err) {
    console.error('Service2 submit-task error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.post('/analyze-task', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const { error, value } = analyzeTaskSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const accountId = req.consultingOperationnelAccountId;
    const exam = await Service2Exam.findById(value.examId).lean();
    if (!exam || !exam.isActive) return res.status(404).json({ success: false, message: 'Exam introuvable' });

    if (exam.assignedAccountId && String(exam.assignedAccountId) !== String(accountId)) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const task = Array.isArray(exam.tasks) ? exam.tasks.find((t) => String(t?.id) === String(value.taskId)) : null;

    const analysis = await analyzeService2Submission({
      exam,
      task,
      submissionText: String(value.submissionText || ''),
      history: null,
    });

    const submissionId = String(value.submissionId || '').trim();
    let saved = null;

    if (submissionId) {
      saved = await Service2Submission.findOneAndUpdate(
        { _id: submissionId, examId: exam._id, accountId, taskId: value.taskId },
        {
          $set: {
            submissionText: String(value.submissionText || ''),
            aiAnalysis: {
              score: analysis.score,
              summary: analysis.summary,
              warnings: analysis.warnings,
              tips: analysis.tips,
              constraintViolations: analysis.constraintViolations,
              successCriteria: analysis.successCriteria,
              raw: analysis.raw,
              model: analysis.model,
            },
          },
        },
        { new: true }
      );
    }

    if (!saved) {
      const previousCount = await Service2Submission.countDocuments({
        examId: exam._id,
        accountId,
        taskId: value.taskId,
      });

      saved = await Service2Submission.create({
        examId: exam._id,
        accountId,
        taskId: value.taskId,
        submissionText: String(value.submissionText || ''),
        attempt: Number(previousCount) + 1,
        aiAnalysis: {
          score: analysis.score,
          summary: analysis.summary,
          warnings: analysis.warnings,
          tips: analysis.tips,
          constraintViolations: analysis.constraintViolations,
          successCriteria: analysis.successCriteria,
          raw: analysis.raw,
          model: analysis.model,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        analysis: {
          score: analysis.score,
          summary: analysis.summary,
          warnings: analysis.warnings,
          tips: analysis.tips,
          constraintViolations: analysis.constraintViolations,
          successCriteria: analysis.successCriteria,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          recommendations: analysis.recommendations,
        },
        submissionId: String(saved._id),
      },
    });
  } catch (err) {
    if (err?.code === 'MISSING_KEY') {
      return res.status(503).json({ success: false, message: 'IA non configurée: veuillez ajouter SK_API_KEY dans backend/.env puis redémarrer le serveur.' });
    }
    console.error('Service2 analyze-task error:', err);
    return res.status(500).json({ success: false, message: String(err?.message || 'Erreur serveur') });
  }
});

router.post('/generate-final-verdict', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const { error, value } = generateVerdictSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const accountId = req.consultingOperationnelAccountId;
    const exam = await Service2Exam.findById(value.examId).lean();
    if (!exam || !exam.isActive) return res.status(404).json({ success: false, message: 'Exam introuvable' });

    if (exam.assignedAccountId && String(exam.assignedAccountId) !== String(accountId)) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const subs = await Service2Submission.find({ examId: exam._id, accountId }).sort({ createdAt: 1 }).lean();
    if (!subs.length) return res.status(400).json({ success: false, message: 'Aucune soumission' });

    const scores = subs
      .map((s) => Number(s?.aiAnalysis?.score))
      .filter((n) => Number.isFinite(n));

    const globalScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    let constraintViolationsCount = 0;
    for (const s of subs) {
      const arr = Array.isArray(s?.aiAnalysis?.constraintViolations) ? s.aiAnalysis.constraintViolations : [];
      constraintViolationsCount += arr.length;
    }

    const verdict = applyVerdictRules({
      rules: exam.verdictRules,
      score: globalScore,
      constraintViolationsCount,
      submissionsCount: subs.length,
    });

    const strengths = [];
    const weaknesses = [];
    const recommendations = [];

    for (const s of subs) {
      const raw = s?.aiAnalysis?.raw;
      if (raw && typeof raw === 'object') {
        if (Array.isArray(raw.strengths)) strengths.push(...raw.strengths.map(String));
        if (Array.isArray(raw.weaknesses)) weaknesses.push(...raw.weaknesses.map(String));
        if (Array.isArray(raw.recommendations)) recommendations.push(...raw.recommendations.map(String));
      }
    }

    const reportText =
      `Score global: ${globalScore}/100\n` +
      `Violations contraintes: ${constraintViolationsCount}\n` +
      `Statut: ${verdict.status}\n` +
      (verdict.message ? `Message: ${verdict.message}\n` : '');

    const report = await Service2FinalReport.findOneAndUpdate(
      { examId: exam._id, accountId },
      {
        $set: {
          globalScore,
          constraintViolationsCount,
          status: verdict.status,
          message: verdict.message,
          strengths,
          weaknesses,
          recommendations,
          reportText,
          inputs: { ctx: verdict.ctx, submissions: subs.map((s) => ({ id: String(s._id), taskId: s.taskId, score: s.aiAnalysis?.score })) },
        },
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: { report } });
  } catch (err) {
    console.error('Service2 generate-final-verdict error:', err);
    return res.status(500).json({ success: false, message: String(err?.message || 'Erreur serveur') });
  }
});

router.get('/final-report/:examId', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const accountId = req.consultingOperationnelAccountId;
    const examId = String(req.params.examId || '').trim();
    const report = await Service2FinalReport.findOne({ examId, accountId }).lean();
    if (!report) return res.status(404).json({ success: false, message: 'Rapport introuvable' });
    return res.json({ success: true, data: { report } });
  } catch (err) {
    console.error('Service2 final-report error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.get('/finish-slots', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const accountId = req.consultingOperationnelAccountId;
    const slots = await Service2FinishSlot.find({ isActive: true, assignedAccountId: accountId }).sort({ startAt: 1 }).lean();
    return res.json({ success: true, data: { slots } });
  } catch (err) {
    console.error('Service2 finish-slots error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.get('/my-plan', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const accountId = req.consultingOperationnelAccountId;
    const examId = String(req.query.examId || '').trim();
    if (!examId) return res.status(400).json({ success: false, message: 'Données invalides', errors: ['examId requis'] });

    const access = await ensureExamAccess({ examId, accountId });
    if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

    const plan = await Service2ActionPlan.findOne({ examId, accountId }).lean();
    if (!plan) return res.json({ success: true, data: { plan: null } });
    return res.json({ success: true, data: { plan: toPublicActionPlan(plan) } });
  } catch (err) {
    console.error('Service2 my-plan error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.post('/my-plan', requireConsultingOperationnelParticipant, async (req, res) => {
  try {
    const { error, value } = upsertActionPlanSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }

    const accountId = req.consultingOperationnelAccountId;
    const access = await ensureExamAccess({ examId: value.examId, accountId });
    if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

    const existing = await Service2ActionPlan.findOne({ examId: value.examId, accountId });
    const existingTasks = Array.isArray(existing?.tasks) ? existing.tasks : [];

    const byTitle = new Map();
    for (const t of existingTasks) {
      const key = String(t?.title || '').trim().toLowerCase();
      if (key) byTitle.set(key, t);
    }

    const tasks = (value.tasks || []).map((t) => {
      const title = String(t.title);
      const key = title.trim().toLowerCase();
      const prev = byTitle.get(key);

      return {
        title,
        dueAt: t.dueAt ? new Date(t.dueAt) : undefined,
        status: prev?.status || 'todo',
        completedAt: prev?.completedAt,
        aiFeedback: prev?.aiFeedback,
      };
    });

    const plan = await Service2ActionPlan.findOneAndUpdate(
      { examId: value.examId, accountId },
      { $set: { tasks } },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: { plan: toPublicActionPlan(plan) } });
  } catch (err) {
    console.error('Service2 upsert plan error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.post(
  '/my-plan/:planId/tasks/:taskId/analyze',
  requireConsultingOperationnelParticipant,
  planUploadPdf,
  async (req, res) => {
    try {
      const accountId = req.consultingOperationnelAccountId;
      const planId = String(req.params.planId || '').trim();
      const taskId = String(req.params.taskId || '').trim();

      const reportText = String(req.body?.reportText || '').trim();
      if (!reportText) {
        return res.status(400).json({ success: false, message: 'Données invalides', errors: ['reportText requis'] });
      }
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ success: false, message: 'Données invalides', errors: ['pdf requis'] });
      }

      const plan = await Service2ActionPlan.findOne({ _id: planId, accountId });
      if (!plan) return res.status(404).json({ success: false, message: 'Plan introuvable' });

      const access = await ensureExamAccess({ examId: plan.examId, accountId });
      if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

      const task = plan.tasks.id(taskId);
      if (!task) return res.status(404).json({ success: false, message: 'Tâche introuvable' });

      let pdfText = '';
      try {
        const parsed = await pdfParse(req.file.buffer);
        pdfText = String(parsed?.text || '').trim();
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'PDF invalide',
          errors: ['Impossible de lire le PDF (le fichier est peut-être scanné ou protégé)'],
        });
      }

      const combinedSubmission =
        `TASK TITLE:\n${String(task.title || '')}\n\n` +
        `REPORT TEXT:\n${reportText}\n\n` +
        `PDF TEXT (extracted):\n${pdfText.slice(0, 20000)}`;

      const analysis = await analyzeService2Submission({
        exam: { scenarioBrief: 'Analyse Plan d\'action', constraints: [], successCriteria: [] },
        task: { prompt: `Tâche: ${String(task.title || '')}` },
        submissionText: combinedSubmission,
        history: null,
      });

      task.status = 'done';
      task.completedAt = new Date();
      task.aiFeedback = {
        score: analysis.score,
        summary: analysis.summary,
        warnings: analysis.warnings,
        tips: analysis.tips,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        raw: analysis.raw,
        model: analysis.model,
        analyzedAt: new Date(),
      };

      await plan.save();

      return res.json({
        success: true,
        data: {
          task: {
            id: String(task._id),
            title: String(task.title || ''),
            dueAt: task.dueAt ? new Date(task.dueAt).toISOString() : null,
            status: String(task.status || 'todo'),
            completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null,
            aiFeedback: {
              score: analysis.score,
              summary: analysis.summary,
              warnings: analysis.warnings,
              tips: analysis.tips,
              strengths: analysis.strengths,
              weaknesses: analysis.weaknesses,
              recommendations: analysis.recommendations,
            },
          },
        },
      });
    } catch (err) {
      if (err?.code === 'MISSING_KEY') {
        return res
          .status(503)
          .json({ success: false, message: 'IA non configurée: veuillez ajouter SK_API_KEY dans backend/.env puis redémarrer le serveur.' });
      }
      console.error('Service2 analyze plan-task error:', err);
      return res.status(500).json({ success: false, message: String(err?.message || 'Erreur serveur') });
    }
  }
);

export default router;
