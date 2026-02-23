import { useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../config/api';

type CareerQuestProfileSnapshot = {
  declaredRole: string;
  realRole: string;
  maturityLevel: string;
  weaknesses: string[];
  strengths: string[];
  exclusions: string[];
  selectedPath: { id?: string; type?: string; title?: string } | null;
};

type Service1FinalAction = {
  id: string;
  title: string;
  description: string;
  pressure: string;
};

type Service1SkillGap = {
  skillName: string;
  currentLevel: string;
  requiredLevel: string;
  gapDescription: string;
  microActions: string[];
  expertNoteFR: string;
  at?: string;
};

type CareerQuestService1Phase5 = {
  finalActions: Service1FinalAction[];
  selectedFinalAction: (Service1FinalAction & { selectedAt?: string }) | null;
  skillGap: Service1SkillGap | null;
};

const coerceProgress = (parsed: any, fallbackUpdatedAt?: string | null): GameProgress => {
  const base: GameProgress = {
    level: 1,
    xp: 0,
    coins: 1200,
    gems: 150,
    completedTaskIds: [],
    proofs: {},
    updatedAt: typeof fallbackUpdatedAt === 'string' ? fallbackUpdatedAt : new Date().toISOString(),
    revision: 0,
  };

  if (!parsed || typeof parsed !== 'object') return base;

  return {
    ...base,
    level: Number.isFinite(parsed.level) ? clamp(Number(parsed.level), 1, 99) : base.level,
    xp: Number.isFinite(parsed.xp) ? clamp(Number(parsed.xp), 0, 9999999) : base.xp,
    coins: Number.isFinite(parsed.coins) ? clamp(Number(parsed.coins), 0, 9999999) : base.coins,
    gems: Number.isFinite(parsed.gems) ? clamp(Number(parsed.gems), 0, 9999999) : base.gems,
    completedTaskIds: Array.isArray(parsed.completedTaskIds) ? parsed.completedTaskIds.map(String) : base.completedTaskIds,
    proofs: parsed.proofs && typeof parsed.proofs === 'object' ? parsed.proofs : base.proofs,
    updatedAt: String(parsed.updatedAt || base.updatedAt),
    revision: Number.isFinite(parsed.revision) ? clamp(Number(parsed.revision), 0, 9999999) : base.revision,
  };
};

type CareerQuestLoginResponse = {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    sessionId: string;
    sessionToken: string;
    profileSnapshot: CareerQuestProfileSnapshot;
    service1?: { phase5?: CareerQuestService1Phase5 };
  };
};

const STORAGE_KEY = 'career_quest_session';

type ProofSubmission = {
  url?: string;
  note?: string;
  submittedAt: string;
  aiScore?: number;
  aiLabel?: string;
  aiTips?: string[];
  aiMeta?: any;
  analyzedAt?: string;
};

type QuestTask = {
  id: string;
  phaseId: string;
  title: string;
  objective: string;
  actions: string[];
  proofLabel: string;
  proofHint: string;
  rewardXp: number;
  rewardCoins: number;
};

type QuestPhase = {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  tasks: QuestTask[];
};

type GameProgress = {
  level: number;
  xp: number;
  coins: number;
  gems: number;
  completedTaskIds: string[];
  proofs: Record<string, ProofSubmission>;
  updatedAt: string;
  revision: number;
};

type GameTab = 'tasks' | 'log' | 'profile' | 'coach';

type GuideLang = 'ar' | 'fr' | 'en';

const buildProgressKey = (sessionId: string) => `career_quest_progress::${sessionId}`;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const xpToNextLevel = (level: number) => 900 + Math.max(0, level - 1) * 250;

const safeParseJson = (raw: string | null) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const normalizeText = (s: string) => String(s || '').trim().toLowerCase();

const extractKeywords = (items: string[], limit = 24) => {
  const raw = Array.isArray(items) ? items : [];
  const words: string[] = [];
  for (const it of raw) {
    const t = normalizeText(it)
      .replace(/[^a-z0-9\u0600-\u06FF\s]+/g, ' ')
      .split(/\s+/g)
      .map((x) => x.trim())
      .filter((x) => x.length >= 4);
    words.push(...t);
  }
  return Array.from(new Set(words)).slice(0, limit);
};

const buildService1PriorityMatcher = (snapshot: CareerQuestProfileSnapshot | null, service1Phase5: CareerQuestService1Phase5 | null) => {
  const weaknessKeywords = extractKeywords((snapshot?.weaknesses || []).slice(0, 12));
  const skillGap = service1Phase5?.skillGap || null;
  const skillKeywords = extractKeywords([
    String(skillGap?.skillName || ''),
    ...(Array.isArray(skillGap?.microActions) ? skillGap!.microActions.slice(0, 6) : []),
  ]);
  const keywords = Array.from(new Set([...weaknessKeywords, ...skillKeywords])).filter(Boolean);

  return (task: QuestTask | null) => {
    if (!task) return false;
    if (String(task.id || '').startsWith('s1fa-')) return false;
    if (!keywords.length) return false;
    const hay = normalizeText(`${task.title} ${task.objective} ${(task.actions || []).join(' ')}`);
    return keywords.some((k) => k && hay.includes(k));
  };
};

const hasWeakness = (snapshot: CareerQuestProfileSnapshot | null, keyword: string) => {
  const k = normalizeText(keyword);
  const items = Array.isArray(snapshot?.weaknesses) ? snapshot?.weaknesses : [];
  return items.some((w) => normalizeText(w).includes(k));
};

