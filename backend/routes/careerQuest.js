import express from 'express';
import crypto from 'crypto';
import Joi from 'joi';
import rateLimit from 'express-rate-limit';
import fetch from 'node-fetch';
import dns from 'dns/promises';
import net from 'net';
import multer from 'multer';
import DiagnosticSession from '../models/DiagnosticSession.js';
import CareerQuestProgress from '../models/CareerQuestProgress.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de tentatives, veuillez réessayer plus tard.',
  },
});

const lockMap = new Map();

const normalizeIp = (ip) => {
  const raw = String(ip || '').trim();
  if (!raw) return '';
  if (raw === '::1') return '127.0.0.1';
  return raw.startsWith('::ffff:') ? raw.replace('::ffff:', '') : raw;
};

const normalizeWhitespace = (s) => String(s || '').trim().replace(/\s+/g, ' ');

const normalizeName = (s) =>
  normalizeWhitespace(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const digitsOnly = (s) => String(s || '').replace(/\D+/g, '');

const phoneMatches = (a, b) => {
  const da = digitsOnly(a);
  const db = digitsOnly(b);
  if (!da || !db) return false;
  if (da === db) return true;
  if (da.length >= 8 && db.length >= 8) {
    return da.slice(-8) === db.slice(-8);
  }
  return false;
};

const isService1Completed = (session) => {
  const active = String(session?.subscriptionStatus || 'pending') === 'active';
  const agg = session?.responses?.service1?.phase5?.aggregatedProfile;
  const hasAgg = agg && typeof agg === 'object';
  return active && hasAgg;
};

const schema = Joi.object({
  email: Joi.string().email().required(),
  whatsapp: Joi.string().min(3).required(),
  fullName: Joi.string().min(2).required(),
}).required();

const progressLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 90,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes. Réessayez plus tard.' },
});

const uploadProof = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
});

const hashToken = (token) => crypto.createHash('sha256').update(String(token || '')).digest('hex');

const loadProgressDoc = async ({ sessionId, token }) => {
  const sid = String(sessionId || '').trim();
  const tok = String(token || '').trim();
  if (!sid || !tok) return null;

  const doc = await CareerQuestProgress.findOne({ sessionId: sid });
  if (!doc) return null;
  if (String(doc.tokenHash || '') !== hashToken(tok)) return { forbidden: true };
  return doc;
};

const isPrivateIp = (ip) => {
  const raw = String(ip || '').trim();
  if (!raw) return true;

  const v = net.isIP(raw);
  if (v === 4) {
    const parts = raw.split('.').map((x) => Number(x));
    if (parts.length !== 4 || parts.some((x) => !Number.isFinite(x))) return true;

    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }

  if (v === 6) {
    const lower = raw.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    if (lower.startsWith('fe80:')) return true;
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    if (lower.startsWith('ff')) return true;
    return false;
  }

  return true;
};

const validateUrlForFetch = async (rawUrl) => {
  let u;
  try {
    u = new URL(String(rawUrl || '').trim());
  } catch {
    return { ok: false, reason: 'INVALID_URL' };
  }

  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return { ok: false, reason: 'INVALID_PROTOCOL' };
  }

  const host = String(u.hostname || '').trim();
  if (!host) return { ok: false, reason: 'INVALID_HOST' };

  const hostLower = host.toLowerCase();
  if (hostLower === 'localhost' || hostLower.endsWith('.localhost') || hostLower.endsWith('.local')) {
    return { ok: false, reason: 'BLOCKED_HOST' };
  }

  if (net.isIP(hostLower)) {
    if (isPrivateIp(hostLower)) return { ok: false, reason: 'BLOCKED_IP' };
    return { ok: true, url: u.toString() };
  }

  try {
    const results = await dns.lookup(hostLower, { all: true });
    if (!Array.isArray(results) || results.length === 0) return { ok: false, reason: 'DNS_NOT_FOUND' };
    for (const r of results) {
      const addr = String(r?.address || '').trim();
      if (!addr) return { ok: false, reason: 'DNS_INVALID' };
      if (isPrivateIp(addr)) return { ok: false, reason: 'BLOCKED_DNS_IP' };
    }
  } catch {
    return { ok: false, reason: 'DNS_FAILED' };
  }

  return { ok: true, url: u.toString() };
};

const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...(options || {}), signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const followSafeRedirects = async (startUrl, maxRedirects = 3) => {
  let current = String(startUrl || '').trim();
  const chain = [];

  for (let i = 0; i < maxRedirects; i += 1) {
    const check = await validateUrlForFetch(current);
    if (!check.ok) {
      return { ok: false, reason: check.reason, chain };
    }

    const res = await fetchWithTimeout(check.url, { method: 'HEAD', redirect: 'manual' }, 4500);
    const status = Number(res?.status || 0);
    const location = String(res?.headers?.get('location') || '').trim();
    chain.push({ url: check.url, status, location });

    if ([301, 302, 303, 307, 308].includes(status) && location) {
      const nextUrl = new URL(location, check.url).toString();
      current = nextUrl;
      continue;
    }

    return { ok: true, finalUrl: check.url, head: res, chain };
  }

  return { ok: false, reason: 'TOO_MANY_REDIRECTS', chain };
};

