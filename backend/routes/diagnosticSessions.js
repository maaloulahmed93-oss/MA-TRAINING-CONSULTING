import express from 'express';
import Joi from 'joi';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fetch from 'node-fetch';
import DiagnosticSession from '../models/DiagnosticSession.js';
import DiagnosticQuestion from '../models/DiagnosticQuestion.js';
import requireExpert from '../middleware/requireExpert.js';
import uploadSupabase from '../middlewares/uploadSupabase.js';
import { uploadToSupabase } from '../utils/supabaseStorage.js';

const router = express.Router();

const normalizeIp = (ip) => {
  const raw = String(ip || '').trim();
  if (!raw) return '';
  if (raw === '::1') return '127.0.0.1';
  return raw.startsWith('::ffff:') ? raw.replace('::ffff:', '') : raw;
};

 const detectPreferredLanguage = () => 'fr';

 const normalizeLanguage = () => 'fr';

 const getService1Lang = () => 'fr';

 const setService1LangFromText = ({ service1Obj }) => {
   service1Obj.language = 'fr';
   return 'fr';
 };

 const t = (_lang, fr) => fr;

const loadAuthorizedActiveSessionByEmail = async (req, email) => {
  const safeEmail = String(email || '').trim().toLowerCase();
  if (!safeEmail) return null;

  const ipRaw = String(req.ip || '').trim();
  const ipNorm = normalizeIp(ipRaw);
  const ipCandidates = Array.from(new Set([ipRaw, ipNorm].filter(Boolean)));

  const session = await DiagnosticSession.findOne({ 'participant.email': safeEmail })
    .sort({ submittedAt: -1, createdAt: -1 });

  if (!session) return null;

  const sessionIp = normalizeIp(String(session?.metadata?.ip || ''));
  if (!sessionIp || !ipCandidates.includes(sessionIp)) {
    return { forbidden: true };
  }

  const isActive = String(session.subscriptionStatus || 'pending') === 'active';
  if (!isActive) {
    return { inactive: true };
  }

  return session;
};

const safeJsonParse = (txt) => {
  try {
    return JSON.parse(String(txt || ''));
  } catch {
    try {
      const s = String(txt || '');
      const fenced = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (fenced?.[1]) {
        try {
          return JSON.parse(fenced[1]);
        } catch {}
      }
      const start = s.indexOf('{');
      const end = s.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(s.slice(start, end + 1));
      }
    } catch {}
    return null;
  }
};

const normalizePhase0Question = (parsed) => {
  const q = {
    id: String(parsed?.id || `q_${Date.now()}_${Math.random().toString(16).slice(2)}`),
    question: String(parsed?.question || '').trim(),
    options: Array.isArray(parsed?.options)
      ? parsed.options
          .map((o) => ({ key: String(o?.key || '').trim().toUpperCase(), text: String(o?.text || '').trim() }))
          .filter((o) => ['A', 'B', 'C', 'D'].includes(o.key) && o.text)
      : [],
  };
  return q;
};

const buildFallbackPhase0Question = ({ step, profile }) => {
  const role = String(profile?.currentRole || 'votre domaine').trim() || 'votre domaine';
  const exp = Number(profile?.experience || 0) || 0;
  const id = `fallback_${step}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  if (step <= 1) {
    return {
      id,
      question: `Comment vous présentez-vous en tant que professionnel dans ${role} ? (environ ${exp} ans d'expérience)`,
      options: [
        { key: 'A', text: 'Je mets en avant les résultats et l’impact avec des chiffres et des exemples.' },
        { key: 'B', text: 'Je mets en avant les compétences et outils techniques que je maîtrise.' },
        { key: 'C', text: 'Je mets en avant les projets et secteurs sur lesquels j’ai travaillé.' },
        { key: 'D', text: 'Je mets en avant les rôles de leadership, coordination et travail en équipe.' },
      ],
    };
  }

  if (step === 2) {
    return {
      id,
      question: 'Quelle est la nature des tâches quotidiennes les plus fréquentes dans votre travail actuel / le plus récent ?',
      options: [
        { key: 'A', text: 'Exécution opérationnelle / production au quotidien.' },
        { key: 'B', text: 'Planification, organisation et suivi (planning & coordination).' },
        { key: 'C', text: 'Analyse, recherche, rédaction et production de contenus / rapports.' },
        { key: 'D', text: 'Communication client, négociation et gestion des parties prenantes.' },
      ],
    };
  }

  if (step === 3) {
    return {
      id,
      question: 'Comment évaluez-vous votre niveau d’autonomie dans la prise de décision au travail ?',
      options: [
        { key: 'A', text: 'Je travaille avec des consignes claires et une validation fréquente.' },
        { key: 'B', text: 'Je propose des solutions, mais la décision finale n’est généralement pas la mienne.' },
        { key: 'C', text: 'J’ai une forte marge de décision et je pilote l’exécution.' },
        { key: 'D', text: 'Je définis les orientations et je valide les décisions.' },
      ],
    };
  }

  if (step === 4) {
    return {
      id,
      question: 'Quel type de rôle souhaitez-vous incarner professionnellement au cours des 12 prochains mois ?',
      options: [
        { key: 'A', text: 'Expert / spécialiste (IC) sur un domaine précis.' },
        { key: 'B', text: 'Leader d’équipe / coordinateur.' },
        { key: 'C', text: 'Consultant / freelance.' },
        { key: 'D', text: 'Manager / responsable d’un périmètre complet.' },
      ],
    };
  }

  return {
    id,
    question: 'Quel est votre principal défi professionnel actuel que vous souhaitez résoudre via ce diagnostic ?',
    options: [
      { key: 'A', text: 'Définir clairement le bon positionnement / rôle.' },
      { key: 'B', text: 'Améliorer la présentation professionnelle (CV / LinkedIn / Portfolio).' },
      { key: 'C', text: 'Monter en compétences pour réussir une transition.' },
      { key: 'D', text: 'Obtenir des opportunités (entretiens / clients / missions).' },
    ],
  };
};

const generatePhase0QuestionWithRetry = async ({ profile, compactHistory, isFirst, lang = 'fr' }) => {
  const l = normalizeLanguage(lang);
  const baseSystem =
    'Tu es un système d’entretien professionnel adaptatif. Retourne uniquement du JSON valide, sans aucun texte autour. Clés: id, question, options. options est un tableau EXACTEMENT de 4 éléments; chaque élément: {key:"A"|"B"|"C"|"D", text:"..."}. Écris en français et focalise sur: le positionnement, les rôles, la nature des tâches quotidiennes, et la manière dont le participant se présente.';

  const userContent = isFirst
    ? `Données initiales (JSON):\n${JSON.stringify(profile)}\n\nIl n’y a pas encore de réponses. Pose la première question.`
    : `Données initiales (JSON):\n${JSON.stringify(profile)}\n\nHistorique questions/réponses (JSON):\n${JSON.stringify(compactHistory)}\n\nPose la question suivante.`;

  const attempt = async (strict) => {
    const system = strict
      ? `${baseSystem} Très important: options doit contenir EXACTEMENT 4 éléments (A,B,C,D) et le JSON doit être valide.`
      : baseSystem;
    const aiText = await callAIChat({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userContent },
      ],
      temperature: 0.35,
    });
    const parsed = safeJsonParse(aiText) || {};
    return normalizePhase0Question(parsed);
  };

  const q1 = await attempt(false);
  if (q1.question && q1.options.length === 4) return q1;

  const q2 = await attempt(true);
  if (q2.question && q2.options.length === 4) return q2;

  // Fallback: always return a valid question to keep UX flowing
  const step = (Array.isArray(compactHistory) ? compactHistory.length : 0) + 1;
  return buildFallbackPhase0Question({ step, profile });
};

const callOpenAIChat = async ({ messages, temperature = 0.2 }) => {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) {
    const err = new Error('AI non configuré');
    err.code = 'MISSING_KEY';
    throw err;
  }

  const url = String(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '') + '/chat/completions';
  const model = String(process.env.OPENAI_MODEL || 'gpt-3.5-turbo');

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  const json = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = json?.error?.message || json?.message || `AI error (${r.status})`;
    const err = new Error(msg);
    err.status = r.status;
    throw err;
  }

  const content = json?.choices?.[0]?.message?.content;
  return String(content || '');
};

const callDeepSeekChat = async ({ messages, temperature = 0.2 }) => {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY_SERVICE1 || '';
  if (!apiKey) {
    const err = new Error('AI non configuré');
    err.code = 'MISSING_KEY';
    throw err;
  }

  const base = String(process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/+$/, '');
  const url = `${base}/chat/completions`;

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages,
      temperature,
    }),
  });

  const json = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = json?.error?.message || json?.message || `AI error (${r.status})`;
    const err = new Error(msg);
    err.status = r.status;
    throw err;
  }

  const content = json?.choices?.[0]?.message?.content;
  return String(content || '');
};

const callAIChat = async ({ messages, temperature = 0.2 }) => {
  const hasOpenAI = String(process.env.OPENAI_API_KEY || '').trim();
  if (hasOpenAI) {
    return callOpenAIChat({ messages, temperature });
  }
  return callDeepSeekChat({ messages, temperature });
};

const generatePhase0CadrageNote = async ({ profile, initialObservation, history }) => {
  const system =
    'Tu es un consultant senior en orientation professionnelle. Tu dois produire une Note de Cadrage utile, structurée et actionnable. Réponds uniquement en français. Format: Markdown. Ne mentionne pas que tu es une IA.';

  const qa = (Array.isArray(history) ? history : []).map((h, idx) => {
    const q = String(h?.question?.question || '').trim();
    const a = String(h?.answerText || '').trim();
    const k = String(h?.selectedKey || '').trim();
    return `Q${idx + 1}: ${q}\nR${idx + 1}: (${k}) ${a}`;
  });

  const user =
    `Analyse CV (JSON):\n${JSON.stringify(profile || {})}\n\n` +
    `Observation initiale (peut être en arabe):\n${String(initialObservation || '').trim()}\n\n` +
    `Entretien (Q/R):\n${qa.join('\n\n')}\n\n` +
    'Génère une "Note de Cadrage" contenant exactement ces sections (titres en français):\n' +
    '1) Qui êtes-vous (résumé de profil)\n' +
    '2) Comment vous vous présentez (synthèse entretien)\n' +
    '3) La Gap (cohérence entre réalité et récit)\n' +
    '4) Contraintes actuelles (Constraints)\n' +
    '5) Hypothèses + prochaines étapes (3 à 6 puces)';

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.35,
  });

  const out = String(txt || '').trim();
  if (!out || out.length < 80) {
    const err = new Error('Empty cadrage note');
    err.code = 'EMPTY_CADRAGE_NOTE';
    throw err;
  }
  return out;
};

const normalizePhase3Paths = (parsed) => {
  const p = parsed && typeof parsed === 'object' ? parsed : {};
  const paths = Array.isArray(p.paths) ? p.paths : [];
  const out = paths
    .map((x, idx) => {
      const xx = x && typeof x === 'object' ? x : {};
      const id = String(xx.id || `path_${idx + 1}`).trim();
      const typeRaw = String(xx.type || '').trim().toLowerCase();
      const type = typeRaw === 'skills' || typeRaw === 'experience' || typeRaw === 'mentoring' ? typeRaw : '';
      const title = String(xx.title || '').trim();
      const description = String(xx.description || '').trim();
      const successProbabilityNum = Number(xx.successProbability);
      const successProbability = Number.isFinite(successProbabilityNum)
        ? Math.max(0, Math.min(100, Math.round(successProbabilityNum)))
        : null;
      const rationale = String(xx.rationale || '').trim();
      return { id, type, title, description, successProbability, rationale };
    })
    .filter((x) => Boolean(x.id) && Boolean(x.title) && Boolean(x.description) && x.successProbability !== null);

  const uniq = [];
  const seen = new Set();
  for (const x of out) {
    if (seen.has(x.id)) continue;
    seen.add(x.id);
    uniq.push(x);
  }

  return uniq.length >= 3 ? uniq.slice(0, 3) : uniq;
};

const generatePhase3GrowthPaths = async ({ profile, phase2ReportMarkdown }) => {
  const system =
    'Tu es un consultant senior en développement de carrière. Réponds uniquement en JSON valide, sans aucun texte autour.';
  const user =
    `CV_Data (JSON):\n${JSON.stringify(profile || {})}\n\n` +
    `Phase2_Analyse_Strategique (Markdown):\n${String(phase2ReportMarkdown || '').slice(0, 8000)}\n\n` +
    'Génère exactement 3 Growth Paths adaptés aux faiblesses et au niveau actuel.\n' +
    'Paths obligatoires: \n' +
    '- A: Skills Path (type="skills") focus outils/langages/compétences\n' +
    '- B: Experience Path (type="experience") focus rôles exécutifs terrain\n' +
    '- C: Mentoring Path (type="mentoring") focus accompagnement/mentor/savoir-être\n' +
    'Chaque path: id, type, title, description, successProbability (0-100), rationale.\n' +
    'Format JSON STRICT: {"paths":[...]}';

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.35,
  });

  const parsed = safeJsonParse(txt) || {};
  const paths = normalizePhase3Paths(parsed);
  if (!Array.isArray(paths) || paths.length !== 3) {
    const err = new Error('Invalid phase3 paths');
    err.code = 'INVALID_PHASE3_PATHS';
    throw err;
  }
  return paths;
};

const normalizePhase4Plan = (parsed) => {
  const p = parsed && typeof parsed === 'object' ? parsed : {};
  const notePositionnementMarkdown = String(p.notePositionnementMarkdown || '').trim();
  const planningMarkdown = String(p.planningMarkdown || '').trim();

  const roadmap = p.roadmap && typeof p.roadmap === 'object' ? p.roadmap : {};
  const months = Array.isArray(roadmap.months) ? roadmap.months : [];
  const normalizedMonths = months
    .map((m) => {
      const mm = m && typeof m === 'object' ? m : {};
      const monthNum = Number(mm.month);
      const month = Number.isFinite(monthNum) ? Math.max(1, Math.min(3, Math.round(monthNum))) : null;
      const title = String(mm.title || '').trim();
      const checklistRaw = Array.isArray(mm.checklist) ? mm.checklist : [];
      const checklist = checklistRaw
        .map((t, idx) => {
          const tt = t && typeof t === 'object' ? t : {};
          const id = String(tt.id || `m${month || 0}_${idx + 1}`).trim();
          const text = String(tt.text || '').trim();
          return { id, text, done: Boolean(tt.done) };
        })
        .filter((t) => Boolean(t.id) && Boolean(t.text));

      return { month, title, checklist };
    })
    .filter((m) => m.month && m.checklist.length > 0);

  const monthMap = new Map();
  for (const m of normalizedMonths) {
    if (!monthMap.has(m.month)) monthMap.set(m.month, m);
  }

  const finalMonths = [1, 2, 3].map((n) => monthMap.get(n)).filter(Boolean);

  return {
    notePositionnementMarkdown,
    planningMarkdown,
    roadmap: { months: finalMonths },
  };
};