const buildPhases = (snapshot: CareerQuestProfileSnapshot | null, service1Phase5: CareerQuestService1Phase5 | null): QuestPhase[] => {
  const softenOutreach =
    hasWeakness(snapshot, 'communication') ||
    hasWeakness(snapshot, 'collaboration') ||
    hasWeakness(snapshot, 'public');

  const outreachAction = softenOutreach
    ? 'Commence par un message court (5 lignes) + une question simple.'
    : 'Message structuré (observation + mini-solution + preuve + call-to-action).';

  const s1Actions = Array.isArray(service1Phase5?.finalActions) ? service1Phase5!.finalActions : [];
  const selectedId = String(service1Phase5?.selectedFinalAction?.id || '').trim();
  const skillGap = service1Phase5?.skillGap || null;

  const actionToReward = (pressure: string) => {
    const p = String(pressure || '').toLowerCase();
    if (p === 'high') return { xp: 880, coins: 420 };
    if (p === 'low') return { xp: 520, coins: 260 };
    return { xp: 700, coins: 340 };
  };

  const personalizedTasks: QuestTask[] = s1Actions
    .map((a, idx) => {
      const id = String(a?.id || `s1_action_${idx + 1}`).trim();
      const title = String(a?.title || '').trim();
      const description = String(a?.description || '').trim();
      const pressure = String(a?.pressure || 'medium').trim();
      if (!id || !title || !description) return null;

      const reward = actionToReward(pressure);
      const micro = Array.isArray(skillGap?.microActions) ? skillGap!.microActions.slice(0, 4) : [];

      return {
        id: `s1fa-${id}`,
        phaseId: 'phase12',
        title: `${selectedId && selectedId === id ? '⭐ ' : ''}${title}`,
        objective: `Service 1 (Final Action): ${description}`,
        actions: [
          'Rédige un plan étape par étape (objectif, contraintes, risques, priorités).',
          'Ajoute 3 hypothèses + 3 risques + 3 KPI/indicateurs.',
          ...(micro.length ? micro : ['Ajoute au moins 3 micro-actions concrètes.']),
          'Fais une mini simulation (10-15 minutes) et note tes améliorations.',
        ],
        proofLabel: 'Screenshot + AI feedback',
        proofHint: 'Ajoute un screenshot + texte (optionnel) pour analyse IA. Seul le feedback est sauvegardé.',
        rewardXp: reward.xp,
        rewardCoins: reward.coins,
      } as QuestTask;
    })
    .filter(Boolean) as QuestTask[];

  return [
    {
      id: 'phase0',
      index: 0,
      title: 'Setup',
      subtitle: 'Préparer ton terrain de jeu',
      tasks: [
        {
          id: 'p0-avatar',
          phaseId: 'phase0',
          title: 'Créer ton profil',
          objective: 'Définir ton identité de carrière et connecter tes outils.',
          actions: [
            'Choisir un nom de joueur (pro ou pseudo).',
            'Définir un objectif (emploi / freelance / évolution).',
            'Connecter LinkedIn ou Portfolio.',
          ],
          proofLabel: 'Lien LinkedIn ou Portfolio',
          proofHint: 'Colle un lien public (LinkedIn, Notion, Google Site, GitHub…).',
          rewardXp: 150,
          rewardCoins: 80,
        },
      ],
    },
    {
      id: 'phase1',
      index: 1,
      title: 'Identity',
      subtitle: 'Clarifier ta valeur',
      tasks: [
        {
          id: 'p1-brand',
          phaseId: 'phase1',
          title: 'Personal Brand Statement',
          objective: 'Écrire une phrase claire qui résume ce que tu fais et pour qui.',
          actions: [
            'Lister 3 compétences clés + 1 niche.',
            'Écrire 1 statement (1-2 lignes) + 1 version longue (4-6 lignes).',
            'Publier sur LinkedIn ou portfolio.',
          ],
          proofLabel: 'Lien vers la section publiée',
          proofHint: 'Donne le lien exact (profil / page portfolio).',
          rewardXp: 220,
          rewardCoins: 120,
        },
      ],
    },
    {
      id: 'phase2',
      index: 2,
      title: 'Portfolio',
      subtitle: 'Construire une vitrine',
      tasks: [
        {
          id: 'p2-portfolio',
          phaseId: 'phase2',
          title: 'Lancer ton portfolio',
          objective: 'Créer une page portfolio avec au moins 1 projet.',
          actions: [
            'Créer la page (À propos, Projets, Contact).',
            'Ajouter 1 mini case study.',
            'Mettre le lien sur LinkedIn (si possible).',
          ],
          proofLabel: 'Lien du portfolio',
          proofHint: 'Un lien public. Pas de fichiers.',
          rewardXp: 350,
          rewardCoins: 180,
        },
      ],
    },
    {
      id: 'phase3',
      index: 3,
      title: 'LinkedIn',
      subtitle: 'Devenir visible',
      tasks: [
        {
          id: 'p3-linkedin',
          phaseId: 'phase3',
          title: 'Optimiser LinkedIn + 1 post',
          objective: 'Mettre ton profil en mode pro + publier un post.',
          actions: ['Mettre à jour Headline + About.', 'Ajouter une photo correcte.', 'Publier 1 post sur ton projet.'],
          proofLabel: 'Lien du post LinkedIn',
          proofHint: 'Colle le lien direct du post.',
          rewardXp: 300,
          rewardCoins: 160,
        },
      ],
    },
    {
      id: 'phase4',
      index: 4,
      title: 'Content',
      subtitle: 'Construire l’autorité',
      tasks: [
        {
          id: 'p4-content',
          phaseId: 'phase4',
          title: 'Série de 3 contenus',
          objective: 'Publier 3 contenus courts (update, insight, mini-solution).',
          actions: ['Post 1: update.', 'Post 2: insight métier.', 'Post 3: mini-solution.'],
          proofLabel: 'Lien du 3ème post',
          proofHint: 'Colle un lien public (LinkedIn, Medium…).',
          rewardXp: 420,
          rewardCoins: 220,
        },
      ],
    },
    {
      id: 'phase5',
      index: 5,
      title: 'Analyse',
      subtitle: 'Trouver de vrais problèmes',
      tasks: [
        {
          id: 'p5-companies',
          phaseId: 'phase5',
          title: 'Analyser 10 entreprises',
          objective: 'Lister 10 entreprises + 1 problème concret + 1 mini-solution.',
          actions: ['Lister 10 entreprises (site + contact).', 'Pour chaque: 1 problème + 1 mini-solution.', 'Choisir 3 priorités.'],
          proofLabel: 'Lien Google Sheet / Notion',
          proofHint: 'Partage en lecture seule.',
          rewardXp: 500,
          rewardCoins: 260,
        },
      ],
    },
    {
      id: 'phase6',
      index: 6,
      title: 'Outreach',
      subtitle: 'Action réelle',
      tasks: [
        {
          id: 'p6-outreach',
          phaseId: 'phase6',
          title: 'Envoyer 5 messages',
          objective: 'Envoyer 5 messages avec observation + mini-solution + lien portfolio.',
          actions: [outreachAction, 'Envoyer 5 messages (en gardant une copie).', 'Programmer un follow-up à J+7.'],
          proofLabel: 'Lien copie (Google Doc/Notion)',
          proofHint: 'Pas de fichiers uploadés. Un lien seulement.',
          rewardXp: 550,
          rewardCoins: 280,
        },
      ],
    },
    {
      id: 'phase7',
      index: 7,
      title: 'Client',
      subtitle: 'Proposition',
      tasks: [
        {
          id: 'p7-proposal',
          phaseId: 'phase7',
          title: 'Préparer 1 proposition',
          objective: 'Créer une proposition simple (scope + prix + délais) ou un pitch 60s.',
          actions: ['Proposition 1 page.', 'Pitch 60 secondes.', 'Demander 1 feedback.'],
          proofLabel: 'Lien de la proposition',
          proofHint: 'Lien lecture seule.',
          rewardXp: 450,
          rewardCoins: 240,
        },
      ],
    },
    {
      id: 'phase8',
      index: 8,
      title: 'Network',
      subtitle: 'Communautés',
      tasks: [
        {
          id: 'p8-network',
          phaseId: 'phase8',
          title: '2 communautés + 1 feedback',
          objective: 'Entrer dans 2 groupes pro et obtenir 1 feedback exploitable.',
          actions: ['Rejoindre 2 communautés.', 'Poster une question/partage.', 'Collecter 1 feedback.'],
          proofLabel: 'Lien vers ton post',
          proofHint: 'Lien public ou accessible.',
          rewardXp: 320,
          rewardCoins: 160,
        },
      ],
    },
    {
      id: 'phase9',
      index: 9,
      title: 'Metrics',
      subtitle: 'Mesurer',
      tasks: [
        {
          id: 'p9-metrics',
          phaseId: 'phase9',
          title: 'Dashboard actions',
          objective: 'Suivre messages, réponses, contenu, conversions.',
          actions: ['Créer un tableau.', 'Mettre à jour 7 jours.', 'Déduire 1 amélioration.'],
          proofLabel: 'Lien du dashboard',
          proofHint: 'Lecture seule.',
          rewardXp: 400,
          rewardCoins: 200,
        },
      ],
    },
    {
      id: 'phase10',
      index: 10,
      title: 'Interview',
      subtitle: 'CV + mock',
      tasks: [
        {
          id: 'p10-cv',
          phaseId: 'phase10',
          title: 'CV 1 page + mock interview',
          objective: 'Mettre à jour ton CV et faire 1 mock interview (notes).',
          actions: ['CV 1 page centré résultats.', 'Mock interview 30 min.', 'Plan d’amélioration (3 points).'],
          proofLabel: 'Lien vers CV ou notes',
          proofHint: 'Lien seulement.',
          rewardXp: 520,
          rewardCoins: 260,
        },
      ],
    },
    {
      id: 'phase11',
      index: 11,
      title: 'Certifs',
      subtitle: 'Crédibilité',
      tasks: [
        {
          id: 'p11-cert',
          phaseId: 'phase11',
          title: 'Ajouter 1 certification',
          objective: 'Obtenir/ajouter 1 certification pertinente + l’afficher.',
          actions: ['Choisir 1 certification.', 'Ajouter le lien sur profil.', 'Écrire 3 lignes: apprentissages.'],
          proofLabel: 'Lien badge/certification',
          proofHint: 'Lien public.',
          rewardXp: 380,
          rewardCoins: 180,
        },
      ],
    },
    {
      id: 'phase12',
      index: 12,
      title: 'Soft Skills',
      subtitle: 'Leadership',
      tasks: [
        {
          id: 'p12-soft',
          phaseId: 'phase12',
          title: 'Exercice 7 jours',
          objective: 'Choisir 1 soft skill et la pratiquer 7 jours.',
          actions: ['Choisir une soft skill.', '1 exercice/jour (10-20 min).', 'Mini-rétro de fin.'],
          proofLabel: 'Lien journal (Notion/Doc)',
          proofHint: 'Lecture seule.',
          rewardXp: 450,
          rewardCoins: 220,
        },
        ...personalizedTasks,
      ],
    },
  ];
};