const tryParseJsonObject = (raw) => {
  try {
    if (!raw) return null;
    const s = String(raw);
    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    return JSON.parse(s.slice(start, end + 1));
  } catch {
    return null;
  }
};

const buildHeuristicFeedbackFromText = ({ screenshotText, ocrText, mime, size }) => {
  const merged = `${String(screenshotText || '').trim()}\n${String(ocrText || '').trim()}`.trim();
  const textLen = merged.length;
  const hasDigits = /\d/.test(merged);
  const hasDate = /(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{2,4})/.test(merged);
  const hasLink = /https?:\/\//i.test(merged);

  let score = 45;
  const tips = [];
  const signals = [];

  score += 18;
  if (size > 0) {
    score += 6;
  }
  if (size > 0 && size < 6 * 1024) {
    score -= 3;
    tips.push("Le fichier est très petit. Si le résultat n'est pas lisible, prends un screenshot plus net.");
  }

  if (textLen >= 120) score += 10;
  else tips.push('Ajoute un texte court (quoi, quand, résultat).');
  if (textLen >= 300) score += 8;

  if (hasDigits) score += 6;
  else tips.push('Ajoute un chiffre: quantité, pourcentage, temps, reach, réponses...');

  if (hasDate) score += 5;
  else tips.push('Ajoute une date (jour / semaine) pour contextualiser.');

  if (hasLink) {
    score += 4;
    tips.push('Si possible, ajoute un lien public vers la preuve (optionnel).');
  }

  tips.push('Assure-toi que le screenshot ne contient pas de données sensibles.');

  score = Math.max(0, Math.min(100, Math.round(score)));
  const label = score >= 80 ? 'Strong' : score >= 60 ? 'OK' : 'Weak';

  signals.push({ id: 'imageType', title: 'Image Type', value: mime });
  signals.push({ id: 'imageSize', title: 'Image Size (bytes)', value: String(size || 0) });
  signals.push({ id: 'textLen', title: 'Merged Text Length', value: String(textLen) });
  signals.push({ id: 'hasDigits', title: 'Has Numbers', value: hasDigits ? 'yes' : 'no' });
  signals.push({ id: 'hasDate', title: 'Has Date', value: hasDate ? 'yes' : 'no' });
  signals.push({ id: 'hasLink', title: 'Has Link', value: hasLink ? 'yes' : 'no' });

  return {
    score,
    label,
    tips: Array.from(new Set(tips)).slice(0, 10),
    signals,
    meta: {
      image: { mime, bytes: size },
      textStats: { length: textLen, hasDigits, hasDate, hasLink },
      ocr: { used: Boolean(ocrText), chars: String(ocrText || '').length },
    },
  };
};

const runVisionAnalysisWithOpenAi = async ({ buffer, mime, screenshotText, ocrText, task }) => {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) return { ok: false, reason: 'NO_OPENAI_KEY' };
  const model = String(process.env.CQ_OPENAI_VISION_MODEL || 'gpt-4o-mini').trim();
  const base64 = Buffer.from(buffer).toString('base64');

  const combinedHint = `${String(screenshotText || '').trim()}\n${String(ocrText || '').trim()}`.trim();
  const safeTask = task && typeof task === 'object' ? task : {};
  const taskContext = {
    phaseId: String(safeTask?.phaseId || ''),
    taskId: String(safeTask?.taskId || ''),
    title: String(safeTask?.title || ''),
    objective: String(safeTask?.objective || ''),
    actions: Array.isArray(safeTask?.actions) ? safeTask.actions.map((x) => String(x || '')).slice(0, 12) : [],
  };

  const body = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a strict evaluator for a specific mission proof screenshot. Return JSON only with keys: score (0-100 number), label (Strong|OK|Weak), tips (array of strings), signals (array of {id,title,value}). You MUST tailor the feedback to the mission context. Focus on clarity, measurability, date/context, and proof completeness. Do not include any extra text outside JSON.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'Mission context (JSON):\n' +
              JSON.stringify(taskContext).slice(0, 1800) +
              '\n\nAnalyze this screenshot proof and give actionable feedback tailored to this mission. Use the optional hint text if provided. Hint text (may be empty):\n' +
              combinedHint,
          },
          { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
        ],
      },
    ],
    temperature: 0.2,
  };

  const r = await fetchWithTimeout(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    18000
  );

  const j = await r.json().catch(() => null);
  const raw = j?.choices?.[0]?.message?.content;
  const parsed = tryParseJsonObject(raw);
  if (!parsed || typeof parsed !== 'object') return { ok: false, reason: 'BAD_AI_JSON', raw: String(raw || '') };

  const score = Number(parsed?.score);
  const label = String(parsed?.label || '');
  const tips = Array.isArray(parsed?.tips) ? parsed.tips.map((x) => String(x)).filter(Boolean) : [];
  const signals = Array.isArray(parsed?.signals)
    ? parsed.signals
        .map((s) => ({ id: String(s?.id || ''), title: String(s?.title || ''), value: String(s?.value || '') }))
        .filter((s) => s.id || s.title || s.value)
    : [];

  if (!Number.isFinite(score)) return { ok: false, reason: 'BAD_AI_SCORE' };
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const safeLabel = ['Strong', 'OK', 'Weak'].includes(label) ? label : clamped >= 80 ? 'Strong' : clamped >= 60 ? 'OK' : 'Weak';

  return {
    ok: true,
    data: {
      score: clamped,
      label: safeLabel,
      tips: tips.slice(0, 10),
      signals: signals.slice(0, 10),
    },
  };
};