const generatePhase4PlanDocs = async ({ profile, phase2ReportMarkdown, selectedPath }) => {
  const system =
    'Tu es un consultant senior. Réponds uniquement en JSON valide, sans aucun texte autour. Les documents doivent être en français.';

  const user =
    `CV_Data (JSON):\n${JSON.stringify(profile || {})}\n\n` +
    `Phase2_Analyse_Strategique (Markdown):\n${String(phase2ReportMarkdown || '').slice(0, 8000)}\n\n` +
    `Selected_Growth_Path (JSON):\n${JSON.stringify(selectedPath || {})}\n\n` +
    'Transforme le path choisi en plan d\'action sur 3 mois.\n' +
    'Tu dois produire JSON STRICT avec: \n' +
    '- notePositionnementMarkdown (Markdown) : "vous êtes ici -> vous allez là"\n' +
    '- planningMarkdown (Markdown) : document de planning détaillé\n' +
    '- roadmap: { months: [ {month:1,title:string,checklist:[{id:string,text:string}]} , {month:2,...}, {month:3,...} ] }\n' +
    'Checklist: tâches concrètes, actionnables, 6 à 12 par mois.\n' +
    'Format JSON STRICT.';

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.35,
  });

  const parsed = safeJsonParse(txt) || {};
  const normalized = normalizePhase4Plan(parsed);
  const months = Array.isArray(normalized?.roadmap?.months) ? normalized.roadmap.months : [];
  if (!String(normalized.notePositionnementMarkdown || '').trim() || !String(normalized.planningMarkdown || '').trim() || months.length !== 3) {
    const err = new Error('Invalid phase4 plan');
    err.code = 'INVALID_PHASE4_PLAN';
    throw err;
  }
  return normalized;
};

const normalizePhase5AggregatedProfile = (parsed) => {
  const p = parsed && typeof parsed === 'object' ? parsed : {};
  const realRole = String(p.realRole || '').trim();
  const declaredRole = String(p.declaredRole || '').trim();
  const maturityLevel = String(p.maturityLevel || '').trim();
  const weaknesses = Array.isArray(p.weaknesses) ? p.weaknesses.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 12) : [];
  const strengths = Array.isArray(p.strengths) ? p.strengths.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 12) : [];
  const exclusions = Array.isArray(p.exclusions) ? p.exclusions.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 12) : [];

  const selectedPath = p.selectedPath && typeof p.selectedPath === 'object'
    ? {
        id: String(p.selectedPath.id || '').trim(),
        type: String(p.selectedPath.type || '').trim(),
        title: String(p.selectedPath.title || '').trim(),
      }
    : null;

  const roadmap = p.roadmap && typeof p.roadmap === 'object' ? p.roadmap : null;

  return {
    declaredRole,
    realRole,
    maturityLevel,
    weaknesses,
    strengths,
    exclusions,
    selectedPath,
    roadmap,
  };
};

const extractPhase5AggregatedProfile = async ({
  profile,
  phase1Analysis,
  phase1ReportMarkdown,
  phase2ReportMarkdown,
  phase3SelectedPath,
  phase4,
}) => {
  const system =
    'Tu es un système d\'extraction. Réponds uniquement en JSON valide, sans texte autour. Si une information est inconnue, retourne une valeur vide.';

  const user =
    `CV_Data (JSON):\n${JSON.stringify(profile || {})}\n\n` +
    `Phase1_Analysis (JSON):\n${JSON.stringify(phase1Analysis || {})}\n\n` +
    `Phase1_Report (Markdown):\n${String(phase1ReportMarkdown || '').slice(0, 8000)}\n\n` +
    `Phase2_Report (Markdown):\n${String(phase2ReportMarkdown || '').slice(0, 12000)}\n\n` +
    `Phase3_SelectedPath (JSON):\n${JSON.stringify(phase3SelectedPath || {})}\n\n` +
    `Phase4 (JSON):\n${JSON.stringify(phase4 || {})}\n\n` +
    'Extrait et retourne le JSON STRICT suivant:\n' +
    '{"declaredRole":string,"realRole":string,"maturityLevel":string,"weaknesses":string[],"strengths":string[],"exclusions":string[],"selectedPath":{"id":string,"type":string,"title":string},"roadmap":{"months":[{"month":1|2|3,"title":string,"checklist":[{"id":string,"text":string,"done":boolean}]}]}}\n' +
    'Règles: weaknesses/strengths/exclusions en FR (puces courtes), maturityLevel doit être: faible/moyen/élevé.';

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
  });

  const parsed = safeJsonParse(txt) || {};
  const normalized = normalizePhase5AggregatedProfile(parsed);

  const mergedSelected = phase3SelectedPath && typeof phase3SelectedPath === 'object'
    ? {
        id: String(phase3SelectedPath.id || normalized?.selectedPath?.id || '').trim(),
        type: String(phase3SelectedPath.type || normalized?.selectedPath?.type || '').trim(),
        title: String(phase3SelectedPath.title || normalized?.selectedPath?.title || '').trim(),
      }
    : normalized.selectedPath;

  const roadmap = (phase4?.roadmap && typeof phase4.roadmap === 'object') ? phase4.roadmap : normalized.roadmap;

  return {
    ...normalized,
    declaredRole: String(normalized.declaredRole || phase1Analysis?.claimedRole || '').trim(),
    realRole: String(normalized.realRole || phase1Analysis?.realRole || '').trim(),
    selectedPath: mergedSelected,
    roadmap,
  };
};

const generatePhase5FinalActions = async ({ aggregatedProfile }) => {
  const system =
    'Tu es un évaluateur strict. Réponds uniquement en JSON valide, sans aucun texte autour. Langue: français.';
  const user =
    `AggregatedProfile (JSON):\n${JSON.stringify(aggregatedProfile || {})}\n\n` +
    'Génère EXACTEMENT 3 Final Actions réalistes et exigeantes, liées au path choisi.\n' +
    'JSON STRICT: {"actions":[{"id":string,"title":string,"description":string,"pressure":"low|medium|high"}]}' ;

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.3,
  });
  const parsed = safeJsonParse(txt) || {};
  const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
  const normalized = actions
    .map((a, idx) => {
      const aa = a && typeof a === 'object' ? a : {};
      const id = String(aa.id || `action_${idx + 1}`).trim();
      const title = String(aa.title || '').trim();
      const description = String(aa.description || '').trim();
      const pressureRaw = String(aa.pressure || '').trim().toLowerCase();
      const pressure = pressureRaw === 'low' || pressureRaw === 'high' ? pressureRaw : 'medium';
      return { id, title, description, pressure };
    })
    .filter((a) => a.id && a.title && a.description)
    .slice(0, 3);

  if (normalized.length === 3) return normalized;
  return [
    {
      id: 'action_crisis_client',
      title: 'Client mécontent menaçant de résilier',
      description: 'En réunion d’urgence, le client annonce qu’il se retire sous 48h à cause de la qualité. Quelle est votre stratégie immédiate ?',
      pressure: 'high',
    },
    {
      id: 'action_delivery_under_pressure',
      title: 'Livraison critique sous pression',
      description: 'Incident en production, deadline aujourd’hui. Comment diagnostiquer, corriger et sécuriser le système ?',
      pressure: 'high',
    },
    {
      id: 'action_team_coordination',
      title: 'Coordination d’une petite équipe pour sauver un projet',
      description: 'Équipe dispersée, décisions contradictoires. Quelle organisation, quel plan de communication et quel plan de la semaine ?',
      pressure: 'medium',
    },
  ];
};

const generatePhase5SkillGap = async ({ aggregatedProfile, selectedAction }) => {
  const system =
    'Tu es un évaluateur strict. Réponds uniquement en JSON valide, sans aucun texte autour. Langue: français.';
  const user =
    `AggregatedProfile (JSON):\n${JSON.stringify(aggregatedProfile || {})}\n\n` +
    `SelectedAction (JSON):\n${JSON.stringify(selectedAction || {})}\n\n` +
    'Identifie le Skill Gap principal (le plus risqué) qui empêche de réussir l’action.\n' +
    'JSON STRICT: {"skillName":string,"currentLevel":string,"requiredLevel":string,"gapDescription":string,"microActions":string[],"expertNoteFR":string}';

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.25,
  });
  const parsed = safeJsonParse(txt) || {};
  const microActions = Array.isArray(parsed.microActions)
    ? parsed.microActions.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 8)
    : [];
  return {
    skillName: String(parsed.skillName || '').trim(),
    currentLevel: String(parsed.currentLevel || '').trim(),
    requiredLevel: String(parsed.requiredLevel || '').trim(),
    gapDescription: String(parsed.gapDescription || '').trim(),
    microActions,
    expertNoteFR: String(parsed.expertNoteFR || '').trim(),
  };
};

const generatePhase5GrandScenario = async ({ aggregatedProfile, selectedAction, skillGap }) => {
  const system =
    'Tu es un intervieweur strict lors d’une simulation finale. Interdit de flatter. Objectif: tester le réalisme et la capacité. Réponds uniquement en français.';
  const user =
    `AggregatedProfile (JSON):\n${JSON.stringify(aggregatedProfile || {})}\n\n` +
    `SelectedAction (JSON):\n${JSON.stringify(selectedAction || {})}\n\n` +
    `SkillGap (JSON):\n${JSON.stringify(skillGap || {})}\n\n` +
    'Écris un scénario professionnel réaliste, exigeant et multi-étapes.\n' +
    'Contraintes: pression temporelle + risque clair + parties prenantes en tension + demande d’un plan étape par étape.\n' +
    'À la fin, pose une seule question claire: "Écris ton plan étape par étape maintenant".';

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.35,
  });
  return String(txt || '').trim();
};

const evaluatePhase5GrandAnswer = async ({ aggregatedProfile, selectedAction, skillGap, scenarioText, answerText }) => {
  const system =
    'Tu es un intervieweur strict. Évalue sur preuves. Sans flatterie. Réponds uniquement en JSON valide, sans aucun texte autour.';
  const user =
    `AggregatedProfile (JSON):\n${JSON.stringify(aggregatedProfile || {})}\n\n` +
    `SelectedAction (JSON):\n${JSON.stringify(selectedAction || {})}\n\n` +
    `SkillGap (JSON):\n${JSON.stringify(skillGap || {})}\n\n` +
    `GrandScenario (français):\n${String(scenarioText || '').slice(0, 8000)}\n\n` +
    `Réponse utilisateur (français):\n${String(answerText || '').slice(0, 8000)}\n\n` +
    'Évalue selon: réalisme, méthodologie, gestion des risques, communication, adéquation au niveau.\n' +
    'JSON STRICT: {"score":0-100,"verdict":string,"good":string[],"bad":string[],"finalAdvice":string[],"handoverUserMarkdown":string,"handoverExpertFR":string}';

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.25,
  });
  const parsed = safeJsonParse(txt) || {};
  return {
    score: Number.isFinite(Number(parsed.score)) ? Math.max(0, Math.min(100, Math.round(Number(parsed.score)))) : 0,
    verdict: String(parsed.verdict || '').trim(),
    good: Array.isArray(parsed.good) ? parsed.good.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 10) : [],
    bad: Array.isArray(parsed.bad) ? parsed.bad.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 10) : [],
    finalAdvice: Array.isArray(parsed.finalAdvice) ? parsed.finalAdvice.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 12) : [],
    handoverUserMarkdown: String(parsed.handoverUserMarkdown || '').trim(),
    handoverExpertFR: String(parsed.handoverExpertFR || '').trim(),
  };
};

const generateService1ExpertDossierFR = async ({ phase0, phase1, phase2, phase3, phase4, phase5 }) => {
  const p0 = phase0 && typeof phase0 === 'object' ? phase0 : {};
  const p1 = phase1 && typeof phase1 === 'object' ? phase1 : {};
  const p2 = phase2 && typeof phase2 === 'object' ? phase2 : {};
  const p3 = phase3 && typeof phase3 === 'object' ? phase3 : {};
  const p4 = phase4 && typeof phase4 === 'object' ? phase4 : {};
  const p5 = phase5 && typeof phase5 === 'object' ? phase5 : {};

  const system =
    'Tu es un expert senior (recrutement, carrière, évaluation). Réponds uniquement en français. Format: Markdown. Ne mentionne jamais que tu es une IA. Objectif: préparer un expert humain à une session de 45 minutes. Sois précis, factuel, et directement actionnable.';

  const user =
    "Tu vas recevoir des données brutes (JSON + Markdown) des phases 0 à 5. Tu dois produire un DOSSIER EXPERT COMPLET.\n" +
    "Contraintes:\n" +
    "- Ne copie pas les JSON bruts.\n" +
    "- Sors uniquement l'essentiel.\n" +
    "- Si une donnée manque, dis \"Information non disponible\".\n" +
    "- Structure EXACTE avec ces titres:\n" +
    "1) Résumé exécutif\n" +
    "2) Profil & Contexte\n" +
    "3) Synthèse par phase (0→5)\n" +
    "4) Risques / incohérences probables\n" +
    "5) Questions de clarification (10)\n" +
    "6) Plan de session expert (45 minutes)\n" +
    "7) Recommandations immédiates (7 jours)\n\n" +
    `Phase0_Profile_JSON:\n${JSON.stringify(p0.profile || {}).slice(0, 8000)}\n\n` +
    `Phase0_CadrageNote:\n${String(p0.cadrageNote || '').slice(0, 8000)}\n\n` +
    `Phase1_Report_Markdown:\n${String(p1.reportMarkdown || '').slice(0, 9000)}\n\n` +
    `Phase2_Report_Markdown:\n${String(p2.reportMarkdown || '').slice(0, 9000)}\n\n` +
    `Phase3_SelectedGrowthPath_JSON:\n${JSON.stringify(p3.selectedGrowthPath || {}).slice(0, 7000)}\n\n` +
    `Phase4_NotePositionnement:\n${String(p4.notePositionnementMarkdown || '').slice(0, 9000)}\n\n` +
    `Phase4_Planning:\n${String(p4.planningMarkdown || '').slice(0, 9000)}\n\n` +
    `Phase5_AggregatedProfile_JSON:\n${JSON.stringify(p5.aggregatedProfile || {}).slice(0, 7000)}\n\n` +
    `Phase5_SelectedFinalAction_JSON:\n${JSON.stringify(p5.selectedFinalAction || {}).slice(0, 4000)}\n\n` +
    `Phase5_SkillGap_JSON:\n${JSON.stringify(p5.skillGap || {}).slice(0, 4000)}\n\n` +
    `Phase5_Evaluation_JSON:\n${JSON.stringify(p5.evaluation || {}).slice(0, 5000)}\n\n` +
    `Phase5_Handover_ExpertFR:\n${String(p5?.handover?.expertFR || '').slice(0, 8000)}\n`;

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.25,
  });

  const out = String(txt || '').trim();
  if (!out) {
    const err = new Error('Invalid expert dossier');
    err.code = 'INVALID_EXPERT_DOSSIER';
    throw err;
  }
  return out;
};