const CareerQuestPage = () => {
  const existingSession = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [email, setEmail] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [session, setSession] = useState<any>(existingSession);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedSigRef = useRef<string>('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp.trim(),
      fullName: fullName.trim(),
    };

    if (!payload.email || !payload.whatsapp || !payload.fullName) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/career-quest/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as CareerQuestLoginResponse;
      if (!json.success || !json.data) {
        setError(json.message || 'Identifiants invalides');
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
      setSession(json.data);
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  const snapshot: CareerQuestProfileSnapshot | null = session?.profileSnapshot || null;
  const service1Phase5: CareerQuestService1Phase5 | null = (session?.service1?.phase5 as any) || null;

  const isService1Priority = useMemo(() => buildService1PriorityMatcher(snapshot, service1Phase5), [snapshot, service1Phase5]);

  const phases = useMemo(() => buildPhases(snapshot, service1Phase5), [snapshot, service1Phase5]);
  const sessionId = String(session?.sessionId || '').trim();
  const sessionToken = String(session?.sessionToken || '').trim();

  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [activePhaseId, setActivePhaseId] = useState<string>('phase0');
  const [activeTaskId, setActiveTaskId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<GameTab>('tasks');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofScreenshotText, setProofScreenshotText] = useState<string>('');
  const [actionMsg, setActionMsg] = useState<string>('');
  const [proofAiLoading, setProofAiLoading] = useState<boolean>(false);
  const [proofAiError, setProofAiError] = useState<string>('');
  const [proofAiResult, setProofAiResult] = useState<any>(null);
  const [coachLiveLoading, setCoachLiveLoading] = useState<boolean>(false);
  const [coachLiveError, setCoachLiveError] = useState<string>('');
  const [coachLiveData, setCoachLiveData] = useState<any>(null);
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  const [guideLang, setGuideLang] = useState<GuideLang>('fr');

  useEffect(() => {
    if (!session) return;
    if (!sessionToken) {
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
      setError('Veuillez vous reconnecter pour continuer.');
    }
  }, [session, sessionToken]);

  useEffect(() => {
    if (!guideOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGuideOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [guideOpen]);

  useEffect(() => {
    if (!sessionId) {
      setProgress(null);
      return;
    }

    const localRaw = localStorage.getItem(buildProgressKey(sessionId));
    const localParsed = safeParseJson(localRaw);
    const localProgress = coerceProgress(localParsed);
    setProgress(localProgress);

    (async () => {
      if (!sessionToken) return;
      try {
        const r = await fetch(`${API_BASE_URL}/career-quest/progress`, {
          method: 'GET',
          headers: {
            'x-career-quest-session-id': sessionId,
            'x-career-quest-token': sessionToken,
          },
        });

        const j = await r.json();
        if (!j?.success) return;
        const serverProgress = coerceProgress(
          { ...(j?.data?.progress || {}), revision: Number(j?.data?.revision ?? 0) },
          j?.data?.updatedAt ?? null
        );

        const serverUpdatedAt = new Date(serverProgress.updatedAt).getTime();
        const localUpdatedAt = new Date(localProgress.updatedAt).getTime();
        if (Number.isFinite(serverUpdatedAt) && serverUpdatedAt > localUpdatedAt) {
          localStorage.setItem(buildProgressKey(sessionId), JSON.stringify(serverProgress));
          setProgress(serverProgress);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [sessionId]);

  const saveProgress = (next: GameProgress) => {
    if (!sessionId) return;
    localStorage.setItem(buildProgressKey(sessionId), JSON.stringify(next));
    setProgress(next);
  };

  useEffect(() => {
    if (!sessionId || !sessionToken || !progress) return;

    const sig = `${String(progress.updatedAt || '')}::${Number(progress.revision || 0)}`;
    if (sig === lastSyncedSigRef.current) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/career-quest/progress`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-career-quest-session-id': sessionId,
            'x-career-quest-token': sessionToken,
          },
          body: JSON.stringify({ progress, revision: Number(progress.revision ?? 0) }),
        });

        if (r.status === 409) {
          const j = await r.json().catch(() => null);
          const serverProgress = coerceProgress(
            { ...(j?.data?.progress || {}), revision: Number(j?.data?.revision ?? 0) },
            j?.data?.updatedAt ?? null
          );
          localStorage.setItem(buildProgressKey(sessionId), JSON.stringify(serverProgress));
          setProgress(serverProgress);
          setActionMsg('⚠️ Progress conflict detected. Progress reloaded from server (another device updated it).');
          return;
        }

        const j = await r.json().catch(() => null);
        if (j?.success && progress) {
          const nextRevision = Number(j?.data?.revision);
          if (Number.isFinite(nextRevision)) {
            lastSyncedSigRef.current = `${String(progress.updatedAt || '')}::${nextRevision}`;
            if (nextRevision !== Number(progress.revision || 0)) {
              saveProgress({ ...progress, revision: nextRevision });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 900);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [progress, sessionId, sessionToken]);

  const isTaskCompleted = (taskId: string) => (progress?.completedTaskIds || []).includes(taskId);

  const phaseUnlocked = (p: QuestPhase) => {
    if (!progress) return false;
    if (p.index === 0) return true;
    const prev = phases.find((x) => x.index === p.index - 1);
    if (!prev) return true;
    const prevTaskIds = prev.tasks.map((t) => t.id);
    return prevTaskIds.every((id) => isTaskCompleted(id));
  };

  const currentTask = useMemo(() => {
    if (!progress) return null;
    for (const p of phases) {
      if (!phaseUnlocked(p)) continue;
      for (const t of p.tasks) {
        if (!isTaskCompleted(t.id)) return t;
      }
    }
    return null;
  }, [progress, phases]);

  const selectedPhase = useMemo(() => phases.find((p) => p.id === activePhaseId) || phases[0], [phases, activePhaseId]);
  const selectedTask = useMemo(() => {
    if (!selectedPhase) return null;
    const desired = String(activeTaskId || '').trim();
    if (!desired) return selectedPhase.tasks?.[0] || null;
    return selectedPhase.tasks.find((t) => t.id === desired) || selectedPhase.tasks?.[0] || null;
  }, [selectedPhase, activeTaskId]);

  useEffect(() => {
    setActiveTaskId('');
    setProofImage(null);
    setProofScreenshotText('');
    setActionMsg('');
    setProofAiLoading(false);
    setProofAiError('');
    setProofAiResult(null);
  }, [activePhaseId]);

  const analyzeScreenshotProof = async () => {
    setProofAiError('');
    setProofAiResult(null);

    if (!sessionId || !sessionToken) {
      setProofAiError('Veuillez vous reconnecter.');
      return null;
    }
    if (!proofImage) {
      setProofAiError('Veuillez sélectionner une image (screenshot).');
      return null;
    }

    setProofAiLoading(true);
    try {
      const form = new FormData();
      form.append('image', proofImage);
      form.append('screenshotText', proofScreenshotText);
      form.append('phaseId', String(selectedPhase?.id || ''));
      form.append('taskId', String(missionTask?.id || ''));
      form.append('taskTitle', String(missionTask?.title || ''));
      form.append('taskObjective', String(missionTask?.objective || ''));
      form.append('taskActions', JSON.stringify(Array.isArray(missionTask?.actions) ? missionTask!.actions : []));

      const r = await fetch(`${API_BASE_URL}/career-quest/proof-score-screenshot`, {
        method: 'POST',
        headers: {
          'x-career-quest-session-id': sessionId,
          'x-career-quest-token': sessionToken,
        },
        body: form,
      });

      const raw = await r.text();
      const j = safeParseJson(raw);
      if (!r.ok) {
        setProofAiError(j?.message ? `${j.message} (HTTP ${r.status})` : `Analyse impossible (HTTP ${r.status})`);
        return null;
      }
      if (!j?.success) {
        setProofAiError(j?.message ? String(j.message) : 'Analyse impossible');
        return null;
      }

      setProofAiResult(j?.data || null);
      return j?.data || null;
    } catch (e) {
      console.error(e);
      setProofAiError('Erreur pendant l’analyse.');
      return null;
    } finally {
      setProofAiLoading(false);
    }
  };

  const missionTask = selectedTask || currentTask;
  const isMissionCurrent = Boolean(currentTask && missionTask && currentTask.id === missionTask.id);
  const xpNext = xpToNextLevel(progress?.level || 1);
  const xpPct = progress ? clamp((progress.xp / Math.max(1, xpNext)) * 100, 0, 100) : 0;

  const achievements = useMemo(() => {
    if (!progress) return [] as Array<{ id: string; title: string; subtitle: string; unlocked: boolean }>;
    const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0);
    const completedTasks = (progress.completedTaskIds || []).length;
    const completedPhases = phases.filter((p) => p.tasks.every((t) => isTaskCompleted(t.id))).length;
    const hasAnyProof = Object.keys(progress.proofs || {}).length > 0;
    const lvl = Number(progress.level || 1);

    return [
      { id: 'a-first-proof', title: 'First Proof', subtitle: 'Soumettre ta première preuve', unlocked: hasAnyProof },
      { id: 'a-25', title: 'Momentum', subtitle: 'Compléter 25% des missions', unlocked: totalTasks > 0 && completedTasks >= Math.ceil(totalTasks * 0.25) },
      { id: 'a-50', title: 'Consistency', subtitle: 'Compléter 50% des missions', unlocked: totalTasks > 0 && completedTasks >= Math.ceil(totalTasks * 0.5) },
      { id: 'a-100', title: 'Finisher', subtitle: 'Compléter 100% des missions', unlocked: totalTasks > 0 && completedTasks >= totalTasks },
      { id: 'a-phases-3', title: 'Roadmap', subtitle: 'Valider 3 phases', unlocked: completedPhases >= 3 },
      { id: 'a-level-5', title: 'Level 5', subtitle: 'Atteindre le niveau 5', unlocked: lvl >= 5 },
    ];
  }, [progress, phases]);

  const coachCards = useMemo(() => {
    const phaseTitle = String(selectedPhase?.title || '').trim();
    const missionTitle = String(missionTask?.title || '').trim();
    const weaknessSet = new Set((snapshot?.weaknesses || []).map((x) => normalizeText(x)));
    const softOutreach = Array.from(weaknessSet).some((w) => w.includes('communication') || w.includes('public') || w.includes('collaboration'));

    const outreachTemplate = softOutreach
      ? "Bonjour [Nom], je découvre votre activité et j'apprécie [1 point concret]. J'ai une question rapide: comment gérez-vous [problème]? J'ai une idée simple (2 lignes) si vous voulez."
      : "Bonjour [Nom], j'ai analysé [entreprise] et j'ai repéré [problème concret]. Voici une mini-solution (2-3 lignes) + un exemple. Si utile, je peux vous envoyer un plan en 5 étapes.";

    const proofChecklist = [
      'Lien public (lecture seule)',
      'Titre clair + date',
      'Résultat mesurable (si possible)',
      'Capture/notes dans le lien (pas de fichier upload)',
    ];

    return [
      {
        id: 'c-focus',
        title: 'Focus du moment',
        body: `Phase: ${phaseTitle || '—'} · Mission: ${missionTitle || '—'}`,
        items: [
          'Travaille une seule mission à la fois: preuve → validation → XP.',
          'Si tu bloques, fais une version “lite” en 20 minutes puis améliore.',
        ],
      },
      {
        id: 'c-proof',
        title: 'Proof Quality (checklist)',
        body: 'Une preuve solide = plus de crédibilité + progression stable.',
        items: proofChecklist,
      },
      {
        id: 'c-outreach',
        title: 'Template message (Outreach)',
        body: outreachTemplate,
        items: ['Personnalise 1 phrase.', 'Garde le message court.', 'Termine par une question simple.'],
      },
    ];
  }, [snapshot, selectedPhase, missionTask]);

  const loadLiveCoach = async () => {
    if (!sessionId || !sessionToken) return;
    setCoachLiveError('');
    setCoachLiveLoading(true);
    try {
      const body = {
        phaseId: String(selectedPhase?.id || ''),
        phaseTitle: String(selectedPhase?.title || ''),
        missionId: String(missionTask?.id || ''),
        missionTitle: String(missionTask?.title || ''),
        missionObjective: String(missionTask?.objective || ''),
        missionActions: Array.isArray(missionTask?.actions) ? missionTask.actions : [],
      };

      const r = await fetch(`${API_BASE_URL}/career-quest/coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-career-quest-session-id': sessionId,
          'x-career-quest-token': sessionToken,
        },
        body: JSON.stringify(body),
      });

      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.success) {
        setCoachLiveError(String(j?.message || `Coach indisponible (HTTP ${r.status})`));
        setCoachLiveData(null);
        return;
      }

      setCoachLiveData(j?.data || null);
    } catch (e) {
      console.error(e);
      setCoachLiveError('Coach indisponible (erreur réseau).');
      setCoachLiveData(null);
    } finally {
      setCoachLiveLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'coach') return;
    if (!sessionId || !sessionToken) return;
    loadLiveCoach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sessionId, sessionToken, selectedPhase?.id, missionTask?.id]);

  const completeTaskWithProof = (task: QuestTask) => {
    if (!progress) return;
    if (isTaskCompleted(task.id)) return;

    let lvl = progress.level;
    let xp = progress.xp + task.rewardXp;
    let coins = progress.coins + task.rewardCoins;
    let gems = progress.gems;

    while (xp >= xpToNextLevel(lvl) && lvl < 99) {
      xp -= xpToNextLevel(lvl);
      lvl += 1;
      coins += 120;
      gems += 10;
    }

    const next: GameProgress = {
      ...progress,
      level: lvl,
      xp,
      coins,
      gems,
      completedTaskIds: Array.from(new Set([...(progress.completedTaskIds || []), task.id])),
      proofs: {
        ...(progress.proofs || {}),
        [task.id]: {
          submittedAt: new Date().toISOString(),
          aiScore: typeof proofAiResult?.score === 'number' ? proofAiResult.score : undefined,
          aiLabel: typeof proofAiResult?.label === 'string' ? proofAiResult.label : undefined,
          aiTips: Array.isArray(proofAiResult?.tips) ? proofAiResult.tips : undefined,
          aiMeta: proofAiResult?.meta ?? undefined,
          analyzedAt: proofAiResult ? new Date().toISOString() : undefined,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    saveProgress(next);
    setActionMsg('Mission validée. Récompenses ajoutées.');
    setProofImage(null);
    setProofScreenshotText('');
    setProofAiLoading(false);
    setProofAiError('');
    setProofAiResult(null);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#070A12] text-white">
      {guideOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setGuideOpen(false)}
            role="button"
            tabIndex={-1}
          />
          <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-6">
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.10] to-white/[0.03] ring-1 ring-white/10 shadow-[0_30px_120px_-70px_rgba(0,0,0,0.95)] backdrop-blur-xl">
              <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold text-white/60">🎮 Career Path RPG</div>
                  <div className="mt-1 text-lg font-extrabold">
                    {guideLang === 'ar' ? '📕 Guide Participant — دليل اللاعب' : guideLang === 'fr' ? '📕 Guide Participant' : '📕 Guide Participant'}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-white/60">Phase by phase · Real tasks · Proof-driven</div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 rounded-xl bg-white/[0.04] p-1 ring-1 ring-white/10">
                    <button
                      type="button"
                      onClick={() => setGuideLang('ar')}
                      className={
                        'rounded-lg px-3 py-2 text-xs font-bold transition-colors ' +
                        (guideLang === 'ar' ? 'bg-white/10 text-white ring-1 ring-white/15' : 'text-white/70 hover:bg-white/5')
                      }
                    >
                      AR
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuideLang('fr')}
                      className={
                        'rounded-lg px-3 py-2 text-xs font-bold transition-colors ' +
                        (guideLang === 'fr' ? 'bg-white/10 text-white ring-1 ring-white/15' : 'text-white/70 hover:bg-white/5')
                      }
                    >
                      FR
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuideLang('en')}
                      className={
                        'rounded-lg px-3 py-2 text-xs font-bold transition-colors ' +
                        (guideLang === 'en' ? 'bg-white/10 text-white ring-1 ring-white/15' : 'text-white/70 hover:bg-white/5')
                      }
                    >
                      EN
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGuideOpen(false)}
                    className="rounded-xl bg-white/[0.06] px-4 py-2 text-xs font-bold ring-1 ring-white/12 hover:bg-white/[0.10]"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="max-h-[75vh] overflow-auto p-4 sm:p-6">
                {guideLang === 'ar' ? (
                  <div dir="rtl" className="space-y-5 text-white/85">
                    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-sm font-extrabold">سيرشدك هذا الدليل مرحلةً بعد مرحلة</div>
                      <div className="mt-2 text-sm text-white/75">كل مرحلة = مهمة حقيقية · بدون حشو · وبدليل إنجاز.</div>
                    </div>

                    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-sm font-extrabold">🟢 قبل أن تبدأ</div>
                      <div className="mt-3 text-sm font-semibold">اختر فئتك:</div>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {['طالب', 'باحث عن عمل', 'مستقل', 'رائد أعمال'].map((x) => (
                          <div key={x} className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 text-sm font-bold">
                            {x}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-sm font-semibold">حضّر:</div>
                      <ul className="mt-2 space-y-1 text-sm">
                        {['بريد إلكتروني مهني', 'مجلد على Google Drive', 'مستند Notion أو Word للتوثيق'].map((x) => (
                          <li key={x} className="flex gap-2">
                            <span className="text-white/40">-</span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {[
                        {
                          t: '🟢 المرحلة 1 — ملف الأعمال (Portfolio)',
                          goal: 'إعداد ملف أعمال يوضح قيمتك بصورة واضحة.',
                          req: ['اختيار مجال واحد واضح', 'إنشاء ملف أعمال (Notion / PDF / موقع)', 'إضافة مشروع واحد على الأقل'],
                          del: ['رابط ملف الأعمال', 'وصف مختصر لكل مشروع'],
                          dont: ['الاكتفاء بالسيرة الذاتية فقط', 'مشاريع غير واضحة'],
                        },
                        {
                          t: '🟢 المرحلة 2 — تطوير المهارات',
                          goal: 'تحويل مهارة إلى نتيجة قابلة للعرض.',
                          req: ['اختيار مهارة مطلوبة', 'تنفيذ مشروع مصغّر تطبيقي'],
                          del: ['لقطة شاشة/عرض', 'ملخص: ماذا تعلمت'],
                        },
                        {
                          t: '🟢 المرحلة 3 — الحضور المهني عبر الإنترنت',
                          goal: 'تحسين حضورك المهني وبناء ثقة أولية.',
                          req: ['تحسين ملف LinkedIn', 'كتابة نبذة واضحة', 'نشر منشور مهني أول'],
                          del: ['رابط LinkedIn', 'لقطة شاشة للمنشور'],
                        },
                        {
                          t: '🟢 المرحلة 4 — تحليل الشركات',
                          goal: 'اختيار شركات مناسبة وفهم احتياجاتها قبل التواصل.',
                          req: ['اختيار 3–5 شركات', 'تحليل الحضور/المشكلات'],
                          del: ['ملف تحليل الشركات (Sheet/Doc)'],
                        },
                        {
                          t: '🟢 المرحلة 5 — التواصل (Outreach)',
                          goal: 'التواصل برسالة قصيرة مع قيمة واضحة.',
                          req: ['تحديد جهات الاتصال', 'إرسال رسالة مع ملف الأعمال + حل مختصر'],
                          del: ['لقطات شاشة للرسائل'],
                        },
                        {
                          t: '🟢 المرحلة 6 — المقترح (Proposal)',
                          goal: 'صياغة عرض واضح ومحترف.',
                          req: ['كتابة مقترح مختصر', 'تحضير Pitch'],
                          del: ['ملف المقترح'],
                        },
                        {
                          t: '🟢 المرحلة 7 — العلاقات (Networking)',
                          goal: 'بناء شبكة علاقات ذات قيمة.',
                          req: ['الانضمام إلى مجتمعات', 'التفاعل والمساهمة'],
                          del: ['روابط المجموعات', 'دليل على التفاعل'],
                        },
                        {
                          t: '🟢 المرحلة 8 — التقديم (Applications)',
                          goal: 'تقديم منظم وواقعي.',
                          req: ['تحديث السيرة الذاتية', 'التقديم على 5 فرص'],
                          del: ['السيرة الذاتية', 'دليل على التقديمات'],
                        },
                        {
                          t: '🟢 المرحلة 9 — المحتوى (Content)',
                          goal: 'تعزيز الثقة بالمحتوى.',
                          req: ['نشر محتوى مهني أسبوعي'],
                          del: ['روابط المنشورات'],
                        },
                        {
                          t: '🟢 المرحلة 10 — الشهادات (Certifications)',
                          goal: 'رفع المصداقية بإنجاز واضح.',
                          req: ['إكمال شهادة مناسبة', 'إضافتها إلى ملف الأعمال'],
                          del: ['لقطة شاشة للشهادة/الشارة'],
                        },
                        {
                          t: '🟢 المرحلة 11 — المهارات الناعمة',
                          goal: 'تطوير التواصل والعمل الجماعي.',
                          req: ['عرض تقديمي أو مهمة ضمن فريق'],
                          del: ['لقطة شاشة/ملاحظات'],
                        },
                        {
                          t: '🟢 المرحلة 12 — مشاريع واقعية',
                          goal: 'إنجاز نتيجة فعلية قابلة للعرض.',
                          req: ['تنفيذ مشروع واقعي', 'توثيق النتائج'],
                          del: ['لقطات شاشة + ملخص'],
                        },
                        {
                          t: '🟢 المرحلة 13 — إتقان المسار',
                          goal: 'إغلاق المسار بخطة واضحة.',
                          req: ['ملف أعمال نهائي', 'خطة مهنية'],
                          del: ['ملف الأعمال + الخطة'],
                        },
                      ].map((p) => (
                        <div key={p.t} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                          <div className="text-sm font-extrabold">{p.t}</div>
                          <div className="mt-3 text-sm">
                            <div className="font-bold">🎯 الهدف</div>
                            <div className="mt-1 text-white/75">{p.goal}</div>
                          </div>
                          <div className="mt-3 text-sm">
                            <div className="font-bold">✅ المطلوب</div>
                            <ul className="mt-2 space-y-1 text-white/80">
                              {p.req.map((x) => (
                                <li key={x} className="flex gap-2">
                                  <span className="text-white/40">-</span>
                                  <span>{x}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-3 text-sm">
                            <div className="font-bold">📦 التسليم</div>
                            <ul className="mt-2 space-y-1 text-white/80">
                              {p.del.map((x) => (
                                <li key={x} className="flex gap-2">
                                  <span className="text-white/40">-</span>
                                  <span>{x}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {p.dont ? (
                            <div className="mt-3 text-sm">
                              <div className="font-bold">❌ تجنّبه</div>
                              <ul className="mt-2 space-y-1 text-white/80">
                                {p.dont.map((x) => (
                                  <li key={x} className="flex gap-2">
                                    <span className="text-white/40">-</span>
                                    <span>{x}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20">
                      <div className="text-sm font-extrabold">🏁 الخلاصة</div>
                      <div className="mt-2 text-sm text-emerald-100/90">عند إتمام المراحل ستحصل على ملف أعمال قوي وخطة مهنية واضحة.</div>
                    </div>
                  </div>
                ) : guideLang === 'fr' ? (
                  <div className="space-y-5 text-white/85">
                    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-sm font-extrabold">Ce guide te guide Phase par Phase</div>
                      <div className="mt-2 text-sm text-white/75">Chaque Phase = action réelle · zéro blabla · preuve obligatoire.</div>
                    </div>

                    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-sm font-extrabold">🟢 Avant de commencer</div>
                      <div className="mt-3 text-sm font-semibold">Choisis ta catégorie:</div>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {['Étudiant', "Demandeur d'emploi", 'Freelancer', 'Entrepreneur'].map((x) => (
                          <div key={x} className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 text-sm font-bold">
                            {x}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-sm font-semibold">Prépare:</div>
                      <ul className="mt-2 space-y-1 text-sm">
                        {['Un email professionnel', 'Un dossier Google Drive', 'Un document Notion / Word pour documenter'].map((x) => (
                          <li key={x} className="flex gap-2">
                            <span className="text-white/40">-</span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {[
                        {
                          t: '🟢 Phase 1 — Portfolio',
                          goal: 'Construire un portfolio qui explique ta valeur.',
                          req: ['Choisir un seul domaine clair', 'Créer un portfolio (Notion / PDF / site)', 'Ajouter au moins 1 projet'],
                          del: ['Lien du portfolio', 'Description courte par projet'],
                          dont: ['Un CV seul', 'Projets flous / incompréhensibles'],
                        },
                        {
                          t: '🟢 Phase 2 — Skill Development',
                          goal: 'Transformer une compétence en résultat.',
                          req: ['Choisir une skill demandée sur le marché', 'Réaliser un mini-projet'],
                          del: ['Screenshot / démo', "Résumé: ce que tu as appris"],
                        },
                        {
                          t: '🟢 Phase 3 — Présence en ligne',
                          goal: 'Construire une présence professionnelle.',
                          req: ['Optimiser LinkedIn', 'Écrire une bio propre', 'Publier un premier post'],
                          del: ['Lien LinkedIn', 'Screenshot du post'],
                        },
                        {
                          t: '🟢 Phase 4 — Analyse des entreprises',
                          goal: 'Comprendre les entreprises avant de contacter.',
                          req: ['Choisir 3 à 5 entreprises', 'Analyser présence + problèmes'],
                          del: 'Tableau d’analyse (sheet)',
                        },
                        {
                          t: '🟢 Phase 5 — Outreach',
                          goal: 'Contacter intelligemment avec une mini-solution.',
                          req: ['Trouver emails/contacts', 'Envoyer message: portfolio + solution'],
                          del: 'Screenshots des messages',
                        },
                        {
                          t: '🟢 Phase 6 — Proposal',
                          goal: 'Présenter une offre claire.',
                          req: ['Écrire une mini-proposition', 'Préparer un pitch'],
                          del: 'Fichier proposition',
                        },
                        {
                          t: '🟢 Phase 7 — Networking',
                          goal: 'Créer des relations utiles.',
                          req: ['Rejoindre des communautés', 'Interagir + aider'],
                          del: ['Liens groupes', 'Preuve interaction'],
                        },
                        {
                          t: '🟢 Phase 8 — Applications',
                          goal: 'Candidatures structurées.',
                          req: ['Mettre à jour CV', 'Postuler à 5 opportunités'],
                          del: ['CV', 'Preuve candidatures'],
                        },
                        {
                          t: '🟢 Phase 9 — Content',
                          goal: 'Créer de la confiance.',
                          req: ['Publier du contenu pro chaque semaine'],
                          del: ['Liens posts'],
                        },
                        {
                          t: '🟢 Phase 10 — Certifications',
                          goal: 'Renforcer la crédibilité.',
                          req: ['Terminer une certification', 'L’ajouter au portfolio'],
                          del: ['Screenshot badge/certif'],
                        },
                        {
                          t: '🟢 Phase 11 — Soft Skills',
                          goal: 'Améliorer communication et collaboration.',
                          req: ['Présentation ou mini tâche en équipe'],
                          del: ['Screenshot / notes'],
                        },
                        {
                          t: '🟢 Phase 12 — Projets réels',
                          goal: 'Livrer un résultat réel.',
                          req: ['Faire un projet réel', 'Documenter les résultats'],
                          del: ['Screenshots + résumé'],
                        },
                        {
                          t: '🟢 Phase 13 — Career Mastery',
                          goal: 'Clore le parcours.',
                          req: ['Portfolio final', 'Plan de carrière'],
                          del: ['Portfolio final + plan'],
                        },
                      ].map((p) => (
                        <div key={p.t} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                          <div className="text-sm font-extrabold">{p.t}</div>
                          <div className="mt-3 text-sm">
                            <div className="font-bold">🎯 Objectif</div>
                            <div className="mt-1 text-white/75">{p.goal}</div>
                          </div>
                          <div className="mt-3 text-sm">
                            <div className="font-bold">✅ À faire</div>
                            <ul className="mt-2 space-y-1 text-white/80">
                              {p.req.map((x) => (
                                <li key={x} className="flex gap-2">
                                  <span className="text-white/40">-</span>
                                  <span>{x}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-3 text-sm">
                            <div className="font-bold">📦 Livrable</div>
                            <div className="mt-1 text-white/80">
                              {Array.isArray(p.del) ? (
                                <ul className="mt-2 space-y-1 text-white/80">
                                  {p.del.map((x) => (
                                    <li key={x} className="flex gap-2">
                                      <span className="text-white/40">-</span>
                                      <span>{x}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span>{String(p.del || '')}</span>
                              )}
                            </div>
                          </div>
                          {p.dont ? (
                            <div className="mt-3 text-sm">
                              <div className="font-bold">❌ À éviter</div>
                              <ul className="mt-2 space-y-1 text-white/80">
                                {p.dont.map((x) => (
                                  <li key={x} className="flex gap-2">
                                    <span className="text-white/40">-</span>
                                    <span>{x}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20">
                      <div className="text-sm font-extrabold">🏁 Fin</div>
                      <div className="mt-2 text-sm text-emerald-100/90">
                        Si tu termines les 13 phases: Portfolio · Présence · Preuves · Plan clair
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 text-white/85">
                    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-sm font-extrabold">This guide takes you Phase by Phase</div>
                      <div className="mt-2 text-sm text-white/75">Every phase = real task · no fluff · proof-driven.</div>
                    </div>

                    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-sm font-extrabold">🟢 Before you start</div>
                      <div className="mt-3 text-sm font-semibold">Pick your category:</div>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {['Student', 'Job Seeker', 'Freelancer', 'Entrepreneur'].map((x) => (
                          <div key={x} className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 text-sm font-bold">
                            {x}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-sm font-semibold">Prepare:</div>
                      <ul className="mt-2 space-y-1 text-sm">
                        {['A professional email', 'A Google Drive folder', 'A Notion/Word doc for documentation'].map((x) => (
                          <li key={x} className="flex gap-2">
                            <span className="text-white/40">-</span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {[
                        {
                          t: '🟢 Phase 1 — Build Your Portfolio',
                          goal: 'Create a portfolio that clearly communicates your value.',
                          req: ['Pick one clear domain', 'Create a portfolio (Notion / PDF / website)', 'Add at least 1 project'],
                          del: ['Portfolio link', 'Short description per project'],
                          dont: ['CV only', 'Unclear projects'],
                        },
                        {
                          t: '🟢 Phase 2 — Skill Development',
                          goal: 'Turn a skill into a measurable result.',
                          req: ['Choose a market-relevant skill', 'Build a mini practical project'],
                          del: ['Screenshot / demo', 'What you learned summary'],
                        },
                        {
                          t: '🟢 Phase 3 — Online Presence',
                          goal: 'Build a professional online presence.',
                          req: ['Improve LinkedIn profile', 'Write a strong bio', 'Publish your first professional post'],
                          del: ['LinkedIn link', 'Post screenshot'],
                        },
                        {
                          t: '🟢 Phase 4 — Company Analysis',
                          goal: 'Understand companies before outreach.',
                          req: ['Pick 3–5 companies', 'Analyze presence / problems'],
                          del: ['Company analysis sheet'],
                        },
                        {
                          t: '🟢 Phase 5 — Outreach',
                          goal: 'Reach out with a smart message + mini-solution.',
                          req: ['Find emails/contacts', 'Send message with portfolio + solution'],
                          del: ['Message screenshots'],
                        },
                        {
                          t: '🟢 Phase 6 — Proposal',
                          goal: 'Present a clear professional offer.',
                          req: ['Write a mini proposal', 'Prepare a pitch'],
                          del: ['Proposal file'],
                        },
                        {
                          t: '🟢 Phase 7 — Networking',
                          goal: 'Build useful relationships.',
                          req: ['Join communities', 'Engage and help'],
                          del: ['Group links', 'Interaction proof'],
                        },
                        {
                          t: '🟢 Phase 8 — Applications',
                          goal: 'Apply in a structured way.',
                          req: ['Update your CV', 'Apply to 5 opportunities'],
                          del: ['CV', 'Applications proof'],
                        },
                        {
                          t: '🟢 Phase 9 — Content',
                          goal: 'Build trust through content.',
                          req: ['Publish weekly professional content'],
                          del: ['Post links'],
                        },
                        {
                          t: '🟢 Phase 10 — Certifications',
                          goal: 'Increase credibility.',
                          req: ['Complete a certification', 'Add it to your portfolio'],
                          del: ['Certificate/badge screenshot'],
                        },
                        {
                          t: '🟢 Phase 11 — Soft Skills',
                          goal: 'Improve communication.',
                          req: ['Presentation or team task'],
                          del: ['Screenshot/notes'],
                        },
                        {
                          t: '🟢 Phase 12 — Real Projects',
                          goal: 'Deliver real results.',
                          req: ['Build a real project', 'Document outcomes'],
                          del: ['Screenshots + summary'],
                        },
                        {
                          t: '🟢 Phase 13 — Career Mastery',
                          goal: 'Close the journey with a clear career plan.',
                          req: ['Final portfolio', 'Career plan'],
                          del: ['Final portfolio + plan'],
                        },
                      ].map((p) => (
                        <div key={p.t} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                          <div className="text-sm font-extrabold">{p.t}</div>
                          <div className="mt-3 text-sm">
                            <div className="font-bold">🎯 Goal</div>
                            <div className="mt-1 text-white/75">{p.goal}</div>
                          </div>
                          <div className="mt-3 text-sm">
                            <div className="font-bold">✅ What to do</div>
                            <ul className="mt-2 space-y-1 text-white/80">
                              {p.req.map((x) => (
                                <li key={x} className="flex gap-2">
                                  <span className="text-white/40">-</span>
                                  <span>{x}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-3 text-sm">
                            <div className="font-bold">📦 Deliverable</div>
                            <ul className="mt-2 space-y-1 text-white/80">
                              {p.del.map((x) => (
                                <li key={x} className="flex gap-2">
                                  <span className="text-white/40">-</span>
                                  <span>{x}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {p.dont ? (
                            <div className="mt-3 text-sm">
                              <div className="font-bold">❌ Avoid</div>
                              <ul className="mt-2 space-y-1 text-white/80">
                                {p.dont.map((x) => (
                                  <li key={x} className="flex gap-2">
                                    <span className="text-white/40">-</span>
                                    <span>{x}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20">
                      <div className="text-sm font-extrabold">🏁 Finish</div>
                      <div className="mt-2 text-sm text-emerald-100/90">
                        Complete all phases and you get: Portfolio · Presence · Proof · Clear career direction
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-48 -left-56 h-[620px] w-[620px] rounded-full bg-indigo-600 blur-3xl" />
          <div className="absolute -bottom-56 -right-56 h-[620px] w-[620px] rounded-full bg-fuchsia-600 blur-3xl" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:64px_64px]" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <style>
            {`@keyframes cqFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes cqShimmer{0%{transform:translateX(-45%) skewX(-12deg)}100%{transform:translateX(145%) skewX(-12deg)}}
@keyframes cqSpinSlow{to{transform:rotate(360deg)}}`}
          </style>
          <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.10] to-white/[0.03] ring-1 ring-white/10 shadow-[0_30px_120px_-70px_rgba(0,0,0,0.95)] backdrop-blur-xl">
            <div className="relative">
              <div className="relative h-[220px] w-full sm:h-[260px]">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-sky-500/10 to-fuchsia-600/20" />
                <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.10),transparent_42%),radial-gradient(circle_at_55%_85%,rgba(255,255,255,0.12),transparent_45%)]" />

                <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl animate-pulse motion-reduce:animate-none" />
                <div className="absolute right-10 top-6 h-40 w-40 rounded-full bg-sky-400/25 blur-3xl animate-pulse motion-reduce:animate-none" style={{ animationDelay: '800ms' }} />
                <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl animate-pulse motion-reduce:animate-none" style={{ animationDelay: '1400ms' }} />

                <div className="absolute left-[58%] top-[28%] h-3 w-3 rounded-full bg-emerald-300/80 shadow-[0_0_0_10px_rgba(16,185,129,0.10)] animate-ping motion-reduce:animate-none" />

                <div className="absolute right-6 top-1/2 hidden w-[360px] -translate-y-1/2 md:block">
                  <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)] backdrop-blur-xl animate-[cqFloat_8s_ease-in-out_infinite]">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
                      <div className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[cqShimmer_2.9s_ease-in-out_infinite]" />
                    </div>
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl animate-pulse motion-reduce:animate-none" />
                    <div className="absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl animate-pulse motion-reduce:animate-none" style={{ animationDelay: '900ms' }} />

                    <div className="relative">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="h-3 w-40 rounded-full bg-white/10 ring-1 ring-white/10" />
                          <div className="h-3 w-56 rounded-full bg-white/10 ring-1 ring-white/10" />
                          <div className="h-3 w-44 rounded-full bg-white/10 ring-1 ring-white/10" />
                        </div>

                        <div className="relative rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                          <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-[conic-gradient(from_180deg,rgba(34,197,94,0.0),rgba(34,197,94,0.18),rgba(167,139,250,0.12),rgba(34,197,94,0.0))] blur-2xl opacity-70 animate-[cqSpinSlow_10s_linear_infinite]" />
                          <svg width="92" height="92" viewBox="0 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                            <path d="M30 78 L52 14" stroke="rgba(199,210,254,0.70)" strokeWidth="7" strokeLinecap="round"/>
                            <path d="M12 78 L34 14" stroke="rgba(199,210,254,0.70)" strokeWidth="7" strokeLinecap="round"/>
                            <path d="M22 62 H44" stroke="rgba(199,210,254,0.55)" strokeWidth="6" strokeLinecap="round"/>
                            <path d="M26 46 H48" stroke="rgba(199,210,254,0.55)" strokeWidth="6" strokeLinecap="round"/>
                            <path d="M30 30 H52" stroke="rgba(199,210,254,0.55)" strokeWidth="6" strokeLinecap="round"/>

                            <circle cx="62" cy="28" r="9" fill="rgba(34,197,94,0.85)"/>
                            <path d="M58 28 L61 31 L67 24" stroke="rgba(5,46,22,0.95)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

                            <g transform="translate(50 58)">
                              <circle cx="0" cy="-10" r="8" fill="rgba(248,250,252,0.95)"/>
                              <rect x="-10" y="-2" width="20" height="22" rx="8" fill="rgba(248,250,252,0.95)"/>
                              <path d="M-8 8 L0 4 L8 8" stroke="rgba(17,24,39,0.7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                          </svg>

                          <div className="absolute -right-1 -top-1">
                            <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-300/70 animate-ping motion-reduce:animate-none" />
                            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-300/90 ring-1 ring-emerald-200/40" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold text-white/70">Career Ladder</div>
                          <div className="text-xs font-semibold text-white/60">Live Progress</div>
                        </div>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
                          <div className="h-full w-[62%] bg-gradient-to-r from-emerald-400 to-lime-300 animate-pulse motion-reduce:animate-none" />
                        </div>
                        <div className="mt-2 text-[11px] text-white/60">Proofs → XP → Unlock phases</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#070A12]/90 via-[#070A12]/30 to-transparent" />
              <div className="absolute inset-0 flex items-end">
                <div className="w-full px-6 pb-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide ring-1 ring-white/15 backdrop-blur">
                    Service 1 — Career Quest
                  </div>
                  <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Career Path Real-Life Game
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-white/80">
                    Jeu réel: actions concrètes, preuves par liens, XP et progression.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="max-w-2xl text-sm text-white/80">
              Accès réservé aux participants ayant complété le diagnostic Service 1.
            </p>
          </div>

          {!session ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-6 ring-1 ring-white/10 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                <h2 className="text-lg font-bold">Connexion</h2>
                <p className="mt-2 text-sm text-white/70">
                  Utilisez exactement les informations de votre diagnostic.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-white/80">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="mt-2 w-full rounded-xl bg-white/[0.06] px-4 py-3 text-sm ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/80"
                      placeholder="exemple@email.com"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white/80">WhatsApp</label>
                    <input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      type="tel"
                      className="mt-2 w-full rounded-xl bg-white/[0.06] px-4 py-3 text-sm ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/80"
                      placeholder="+216 ..."
                      autoComplete="tel"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white/80">Nom complet</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      type="text"
                      className="mt-2 w-full rounded-xl bg-white/[0.06] px-4 py-3 text-sm ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/80"
                      placeholder="Prénom Nom"
                      autoComplete="name"
                    />
                  </div>

                  {error ? (
                    <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-500/20">
                      {error}
                    </div>
                  ) : null}

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 text-sm font-bold shadow-[0_18px_60px_-25px_rgba(99,102,241,0.75)] ring-1 ring-white/10 hover:from-indigo-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Connexion...' : 'Entrer dans le jeu'}
                  </button>
                </form>
              </div>

              <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-6 ring-1 ring-white/10 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                <h2 className="text-lg font-bold">Ce que vous débloquez</h2>
                <div className="mt-4 space-y-3 text-sm text-white/75">
                  <div className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                    Un parcours en 13 phases, personnalisé selon votre profil.
                  </div>
                  <div className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                    Système XP/Réputation, missions réelles, preuves par liens.
                  </div>
                  <div className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                    Support IA “Ask the Expert” à chaque phase.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-12 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 ring-1 ring-white/10 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.12] to-white/[0.05] ring-1 ring-white/15 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.95)]">
                      <img
                        src="/images/avatar-professional.svg"
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white/60">Session</div>
                      <div className="mt-1 font-mono text-sm text-white/80">{sessionId}</div>
                      <div className="mt-2 text-sm font-bold">Level {progress?.level || 1} · {snapshot?.realRole || '—'}</div>
                      <div className="text-xs text-white/60">Path: {snapshot?.selectedPath?.title || '—'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGuideOpen(true)}
                      className="rounded-xl bg-white/[0.06] px-4 py-2 text-sm font-semibold ring-1 ring-white/12 hover:bg-white/[0.10]"
                    >
                      📕 Guide
                    </button>
                    <div className="rounded-xl bg-white/[0.06] px-4 py-2 ring-1 ring-white/12 min-w-[220px]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[10px] font-semibold text-white/60">XP</div>
                        <div className="text-[10px] font-semibold text-white/60">{progress?.xp || 0}/{xpNext}</div>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-white/10 ring-1 ring-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-lime-300" style={{ width: `${xpPct}%` }} />
                      </div>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 px-4 py-2 ring-1 ring-amber-500/20 shadow-[0_12px_40px_-28px_rgba(245,158,11,0.7)]">
                      <div className="text-[10px] font-semibold text-amber-100/80">COINS</div>
                      <div className="text-sm font-extrabold text-amber-100">{progress?.coins ?? 0}</div>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 px-4 py-2 ring-1 ring-emerald-500/20 shadow-[0_12px_40px_-28px_rgba(34,197,94,0.6)]">
                      <div className="text-[10px] font-semibold text-emerald-100/80">GEMS</div>
                      <div className="text-sm font-extrabold text-emerald-100">{progress?.gems ?? 0}</div>
                    </div>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="rounded-xl bg-white/[0.06] px-4 py-2 text-sm font-semibold ring-1 ring-white/12 hover:bg-white/[0.10]"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 ring-1 ring-white/10 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white/60">Map</div>
                    <div className="mt-1 text-lg font-extrabold">Phases</div>
                  </div>
                  <div className="text-xs font-semibold text-white/60">
                    Complété: {progress?.completedTaskIds?.length || 0}/{phases.reduce((acc, p) => acc + p.tasks.length, 0)}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {phases.map((p) => {
                    const unlocked = phaseUnlocked(p);
                    const completed = p.tasks.every((t) => isTaskCompleted(t.id));
                    const active = p.id === activePhaseId;
                    const statusText = completed ? 'Completed' : unlocked ? 'Unlocked' : 'Locked';
                    const statusClass = completed
                      ? 'bg-emerald-500/10 text-emerald-100 ring-1 ring-emerald-500/20'
                      : unlocked
                        ? 'bg-white/10 text-white/80 ring-1 ring-white/15'
                        : 'bg-white/5 text-white/55 ring-1 ring-white/10';
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (!unlocked) return;
                          setActivePhaseId(p.id);
                          setActiveTab('tasks');
                        }}
                        className={
                          'group relative overflow-hidden rounded-2xl p-4 text-left ring-1 transition-all duration-200 ' +
                          (unlocked
                            ? active
                              ? 'bg-indigo-500/12 ring-indigo-400/30 shadow-[0_0_0_1px_rgba(99,102,241,0.15),0_24px_80px_-55px_rgba(99,102,241,0.55)]'
                              : 'bg-white/[0.04] ring-white/10 hover:bg-white/[0.06] hover:-translate-y-0.5'
                            : 'bg-white/[0.02] ring-white/5 opacity-60 cursor-not-allowed')
                        }
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-semibold text-white/60">Phase {p.index}</div>
                          <span className={'rounded-full px-2 py-1 text-[10px] font-bold tracking-wide ' + statusClass}>
                            {statusText}
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-extrabold tracking-tight">{p.title}</div>
                        <div className="mt-1 text-xs text-white/60 line-clamp-1">{p.subtitle}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-white/60">Phase active</div>
                      <div className="mt-1 text-sm font-extrabold">{selectedPhase?.title || ''}</div>
                      <div className="mt-1 text-xs text-white/60">{selectedPhase?.subtitle || ''}</div>
                    </div>
                    <div className="text-xs font-semibold text-white/60">
                      {phaseUnlocked(selectedPhase) ? 'Unlocked' : 'Locked'}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {(selectedPhase?.tasks || []).map((t) => {
                      const done = isTaskCompleted(t.id);
                      const isActiveTask = t.id === (activeTaskId || selectedPhase?.tasks?.[0]?.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setActiveTaskId(t.id);
                            setActiveTab('tasks');
                            setActionMsg('');
                          }}
                          className={
                            'rounded-xl px-4 py-3 text-left ring-1 transition-all duration-200 ' +
                            (done
                              ? 'bg-emerald-500/10 ring-emerald-500/20'
                              : isActiveTask
                                ? 'bg-white/10 ring-white/20'
                                : 'bg-white/[0.04] ring-white/10 hover:bg-white/[0.06] hover:-translate-y-0.5')
                          }
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-bold flex flex-wrap items-center gap-2">
                                <span>{t.title}</span>
                                {isService1Priority(t) ? (
                                  <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold tracking-wide text-amber-100 ring-1 ring-amber-500/20">
                                    Service 1 Priority
                                  </span>
                                ) : null}
                                {String(t.id || '').startsWith('s1fa-') ? (
                                  <span className="rounded-full bg-fuchsia-500/10 px-2 py-1 text-[10px] font-bold tracking-wide text-fuchsia-100 ring-1 ring-fuchsia-500/20">
                                    Service 1
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-1 text-xs text-white/60 line-clamp-1">{t.objective}</div>
                            </div>
                            <div className="text-xs font-semibold text-white/70">{done ? '✓' : `+${t.rewardXp} XP`}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 ring-1 ring-white/10 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tasks')}
                    className={
                      'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ' +
                      (activeTab === 'tasks' ? 'bg-white/10 text-white ring-1 ring-white/15' : 'text-white/70 hover:bg-white/5')
                    }
                  >
                    TASKS
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('log')}
                    className={
                      'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ' +
                      (activeTab === 'log' ? 'bg-white/10 text-white ring-1 ring-white/15' : 'text-white/70 hover:bg-white/5')
                    }
                  >
                    MISSION LOG
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={
                      'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ' +
                      (activeTab === 'profile' ? 'bg-white/10 text-white ring-1 ring-white/15' : 'text-white/70 hover:bg-white/5')
                    }
                  >
                    PROFILE
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('coach')}
                    className={
                      'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ' +
                      (activeTab === 'coach' ? 'bg-white/10 text-white ring-1 ring-white/15' : 'text-white/70 hover:bg-white/5')
                    }
                  >
                    AI COACH
                  </button>
                </div>

                {activeTab === 'tasks' ? (
                  <>
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-white/60">Current Mission</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <div className="text-lg font-extrabold">{missionTask?.title || 'Tout est terminé'}</div>
                          {missionTask && isService1Priority(missionTask) ? (
                            <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold tracking-wide text-amber-100 ring-1 ring-amber-500/20">
                              Service 1 Priority
                            </span>
                          ) : null}
                          {missionTask && String(missionTask.id || '').startsWith('s1fa-') ? (
                            <span className="rounded-full bg-fuchsia-500/10 px-2 py-1 text-[10px] font-bold tracking-wide text-fuchsia-100 ring-1 ring-fuchsia-500/20">
                              Service 1
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 text-sm text-white/80">{missionTask?.objective || ''}</div>
                        {missionTask && currentTask && !isMissionCurrent ? (
                          <div className="mt-2 text-xs text-amber-200/80">
                            Note: tu dois valider la mission courante avant d'en sauter une autre.
                          </div>
                        ) : null}
                      </div>
                      {missionTask ? (
                        <div className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15 text-xs font-semibold">
                          +{missionTask.rewardXp} XP
                        </div>
                      ) : null}
                    </div>

                    {missionTask ? (
                      <>
                        <div className="mt-4 rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                          <div className="text-xs font-semibold text-white/60">Actions</div>
                          <ul className="mt-2 space-y-1 text-sm text-white/80">
                            {missionTask.actions.map((a) => (
                              <li key={a} className="flex gap-2">
                                <span className="text-white/40">-</span>
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-4">
                          <div className="text-xs font-semibold text-white/60">Preuve (capture d’écran)</div>
                          <div className="mt-2 text-xs text-white/60">Capture + note optionnelle pour l’analyse. L’image et le texte ne sont pas enregistrés; seul le feedback est sauvegardé.</div>
                          <div className="mt-3 rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                            <div className="text-xs font-semibold text-white/70">Screenshot (image)</div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0] || null;
                                setProofImage(f);
                                setProofAiError('');
                                setProofAiResult(null);
                              }}
                              className="mt-2 block w-full text-xs text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/15"
                            />
                            <div className="mt-3 text-xs font-semibold text-white/70">Screenshot text (optional, not saved)</div>
                            <textarea
                              value={proofScreenshotText}
                              onChange={(e) => setProofScreenshotText(e.target.value)}
                              className="mt-2 w-full rounded-xl bg-white/[0.06] px-4 py-3 text-sm ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/80"
                              rows={3}
                              placeholder="Collez un texte visible sur la capture ou un court contexte (non enregistré)."
                            />
                          </div>
                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <button
                              type="button"
                              disabled={proofAiLoading}
                              onClick={() => {
                                setActionMsg('');
                                analyzeScreenshotProof();
                              }}
                              className={
                                'rounded-xl px-4 py-2 text-xs font-bold ring-1 ring-white/12 transition-colors ' +
                                (!proofAiLoading ? 'bg-white/[0.06] hover:bg-white/[0.10]' : 'bg-white/10 text-white/60 cursor-not-allowed')
                              }
                            >
                              {proofAiLoading ? 'Analyzing…' : 'Analyze screenshot'}
                            </button>
                            <div className="text-[11px] text-white/60 sm:self-center">
                              L’IA fournit un score et des conseils; ils seront enregistrés avec la preuve.
                            </div>
                          </div>
                          {proofAiError ? (
                            <div className="mt-3 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-100 ring-1 ring-amber-500/20">
                              {proofAiError}
                            </div>
                          ) : null}
                          {proofAiResult ? (
                            <div className="mt-3 rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-xs font-semibold text-white/60">AI Feedback</div>
                                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-100 ring-1 ring-emerald-500/20">
                                  {String(proofAiResult?.label || '—')} · {Number(proofAiResult?.score ?? 0)}/100
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div className="rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">
                                  <div className="text-[10px] font-semibold text-white/60">AI Engine</div>
                                  <div className="mt-1 text-xs font-bold text-white/80">
                                    {String(
                                      proofAiResult?.meta?.ai?.engine ?? (proofAiResult?.meta?.ai?.used ? 'openai' : 'heuristic')
                                    )}
                                  </div>
                                </div>
                                <div className="rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">
                                  <div className="text-[10px] font-semibold text-white/60">OCR</div>
                                  <div className="mt-1 text-xs font-bold text-white/80">
                                    {String(proofAiResult?.meta?.ocr?.provider || 'none')}
                                    {proofAiResult?.meta?.ocr?.used ? ' (used)' : ' (not used)'}
                                  </div>
                                </div>
                              </div>
                              {Array.isArray(proofAiResult?.tips) && proofAiResult.tips.length > 0 ? (
                                <ul className="mt-3 space-y-1 text-sm text-white/80">
                                  {proofAiResult.tips.slice(0, 6).map((t: string, idx: number) => (
                                    <li key={`${idx}-${t}`} className="flex gap-2">
                                      <span className="text-white/40">-</span>
                                      <span>{t}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="mt-3 text-sm text-white/70">Pas de conseils pour ce lien.</div>
                              )}
                            </div>
                          ) : null}
                          {actionMsg ? (
                            <div className="mt-3 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 ring-1 ring-emerald-500/20">
                              {actionMsg}
                            </div>
                          ) : null}

                          <button
                            type="button"
                            disabled={!isMissionCurrent}
                            onClick={() => {
                              setActionMsg('');
                              if (!currentTask) {
                                setActionMsg('Aucune mission active.');
                                return;
                              }
                              if (!proofImage) {
                                setActionMsg('Veuillez ajouter un screenshot (image).');
                                return;
                              }
                              if (!proofAiResult) {
                                setActionMsg('Veuillez cliquer sur Analyze avant de valider afin d’enregistrer uniquement le feedback.');
                                return;
                              }
                              completeTaskWithProof(currentTask);
                            }}
                            className={
                              'mt-3 w-full rounded-xl px-4 py-3 text-sm font-bold shadow-sm ring-1 ring-white/10 transition-colors ' +
                              (isMissionCurrent
                                ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 shadow-[0_18px_60px_-25px_rgba(99,102,241,0.75)]'
                                : 'bg-white/10 text-white/60 cursor-not-allowed')
                            }
                          >
                            Valider la mission
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-4 text-sm text-white/70">Bravo. Tu as terminé toutes les missions.</div>
                    )}
                  </>
                ) : null}

                {activeTab === 'log' ? (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-white/60">Mission Log</div>
                    <div className="mt-3 space-y-2">
                      {Object.keys(progress?.proofs || {}).length === 0 ? (
                        <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 text-sm text-white/70">
                          Aucune mission validée pour le moment.
                        </div>
                      ) : (
                        Object.entries(progress?.proofs || {})
                          .sort((a, b) => String(b[1]?.submittedAt || '').localeCompare(String(a[1]?.submittedAt || '')))
                          .map(([taskId, proof]) => {
                            const task = phases.flatMap((p) => p.tasks).find((t) => t.id === taskId);
                            return (
                              <div key={taskId} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                                <div className="text-sm font-extrabold">{task?.title || taskId}</div>
                                <div className="mt-1 text-xs text-white/60">{new Date(proof.submittedAt).toLocaleString()}</div>
                                {typeof (proof as any)?.aiScore === 'number' ? (
                                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-100 ring-1 ring-emerald-500/20">
                                    AI: {String((proof as any)?.aiLabel || '—')} · {Number((proof as any)?.aiScore)}/100
                                  </div>
                                ) : null}
                                {String((proof as any)?.url || '').trim() ? (
                                  <a
                                    className="mt-3 block text-sm font-semibold text-indigo-200 hover:text-indigo-100 underline"
                                    href={String((proof as any)?.url || '')}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Ouvrir la preuve
                                  </a>
                                ) : null}
                                {String((proof as any)?.note || '').trim() ? (
                                  <div className="mt-2 text-sm text-white/75">{String((proof as any)?.note || '')}</div>
                                ) : null}
                                {Array.isArray((proof as any)?.aiTips) && (proof as any)?.aiTips?.length ? (
                                  <div className="mt-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/10">
                                    <div className="text-xs font-semibold text-white/60">AI Tips</div>
                                    <ul className="mt-2 space-y-1 text-sm text-white/80">
                                      {(proof as any).aiTips.slice(0, 4).map((t: string, idx: number) => (
                                        <li key={`${idx}-${t}`} className="flex gap-2">
                                          <span className="text-white/40">-</span>
                                          <span>{t}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                ) : null}

                {activeTab === 'profile' ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-xs font-semibold text-white/60">Rôle déclaré</div>
                      <div className="mt-1 text-sm font-bold">{snapshot?.declaredRole || '—'}</div>
                      <div className="mt-3 text-xs font-semibold text-white/60">Maturité</div>
                      <div className="mt-1 text-sm font-bold">{snapshot?.maturityLevel || '—'}</div>
                    </div>

                    <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-xs font-semibold text-white/60">Forces</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(snapshot?.strengths || []).slice(0, 12).map((x, idx) => (
                          <span
                            key={`${x}-${idx}`}
                            className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/20"
                          >
                            {x}
                          </span>
                        ))}
                        {(snapshot?.strengths || []).length === 0 ? (
                          <span className="text-sm text-white/60">—</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-xs font-semibold text-white/60">Faiblesses</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(snapshot?.weaknesses || []).slice(0, 12).map((x, idx) => (
                          <span
                            key={`${x}-${idx}`}
                            className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100 ring-1 ring-amber-500/20"
                          >
                            {x}
                          </span>
                        ))}
                        {(snapshot?.weaknesses || []).length === 0 ? (
                          <span className="text-sm text-white/60">—</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-xs font-semibold text-white/60">Achievements</div>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {achievements.map((a) => (
                          <div
                            key={a.id}
                            className={
                              'rounded-xl px-4 py-3 ring-1 ' +
                              (a.unlocked
                                ? 'bg-emerald-500/10 ring-emerald-500/20'
                                : 'bg-white/[0.04] ring-white/10 opacity-75')
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-extrabold">{a.title}</div>
                              <div className="text-xs font-semibold text-white/70">{a.unlocked ? '✓' : '—'}</div>
                            </div>
                            <div className="mt-1 text-xs text-white/60">{a.subtitle}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-white/60">Service 1 Missions</div>
                        <div className="text-xs font-semibold text-white/60">
                          {(service1Phase5?.finalActions || []).length} actions
                        </div>
                      </div>

                      {(service1Phase5?.finalActions || []).length === 0 ? (
                        <div className="mt-3 rounded-xl bg-amber-500/10 p-4 ring-1 ring-amber-500/20 text-sm text-amber-100">
                          Aucune mission Service 1 n’est disponible pour cette session.
                          <div className="mt-2 text-xs text-amber-100/80">
                            Pistes:
                            <div className="mt-1">- Déconnexion puis reconnexion (rafraîchir la session).</div>
                            <div className="mt-1">- Vérifier que Service 1 (Phase 5) a généré les finalActions.</div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {(service1Phase5?.finalActions || []).map((a) => {
                            const isSelected = String(service1Phase5?.selectedFinalAction?.id || '') === String(a.id || '');
                            return (
                              <div
                                key={a.id}
                                className={
                                  'rounded-xl p-4 ring-1 ' +
                                  (isSelected ? 'bg-fuchsia-500/10 ring-fuchsia-500/20' : 'bg-white/[0.04] ring-white/10')
                                }
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-sm font-extrabold">
                                    {isSelected ? '⭐ ' : ''}
                                    {a.title}
                                  </div>
                                  <div className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70 ring-1 ring-white/10">
                                    {String(a.pressure || 'medium')}
                                  </div>
                                </div>
                                <div className="mt-2 text-sm text-white/75">{a.description}</div>
                              </div>
                            );
                          })}

                          {service1Phase5?.skillGap ? (
                            <div className="mt-3 rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                              <div className="text-xs font-semibold text-white/60">Skill Gap</div>
                              <div className="mt-1 text-sm font-bold text-white/85">
                                {service1Phase5.skillGap.skillName || '—'}
                              </div>
                              <div className="mt-2 text-sm text-white/75">{service1Phase5.skillGap.gapDescription || ''}</div>
                              {Array.isArray(service1Phase5.skillGap.microActions) && service1Phase5.skillGap.microActions.length ? (
                                <ul className="mt-3 space-y-1 text-sm text-white/80">
                                  {service1Phase5.skillGap.microActions.slice(0, 6).map((m, idx) => (
                                    <li key={`${idx}-${m}`} className="flex gap-2">
                                      <span className="text-white/40">-</span>
                                      <span>{m}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {activeTab === 'coach' ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-white/60">AI Coach (Live)</div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-semibold text-white/60">
                          Engine: {String(coachLiveData?.meta?.ai?.engine || 'fallback')}
                        </div>
                        <button
                          type="button"
                          disabled={coachLiveLoading}
                          onClick={() => loadLiveCoach()}
                          className={
                            'rounded-lg px-3 py-2 text-[11px] font-bold ring-1 ring-white/12 ' +
                            (coachLiveLoading ? 'bg-white/10 text-white/60 cursor-not-allowed' : 'bg-white/[0.06] hover:bg-white/[0.10]')
                          }
                        >
                          {coachLiveLoading ? 'Refreshing…' : 'Refresh'}
                        </button>
                      </div>
                    </div>

                    {coachLiveError ? (
                      <div className="rounded-xl bg-amber-500/10 p-4 ring-1 ring-amber-500/20 text-sm text-amber-100">
                        {coachLiveError}
                      </div>
                    ) : null}

                    {(Array.isArray(coachLiveData?.cards) && coachLiveData.cards.length ? coachLiveData.cards : coachCards).map((c: any) => (
                      <div key={c.id} className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                        <div className="text-sm font-extrabold">{c.title}</div>
                        <div className="mt-2 text-sm text-white/80">{c.body}</div>
                        <ul className="mt-3 space-y-1 text-sm text-white/80">
                          {(Array.isArray(c.items) ? c.items : []).map((it: string) => (
                            <li key={it} className="flex gap-2">
                              <span className="text-white/40">-</span>
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('site-footer');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="fixed bottom-6 right-6 z-40 rounded-2xl bg-white/[0.06] px-4 py-3 text-xs font-bold tracking-wide ring-1 ring-white/12 shadow-[0_18px_70px_-50px_rgba(0,0,0,0.95)] backdrop-blur-xl hover:bg-white/[0.10]"
        >
          GO TO FOOTER
        </button>
      </div>
    </div>
  );
};

export default CareerQuestPage;