const runOcrWithOcrSpace = async ({ buffer, mime }) => {
  const apiKey = String(process.env.CQ_OCR_SPACE_KEY || '').trim();
  if (!apiKey) return { ok: false, reason: 'NO_OCR_KEY' };

  const base64 = Buffer.from(buffer).toString('base64');
  const payload = new URLSearchParams();
  payload.set('base64Image', `data:${mime};base64,${base64}`);
  payload.set('language', 'eng');
  payload.set('isOverlayRequired', 'false');

  const r = await fetchWithTimeout(
    'https://api.ocr.space/parse/image',
    {
      method: 'POST',
      headers: {
        apikey: apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    },
    12000
  );

  const j = await r.json().catch(() => null);
  const parsed = Array.isArray(j?.ParsedResults) ? j.ParsedResults[0] : null;
  const text = String(parsed?.ParsedText || '').trim();
  if (!text) return { ok: false, reason: 'NO_TEXT' };
  return { ok: true, text };
};

const runOcrWithOpenAiVision = async ({ buffer, mime }) => {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) return { ok: false, reason: 'NO_OPENAI_KEY' };
  const model = String(process.env.CQ_OPENAI_VISION_MODEL || 'gpt-4o-mini').trim();
  const base64 = Buffer.from(buffer).toString('base64');

  const body = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'You extract (OCR) visible text from a screenshot image. Return only the extracted text. If no text, return empty string.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract the text from this screenshot.' },
          { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
        ],
      },
    ],
    temperature: 0,
  };

  const r = await fetchWithTimeout(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    15000
  );

  const j = await r.json().catch(() => null);
  const text = String(j?.choices?.[0]?.message?.content || '').trim();
  if (!text) return { ok: false, reason: 'NO_TEXT' };
  return { ok: true, text };
};

const runOcr = async ({ buffer, mime }) => {
  const provider = String(process.env.CQ_OCR_PROVIDER || '').trim().toLowerCase();
  if (provider === 'ocrspace') {
    return await runOcrWithOcrSpace({ buffer, mime });
  }
  if (provider === 'openai') {
    return await runOcrWithOpenAiVision({ buffer, mime });
  }
  return { ok: false, reason: 'OCR_NOT_CONFIGURED' };
};