const buildPhase5BundleMarkdown = ({ phase0, phase1, phase2, phase3, phase4, phase5, expertDossierFR }) => {
  const p0 = phase0 && typeof phase0 === 'object' ? phase0 : {};
  const p1 = phase1 && typeof phase1 === 'object' ? phase1 : {};
  const p2 = phase2 && typeof phase2 === 'object' ? phase2 : {};
  const p3 = phase3 && typeof phase3 === 'object' ? phase3 : {};
  const p4 = phase4 && typeof phase4 === 'object' ? phase4 : {};
  const p5 = phase5 && typeof phase5 === 'object' ? phase5 : {};

  const dossierFR = String(expertDossierFR || '').trim();
  const fallbackExpertFR = String(p5?.handover?.expertFR || '').trim();
  const expertIntro = dossierFR || fallbackExpertFR;

  const parts = [];
  parts.push('# Dossier Expert — Service 1 (Phases 0–5)');
  parts.push('');
  parts.push('## Résumé expert (FR)');
  parts.push('');
  parts.push(expertIntro || 'Information non disponible');
  parts.push('');
  parts.push('---');
  parts.push('');
  parts.push('## Annexes — Documents & données (pour vérification)');
  parts.push('');
  parts.push('## Phase 0 — CV + Entretien');
  parts.push('');
  parts.push('### Profile (JSON)');
  parts.push('```json');
  parts.push(JSON.stringify(p0.profile || {}, null, 2));
  parts.push('```');
  parts.push('');
  parts.push('### Note de Cadrage (Markdown)');
  parts.push(String(p0.cadrageNote || '').trim() || '—');
  parts.push('');
  parts.push('## Phase 1 — Analyse');
  parts.push('');
  parts.push(String(p1.reportMarkdown || '').trim() || '—');
  parts.push('');
  parts.push('## Phase 2 — Analyse stratégique');
  parts.push('');
  parts.push(String(p2.reportMarkdown || '').trim() || '—');
  parts.push('');
  parts.push('## Phase 3 — Growth Path');
  parts.push('');
  parts.push('```json');
  parts.push(JSON.stringify(p3.selectedGrowthPath || {}, null, 2));
  parts.push('```');
  parts.push('');
  parts.push('## Phase 4 — Plan 3 mois');
  parts.push('');
  parts.push(String(p4.notePositionnementMarkdown || '').trim() || '—');
  parts.push('');
  parts.push(String(p4.planningMarkdown || '').trim() || '—');
  parts.push('');
  parts.push('## Phase 5 — Final Validation Interview');
  parts.push('');
  parts.push('### Aggregated Profile (JSON)');
  parts.push('```json');
  parts.push(JSON.stringify(p5.aggregatedProfile || {}, null, 2));
  parts.push('```');
  parts.push('');
  if (p5.selfAwareness) {
    parts.push('### Self-Awareness');
    parts.push('```json');
    parts.push(JSON.stringify(p5.selfAwareness || {}, null, 2));
    parts.push('```');
    parts.push('');
  }
  if (Array.isArray(p5.finalActions) && p5.finalActions.length) {
    parts.push('### Final Actions');
    parts.push('```json');
    parts.push(JSON.stringify(p5.finalActions || [], null, 2));
    parts.push('```');
    parts.push('');
  }
  if (p5.selectedFinalAction) {
    parts.push('### Selected Final Action');
    parts.push('```json');
    parts.push(JSON.stringify(p5.selectedFinalAction || {}, null, 2));
    parts.push('```');
    parts.push('');
  }
  if (p5.skillGap) {
    parts.push('### Skill Gap');
    parts.push('```json');
    parts.push(JSON.stringify(p5.skillGap || {}, null, 2));
    parts.push('```');
    parts.push('');
  }
  if (p5.grandScenario) {
    parts.push('### Grand Simulation — Scenario');
    parts.push(String(p5.grandScenario || '').trim());
    parts.push('');
  }
  if (p5.grandAnswer) {
    parts.push('### Grand Simulation — Answer');
    parts.push(String(p5.grandAnswer || '').trim());
    parts.push('');
  }
  if (p5.evaluation) {
    parts.push('### Evaluation');
    parts.push('```json');
    parts.push(JSON.stringify(p5.evaluation || {}, null, 2));
    parts.push('```');
    parts.push('');
  }
  if (p5.handover && typeof p5.handover === 'object') {
    parts.push('### Handover (User Markdown)');
    parts.push(String(p5.handover.userMarkdown || '').trim() || '—');
    parts.push('');
    parts.push('### Handover (Expert FR)');
    parts.push(String(p5.handover.expertFR || '').trim() || '—');
    parts.push('');
  }

  return parts.join('\n');
};

const normalizePhase2Scenarios = (parsed) => {
  const p = parsed && typeof parsed === 'object' ? parsed : {};
  const scenarios = Array.isArray(p.scenarios) ? p.scenarios : [];
  const out = scenarios
    .map((s, idx) => {
      const ss = s && typeof s === 'object' ? s : {};
      const typeRaw = String(ss.type || ss.scenarioType || '').trim().toLowerCase();
      const type = typeRaw === 'crisis' || typeRaw === 'teamwork' || typeRaw === 'execution' ? typeRaw : '';
      const title = String(ss.title || '').trim();
      const question = String(ss.question || '').trim();
      const optionsRaw = Array.isArray(ss.options) ? ss.options : [];
      const options = optionsRaw
        .map((o) => {
          const oo = o && typeof o === 'object' ? o : {};
          const key = String(oo.key || '').trim().toUpperCase();
          const text = String(oo.text || oo.label || '').trim();
          return { key, text };
        })
        .filter((o) => ['A', 'B', 'C', 'D'].includes(o.key) && Boolean(o.text));

      return {
        id: String(ss.id || `${type || 'scenario'}_${idx + 1}`),
        type,
        title,
        question,
        options,
      };
    })
    .filter((s) => Boolean(s.question) && s.options.length === 4);

  const uniqueByType = new Map();
  for (const s of out) {
    const k = s.type || s.id;
    if (!uniqueByType.has(k)) uniqueByType.set(k, s);
  }
  const uniq = Array.from(uniqueByType.values());

  const byType = {
    crisis: uniq.find((s) => s.type === 'crisis'),
    teamwork: uniq.find((s) => s.type === 'teamwork'),
    execution: uniq.find((s) => s.type === 'execution'),
  };

  const normalized = [byType.crisis, byType.teamwork, byType.execution].filter(Boolean);
  return normalized.length === 3 ? normalized : uniq.slice(0, 3);
};

const generatePhase2Scenarios = async ({ profile, phase1ReportMarkdown, phase1Analysis }) => {
  const system =
    'Tu es un expert en évaluation comportementale et stratégique. Réponds uniquement en JSON valide, sans aucun texte autour.';

  const user =
    `Profil (CV JSON):\n${JSON.stringify(profile || {})}\n\n` +
    `Phase 1 Analyse (JSON):\n${JSON.stringify(phase1Analysis || {})}\n\n` +
    `Phase 1 Fiche (Markdown):\n${String(phase1ReportMarkdown || '').slice(0, 6000)}\n\n` +
    'Génère exactement 3 scénarios DIFFERENTS pour tester la stabilité du raisonnement et du comportement.\n' +
    'Format JSON STRICT: {"scenarios": [{"id":string,"type":"crisis|teamwork|execution","title":string,"question":string,"options":[{"key":"A","text":string},{"key":"B","text":string},{"key":"C","text":string},{"key":"D","text":string}]}]}\n' +
    'Contraintes: 1) une seule question par scénario 2) options réalistes et mutuellement exclusives 3) langage clair et professionnel 4) pas d\'explication.';

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.35,
  });

  const parsed = safeJsonParse(txt) || {};
  const scenarios = normalizePhase2Scenarios(parsed);
  if (!Array.isArray(scenarios) || scenarios.length !== 3) {
    const err = new Error('Invalid phase2 scenarios');
    err.code = 'INVALID_PHASE2_SCENARIOS';
    throw err;
  }
  return scenarios;
};

const generatePhase2StrategicReport = async ({
  profile,
  phase0InterviewHistory,
  phase1Analysis,
  phase1ReportMarkdown,
  phase2Scenarios,
  phase2Answers,
}) => {
  const system =
    'Tu es un consultant senior en orientation et stratégie de carrière. Réponds uniquement en français. Format: Markdown. Ne mentionne pas que tu es une IA.';

  const user =
    `CV_Data (JSON):\n${JSON.stringify(profile || {})}\n\n` +
    `Phase0_Interview (JSON):\n${JSON.stringify(phase0InterviewHistory || [])}\n\n` +
    `Phase1_Analyse (JSON):\n${JSON.stringify(phase1Analysis || {})}\n\n` +
    `Phase1_Fiche (Markdown):\n${String(phase1ReportMarkdown || '').slice(0, 8000)}\n\n` +
    `Phase2_Scenarios (JSON):\n${JSON.stringify(phase2Scenarios || [])}\n\n` +
    `Phase2_Answers (JSON):\n${JSON.stringify(phase2Answers || [])}\n\n` +
    'Génère une Note d\'analyse stratégique professionnelle avec EXACTEMENT les sections suivantes (mêmes titres) :\n' +
    'A) Compétences : réelles vs déclarées (Real vs Declared)\n' +
    'B) Points forts et points faibles (Strengths & Weaknesses)\n' +
    'C) Niveau de maturité et de préparation (Maturity & Readiness)\n' +
    '   - Donne un niveau: faible / moyen / élevé\n' +
    'D) Analyse de positionnement (Positioning Analysis)\n' +
    '   - Propose des rôles réalistes (Real Roles)\n' +
    '   - Exclusion: liste des pistes à éviter absolument\n' +
    '\nPuis ajoute à la fin une section très visible exactement titrée: "Verdict final"\n' +
    'Dans "Verdict final": écris un verdict DIRECT, strict et clair: où il en est maintenant, les actions immédiates, les conseils comportementaux, ce qu’il doit éviter, puis une motivation finale.\n' +
    'Pas de blabla, pas d\'auto-référence.';

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.35,
  });

  const out = String(txt || '').trim();
  if (!out || out.length < 200) {
    const err = new Error('Empty phase2 report');
    err.code = 'EMPTY_PHASE2_REPORT';
    throw err;
  }
  return out;
};

const normalizePhase1Analysis = (parsed) => {
  const p = parsed && typeof parsed === 'object' ? parsed : {};
  const consistency = Array.isArray(p.consistency) ? p.consistency.map((s) => String(s || '').trim()).filter(Boolean) : [];
  const incoherence = Array.isArray(p.incoherence) ? p.incoherence.map((s) => String(s || '').trim()).filter(Boolean) : [];
  const incoherenceLevelRaw = String(p.incoherenceLevel || '').trim().toLowerCase();
  const incoherenceLevel = incoherenceLevelRaw === 'high' ? 'high' : 'low';

  return {
    claimedRole: String(p.claimedRole || '').trim(),
    realRole: String(p.realRole || '').trim(),
    rationale: String(p.rationale || '').trim(),
    consistency,
    incoherence,
    incoherenceLevel,
    probeQuestion: String(p.probeQuestion || '').trim(),
    verdict: String(p.verdict || '').trim(),
  };
};

const generatePhase1CrossReference = async ({ profile, interviewHistory }) => {
  const system =
    'Tu es un expert en analyse de cohérence professionnelle. Réponds uniquement en JSON valide, sans aucun texte autour. Champs requis: claimedRole, realRole, rationale, consistency (array), incoherence (array), incoherenceLevel ("low"|"high"), probeQuestion (string), verdict.';

  const user =
    `CV_Data (JSON):\n${JSON.stringify(profile || {})}\n\n` +
    `Interview_Answers (Q/R) (JSON):\n${JSON.stringify(interviewHistory || [])}\n\n` +
    'Compare les affirmations implicites du CV (leadership, autonomie, niveau) avec les réponses (prise de décision, pression, autonomie).\n' +
    'Produis: points de cohérence (consistency), points d\'incohérence (incoherence).\n' +
    'Si incohérence majeure: incoherenceLevel="high" et propose UNE question de confirmation (probeQuestion) en français.\n' +
    'Sinon incoherenceLevel="low" et probeQuestion vide.';

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
  });

  const parsed = safeJsonParse(txt) || {};
  return normalizePhase1Analysis(parsed);
};

const generatePhase1DecisionReport = async ({ analysis, profile, interviewHistory, probeAnswer }) => {
  const system =
    'Tu es un consultant senior. Tu dois produire une Fiche de logique décisionnelle claire, structurée et actionnable. Réponds uniquement en français. Format: Markdown. Ne mentionne pas que tu es une IA.';

  const user =
    `CV_Data (JSON):\n${JSON.stringify(profile || {})}\n\n` +
    `Interview_Answers (JSON):\n${JSON.stringify(interviewHistory || [])}\n\n` +
    `Analyse (JSON):\n${JSON.stringify(analysis || {})}\n\n` +
    (probeAnswer ? `Réponse de clarification du candidat:\n${String(probeAnswer || '').trim()}\n\n` : '') +
    'Génère une fiche avec ces sections (titres en français):\n' +
    '1) Rôle revendiqué (Claimed Role)\n' +
    '2) Logique réelle observée (Real Logic)\n' +
    '3) Points de cohérence (Consistency)\n' +
    '4) Points d\'incohérence (Incoherence)\n' +
    '5) Verdict (rôle conseillé + justification)\n' +
    '6) Recommandations (3 à 7 puces)';

  const txt = await callAIChat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.35,
  });

  const out = String(txt || '').trim();
  if (!out || out.length < 120) {
    const err = new Error('Empty phase1 report');
    err.code = 'EMPTY_PHASE1_REPORT';
    throw err;
  }
  return out;
};

