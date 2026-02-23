import fetch from 'node-fetch';

function env(name, fallback = '') {
  return String(process.env[name] ?? fallback);
}

function pickAiConfig() {
  const apiKey = env('SK_API_KEY') || env('DEEPSEEK_API_KEY') || env('DEEPSEEK_API_KEY_SERVICE1');
  const baseUrl = (env('SK_BASE_URL') || env('DEEPSEEK_BASE_URL') || 'https://api.deepseek.com/v1').replace(/\/+$/, '');
  const model = env('SK_MODEL') || env('DEEPSEEK_MODEL') || 'deepseek-chat';

  return { apiKey, baseUrl, model };
}

function extractJsonObject(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;

  const candidate = raw.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

export async function analyzeService2Submission({ exam, task, submissionText, history }) {
  const { apiKey, baseUrl, model } = pickAiConfig();
  if (!apiKey) {
    const err = new Error('AI non configuré');
    err.code = 'MISSING_KEY';
    throw err;
  }

  const constraints = Array.isArray(exam?.constraints) ? exam.constraints : [];
  const criteria = Array.isArray(exam?.successCriteria) ? exam.successCriteria : [];

  const systemPrompt =
    'Tu es un évaluateur automatique. Tu dois retourner uniquement un JSON valide, sans texte autour.\n' +
    'Le JSON doit respecter ce schéma:\n' +
    '{\n' +
    '  "score": number,\n' +
    '  "summary": string,\n' +
    '  "warnings": string[],\n' +
    '  "tips": string[],\n' +
    '  "constraintViolations": {"constraint": string, "reason": string}[],\n' +
    '  "successCriteria": {"criterion": string, "met": boolean, "reason": string}[],\n' +
    '  "strengths": string[],\n' +
    '  "weaknesses": string[],\n' +
    '  "recommendations": string[]\n' +
    '}\n' +
    'Le score est entre 0 et 100.';

  const userPrompt =
    `SCENARIO:\n${String(exam?.scenarioBrief || '')}\n\n` +
    `TASK:\n${String(task?.prompt || '')}\n\n` +
    `CONSTRAINTS:\n- ${constraints.map((c) => String(c)).join('\n- ')}\n\n` +
    `SUCCESS CRITERIA:\n- ${criteria.map((c) => String(c)).join('\n- ')}\n\n` +
    `SUBMISSION:\n${String(submissionText || '')}\n\n` +
    `HISTORY (optional):\n${history ? JSON.stringify(history).slice(0, 4000) : ''}`;

  const url = `${baseUrl}/chat/completions`;

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    }),
  });

  const rawText = await r.text();
  if (!r.ok) {
    const err = new Error(rawText || `HTTP ${r.status}`);
    err.code = 'AI_HTTP_ERROR';
    throw err;
  }

  let parsed;
  try {
    const payload = JSON.parse(rawText);
    const content = payload?.choices?.[0]?.message?.content;
    parsed = extractJsonObject(content);
  } catch {
    parsed = null;
  }

  if (!parsed || typeof parsed !== 'object') {
    const err = new Error('Réponse AI invalide');
    err.code = 'AI_INVALID_JSON';
    err.raw = rawText;
    throw err;
  }

  const scoreNum = Number(parsed.score);
  const safeScore = Number.isFinite(scoreNum) ? Math.max(0, Math.min(100, scoreNum)) : 0;

  return {
    score: safeScore,
    summary: String(parsed.summary || ''),
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
    tips: Array.isArray(parsed.tips) ? parsed.tips.map(String) : [],
    constraintViolations: Array.isArray(parsed.constraintViolations) ? parsed.constraintViolations : [],
    successCriteria: Array.isArray(parsed.successCriteria) ? parsed.successCriteria : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(String) : [],
    raw: parsed,
    model,
  };
}

export async function generateService2AccountFullReport({
  exam,
  account,
  submissions,
  actionPlan,
  finalVerdict,
}) {
  const { apiKey, baseUrl, model } = pickAiConfig();
  if (!apiKey) {
    const err = new Error('AI non configuré');
    err.code = 'MISSING_KEY';
    throw err;
  }

  const systemPrompt =
    'Tu es un analyste expert. Tu dois retourner uniquement un JSON valide, sans texte autour.\n' +
    'Le JSON doit respecter ce schéma:\n' +
    '{\n' +
    '  "reportText": string,\n' +
    '  "profile": {"summary": string, "writingStyle": string, "strengths": string[], "weaknesses": string[]},\n' +
    '  "aiSummary": {"overallScore": number, "keyWarnings": string[], "keyRecommendations": string[]},\n' +
    '  "timeline": {"submissionsCount": number, "lastSubmissionAt": string},\n' +
    '  "notesForAdmin": string[]\n' +
    '}\n' +
    'Le texte du report doit être détaillé, structuré (titres, paragraphes), et basé uniquement sur les données fournies.';

  const userPrompt =
    `ACCOUNT:\n${JSON.stringify(account || {}).slice(0, 1500)}\n\n` +
    `EXAM:\n${JSON.stringify(exam || {}).slice(0, 3000)}\n\n` +
    `SUBMISSIONS:\n${JSON.stringify(submissions || []).slice(0, 20000)}\n\n` +
    `ACTION_PLAN:\n${JSON.stringify(actionPlan || null).slice(0, 8000)}\n\n` +
    `FINAL_VERDICT:\n${JSON.stringify(finalVerdict || null).slice(0, 4000)}`;

  const url = `${baseUrl}/chat/completions`;

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    }),
  });

  const rawText = await r.text();
  if (!r.ok) {
    const err = new Error(rawText || `HTTP ${r.status}`);
    err.code = 'AI_HTTP_ERROR';
    throw err;
  }

  let parsed;
  try {
    const payload = JSON.parse(rawText);
    const content = payload?.choices?.[0]?.message?.content;
    parsed = extractJsonObject(content);
  } catch {
    parsed = null;
  }

  if (!parsed || typeof parsed !== 'object') {
    const err = new Error('Réponse AI invalide');
    err.code = 'AI_INVALID_JSON';
    err.raw = rawText;
    throw err;
  }

  const scoreNum = Number(parsed?.aiSummary?.overallScore);
  const safeScore = Number.isFinite(scoreNum) ? Math.max(0, Math.min(100, scoreNum)) : 0;

  return {
    reportText: String(parsed.reportText || ''),
    profile: parsed.profile && typeof parsed.profile === 'object' ? parsed.profile : null,
    aiSummary: {
      overallScore: safeScore,
      keyWarnings: Array.isArray(parsed?.aiSummary?.keyWarnings) ? parsed.aiSummary.keyWarnings.map(String) : [],
      keyRecommendations: Array.isArray(parsed?.aiSummary?.keyRecommendations) ? parsed.aiSummary.keyRecommendations.map(String) : [],
    },
    timeline: parsed.timeline && typeof parsed.timeline === 'object' ? parsed.timeline : null,
    notesForAdmin: Array.isArray(parsed.notesForAdmin) ? parsed.notesForAdmin.map(String) : [],
    raw: parsed,
    model,
  };
}