const runAnalysisWithOpenAi = async ({ screenshotText, ocrText, task }) => {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) return { ok: false, reason: 'NO_OPENAI_KEY' };
  const model = String(process.env.CQ_OPENAI_TEXT_MODEL || 'gpt-4o-mini').trim();
  const combined = `${String(screenshotText || '').trim()}\n${String(ocrText || '').trim()}`.trim();

  const safeTask = task && typeof task === 'object' ? task : {};
  const taskContext = {
    phaseId: String(safeTask?.phaseId || ''),
    taskId: String(safeTask?.taskId || ''),
    title: String(safeTask?.title || ''),
    objective: String(safeTask?.objective || ''),
    actions: Array.isArray(safeTask?.actions) ? safeTask.actions.map((x) => String(x || '')).slice(0, 12) : [],
  };

  const prompt = {
    role: 'user',
    content:
      'You are a strict evaluator for a specific mission proof. Use the mission context to tailor feedback. Return a strict JSON object with keys: score (0-100 number), label (Strong|OK|Weak), tips (array of strings), signals (array of {id,title,value}). Focus on clarity, measurability, date/context, and proof completeness. Output JSON only.\n\nMISSION CONTEXT (JSON):\n' +
      JSON.stringify(taskContext).slice(0, 1800) +
      '\n\nTEXT:\n' +
      combined,
  };

  const body = {
    model,
    messages: [{ role: 'system', content: 'Return JSON only.' }, prompt],
    temperature: 0.2,
  };

  const r = await fetchWithTimeout(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    15000
  );

  const j = await r.json().catch(() => null);
  const raw = j?.choices?.[0]?.message?.content;
  const parsed = tryParseJsonObject(raw);
  if (!parsed || typeof parsed !== 'object') return { ok: false, reason: 'BAD_AI_JSON', raw: String(raw || '') };

  const score = Number(parsed?.score);
  const label = String(parsed?.label || '');
  const tips = Array.isArray(parsed?.tips) ? parsed.tips.map((x) => String(x)).filter(Boolean) : [];
  const signals = Array.isArray(parsed?.signals)
    ? parsed.signals
        .map((s) => ({ id: String(s?.id || ''), title: String(s?.title || ''), value: String(s?.value || '') }))
        .filter((s) => s.id || s.title || s.value)
    : [];

  if (!Number.isFinite(score)) return { ok: false, reason: 'BAD_AI_SCORE' };
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const safeLabel = ['Strong', 'OK', 'Weak'].includes(label) ? label : clamped >= 80 ? 'Strong' : clamped >= 60 ? 'OK' : 'Weak';

  return {
    ok: true,
    data: {
      score: clamped,
      label: safeLabel,
      tips: tips.slice(0, 10),
      signals: signals.slice(0, 10),
    },
  };
};

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides' });
    }

    const email = String(value.email || '').trim().toLowerCase();
    const whatsapp = String(value.whatsapp || '').trim();
    const fullName = String(value.fullName || '').trim();

    const ip = normalizeIp(req.ip);
    const lockKey = `${ip}::${email}`;
    const lockState = lockMap.get(lockKey);

    if (lockState?.lockedUntil && Date.now() < lockState.lockedUntil) {
      return res.status(429).json({ success: false, message: 'Trop de tentatives, veuillez réessayer plus tard.' });
    }

    const candidates = await DiagnosticSession.find({ 'participant.email': email })
      .sort({ submittedAt: -1, createdAt: -1 })
      .limit(5);

    let matched = null;
    for (const s of candidates) {
      const dbName = normalizeName(s?.participant?.fullName || s?.participant?.firstName || '');
      const inName = normalizeName(fullName);
      const nameOk = Boolean(dbName) && dbName === inName;
      const phoneOk = phoneMatches(s?.participant?.whatsapp || '', whatsapp);
      if (nameOk && phoneOk) {
        matched = s;
        break;
      }
    }

    if (!matched) {
      const nextFails = Number(lockState?.fails || 0) + 1;
      const shouldLock = nextFails >= 5;
      lockMap.set(lockKey, {
        fails: shouldLock ? 0 : nextFails,
        lockedUntil: shouldLock ? Date.now() + 15 * 60 * 1000 : null,
      });

      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    lockMap.delete(lockKey);

    if (!isService1Completed(matched)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Service 1 non complété.',
        code: 'NOT_ELIGIBLE',
      });
    }

    const aggregatedProfile = matched?.responses?.service1?.phase5?.aggregatedProfile || {};
    const phase5 = matched?.responses?.service1?.phase5 && typeof matched.responses.service1.phase5 === 'object'
      ? matched.responses.service1.phase5
      : {};
    const finalActions = Array.isArray(phase5?.finalActions)
      ? phase5.finalActions
          .map((a) => ({
            id: String(a?.id || '').trim(),
            title: String(a?.title || '').trim(),
            description: String(a?.description || '').trim(),
            pressure: String(a?.pressure || 'medium').trim(),
          }))
          .filter((a) => a.id && a.title && a.description)
          .slice(0, 3)
      : [];
    const selectedFinalAction = phase5?.selectedFinalAction && typeof phase5.selectedFinalAction === 'object'
      ? {
          id: String(phase5.selectedFinalAction?.id || '').trim(),
          title: String(phase5.selectedFinalAction?.title || '').trim(),
          description: String(phase5.selectedFinalAction?.description || '').trim(),
          pressure: String(phase5.selectedFinalAction?.pressure || 'medium').trim(),
          selectedAt: String(phase5.selectedFinalAction?.selectedAt || '').trim(),
        }
      : null;
    const skillGap = phase5?.skillGap && typeof phase5.skillGap === 'object'
      ? {
          skillName: String(phase5.skillGap?.skillName || '').trim(),
          currentLevel: String(phase5.skillGap?.currentLevel || '').trim(),
          requiredLevel: String(phase5.skillGap?.requiredLevel || '').trim(),
          gapDescription: String(phase5.skillGap?.gapDescription || '').trim(),
          microActions: Array.isArray(phase5.skillGap?.microActions)
            ? phase5.skillGap.microActions.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 8)
            : [],
          expertNoteFR: String(phase5.skillGap?.expertNoteFR || '').trim(),
          at: String(phase5.skillGap?.at || '').trim(),
        }
      : null;

    const sessionToken = crypto.randomBytes(24).toString('hex');
    await CareerQuestProgress.findOneAndUpdate(
      { sessionId: matched._id },
      {
        $set: { tokenHash: hashToken(sessionToken) },
        $setOnInsert: { progress: {}, revision: 0 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      data: {
        sessionId: String(matched._id),
        sessionToken,
        profileSnapshot: {
          declaredRole: String(aggregatedProfile?.declaredRole || ''),
          realRole: String(aggregatedProfile?.realRole || ''),
          maturityLevel: String(aggregatedProfile?.maturityLevel || ''),
          weaknesses: Array.isArray(aggregatedProfile?.weaknesses) ? aggregatedProfile.weaknesses : [],
          strengths: Array.isArray(aggregatedProfile?.strengths) ? aggregatedProfile.strengths : [],
          exclusions: Array.isArray(aggregatedProfile?.exclusions) ? aggregatedProfile.exclusions : [],
          selectedPath: aggregatedProfile?.selectedPath || null,
        },
        service1: {
          phase5: {
            finalActions,
            selectedFinalAction,
            skillGap,
          },
        },
      },
    });
  } catch (err) {
    console.error('❌ CareerQuest login error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.get('/progress', progressLimiter, async (req, res) => {
  try {
    const sessionId = String(req.header('x-career-quest-session-id') || '').trim();
    const token = String(req.header('x-career-quest-token') || '').trim();
    const doc = await loadProgressDoc({ sessionId, token });

    if (!doc) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    if (doc?.forbidden) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    return res.json({
      success: true,
      data: {
        progress: doc.progress && typeof doc.progress === 'object' ? doc.progress : {},
        updatedAt: String((doc.progress && typeof doc.progress === 'object' && doc.progress.updatedAt) || ''),
        revision: Number.isFinite(Number(doc.revision)) ? Number(doc.revision) : 0,
      },
    });
  } catch (err) {
    console.error('❌ CareerQuest get progress error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

const progressSchema = Joi.object({
  progress: Joi.object().required(),
  revision: Joi.number().integer().min(0).required(),
}).required();

router.put('/progress', progressLimiter, async (req, res) => {
  try {
    const sessionId = String(req.header('x-career-quest-session-id') || '').trim();
    const token = String(req.header('x-career-quest-token') || '').trim();
    const doc = await loadProgressDoc({ sessionId, token });

    if (!doc) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    if (doc?.forbidden) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { error, value } = progressSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides' });
    }

    const serverRevision = Number.isFinite(Number(doc.revision)) ? Number(doc.revision) : 0;
    const clientRevision = Number(value.revision);
    if (!Number.isFinite(clientRevision)) {
      return res.status(400).json({ success: false, message: 'Données invalides' });
    }

    if (clientRevision !== serverRevision) {
      return res.status(409).json({
        success: false,
        message: 'Conflit de progression (mise à jour depuis un autre appareil).',
        code: 'REVISION_CONFLICT',
        data: {
          progress: doc.progress && typeof doc.progress === 'object' ? doc.progress : {},
          updatedAt: String((doc.progress && typeof doc.progress === 'object' && doc.progress.updatedAt) || ''),
          revision: serverRevision,
        },
      });
    }

    doc.progress = value.progress;
    doc.revision = serverRevision + 1;
    await doc.save();

    return res.json({
      success: true,
      data: {
        updatedAt: String((doc.progress && typeof doc.progress === 'object' && doc.progress.updatedAt) || ''),
        revision: Number.isFinite(Number(doc.revision)) ? Number(doc.revision) : serverRevision + 1,
      },
    });
  } catch (err) {
    console.error('❌ CareerQuest put progress error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

 const proofScoreSchema = Joi.object({
   url: Joi.string().min(8).required(),
 }).required();

 router.post('/proof-score', progressLimiter, async (req, res) => {
   try {
     const sessionId = String(req.header('x-career-quest-session-id') || '').trim();
     const token = String(req.header('x-career-quest-token') || '').trim();
     const doc = await loadProgressDoc({ sessionId, token });
 
     if (!doc) {
       return res.status(401).json({ success: false, message: 'Non autorisé' });
     }
     if (doc?.forbidden) {
       return res.status(403).json({ success: false, message: 'Accès refusé' });
     }
 
     const { error, value } = proofScoreSchema.validate(req.body, { stripUnknown: true });
     if (error) {
       return res.status(400).json({ success: false, message: 'Données invalides' });
     }
 
     const rawUrl = String(value.url || '').trim();
 
     const firstCheck = await validateUrlForFetch(rawUrl);
     if (!firstCheck.ok) {
       return res.status(400).json({ success: false, message: 'Lien invalide ou bloqué', code: firstCheck.reason });
     }
 
     const redirect = await followSafeRedirects(firstCheck.url, 3);
     if (!redirect.ok) {
       return res.status(400).json({ success: false, message: 'Lien invalide ou bloqué', code: redirect.reason });
     }
 
     const headRes = redirect.head;
     const finalUrl = String(redirect.finalUrl || firstCheck.url);
     const status = Number(headRes?.status || 0);
     const contentType = String(headRes?.headers?.get('content-type') || '').toLowerCase();
     const contentLengthRaw = String(headRes?.headers?.get('content-length') || '').trim();
     const contentLength = Number(contentLengthRaw);
 
     const u = new URL(finalUrl);
     const host = String(u.hostname || '').toLowerCase();
     const isShortener = ['bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'shorturl.at', 'rb.gy'].includes(host);
     const isHttps = u.protocol === 'https:';
 
     const tips = [];
     const signals = [];
 
     let score = 50;
 
     if (isHttps) {
       score += 5;
     } else {
       score -= 5;
       tips.push('Utilise un lien https si possible.');
     }
 
     if (isShortener) {
       score -= 25;
       tips.push('Évite les liens raccourcis. Colle le lien original.');
     }
 
     if (!status || status >= 400) {
       score -= 40;
       tips.push("Le lien semble inaccessible (status HTTP). Vérifie qu'il est public.");
     }
 
     if (contentType.includes('text/html')) {
       score += 10;
     } else if (contentType.includes('application/pdf')) {
       score += 10;
     } else if (contentType) {
       score -= 5;
       tips.push("Type de contenu inhabituel. Préfère une page (Notion/Google Doc/LinkedIn) ou un PDF public.");
     }
 
     if (Number.isFinite(contentLength) && contentLength > 0 && contentLength < 600) {
       score -= 10;
       tips.push('Le contenu semble très léger. Ajoute plus de détails (résultat, date, captures).');
     }
 
     if (host.includes('docs.google.com') || host.includes('drive.google.com')) {
       tips.push('Google: active “Anyone with the link can view” (lecture seule).');
       score += 8;
     }
     if (host.includes('notion.so')) {
       tips.push('Notion: partage la page en “Public” et autorise la lecture.');
       score += 8;
     }
     if (host.includes('linkedin.com')) {
       tips.push('LinkedIn: assure-toi que le post/profil est public (pas seulement pour tes contacts).');
       score += 6;
     }
     if (host.includes('github.com')) {
       tips.push('GitHub: inclure README + étapes + résultat (screenshots si possible).');
       score += 8;
     }
 
     score = Math.max(0, Math.min(100, Math.round(score)));
     const label = score >= 80 ? 'Strong' : score >= 60 ? 'OK' : 'Weak';
 
     signals.push({ id: 'status', title: 'HTTP Status', value: String(status || '') });
     signals.push({ id: 'contentType', title: 'Content-Type', value: contentType || '—' });
     signals.push({ id: 'finalHost', title: 'Host', value: host || '—' });
 
     return res.json({
       success: true,
       data: {
         score,
         label,
         tips: Array.from(new Set(tips)).slice(0, 8),
         signals,
         meta: {
           finalUrl,
           status,
           contentType,
           contentLength: Number.isFinite(contentLength) ? contentLength : null,
           redirects: redirect.chain,
         },
       },
     });
   } catch (err) {
     console.error('❌ CareerQuest proof-score error:', err);
     return res.status(500).json({ success: false, message: 'Erreur serveur' });
   }
 });

const proofScoreScreenshotSchema = Joi.object({
  screenshotText: Joi.string().allow('').max(5000).optional(),
  phaseId: Joi.string().allow('').max(64).optional(),
  taskId: Joi.string().allow('').max(120).optional(),
  taskTitle: Joi.string().allow('').max(220).optional(),
  taskObjective: Joi.string().allow('').max(800).optional(),
  taskActions: Joi.string().allow('').max(6000).optional(),
}).required();

router.post('/proof-score-screenshot', progressLimiter, uploadProof.single('image'), async (req, res) => {
  try {
    const sessionId = String(req.header('x-career-quest-session-id') || '').trim();
    const token = String(req.header('x-career-quest-token') || '').trim();
    const doc = await loadProgressDoc({ sessionId, token });

    if (!doc) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    if (doc?.forbidden) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { error, value } = proofScoreScreenshotSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Image requise.' });
    }

    const mime = String(file.mimetype || '').toLowerCase();
    if (!mime.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Format image non supporté.' });
    }

    const size = Number(file.size || 0);
    const screenshotText = String(value?.screenshotText || '').trim();

    const taskActionsRaw = String(value?.taskActions || '').trim();
    const taskActionsParsed = tryParseJsonObject(taskActionsRaw);
    const taskActions = Array.isArray(taskActionsParsed)
      ? taskActionsParsed.map((x) => String(x || '')).filter(Boolean).slice(0, 12)
      : [];
    const task = {
      phaseId: String(value?.phaseId || '').trim(),
      taskId: String(value?.taskId || '').trim(),
      title: String(value?.taskTitle || '').trim(),
      objective: String(value?.taskObjective || '').trim(),
      actions: taskActions,
    };

    let ocrText = '';
    const ocrProvider = String(process.env.CQ_OCR_PROVIDER || '').trim().toLowerCase();
    try {
      const ocr = await runOcr({ buffer: file.buffer, mime });
      if (ocr?.ok && ocr?.text) {
        ocrText = String(ocr.text || '').trim();
      }
    } catch (e) {
      console.error('❌ OCR error:', e);
    }

    let aiData = null;
    let aiEngine = 'none';
    const combinedLen = `${screenshotText}\n${ocrText}`.trim().length;
    if (combinedLen >= 20) {
      try {
        const ai = await runAnalysisWithOpenAi({ screenshotText, ocrText, task });
        if (ai?.ok && ai?.data) {
          aiData = ai.data;
          aiEngine = 'openai_text';
        }
      } catch (e) {
        console.error('❌ AI analysis error:', e);
      }
    }

    if (!aiData) {
      try {
        const vision = await runVisionAnalysisWithOpenAi({
          buffer: file.buffer,
          mime,
          screenshotText,
          ocrText,
          task,
        });
        if (vision?.ok && vision?.data) {
          aiData = vision.data;
          aiEngine = 'openai_vision';
        }
      } catch (e) {
        console.error('❌ AI vision analysis error:', e);
      }
    }

    const heuristic = buildHeuristicFeedbackFromText({ screenshotText, ocrText, mime, size });
    const chosen = aiData
      ? {
          ...heuristic,
          score: Number(aiData.score),
          label: String(aiData.label),
          tips: Array.isArray(aiData.tips) ? aiData.tips : heuristic.tips,
          signals: Array.isArray(aiData.signals) ? aiData.signals : heuristic.signals,
          meta: {
            ...heuristic.meta,
            ai: { used: true, provider: 'openai', engine: aiEngine },
            ocr: { ...(heuristic.meta?.ocr || {}), provider: ocrProvider || 'none' },
            task: {
              phaseId: String(task.phaseId || ''),
              taskId: String(task.taskId || ''),
            },
          },
        }
      : {
          ...heuristic,
          meta: {
            ...heuristic.meta,
            ai: { used: false, engine: 'heuristic' },
            ocr: { ...(heuristic.meta?.ocr || {}), provider: ocrProvider || 'none' },
            task: {
              phaseId: String(task.phaseId || ''),
              taskId: String(task.taskId || ''),
            },
          },
        };

    return res.json({ success: true, data: chosen });
  } catch (err) {
    console.error('❌ CareerQuest proof-score-screenshot error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

const coachSchema = Joi.object({
  phaseId: Joi.string().allow('').max(64).optional(),
  phaseTitle: Joi.string().allow('').max(120).optional(),
  missionId: Joi.string().allow('').max(120).optional(),
  missionTitle: Joi.string().allow('').max(180).optional(),
  missionObjective: Joi.string().allow('').max(500).optional(),
  missionActions: Joi.array().items(Joi.string().max(220)).max(12).optional(),
}).required();

const buildProgressSummary = (progress) => {
  const p = progress && typeof progress === 'object' ? progress : {};
  const completedCount = Array.isArray(p.completedTaskIds) ? p.completedTaskIds.length : 0;
  const proofsObj = p.proofs && typeof p.proofs === 'object' ? p.proofs : {};
  const proofs = Object.entries(proofsObj)
    .map(([taskId, pr]) => ({
      taskId: String(taskId || ''),
      submittedAt: String(pr?.submittedAt || ''),
      aiScore: typeof pr?.aiScore === 'number' ? pr.aiScore : null,
      aiLabel: String(pr?.aiLabel || ''),
      aiTips: Array.isArray(pr?.aiTips) ? pr.aiTips.map((x) => String(x || '')).filter(Boolean).slice(0, 6) : [],
    }))
    .filter((x) => x.taskId)
    .sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')))
    .slice(0, 3);

  return {
    level: Number.isFinite(Number(p.level)) ? Number(p.level) : 1,
    xp: Number.isFinite(Number(p.xp)) ? Number(p.xp) : 0,
    completedCount,
    recentProofs: proofs,
  };
};

const runCoachWithOpenAi = async ({ aggregatedProfile, mission, progressSummary }) => {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) return { ok: false, reason: 'NO_OPENAI_KEY' };
  const model = String(process.env.CQ_OPENAI_TEXT_MODEL || 'gpt-4o-mini').trim();

  const payload = {
    aggregatedProfile: aggregatedProfile || {},
    mission: mission || {},
    progressSummary: progressSummary || {},
  };

  const body = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'Tu es un coach carrière strict et utile. Réponds uniquement en JSON valide, sans aucun texte autour. Langue: français. JSON STRICT: {"cards":[{"id":string,"title":string,"body":string,"items":string[]}],"engine":"openai"}',
      },
      {
        role: 'user',
        content:
          'Contexte (JSON):\n' +
          JSON.stringify(payload).slice(0, 12000) +
          '\n\nObjectif: donner des conseils actionnables pour la mission en cours + améliorer la qualité de la preuve. Donne 3 à 5 cards. Mentionne explicitement 1 risque principal basé sur faiblesses/proofs.',
      },
    ],
    temperature: 0.3,
  };

  const r = await fetchWithTimeout(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    15000
  );

  const j = await r.json().catch(() => null);
  const raw = j?.choices?.[0]?.message?.content;
  const parsed = tryParseJsonObject(raw);
  if (!parsed || typeof parsed !== 'object') return { ok: false, reason: 'BAD_AI_JSON' };

  const cards = Array.isArray(parsed?.cards)
    ? parsed.cards
        .map((c, idx) => ({
          id: String(c?.id || `card_${idx + 1}`),
          title: String(c?.title || '').trim(),
          body: String(c?.body || '').trim(),
          items: Array.isArray(c?.items) ? c.items.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 8) : [],
        }))
        .filter((c) => c.title && c.body)
        .slice(0, 6)
    : [];

  if (!cards.length) return { ok: false, reason: 'EMPTY' };
  return { ok: true, data: { engine: 'openai', cards } };
};

router.post('/coach', progressLimiter, async (req, res) => {
  try {
    const sessionId = String(req.header('x-career-quest-session-id') || '').trim();
    const token = String(req.header('x-career-quest-token') || '').trim();
    const doc = await loadProgressDoc({ sessionId, token });

    if (!doc) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    if (doc?.forbidden) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { error, value } = coachSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: 'Données invalides' });
    }

    const session = await DiagnosticSession.findById(sessionId).select('responses subscriptionStatus');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session introuvable' });
    }
    if (!isService1Completed(session)) {
      return res.status(403).json({ success: false, message: 'Accès refusé. Service 1 non complété.' });
    }

    const aggregatedProfile = session?.responses?.service1?.phase5?.aggregatedProfile || {};
    const progressSummary = buildProgressSummary(doc.progress);

    const mission = {
      phaseId: String(value?.phaseId || ''),
      phaseTitle: String(value?.phaseTitle || ''),
      missionId: String(value?.missionId || ''),
      missionTitle: String(value?.missionTitle || ''),
      missionObjective: String(value?.missionObjective || ''),
      missionActions: Array.isArray(value?.missionActions) ? value.missionActions.map(String).slice(0, 12) : [],
    };

    const ai = await runCoachWithOpenAi({ aggregatedProfile, mission, progressSummary });
    if (ai?.ok && ai?.data) {
      return res.json({
        success: true,
        data: {
          ...ai.data,
          meta: { ai: { used: true, engine: 'openai_text' } },
        },
      });
    }

    const weaknessList = Array.isArray(aggregatedProfile?.weaknesses) ? aggregatedProfile.weaknesses : [];
    const tips = [
      'Travaille une seule mission à la fois: preuve → validation → XP.',
      'Transforme la mission en plan simple: objectif → étapes → risques → KPI.',
      'Ta preuve doit montrer: date + action + résultat mesurable.',
    ];
    if (weaknessList.some((w) => String(w).toLowerCase().includes('communication'))) {
      tips.push('Simplifie ton message: 5 lignes max + 1 question claire.');
    }
    if (Array.isArray(progressSummary?.recentProofs) && progressSummary.recentProofs[0]?.aiScore != null) {
      tips.push(`Dernier score proof: ${progressSummary.recentProofs[0].aiScore}/100 — améliore 1 point seulement puis re-soumettre.`);
    }

    return res.json({
      success: true,
      data: {
        engine: 'fallback',
        cards: [
          {
            id: 'focus',
            title: 'Focus du moment',
            body: `Phase: ${mission.phaseTitle || '—'} · Mission: ${mission.missionTitle || '—'}`,
            items: tips.slice(0, 4),
          },
          {
            id: 'proof',
            title: 'Proof Quality',
            body: 'Une preuve solide = plus de crédibilité + progression stable.',
            items: ['Screenshot lisible', 'Date claire', 'Résultat mesurable', 'Contexte 2-3 lignes'],
          },
        ],
        meta: { ai: { used: false, engine: 'fallback' } },
      },
    });
  } catch (err) {
    console.error('❌ CareerQuest coach error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