const extractCvText = async ({ buffer, mimetype, originalname }) => {
  const mt = String(mimetype || '').toLowerCase();
  const name = String(originalname || '').toLowerCase();
  const ext = name.includes('.') ? name.split('.').pop() : '';
  if (mt === 'application/pdf') {
    const out = await pdfParse(buffer);
    return String(out?.text || '');
  }
  if (mt === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const out = await mammoth.extractRawText({ buffer });
    return String(out?.value || '');
  }
  if (ext === 'pdf') {
    const out = await pdfParse(buffer);
    return String(out?.text || '');
  }
  if (ext === 'docx') {
    const out = await mammoth.extractRawText({ buffer });
    return String(out?.value || '');
  }
  return '';
};

const phase0Upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mt = String(file?.mimetype || '');
    const name = String(file?.originalname || '').toLowerCase();
    const ext = name.includes('.') ? name.split('.').pop() : '';
    const ok =
      [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(mt) ||
      ['pdf', 'docx'].includes(String(ext || '').toLowerCase());
    cb(ok ? null : new Error('Type de fichier non pris en charge'), ok);
  },
});

router.get('/service1/phase0/state', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = (responsesObj && typeof responsesObj === 'object' ? responsesObj.service1 : null) || {};
    const phase0 = (s1 && typeof s1 === 'object' ? s1.phase0 : null) || {};

    const completed = Boolean(phase0?.completed || String(phase0?.interview?.status || '') === 'completed');
    const noteStr = String(phase0?.cadrageNote || '').trim();
    const history = Array.isArray(phase0?.interview?.history) ? phase0.interview.history : [];
    const shouldGenerate = completed && (!noteStr || noteStr.length < 80) && history.length >= 5 && phase0?.profile;

    if (shouldGenerate) {
      try {
        const note = await generatePhase0CadrageNote({
          profile: phase0.profile,
          initialObservation: phase0.initialObservation,
          history,
        });
        phase0.cadrageNote = note;
        phase0.cadrageNoteGeneratedAt = new Date().toISOString();
      } catch (e) {
        const role = String(phase0?.profile?.currentRole || '').trim();
        phase0.cadrageNote =
          `# Note de Cadrage\n\n## Qui êtes-vous\nProfil analysé (${role || '—'}).\n\n## Comment vous vous présentez\nSynthèse basée sur l'entretien.\n\n## La Gap\nÀ préciser (données insuffisantes).\n\n## Contraintes actuelles\nÀ préciser.\n\n## Prochaines étapes\n- Clarifier l'objectif\n- Identifier 2-3 options de positionnement\n- Définir un plan d'action`;
        phase0.cadrageNoteGeneratedAt = new Date().toISOString();
      }

      s1.phase0 = phase0;
      responsesObj.service1 = s1;
      session.responses = responsesObj;
      session.markModified('responses');
      await session.save();
    }

    return res.json({ success: true, data: { phase0 } });
  } catch (error) {
    console.error('❌ Error getting phase0 state:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

router.get('/service1/phase3/state', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase3 = s1.phase3 && typeof s1.phase3 === 'object' ? s1.phase3 : {};

    return res.json({ success: true, data: { phase3 } });
  } catch (error) {
    console.error('❌ Error getting phase3 state:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

router.post('/service1/phase3/generate-paths', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const lang = getService1Lang(service1Obj);
    const phase0 = service1Obj.phase0 && typeof service1Obj.phase0 === 'object' ? service1Obj.phase0 : {};
    const phase2 = service1Obj.phase2 && typeof service1Obj.phase2 === 'object' ? service1Obj.phase2 : {};

    const profile = phase0?.profile;
    const phase2ReportMarkdown = String(phase2?.reportMarkdown || '').trim();
    if (!profile || !phase2ReportMarkdown) {
      return res.status(400).json({ success: false, message: 'Phase 2 non terminée' });
    }

    const existing = service1Obj.phase3 && typeof service1Obj.phase3 === 'object' ? service1Obj.phase3 : {};
    const existingPaths = Array.isArray(existing?.paths) ? existing.paths : [];
    if (existingPaths.length === 3) {
      return res.json({ success: true, data: { phase3: existing } });
    }

    let paths = [];
    try {
      paths = await generatePhase3GrowthPaths({ profile, phase2ReportMarkdown });
    } catch (e) {
      paths = [
        {
          id: 'skills_path',
          type: 'skills',
          title: 'Parcours Compétences (Skills Path)',
          description: 'Renforcement intensif des outils et compétences clés, avec de courts projets applicatifs.',
          successProbability: 78,
          rationale: 'Pertinent si le principal blocage concerne des compétences/outils techniques.',
        },
        {
          id: 'experience_path',
          type: 'experience',
          title: 'Parcours Expérience (Experience Path)',
          description: 'Cibler des rôles d’exécution terrain pour augmenter l’exposition réelle et améliorer la pratique quotidienne.',
          successProbability: 72,
          rationale: 'Pertinent si l’écart entre discours et réalité vient d’un manque d’expérience opérationnelle.',
        },
        {
          id: 'mentoring_path',
          type: 'mentoring',
          title: 'Parcours Mentorat (Mentoring Path)',
          description: 'Travailler avec un mentor pour améliorer le comportement professionnel, la décision et la communication.',
          successProbability: 85,
          rationale: 'Pertinent si les points faibles sont comportementaux/méthodologiques et nécessitent une correction rapide.',
        },
      ];
    }

    const nowIso = new Date().toISOString();
    const phase3 = {
      status: 'in_progress',
      startedAt: nowIso,
      paths,
      selectedGrowthPath: null,
      selectedAt: null,
      completed: false,
      completedAt: null,
    };

    service1Obj.phase3 = phase3;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase3 } });
  } catch (error) {
    console.error('❌ Error generating phase3 paths:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    if (error?.code === 'INVALID_PHASE3_PATHS') {
      return res.status(502).json({ success: false, message: 'IA: résultats non valides. Veuillez réessayer.' });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.get('/service1/appointment', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase5Obj = s1.phase5 && typeof s1.phase5 === 'object' ? s1.phase5 : {};

    const isCompleted = phase5Obj?.status === 'completed' || Boolean(phase5Obj?.completed);
    if (!isCompleted) return res.status(403).json({ success: false, message: 'Phase 5 non terminée' });

    const appt = s1.directSessionAppointment && typeof s1.directSessionAppointment === 'object' ? s1.directSessionAppointment : {};
    const scheduledAt = String(appt?.scheduledAt || '').trim();
    const notes = String(appt?.notes || '').trim();

    return res.json({ success: true, data: { scheduledAt, notes } });
  } catch (error) {
    console.error('❌ Error getting appointment:', error);
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.get('/service1/audit-report', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase5Obj = s1.phase5 && typeof s1.phase5 === 'object' ? s1.phase5 : {};

    const isCompleted = phase5Obj?.status === 'completed' || Boolean(phase5Obj?.completed);
    if (!isCompleted) return res.status(403).json({ success: false, message: 'Phase 5 non terminée' });

    const auditReport = s1.auditReport && typeof s1.auditReport === 'object' ? s1.auditReport : {};
    const url = String(auditReport?.url || '').trim();
    const fileName = String(auditReport?.fileName || '').trim();
    const uploadedAt = String(auditReport?.uploadedAt || '').trim();

    return res.json({ success: true, data: { url, fileName, uploadedAt } });
  } catch (error) {
    console.error('❌ Error getting audit report:', error);
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/phase3/select', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const pathId = String(req.body?.pathId || '').trim();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });
    if (!pathId) return res.status(400).json({ success: false, message: 'pathId requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase3Existing = service1Obj.phase3 && typeof service1Obj.phase3 === 'object' ? service1Obj.phase3 : {};
    const paths = Array.isArray(phase3Existing?.paths) ? phase3Existing.paths : [];
    const selected = paths.find((p) => String(p?.id || '') === pathId);
    if (!selected) return res.status(400).json({ success: false, message: 'Growth path introuvable' });

    const nowIso = new Date().toISOString();
    const phase3 = {
      ...phase3Existing,
      status: 'completed',
      selectedGrowthPath: selected,
      selectedAt: nowIso,
      completed: true,
      completedAt: nowIso,
    };

    service1Obj.phase3 = phase3;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase3 } });
  } catch (error) {
    console.error('❌ Error selecting phase3 path:', error);
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.get('/service1/phase4/state', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase4 = s1.phase4 && typeof s1.phase4 === 'object' ? s1.phase4 : {};

    return res.json({ success: true, data: { phase4 } });
  } catch (error) {
    console.error('❌ Error getting phase4 state:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

router.post('/service1/phase4/generate', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase0 = service1Obj.phase0 && typeof service1Obj.phase0 === 'object' ? service1Obj.phase0 : {};

    const lang = getService1Lang(service1Obj);
    const phase2 = service1Obj.phase2 && typeof service1Obj.phase2 === 'object' ? service1Obj.phase2 : {};
    const phase3 = service1Obj.phase3 && typeof service1Obj.phase3 === 'object' ? service1Obj.phase3 : {};

    const profile = phase0?.profile;
    const phase2ReportMarkdown = String(phase2?.reportMarkdown || '').trim();
    const selectedPath = phase3?.selectedGrowthPath;
    if (!profile || !phase2ReportMarkdown || !selectedPath) {
      return res.status(400).json({ success: false, message: 'Phase 3 non terminée (sélection du parcours requise)' });
    }

    const existing = service1Obj.phase4 && typeof service1Obj.phase4 === 'object' ? service1Obj.phase4 : {};
    const hasDocs = Boolean(String(existing?.notePositionnementMarkdown || '').trim()) && Boolean(String(existing?.planningMarkdown || '').trim());
    const monthsExisting = Array.isArray(existing?.roadmap?.months) ? existing.roadmap.months : [];
    if (hasDocs && monthsExisting.length === 3) {
      return res.json({ success: true, data: { phase4: existing } });
    }

    let planDocs = null;
    try {
      planDocs = await generatePhase4PlanDocs({ profile, phase2ReportMarkdown, selectedPath });
    } catch (e) {
      planDocs = {
        notePositionnementMarkdown:
          `# Note de positionnement professionnel\n\nVous êtes ici: niveau en construction.\n\nVous allez là: progression structurée via le path choisi.`,
        planningMarkdown:
          `# Document de Planning\n\n## Mois 1\n- Consolider les bases\n\n## Mois 2\n- Monter en complexité\n\n## Mois 3\n- Revue + ajustements`,
        roadmap: {
          months: [
            {
              month: 1,
              title: 'Mois 1 — Fondations',
              checklist: [
                { id: 'm1_1', text: 'Définir objectifs hebdomadaires', done: false },
                { id: 'm1_2', text: 'Réaliser 2 mini-projets', done: false },
                { id: 'm1_3', text: 'Revue CV + portfolio', done: false },
              ],
            },
            {
              month: 2,
              title: 'Mois 2 — Accélération',
              checklist: [
                { id: 'm2_1', text: 'Projet complet end-to-end', done: false },
                { id: 'm2_2', text: 'Simulations d\'entretiens', done: false },
                { id: 'm2_3', text: 'Améliorer qualité et tests', done: false },
              ],
            },
            {
              month: 3,
              title: 'Mois 3 — Revue & Positionnement',
              checklist: [
                { id: 'm3_1', text: 'Bilan des acquis', done: false },
                { id: 'm3_2', text: 'Ciblage des rôles réalistes', done: false },
                { id: 'm3_3', text: 'Plan d\'action prochain trimestre', done: false },
              ],
            },
          ],
        },
      };
    }

    const nowIso = new Date().toISOString();
    const phase4 = {
      status: 'in_progress',
      startedAt: nowIso,
      selectedGrowthPath: selectedPath,
      notePositionnementMarkdown: String(planDocs.notePositionnementMarkdown || ''),
      planningMarkdown: String(planDocs.planningMarkdown || ''),
      roadmap: planDocs.roadmap,
      reportGeneratedAt: nowIso,
      completed: true,
      completedAt: nowIso,
    };

    service1Obj.phase4 = phase4;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase4 } });
  } catch (error) {
    console.error('❌ Error generating phase4:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    if (error?.code === 'INVALID_PHASE4_PLAN') {
      return res.status(502).json({ success: false, message: 'IA: plan non valide. Veuillez réessayer.' });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/phase4/checklist/toggle', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const itemId = String(req.body?.itemId || '').trim();
    const done = Boolean(req.body?.done);
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });
    if (!itemId) return res.status(400).json({ success: false, message: 'itemId requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase4Existing = service1Obj.phase4 && typeof service1Obj.phase4 === 'object' ? service1Obj.phase4 : {};
    const months = Array.isArray(phase4Existing?.roadmap?.months) ? phase4Existing.roadmap.months : [];
    if (months.length !== 3) return res.status(400).json({ success: false, message: 'Phase 4 indisponible' });

    let found = false;
    const updatedMonths = months.map((m) => {
      const mm = m && typeof m === 'object' ? m : {};
      const checklist = Array.isArray(mm.checklist) ? mm.checklist : [];
      const updatedChecklist = checklist.map((t) => {
        if (String(t?.id || '') !== itemId) return t;
        found = true;
        return { ...t, done };
      });
      return { ...mm, checklist: updatedChecklist };
    });

    if (!found) return res.status(400).json({ success: false, message: 'Task introuvable' });

    const phase4 = { ...phase4Existing, roadmap: { months: updatedMonths } };
    service1Obj.phase4 = phase4;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase4 } });
  } catch (error) {
    console.error('❌ Error toggling phase4 checklist:', error);
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.get('/service1/phase5/state', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase5 = s1.phase5 && typeof s1.phase5 === 'object' ? s1.phase5 : {};

    return res.json({ success: true, data: { phase5 } });
  } catch (error) {
    console.error('❌ Error getting phase5 state:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

router.post('/service1/phase5/aggregate', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const force = Boolean(req.body?.force);
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};

    const phase0 = service1Obj.phase0 && typeof service1Obj.phase0 === 'object' ? service1Obj.phase0 : {};
    const phase1 = service1Obj.phase1 && typeof service1Obj.phase1 === 'object' ? service1Obj.phase1 : {};
    const phase2 = service1Obj.phase2 && typeof service1Obj.phase2 === 'object' ? service1Obj.phase2 : {};
    const phase3 = service1Obj.phase3 && typeof service1Obj.phase3 === 'object' ? service1Obj.phase3 : {};
    const phase4 = service1Obj.phase4 && typeof service1Obj.phase4 === 'object' ? service1Obj.phase4 : {};
    const phase5Existing = service1Obj.phase5 && typeof service1Obj.phase5 === 'object' ? service1Obj.phase5 : {};

    const profile = phase0?.profile;
    const phase1ReportMarkdown = String(phase1?.reportMarkdown || '').trim();
    const phase1Analysis = phase1?.analysis && typeof phase1.analysis === 'object' ? phase1.analysis : {};
    const phase2ReportMarkdown = String(phase2?.reportMarkdown || '').trim();
    const phase3SelectedPath = phase3?.selectedGrowthPath;
    const phase4HasDocs = Boolean(String(phase4?.notePositionnementMarkdown || '').trim()) && Boolean(String(phase4?.planningMarkdown || '').trim());
    const months = Array.isArray(phase4?.roadmap?.months) ? phase4.roadmap.months : [];

    if (!profile || !phase1ReportMarkdown || !phase2ReportMarkdown || !phase3SelectedPath || !phase4HasDocs || months.length !== 3) {
      return res.status(400).json({ success: false, message: 'Les phases 0 à 4 doivent être complétées pour générer la phase 5' });
    }

    const existingAgg = phase5Existing?.aggregatedProfile && typeof phase5Existing.aggregatedProfile === 'object' ? phase5Existing.aggregatedProfile : null;
    if (existingAgg && !force) {
      return res.json({ success: true, data: { phase5: phase5Existing } });
    }

    let aggregatedProfile = null;
    try {
      aggregatedProfile = await extractPhase5AggregatedProfile({
        profile,
        phase1Analysis,
        phase1ReportMarkdown,
        phase2ReportMarkdown,
        phase3SelectedPath,
        phase4,
      });
    } catch (e) {
      aggregatedProfile = {
        declaredRole: String(phase1Analysis?.claimedRole || ''),
        realRole: String(phase1Analysis?.realRole || ''),
        maturityLevel: 'moyen',
        weaknesses: [],
        strengths: [],
        exclusions: [],
        selectedPath: {
          id: String(phase3SelectedPath?.id || ''),
          type: String(phase3SelectedPath?.type || ''),
          title: String(phase3SelectedPath?.title || ''),
        },
        roadmap: phase4?.roadmap || null,
      };
    }

    const nowIso = new Date().toISOString();
    const phase5 = {
      status: 'awaiting_self_description',
      startedAt: nowIso,
      snapshotGeneratedAt: nowIso,
      aggregatedProfile,
      selfAwareness: null,
      journeyRecap: null,
      finalActions: [],
      selectedFinalAction: null,
      skillGap: null,
      grandScenario: null,
      grandAnswer: null,
      evaluation: null,
      handover: null,
      completed: false,
      completedAt: null,
    };

    service1Obj.phase5 = phase5;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase5 } });
  } catch (error) {
    console.error('❌ Error generating phase5 snapshot:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/phase5/self-awareness', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const selfDescription = String(req.body?.selfDescription || '').trim();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });
    if (!selfDescription) return res.status(400).json({ success: false, message: 'selfDescription requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase5Existing = service1Obj.phase5 && typeof service1Obj.phase5 === 'object' ? service1Obj.phase5 : {};

    const aggregatedProfile = phase5Existing?.aggregatedProfile;
    if (!aggregatedProfile) {
      return res.status(400).json({ success: false, message: 'Snapshot indisponible. Exécutez /phase5/aggregate d\'abord.' });
    }

    let selfAwareness = null;
    try {
      selfAwareness = await generatePhase5SelfAwareness({ aggregatedProfile, selfDescription });
    } catch (e) {
      selfAwareness = { match: false, reason: 'Analyse indisponible pour le moment. Veuillez réessayer.', expertNoteFR: '' };
    }

    const journeyRecap = {
      text:
        `Vous avez suivi les phases du diagnostic. Votre rôle réaliste a été identifié comme: "${String(aggregatedProfile?.realRole || '').trim()}". ` +
        `Vous avez choisi le parcours: "${String(aggregatedProfile?.selectedPath?.title || '').trim()}". Nous passons maintenant à la vérification finale via une simulation exigeante.`,
    };

    const nowIso = new Date().toISOString();
    const phase5 = {
      ...phase5Existing,
      status: 'awaiting_action_choice',
      selfAwareness: {
        selfDescription,
        ...selfAwareness,
        at: nowIso,
      },
      journeyRecap,
    };

    service1Obj.phase5 = phase5;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase5 } });
  } catch (error) {
    console.error('❌ Error phase5 self-awareness:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/phase5/final-actions/generate', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase5Existing = service1Obj.phase5 && typeof service1Obj.phase5 === 'object' ? service1Obj.phase5 : {};

    const aggregatedProfile = phase5Existing?.aggregatedProfile;
    if (!aggregatedProfile) {
      return res.status(400).json({ success: false, message: 'Snapshot indisponible.' });
    }

    const existingActions = Array.isArray(phase5Existing?.finalActions) ? phase5Existing.finalActions : [];
    if (existingActions.length === 3) {
      return res.json({ success: true, data: { phase5: phase5Existing } });
    }

    const actions = await generatePhase5FinalActions({ aggregatedProfile });
    const nowIso = new Date().toISOString();
    const phase5 = {
      ...phase5Existing,
      status: 'awaiting_action_choice',
      finalActions: actions,
      finalActionsGeneratedAt: nowIso,
    };

    service1Obj.phase5 = phase5;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase5 } });
  } catch (error) {
    console.error('❌ Error phase5 final-actions generate:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/phase5/final-actions/select', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const actionId = String(req.body?.actionId || '').trim();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });
    if (!actionId) return res.status(400).json({ success: false, message: 'actionId requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase5Existing = service1Obj.phase5 && typeof service1Obj.phase5 === 'object' ? service1Obj.phase5 : {};
    const aggregatedProfile = phase5Existing?.aggregatedProfile;

    if (!aggregatedProfile) {
      return res.status(400).json({ success: false, message: 'Snapshot indisponible.' });
    }

    const actions = Array.isArray(phase5Existing?.finalActions) ? phase5Existing.finalActions : [];
    const selected = actions.find((a) => String(a?.id || '') === actionId);
    if (!selected) return res.status(400).json({ success: false, message: 'Final action introuvable' });

    let skillGap = null;
    try {
      skillGap = await generatePhase5SkillGap({ aggregatedProfile, selectedAction: selected });
    } catch (e) {
      skillGap = { skillName: '', currentLevel: '', requiredLevel: '', gapDescription: '', microActions: [], expertNoteFR: '' };
    }

    const nowIso = new Date().toISOString();
    const phase5 = {
      ...phase5Existing,
      status: 'awaiting_grand_simulation',
      selectedFinalAction: { ...selected, selectedAt: nowIso },
      skillGap: { ...skillGap, at: nowIso },
    };

    service1Obj.phase5 = phase5;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase5 } });
  } catch (error) {
    console.error('❌ Error phase5 select action:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/phase5/grand-simulation/start', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase5Existing = service1Obj.phase5 && typeof service1Obj.phase5 === 'object' ? service1Obj.phase5 : {};

    const aggregatedProfile = phase5Existing?.aggregatedProfile;
    const selectedFinalAction = phase5Existing?.selectedFinalAction;
    const skillGap = phase5Existing?.skillGap;
    if (!aggregatedProfile || !selectedFinalAction) {
      return res.status(400).json({ success: false, message: 'Phase 5 non prête: sélectionnez d\'abord une Final Action' });
    }

    const existingScenario = String(phase5Existing?.grandScenario || '').trim();
    if (existingScenario) {
      return res.json({ success: true, data: { phase5: phase5Existing } });
    }

    const scenarioText = await generatePhase5GrandScenario({
      aggregatedProfile,
      selectedAction: selectedFinalAction,
      skillGap,
    });

    const nowIso = new Date().toISOString();
    const phase5 = {
      ...phase5Existing,
      status: 'awaiting_grand_answer',
      grandScenario: scenarioText,
      grandScenarioGeneratedAt: nowIso,
    };

    service1Obj.phase5 = phase5;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase5 } });
  } catch (error) {
    console.error('❌ Error phase5 grand simulation start:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/phase5/grand-simulation/answer', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const answerText = String(req.body?.answerText || '').trim();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });
    if (!answerText) return res.status(400).json({ success: false, message: 'answerText requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase5Existing = service1Obj.phase5 && typeof service1Obj.phase5 === 'object' ? service1Obj.phase5 : {};

    const aggregatedProfile = phase5Existing?.aggregatedProfile;
    const selectedFinalAction = phase5Existing?.selectedFinalAction;
    const skillGap = phase5Existing?.skillGap;
    const scenarioText = String(phase5Existing?.grandScenario || '').trim();
    if (!aggregatedProfile || !selectedFinalAction || !scenarioText) {
      return res.status(400).json({ success: false, message: 'Scénario indisponible. Exécutez d\'abord /grand-simulation/start.' });
    }

    const evalObj = await evaluatePhase5GrandAnswer({
      aggregatedProfile,
      selectedAction: selectedFinalAction,
      skillGap,
      scenarioText,
      answerText,
    });

    const nowIso = new Date().toISOString();
    const phase5 = {
      ...phase5Existing,
      status: 'completed',
      grandAnswer: answerText,
      grandAnsweredAt: nowIso,
      evaluation: {
        score: evalObj.score,
        verdict: evalObj.verdict,
        good: evalObj.good,
        bad: evalObj.bad,
        finalAdvice: evalObj.finalAdvice,
        evaluatedAt: nowIso,
      },
      handover: {
        userMarkdown: evalObj.handoverUserMarkdown,
        expertFR: evalObj.handoverExpertFR,
        generatedAt: nowIso,
      },
      completed: true,
      completedAt: nowIso,
    };

    service1Obj.phase5 = phase5;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase5 } });
  } catch (error) {
    console.error('❌ Error phase5 grand simulation answer:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.get('/service1/phase5/export', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const force = String(req.query.force || '').trim() === '1';

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};

    const phase5Obj = s1.phase5 && typeof s1.phase5 === 'object' ? s1.phase5 : {};
    const existingDossier = String(phase5Obj.expertDossierFR || '').trim();
    let expertDossierFR = existingDossier;

    if (!expertDossierFR || force) {
      try {
        expertDossierFR = await generateService1ExpertDossierFR({
          phase0: s1.phase0,
          phase1: s1.phase1,
          phase2: s1.phase2,
          phase3: s1.phase3,
          phase4: s1.phase4,
          phase5: s1.phase5,
        });

        const nowIso = new Date().toISOString();
        const updatedPhase5 = {
          ...phase5Obj,
          expertDossierFR,
          expertDossierGeneratedAt: nowIso,
        };

        const service1Obj = { ...s1, phase5: updatedPhase5 };
        responsesObj.service1 = service1Obj;
        session.responses = responsesObj;
        session.markModified('responses');
        await session.save();
      } catch (e) {
        expertDossierFR = existingDossier;
      }
    }

    const markdown = buildPhase5BundleMarkdown({
      phase0: s1.phase0,
      phase1: s1.phase1,
      phase2: s1.phase2,
      phase3: s1.phase3,
      phase4: s1.phase4,
      phase5: s1.phase5,
      expertDossierFR,
    });

    return res.json({ success: true, data: { markdown } });
  } catch (error) {
    console.error('❌ Error exporting phase5 bundle:', error);
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/final/chat', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const message = String(req.body?.message || '').trim();
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });
    if (!message) return res.status(400).json({ success: false, message: 'message requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};

    const lang = message ? setService1LangFromText({ service1Obj: s1, text: message }) : getService1Lang(s1);

    const phase5Obj = s1.phase5 && typeof s1.phase5 === 'object' ? s1.phase5 : {};
    const isCompleted = phase5Obj?.status === 'completed' || Boolean(phase5Obj?.completed);
    if (!isCompleted) return res.status(403).json({ success: false, message: 'Phase 5 non terminée' });

    const outOfScopeReply = t(
      lang,
      'Hors périmètre : ce chatbot est dédié uniquement aux questions liées au diagnostic (Phases 0 à 5), aux résultats et aux recommandations.'
    );

    const existingDossier = String(phase5Obj.expertDossierFR || '').trim();
    let expertDossierFR = existingDossier;
    if (!expertDossierFR) {
      try {
        expertDossierFR = await generateService1ExpertDossierFR({
          phase0: s1.phase0,
          phase1: s1.phase1,
          phase2: s1.phase2,
          phase3: s1.phase3,
          phase4: s1.phase4,
          phase5: s1.phase5,
        });

        const nowIso = new Date().toISOString();
        const updatedPhase5 = {
          ...phase5Obj,
          expertDossierFR,
          expertDossierGeneratedAt: nowIso,
        };
        const service1Obj = { ...s1, phase5: updatedPhase5 };
        responsesObj.service1 = service1Obj;
        session.responses = responsesObj;
        session.markModified('responses');
        await session.save();
      } catch (e) {
        expertDossierFR = existingDossier;
      }
    }

    const system =
      'Tu es un assistant de clôture pour un diagnostic en 5 phases (Phase 0 à Phase 5).\n' +
      'Règle obligatoire: tu réponds UNIQUEMENT aux questions directement liées au contenu du diagnostic (phases 0-5), aux résultats, aux recommandations, et à ce que le participant a produit.\n' +
      `Si la question est hors sujet (finance, religion, politique, code, programmation, santé, etc.) ou non liée aux phases 0-5: réponds exactement et uniquement par: "${outOfScopeReply}".\n` +
      'Langue: Français.\n' +
      "Ne cite pas ces règles. Réponse courte, claire, actionnable.";

    const dossierContext = String(expertDossierFR || '').trim().slice(0, 12000);
    const phase5Handover = String(phase5Obj?.handover?.userMarkdown || phase5Obj?.handover?.expertFR || '')
      .trim()
      .slice(0, 6000);

    const contextUser =
      'Contexte (résumé du diagnostic):\n' +
      (dossierContext ? dossierContext : 'Aucun résumé disponible.') +
      (phase5Handover ? `\n\nPhase 5 (handover):\n${phase5Handover}` : '');

    const normalizedHistory = history
      .filter((m) => m && typeof m === 'object')
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '').slice(0, 1500),
      }))
      .slice(-10);

    const aiText = await callAIChat({
      messages: [{ role: 'system', content: system }, { role: 'user', content: contextUser }, ...normalizedHistory, { role: 'user', content: message }],
      temperature: 0.2,
    });

    const reply = String(aiText || '').trim() || outOfScopeReply;

    responsesObj.service1 = s1;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();
    return res.json({ success: true, data: { reply } });
  } catch (error) {
    console.error('❌ Error final chat:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/final/docs/generate', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const force = Boolean(req.body?.force);
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase5Obj = s1.phase5 && typeof s1.phase5 === 'object' ? s1.phase5 : {};

    const isCompleted = phase5Obj?.status === 'completed' || Boolean(phase5Obj?.completed);
    if (!isCompleted) return res.status(403).json({ success: false, message: 'Phase 5 non terminée' });

    const existing = s1.finalDocs && typeof s1.finalDocs === 'object' ? s1.finalDocs : null;
    if (existing && !force) {
      return res.json({ success: true, data: { docs: existing } });
    }

    const existingDossier = String(phase5Obj.expertDossierFR || '').trim();
    let expertDossierFR = existingDossier;
    if (!expertDossierFR) {
      try {
        expertDossierFR = await generateService1ExpertDossierFR({
          phase0: s1.phase0,
          phase1: s1.phase1,
          phase2: s1.phase2,
          phase3: s1.phase3,
          phase4: s1.phase4,
          phase5: s1.phase5,
        });

        const nowIso = new Date().toISOString();
        const updatedPhase5 = {
          ...phase5Obj,
          expertDossierFR,
          expertDossierGeneratedAt: nowIso,
        };
        const service1Obj = { ...s1, phase5: updatedPhase5 };
        responsesObj.service1 = service1Obj;
        session.responses = responsesObj;
        session.markModified('responses');
        await session.save();
      } catch (e) {
        expertDossierFR = existingDossier;
      }
    }

    const p0 = s1.phase0 && typeof s1.phase0 === 'object' ? s1.phase0 : {};
    const profile = p0.profile && typeof p0.profile === 'object' ? p0.profile : {};
    const cvText = String(p0.cvText || '').trim().slice(0, 14000);
    const interview = p0.interview && typeof p0.interview === 'object' ? p0.interview : {};
    const interviewHistory = Array.isArray(interview.history) ? interview.history : [];

    const phase1 = s1.phase1 && typeof s1.phase1 === 'object' ? s1.phase1 : {};
    const phase2 = s1.phase2 && typeof s1.phase2 === 'object' ? s1.phase2 : {};
    const phase3 = s1.phase3 && typeof s1.phase3 === 'object' ? s1.phase3 : {};
    const phase4 = s1.phase4 && typeof s1.phase4 === 'object' ? s1.phase4 : {};

    const system =
      'Tu es un coach carrière senior. Tu produis 3 livrables basés sur un diagnostic complet en 5 phases.\n' +
      'Contraintes STRICTES: \n' +
      '1) Pas de blocs de code Markdown (interdit: ```).\n' +
      '2) Le CV et la lettre doivent être en français professionnel.\n' +
      '3) Les recommandations doivent être en français et très actionnables.\n' +
      '4) Le CV DOIT mentionner explicitement la participation au parcours MA-TRAINING-CONSULTING (exactement: "Participant au parcours MA-TRAINING-CONSULTING").\n' +
      '5) N\'invente pas des diplômes, dates ou entreprises. Si inconnu: mets "—" ou laisse vide.\n' +
      '6) Format de sortie UNIQUE: Markdown avec EXACTEMENT ces sections et séparateurs: \n' +
      '## CV\n...\n---\n## Lettre de motivation\n...\n---\n## Recommandations\n...\n';

    const dossierContext = String(expertDossierFR || '').trim().slice(0, 12000);
    const user =
      `Email: ${email}\n\n` +
      (cvText ? `Phase0_CVText_Raw:\n${cvText}\n\n` : '') +
      `Phase0_Profile_JSON:\n${JSON.stringify(profile || {}).slice(0, 6000)}\n\n` +
      `Phase0_InitialObservation:\n${String(p0.initialObservation || '').slice(0, 3000)}\n\n` +
      `Phase0_InterviewHistory_JSON:\n${JSON.stringify(interviewHistory || []).slice(0, 8000)}\n\n` +
      `Phase1_Analysis_JSON:\n${JSON.stringify(phase1.analysis || {}).slice(0, 7000)}\n\n` +
      `Phase1_Report_Markdown:\n${String(phase1.reportMarkdown || '').slice(0, 8000)}\n\n` +
      `Phase2_Report_Markdown:\n${String(phase2.reportMarkdown || '').slice(0, 12000)}\n\n` +
      `Phase3_SelectedPath_JSON:\n${JSON.stringify(phase3.selectedGrowthPath || {}).slice(0, 4000)}\n\n` +
      `Phase4_Note_Markdown:\n${String(phase4.notePositionnementMarkdown || '').slice(0, 7000)}\n\n` +
      `Phase4_Planning_Markdown:\n${String(phase4.planningMarkdown || '').slice(0, 9000)}\n\n` +
      (dossierContext ? `ExpertDossierFR:\n${dossierContext}\n\n` : '') +
      'Objectif: produire un CV réaliste, une lettre de motivation cohérente, et des recommandations ciblées pour corriger les faiblesses (forme et fond).';

    const txt = await callAIChat({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.2,
    });

    const out = String(txt || '').trim();
    const parts = out.split('\n---\n');
    const docs = {
      markdown: out,
      cvMarkdown: String(parts?.[0] || '').trim(),
      motivationLetterMarkdown: String(parts?.[1] || '').trim(),
      recommendationsMarkdown: String(parts?.[2] || '').trim(),
      generatedAt: new Date().toISOString(),
    };

    const service1Obj = { ...s1, finalDocs: docs };
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { docs } });
  } catch (error) {
    console.error('❌ Error final docs generate:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.get('/service1/phase2/state', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase2 = s1.phase2 && typeof s1.phase2 === 'object' ? s1.phase2 : {};

    return res.json({ success: true, data: { phase2 } });
  } catch (error) {
    console.error('❌ Error getting phase2 state:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

router.post('/service1/phase2/generate-scenarios', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase0 = service1Obj.phase0 && typeof service1Obj.phase0 === 'object' ? service1Obj.phase0 : {};
    const phase1 = service1Obj.phase1 && typeof service1Obj.phase1 === 'object' ? service1Obj.phase1 : {};

    const profile = phase0?.profile;
    const phase1ReportMarkdown = String(phase1?.reportMarkdown || '').trim();
    const phase1Analysis = phase1?.analysis && typeof phase1.analysis === 'object' ? phase1.analysis : {};
    const phase1Completed = Boolean(phase1?.completed || phase1ReportMarkdown);
    if (!profile || !phase1Completed) {
      return res.status(400).json({ success: false, message: 'Phase 1 non terminée' });
    }

    const existing = service1Obj.phase2 && typeof service1Obj.phase2 === 'object' ? service1Obj.phase2 : {};
    const existingScenarios = Array.isArray(existing?.scenarios) ? existing.scenarios : [];
    if (existingScenarios.length === 3 && String(existing?.status || '') !== 'completed') {
      return res.json({ success: true, data: { phase2: existing } });
    }

    const scenarios = await generatePhase2Scenarios({ profile, phase1ReportMarkdown, phase1Analysis });

    const nowIso = new Date().toISOString();
    const phase2 = {
      status: 'in_progress',
      startedAt: nowIso,
      scenarios,
      answers: [],
      reportMarkdown: '',
      reportGeneratedAt: null,
      completed: false,
      completedAt: null,
    };

    service1Obj.phase2 = phase2;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase2 } });
  } catch (error) {
    console.error('❌ Error generating phase2 scenarios:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    if (error?.code === 'INVALID_PHASE2_SCENARIOS') {
      return res.status(502).json({ success: false, message: 'IA: scénarios non valides. Veuillez réessayer.' });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/phase2/answer', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const scenarioId = String(req.body?.scenarioId || '').trim();
    const selectedKey = String(req.body?.selectedKey || '').trim().toUpperCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });
    if (!scenarioId) return res.status(400).json({ success: false, message: 'scenarioId requis' });
    if (!['A', 'B', 'C', 'D'].includes(selectedKey)) {
      return res.status(400).json({ success: false, message: 'selectedKey invalid' });
    }

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase0 = service1Obj.phase0 && typeof service1Obj.phase0 === 'object' ? service1Obj.phase0 : {};
    const phase1 = service1Obj.phase1 && typeof service1Obj.phase1 === 'object' ? service1Obj.phase1 : {};
    const phase2Existing = service1Obj.phase2 && typeof service1Obj.phase2 === 'object' ? service1Obj.phase2 : {};

    const scenarios = Array.isArray(phase2Existing?.scenarios) ? phase2Existing.scenarios : [];
    if (scenarios.length !== 3) {
      return res.status(400).json({ success: false, message: 'Scénarios de la phase 2 indisponibles' });
    }
    const scenario = scenarios.find((s) => String(s?.id || '') === scenarioId);
    if (!scenario) {
      return res.status(400).json({ success: false, message: 'Scenario introuvable' });
    }

    const answers = Array.isArray(phase2Existing?.answers) ? phase2Existing.answers : [];
    const filtered = answers.filter((a) => String(a?.scenarioId || '') !== scenarioId);
    filtered.push({
      scenarioId,
      type: String(scenario?.type || ''),
      selectedKey,
      answeredAt: new Date().toISOString(),
    });

    const phase2Updated = {
      ...phase2Existing,
      status: 'in_progress',
      answers: filtered,
    };

    service1Obj.phase2 = phase2Updated;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    if (filtered.length < 3) {
      return res.json({ success: true, data: { phase2: phase2Updated, done: false } });
    }

    const profile = phase0?.profile;
    const phase0History = Array.isArray(phase0?.interview?.history) ? phase0.interview.history : [];
    const phase0InterviewHistory = phase0History.map((h) => ({
      q: String(h?.question?.question || ''),
      a: String(h?.answerText || ''),
      k: String(h?.selectedKey || ''),
    }));

    const phase1ReportMarkdown = String(phase1?.reportMarkdown || '').trim();
    const phase1Analysis = phase1?.analysis && typeof phase1.analysis === 'object' ? phase1.analysis : {};

    const answersExpanded = filtered
      .map((a) => {
        const sc = scenarios.find((s) => String(s?.id || '') === String(a?.scenarioId || ''));
        const opts = Array.isArray(sc?.options) ? sc.options : [];
        const selectedText = String(opts.find((o) => String(o?.key || '').toUpperCase() === String(a?.selectedKey || '').toUpperCase())?.text || '');
        return {
          scenarioId: String(a?.scenarioId || ''),
          type: String(sc?.type || a?.type || ''),
          title: String(sc?.title || ''),
          question: String(sc?.question || ''),
          selectedKey: String(a?.selectedKey || ''),
          selectedText,
          answeredAt: String(a?.answeredAt || ''),
        };
      })
      .filter((x) => Boolean(x.scenarioId));

    let reportMarkdown = '';
    let reportGeneratedAt = null;
    try {
      reportMarkdown = await generatePhase2StrategicReport({
        profile,
        phase0InterviewHistory,
        phase1Analysis,
        phase1ReportMarkdown,
        phase2Scenarios: scenarios,
        phase2Answers: answersExpanded,
      });
      reportGeneratedAt = new Date().toISOString();
    } catch (e) {
      reportMarkdown =
        `# Note d’analyse stratégique professionnelle\n\nA) Compétences : réelles vs déclarées (Real vs Declared)\n- —\n\nB) Points forts et points faibles (Strengths & Weaknesses)\n- —\n\nC) Niveau de maturité et de préparation (Maturity & Readiness)\n- Niveau: moyen\n\nD) Analyse de positionnement (Positioning Analysis)\n- Rôles réalistes: —\n- Exclusion: —\n\n# Verdict final\nVous êtes en phase de construction. Concentrez-vous sur une exécution rigoureuse et méthodique, évitez les rôles de leadership trop tôt, et développez la prise de responsabilité et la clarté de communication. Continuez avec constance: les fondamentaux précèdent les grands rôles.`;
      reportGeneratedAt = new Date().toISOString();
    }

    const phase2Completed = {
      ...phase2Updated,
      status: 'completed',
      reportMarkdown,
      reportGeneratedAt,
      completed: true,
      completedAt: reportGeneratedAt,
    };

    service1Obj.phase2 = phase2Completed;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase2: phase2Completed, done: true } });
  } catch (error) {
    console.error('❌ Error answering phase2:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.get('/service1/phase1/state', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase1 = s1.phase1 && typeof s1.phase1 === 'object' ? s1.phase1 : {};

    return res.json({ success: true, data: { phase1 } });
  } catch (error) {
    console.error('❌ Error getting phase1 state:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

router.post('/service1/phase1/compute', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase0 = service1Obj.phase0 && typeof service1Obj.phase0 === 'object' ? service1Obj.phase0 : {};

    const profile = phase0?.profile;
    const history = Array.isArray(phase0?.interview?.history) ? phase0.interview.history : [];
    const phase0Completed = Boolean(phase0?.completed || String(phase0?.interview?.status || '') === 'completed');
    if (!phase0Completed || !profile || history.length < 5) {
      return res.status(400).json({ success: false, message: 'Phase 0 non terminée' });
    }

    const phase1Existing = service1Obj.phase1 && typeof service1Obj.phase1 === 'object' ? service1Obj.phase1 : {};
    const existingReport = String(phase1Existing?.reportMarkdown || '').trim();
    if (existingReport) {
      return res.json({ success: true, data: { phase1: phase1Existing } });
    }

    const interviewHistory = history.map((h) => ({
      q: String(h?.question?.question || ''),
      a: String(h?.answerText || ''),
      k: String(h?.selectedKey || ''),
    }));

    const analysis = await generatePhase1CrossReference({ profile, interviewHistory });

    const nowIso = new Date().toISOString();
    const needsProbe = analysis.incoherenceLevel === 'high' && Boolean(analysis.probeQuestion);

    if (needsProbe) {
      const phase1 = {
        status: 'awaiting_probe',
        startedAt: nowIso,
        analysis,
        probe: {
          question: analysis.probeQuestion,
          answer: '',
          answeredAt: null,
        },
        reportMarkdown: '',
        reportGeneratedAt: null,
        completed: false,
        completedAt: null,
      };

      service1Obj.phase1 = phase1;
      responsesObj.service1 = service1Obj;
      session.responses = responsesObj;
      session.markModified('responses');
      await session.save();

      return res.json({
        success: true,
        data: {
          phase1,
          needsProbe: true,
          probeQuestion: analysis.probeQuestion,
        },
      });
    }

    let reportMarkdown = '';
    let reportGeneratedAt = null;
    try {
      reportMarkdown = await generatePhase1DecisionReport({
        analysis,
        profile,
        interviewHistory,
        probeAnswer: null,
      });
      reportGeneratedAt = new Date().toISOString();
    } catch (e) {
      reportMarkdown =
        `# Fiche de logique décisionnelle\n\n## Rôle revendiqué (Claimed Role)\n${analysis.claimedRole || '—'}\n\n## Logique réelle observée (Real Logic)\n${analysis.realRole || '—'}\n\n## Points de cohérence\n${(analysis.consistency || []).map((s) => `- ${s}`).join('\n') || '- —'}\n\n## Points d'incohérence\n${(analysis.incoherence || []).map((s) => `- ${s}`).join('\n') || '- —'}\n\n## Verdict\n${analysis.verdict || analysis.rationale || '—'}\n\n## Recommandations\n- Clarifier le périmètre de responsabilités\n- Prioriser un rôle cohérent avec l'autonomie observée\n- Définir un plan de montée en compétences`;
      reportGeneratedAt = new Date().toISOString();
    }

    const phase1 = {
      status: 'completed',
      startedAt: nowIso,
      analysis,
      probe: null,
      reportMarkdown,
      reportGeneratedAt,
      completed: true,
      completedAt: reportGeneratedAt,
    };

    service1Obj.phase1 = phase1;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase1, done: true } });
  } catch (error) {
    console.error('❌ Error computing phase1:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/phase1/probe/answer', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const answer = String(req.body?.answer || '').trim();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });
    if (!answer) return res.status(400).json({ success: false, message: 'Réponse requise' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase0 = service1Obj.phase0 && typeof service1Obj.phase0 === 'object' ? service1Obj.phase0 : {};
    const profile = phase0?.profile;
    const history = Array.isArray(phase0?.interview?.history) ? phase0.interview.history : [];
    const interviewHistory = history.map((h) => ({
      q: String(h?.question?.question || ''),
      a: String(h?.answerText || ''),
      k: String(h?.selectedKey || ''),
    }));

    const phase1Existing = service1Obj.phase1 && typeof service1Obj.phase1 === 'object' ? service1Obj.phase1 : {};
    const analysis = phase1Existing?.analysis && typeof phase1Existing.analysis === 'object' ? phase1Existing.analysis : null;
    if (String(phase1Existing?.status || '') !== 'awaiting_probe' || !analysis) {
      return res.status(400).json({ success: false, message: 'Phase 1 non prête pour la question de confirmation' });
    }

    const nowIso = new Date().toISOString();

    let reportMarkdown = '';
    let reportGeneratedAt = null;
    try {
      reportMarkdown = await generatePhase1DecisionReport({
        analysis,
        profile,
        interviewHistory,
        probeAnswer: answer,
      });
      reportGeneratedAt = new Date().toISOString();
    } catch (e) {
      reportMarkdown =
        `# Fiche de logique décisionnelle\n\n## Rôle revendiqué (Claimed Role)\n${String(analysis?.claimedRole || '—')}\n\n## Logique réelle observée (Real Logic)\n${String(analysis?.realRole || '—')}\n\n## Points de cohérence\n${(analysis?.consistency || []).map((s) => `- ${s}`).join('\n') || '- —'}\n\n## Points d'incohérence\n${(analysis?.incoherence || []).map((s) => `- ${s}`).join('\n') || '- —'}\n\n## Clarification\n${answer}\n\n## Verdict\n${String(analysis?.verdict || analysis?.rationale || '—')}\n\n## Recommandations\n- Clarifier le périmètre de responsabilités\n- Prioriser un rôle cohérent avec l'autonomie observée\n- Définir un plan de montée en compétences`;
      reportGeneratedAt = new Date().toISOString();
    }

    const phase1 = {
      status: 'completed',
      startedAt: String(phase1Existing?.startedAt || nowIso),
      analysis,
      probe: {
        question: String(phase1Existing?.probe?.question || ''),
        answer,
        answeredAt: nowIso,
      },
      reportMarkdown,
      reportGeneratedAt,
      completed: true,
      completedAt: reportGeneratedAt,
    };

    service1Obj.phase1 = phase1;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { phase1, done: true } });
  } catch (error) {
    console.error('❌ Error answering phase1 probe:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/phase0/analyze-cv', async (req, res) => {
  phase0Upload.single('cv')(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ success: false, message: String(uploadErr.message || 'Upload error') });
    }

    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      if (!email) return res.status(400).json({ success: false, message: 'Email requis' });
      if (!req.file?.buffer) return res.status(400).json({ success: false, message: 'Fichier requis' });

      const session = await loadAuthorizedActiveSessionByEmail(req, email);
      if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
      if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
      if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

      const rawText = await extractCvText({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
      });
      const cvText = String(rawText || '').replace(/\s+/g, ' ').trim().slice(0, 14000);
      const detectedLang = 'fr';
      if (!cvText) {
        return res.status(400).json({
          success: false,
          message: 'Impossible d\'extraire le texte du CV',
        });
      }

      const aiText = await callAIChat({
        messages: [
          {
            role: 'system',
            content:
              'Tu es un système d\'analyse de CV. Retourne uniquement du JSON valide, sans aucun texte autour. Clés: fullName, currentRole, experience, skills, summary, initialObservation. initialObservation doit être une phrase courte en français qui commence exactement par: "J\'ai analysé votre CV".',
          },
          {
            role: 'user',
            content: `Texte du CV (peut être non structuré):\n\n${cvText}`,
          },
        ],
        temperature: 0.1,
      });

      const parsed = safeJsonParse(aiText) || {};
      const profile = {
        fullName: String(parsed?.fullName || '').trim(),
        currentRole: String(parsed?.currentRole || '').trim(),
        experience: Number(parsed?.experience || 0) || 0,
        skills: Array.isArray(parsed?.skills) ? parsed.skills.map((s) => String(s || '').trim()).filter(Boolean) : [],
        summary: String(parsed?.summary || '').trim(),
      };
      const initialObservation = String(parsed?.initialObservation || '').trim();

      const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
      const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};

      service1Obj.language = 'fr';

      service1Obj.phase0 = {
        cv: {
          fileName: String(req.file.originalname || ''),
          mimeType: String(req.file.mimetype || ''),
          uploadedAt: new Date().toISOString(),
        },
        cvText,
        profile,
        initialObservation,
        interview: {
          status: 'ready',
          questionCount: 0,
          history: [],
          currentQuestion: null,
          completedAt: null,
        },
      };

      responsesObj.service1 = service1Obj;
      session.responses = responsesObj;
      session.markModified('responses');
      await session.save();

      return res.json({
        success: true,
        data: { phase0: service1Obj.phase0 },
      });
    } catch (error) {
      console.error('❌ Error analyzing CV:', error);
      if (error?.code === 'MISSING_KEY') {
        return res.status(503).json({
          success: false,
          message: 'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
        });
      }
      return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
    }
  });
});

router.post('/service1/phase0/interview/start', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase0 = service1Obj.phase0 && typeof service1Obj.phase0 === 'object' ? service1Obj.phase0 : {};

    const lang = getService1Lang(service1Obj);

    if (!phase0?.profile) {
      const incomingProfile = req.body?.profile && typeof req.body.profile === 'object' ? req.body.profile : null;
      if (incomingProfile) {
        phase0.profile = {
          fullName: String(incomingProfile?.fullName || '').trim(),
          currentRole: String(incomingProfile?.currentRole || '').trim(),
          experience: Number(incomingProfile?.experience || 0) || 0,
          skills: Array.isArray(incomingProfile?.skills)
            ? incomingProfile.skills.map((s) => String(s || '').trim()).filter(Boolean)
            : [],
          summary: String(incomingProfile?.summary || '').trim(),
        };
        service1Obj.phase0 = phase0;
        responsesObj.service1 = service1Obj;
        session.responses = responsesObj;
        session.markModified('responses');
        await session.save();
      } else {
        return res.status(400).json({ success: false, message: 'Veuillez d\'abord analyser le CV' });
      }
    }

    const interview = phase0.interview && typeof phase0.interview === 'object' ? phase0.interview : {};
    if (String(interview.status || '') === 'completed') {
      return res.json({ success: true, data: { phase0 } });
    }

    if (interview.currentQuestion) {
      return res.json({ success: true, data: { question: interview.currentQuestion, phase0 } });
    }

    const profile = phase0.profile;
    const history = Array.isArray(interview.history) ? interview.history : [];

    const q = await generatePhase0QuestionWithRetry({ profile, compactHistory: [], isFirst: true, lang });

    phase0.interview = {
      status: 'in_progress',
      questionCount: Number(interview.questionCount || 0) || 0,
      history,
      currentQuestion: q,
      completedAt: null,
    };

    service1Obj.phase0 = phase0;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { question: q, phase0 } });
  } catch (error) {
    console.error('❌ Error starting interview:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message: 'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/service1/phase0/interview/answer', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const selectedKey = String(req.body?.selectedKey || '').trim().toUpperCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });
    if (!['A', 'B', 'C', 'D'].includes(selectedKey)) {
      return res.status(400).json({ success: false, message: 'Réponse invalide' });
    }

    const session = await loadAuthorizedActiveSessionByEmail(req, email);
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' });
    if (session?.forbidden) return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (session?.inactive) return res.status(403).json({ success: false, message: 'Subscription inactive' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const service1Obj = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};
    const phase0 = service1Obj.phase0 && typeof service1Obj.phase0 === 'object' ? service1Obj.phase0 : {};
    const interview = phase0.interview && typeof phase0.interview === 'object' ? phase0.interview : {};
    let current = interview.currentQuestion;

    const lang = getService1Lang(service1Obj);

    if (!phase0?.profile) {
      const incomingProfile = req.body?.profile && typeof req.body.profile === 'object' ? req.body.profile : null;
      if (incomingProfile) {
        phase0.profile = {
          fullName: String(incomingProfile?.fullName || '').trim(),
          currentRole: String(incomingProfile?.currentRole || '').trim(),
          experience: Number(incomingProfile?.experience || 0) || 0,
          skills: Array.isArray(incomingProfile?.skills)
            ? incomingProfile.skills.map((s) => String(s || '').trim()).filter(Boolean)
            : [],
          summary: String(incomingProfile?.summary || '').trim(),
        };
      } else {
        return res.status(400).json({ success: false, message: 'Veuillez d\'abord analyser le CV' });
      }
    }

    if (!current?.id) {
      const incomingQ = req.body?.currentQuestion && typeof req.body.currentQuestion === 'object' ? req.body.currentQuestion : null;
      if (incomingQ) {
        const normalized = normalizePhase0Question(incomingQ);
        if (normalized?.id && normalized?.question && Array.isArray(normalized.options) && normalized.options.length === 4) {
          interview.currentQuestion = normalized;
          phase0.interview = interview;
          current = normalized;
        }
      }
    }

    if (!current?.id) {
      return res.status(400).json({ success: false, message: 'Aucune question en cours' });
    }

    const opts = Array.isArray(current.options) ? current.options : [];
    const selected = opts.find((o) => String(o?.key || '').toUpperCase() === selectedKey);
    const answerText = String(selected?.text || '').trim();

    const history = Array.isArray(interview.history) ? interview.history : [];
    history.push({
      at: new Date().toISOString(),
      question: current,
      selectedKey,
      answerText,
    });

    const questionCount = Number(interview.questionCount || 0) || 0;
    const nextCount = questionCount + 1;

    if (nextCount >= 5) {
      phase0.interview = {
        status: 'completed',
        questionCount: nextCount,
        history,
        currentQuestion: null,
        completedAt: new Date().toISOString(),
      };
      phase0.completed = true;
      phase0.completedAt = phase0.interview.completedAt;

      try {
        const note = await generatePhase0CadrageNote({
          profile: phase0.profile,
          initialObservation: phase0.initialObservation,
          history,
        });
        phase0.cadrageNote = note;
        phase0.cadrageNoteGeneratedAt = new Date().toISOString();
      } catch (e) {
        const role = String(phase0?.profile?.currentRole || '').trim();
        phase0.cadrageNote =
          `# Note de Cadrage\n\n## Qui êtes-vous\nProfil analysé (${role || '—'}).\n\n## Comment vous vous présentez\nSynthèse basée sur l'entretien.\n\n## La Gap\nÀ préciser (données insuffisantes).\n\n## Contraintes actuelles\nÀ préciser.\n\n## Prochaines étapes\n- Clarifier l'objectif\n- Identifier 2-3 options de positionnement\n- Définir un plan d'action`;
        phase0.cadrageNoteGeneratedAt = new Date().toISOString();
      }

      service1Obj.phase0 = phase0;
      responsesObj.service1 = service1Obj;
      session.responses = responsesObj;
      session.markModified('responses');
      await session.save();

      return res.json({
        success: true,
        data: {
          done: true,
          message: 'Les informations ont été consolidées et la Note de Cadrage a été générée.',
          phase0,
        },
      });
    }

    const profile = phase0.profile;
    const compactHistory = history.map((h) => ({
      q: String(h?.question?.question || ''),
      a: String(h?.answerText || ''),
    }));

    const nextQ = await generatePhase0QuestionWithRetry({ profile, compactHistory, isFirst: false, lang });

    phase0.interview = {
      status: 'in_progress',
      questionCount: nextCount,
      history,
      currentQuestion: nextQ,
      completedAt: null,
    };

    service1Obj.phase0 = phase0;
    responsesObj.service1 = service1Obj;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { question: nextQ, phase0 } });
  } catch (error) {
    console.error('❌ Error answering interview:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message: 'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

const computeTotalScore = (responses) => {
  try {
    const r = responses || {};

    // New format (recommended): { answers: [{ questionId, selectedOption: { label, score } }] }
    const answers = Array.isArray(r.answers) ? r.answers : [];
    if (answers.length > 0) {
      return answers.reduce((sum, a) => {
        const score =
          Number(a?.selectedOption?.score) ||
          Number(a?.score) ||
          0;
        return sum + (Number.isFinite(score) ? score : 0);
      }, 0);
    }

    // Legacy fallback: closedAnswers object (numeric values)
    const closed = r.closedAnswers && typeof r.closedAnswers === 'object' ? r.closedAnswers : null;
    if (closed) {
      return Object.values(closed)
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n))
        .reduce((a, b) => a + b, 0);
    }

    return 0;
  } catch {
    return 0;
  }
};

const computeOrientation = (total) => {
  // Default scoring matrix (can be refined later)
  if (total < 20) return 'Beginner';
  if (total <= 40) return 'Intermediate';
  return 'Expert';
};

const submitSchema = Joi.object({
  participant: Joi.object({
    fullName: Joi.string().trim().allow('').default(''),
    firstName: Joi.string().trim().allow('').default(''),
    email: Joi.string().email().trim().lowercase().allow('').default(''),
    whatsapp: Joi.string().trim().allow('').default(''),
    situation: Joi.string().trim().allow('').default(''),
  })
    .optional()
    .default({}),

  responses: Joi.object({
    answers: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.string().trim().required(),
          selectedOptionIndex: Joi.number().integer().min(0).required(),
          selectedLabel: Joi.string().trim().allow('').optional(),
        })
      )
      .optional(),
  })
    .unknown(true)
    .required(),

  scores: Joi.object({
    perBlock: Joi.object().default({}),
    total: Joi.number().optional(),
    orientation: Joi.string().allow('').default(''),
  })
    .optional()
    .default({}),

  metadata: Joi.object({
    source: Joi.string().optional(),
    userAgent: Joi.string().optional(),
    ip: Joi.string().optional(),
    selectedDomain: Joi.string().allow('').default(''),
  })
    .optional()
    .default({}),
});

// GET /api/diagnostic-sessions/public-subscription?email=...
router.get('/public-subscription', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    const ipRaw = String(req.ip || '').trim();
    const ipNorm = normalizeIp(ipRaw);
    const ipCandidates = Array.from(new Set([ipRaw, ipNorm].filter(Boolean)));

    const last = await DiagnosticSession.findOne({ 'participant.email': email })
      .select('subscriptionStatus analysis metadata submittedAt scores')
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    if (!last) {
      return res.status(404).json({ success: false, message: 'Session introuvable' });
    }

    const sessionIp = normalizeIp(String(last?.metadata?.ip || ''));
    if (!sessionIp || !ipCandidates.includes(sessionIp)) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    return res.json({
      success: true,
      data: {
        active: String(last.subscriptionStatus || 'pending') === 'active',
        subscriptionStatus: String(last.subscriptionStatus || 'pending'),
        implicitStatus: String(last?.analysis?.implicitStatus || 'en_attente'),
        selectedDomain: String(last?.metadata?.selectedDomain || ''),
        total: Number(last?.scores?.total ?? 0),
        orientation: String(last?.scores?.orientation || ''),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching public subscription:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

const computeWizardScoreFromDb = async (answers) => {
  const arr = Array.isArray(answers) ? answers : [];
  if (arr.length <= 0) {
    return { total: 0, enrichedAnswers: [] };
  }

  const questionIds = arr
    .map((a) => String(a?.questionId || '').trim())
    .filter((id) => Boolean(id));

  const questions = await DiagnosticQuestion.find({ _id: { $in: questionIds } }).lean();
  const byId = new Map(questions.map((q) => [String(q._id), q]));

  let total = 0;
  const enrichedAnswers = arr.map((a) => {
    const qid = String(a?.questionId || '').trim();
    const idx = Number(a?.selectedOptionIndex);
    const q = byId.get(qid);
    const opt = q && Array.isArray(q.options) && Number.isInteger(idx) ? q.options[idx] : null;
    const label = opt?.label || String(a?.selectedLabel || '').trim();
    const score = Number(opt?.score) || 0;
    if (Number.isFinite(score)) total += score;

    return {
      questionId: qid,
      questionText: q?.text || '',
      category: q?.category || '',
      selectedOptionIndex: Number.isFinite(idx) ? idx : 0,
      selectedOption: {
        label,
        score,
      },
    };
  });

  return { total, enrichedAnswers };
};

// GET /api/diagnostic-sessions/eligibility
router.get('/eligibility', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    const ipRaw = String(req.ip || '').trim();
    const ipNorm = normalizeIp(ipRaw);
    const ipCandidates = Array.from(new Set([ipRaw, ipNorm].filter(Boolean)));

    const suspendedByIp = await DiagnosticSession.findOne({
      'metadata.ip': { $in: ipCandidates },
      'analysis.implicitStatus': 'suspendu',
    })
      .select('_id submittedAt metadata participant analysis')
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    if (suspendedByIp) {
      return res.json({
        success: true,
        data: {
          allowNew: false,
          reason: 'suspendu',
          blockedBy: 'ip',
        },
      });
    }

    // Prefer email-based eligibility when email is provided (so UI can show a safe link to the user's result)
    if (email) {
      const lastByEmail = await DiagnosticSession.findOne({ 'participant.email': email })
        .select('_id submittedAt metadata analysis')
        .sort({ submittedAt: -1, createdAt: -1 })
        .lean();

      if (lastByEmail) {
        const implicitStatus = String(lastByEmail?.analysis?.implicitStatus || 'en_attente');
        const selectedDomain = String(lastByEmail?.metadata?.selectedDomain || '');

        if (implicitStatus === 'termine') {
          return res.json({
            success: true,
            data: {
              allowNew: true,
              reason: 'termine',
              blockedBy: 'email',
              lastSessionId: String(lastByEmail._id),
              selectedDomain,
            },
          });
        }

        if (implicitStatus === 'en_attente' || implicitStatus === 'annule') {
          return res.json({
            success: true,
            data: {
              allowNew: false,
              reason: implicitStatus,
              blockedBy: 'email',
              lastSessionId: String(lastByEmail._id),
              selectedDomain,
            },
          });
        }

        if (implicitStatus === 'suspendu') {
          return res.json({
            success: true,
            data: {
              allowNew: false,
              reason: 'suspendu',
              blockedBy: 'email',
            },
          });
        }
      }
    }

    // Fallback to IP-based eligibility (spam prevention even if email changes)
    const lastByIp = await DiagnosticSession.findOne({ 'metadata.ip': { $in: ipCandidates } })
      .select('_id submittedAt metadata analysis')
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    if (lastByIp) {
      const implicitStatus = String(lastByIp?.analysis?.implicitStatus || 'en_attente');
      const selectedDomain = String(lastByIp?.metadata?.selectedDomain || '');

      if (implicitStatus === 'en_attente' || implicitStatus === 'annule') {
        return res.json({
          success: true,
          data: {
            allowNew: false,
            reason: implicitStatus,
            blockedBy: 'ip',
            lastSessionId: String(lastByIp._id),
            selectedDomain,
          },
        });
      }

      if (implicitStatus === 'suspendu') {
        return res.json({
          success: true,
          data: {
            allowNew: false,
            reason: 'suspendu',
            blockedBy: 'ip',
          },
        });
      }

      if (implicitStatus === 'termine') {
        // Allow new by default
      }
    }

    return res.json({
      success: true,
      data: {
        allowNew: true,
        reason: 'new',
        blockedBy: 'none',
      },
    });
  } catch (error) {
    console.error('❌ Error checking eligibility:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error.message,
    });
  }
});

// GET /api/diagnostic-sessions/public-result?email=...
router.get('/public-result', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis',
      });
    }

    const ipRaw = String(req.ip || '').trim();
    const ipNorm = normalizeIp(ipRaw);
    const ipCandidates = Array.from(new Set([ipRaw, ipNorm].filter(Boolean)));

    const lastByEmail = await DiagnosticSession.findOne({ 'participant.email': email })
      .select('participant scores metadata submittedAt analysis')
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    if (!lastByEmail) {
      return res.status(404).json({
        success: false,
        message: 'Session introuvable',
      });
    }

    const sessionIp = normalizeIp(String(lastByEmail?.metadata?.ip || ''));
    if (!sessionIp || !ipCandidates.includes(sessionIp)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
      });
    }

    return res.json({
      success: true,
      data: {
        submittedAt: lastByEmail.submittedAt,
        selectedDomain: String(lastByEmail?.metadata?.selectedDomain || ''),
        total: Number(lastByEmail?.scores?.total ?? 0),
        orientation: String(lastByEmail?.scores?.orientation || ''),
        implicitStatus: String(lastByEmail?.analysis?.implicitStatus || 'en_attente'),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching public result:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération',
      error: error.message,
    });
  }
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
        { 'participant.fullName': { $regex: q, $options: 'i' } },
        { 'participant.email': { $regex: q, $options: 'i' } },
        { 'participant.whatsapp': { $regex: q, $options: 'i' } },
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

const implicitStatusSchema = Joi.object({
  implicitStatus: Joi.string().valid('en_attente', 'termine', 'annule', 'suspendu').required(),
  expertId: Joi.string().allow('').default(''),
  expertEmail: Joi.string().allow('').default(''),
});

router.put('/:id/implicit-status', requireExpert, async (req, res) => {
  try {
    const { error, value } = implicitStatusSchema.validate(req.body, { stripUnknown: true });
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
        'analysis.implicitStatus': value.implicitStatus,
        $push: {
          reviewHistory: {
            at: new Date(),
            expertId,
            expertEmail,
            payload: { implicitStatus: value.implicitStatus },
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

    return res.json({
      success: true,
      message: 'Statut mis à jour',
      data: session,
    });
  } catch (error) {
    console.error('❌ Error updating implicit status:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
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

// PUT /api/diagnostic-sessions/:id/activate-subscription (admin)
router.put('/:id/activate-subscription', requireExpert, async (req, res) => {
  try {
    const session = await DiagnosticSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session de diagnostic introuvable',
      });
    }

    session.subscriptionStatus = 'active';
    await session.save();

    return res.json({ success: true, data: session });
  } catch (error) {
    console.error('❌ Error activating subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'activation',
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

    const incomingAnswers = Array.isArray(value?.responses?.answers) ? value.responses.answers : [];

    if (incomingAnswers.length > 0) {
      const fullName = String(value?.participant?.fullName || '').trim();
      const email = String(value?.participant?.email || '').trim();
      const whatsapp = String(value?.participant?.whatsapp || '').trim();

      if (!fullName || !email || !whatsapp) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          error: 'participant.fullName, participant.email and participant.whatsapp are required',
        });
      }
    }

    let computedTotal = 0;
    let computedOrientation = '';
    let finalResponses = value.responses;

    if (incomingAnswers.length > 0) {
      // New wizard format: compute score from DB (do NOT trust client scores)
      const { total, enrichedAnswers } = await computeWizardScoreFromDb(incomingAnswers);
      computedTotal = total;
      computedOrientation = computeOrientation(computedTotal);
      finalResponses = {
        ...value.responses,
        answers: enrichedAnswers,
      };
    } else {
      // Legacy: compute from payload if no wizard answers
      computedTotal = computeTotalScore(value.responses);
      computedOrientation = computeOrientation(computedTotal);
    }

    const session = new DiagnosticSession({
      status: 'pending',
      participant: {
        ...value.participant,
        // Backward compatibility: keep firstName populated if only fullName is provided
        firstName: value.participant?.firstName || value.participant?.fullName || '',
      },
      responses: finalResponses,
      scores: {
        perBlock: value.scores?.perBlock || {},
        total: computedTotal,
        orientation: computedOrientation,
      },
      metadata: {
        source: value.metadata?.source || 'web',
        userAgent: value.metadata?.userAgent || req.headers['user-agent'] || '',
        ip: normalizeIp(value.metadata?.ip || req.ip || ''),
        selectedDomain: value.metadata?.selectedDomain || '',
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

router.post('/:id/service1/audit-report/upload', requireExpert, uploadSupabase.single('file'), async (req, res) => {
  try {
    const session = await DiagnosticSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session de diagnostic introuvable' });
    }
    if (!req.file?.path) {
      return res.status(400).json({ success: false, message: 'Fichier requis' });
    }

    const supaUrl = await uploadToSupabase(req.file.path, `diagnostic-audit-${session._id}`, 'audit-positionnement');

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};

    s1.auditReport = {
      url: supaUrl,
      fileName: String(req.file.originalname || ''),
      uploadedAt: new Date().toISOString(),
    };
    responsesObj.service1 = s1;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { auditReport: s1.auditReport } });
  } catch (error) {
    console.error('❌ Error uploading audit report:', error);
    if (error?.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        message:
          'IA non configurée: veuillez ajouter DEEPSEEK_API_KEY ou OPENAI_API_KEY dans backend/.env puis redémarrer le serveur.',
      });
    }
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

router.post('/:id/service1/appointment', requireExpert, async (req, res) => {
  try {
    const session = await DiagnosticSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session de diagnostic introuvable' });
    }

    const scheduledAt = String(req.body?.scheduledAt || '').trim();
    const notes = String(req.body?.notes || '').trim();
    if (!scheduledAt) return res.status(400).json({ success: false, message: 'scheduledAt requis' });

    const responsesObj = session.responses && typeof session.responses === 'object' ? session.responses : {};
    const s1 = responsesObj.service1 && typeof responsesObj.service1 === 'object' ? responsesObj.service1 : {};

    s1.directSessionAppointment = {
      scheduledAt,
      notes,
      updatedAt: new Date().toISOString(),
    };

    responsesObj.service1 = s1;
    session.responses = responsesObj;
    session.markModified('responses');
    await session.save();

    return res.json({ success: true, data: { appointment: s1.directSessionAppointment } });
  } catch (error) {
    console.error('❌ Error saving appointment:', error);
    return res.status(500).json({ success: false, message: String(error?.message || 'Erreur serveur') });
  }
});

export default router;
