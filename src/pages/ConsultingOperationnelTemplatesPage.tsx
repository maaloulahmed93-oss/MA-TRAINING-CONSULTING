import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  answersStorageKeyForParticipant,
  clearSession,
  getAnswers,
  getSituation,
  getSession,
  me,
  saveAnswers,
} from '../services/consultingOperationnelParticipantService';

type StepId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type ConsultingOperationnelSituation = {
  posteIntitule: string;
  entrepriseSecteur: string;
  element1: string;
  element2: string;
  difficulte1: string;
  difficulte2: string;
  demandeDirection: string;
  session1DateTime: string;
  session1VideoUrl: string;
  session2DateTime: string;
  session2VideoUrl: string;
  session3DateTime: string;
  session3VideoUrl: string;
};

const CONSULTING_OPERATIONNEL_SITUATION_STORAGE_KEY_PREFIX = 'consultingOperationnelSituation_cache_v1:';
const CONSULTING_OPERATIONNEL_ANSWERS_STORAGE_KEY = 'consultingOperationnelAnswers_v1';

const ConsultingOperationnelTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [participantId, setParticipantId] = useState<string>('');
  const [participantToken, setParticipantToken] = useState<string>('');
  const steps = useMemo(
    () =>
      [
        {
          id: 0 as StepId,
          badge: '🟣 TEMPLATE — Page 0',
          sectionTitle: 'Cadre général du service',
          title: 'Cadre de la mission',
          primaryCta: 'Continuer',
        },
        {
          id: 1 as StepId,
          badge: '🟣 TEMPLATE — Page 1',
          sectionTitle: 'Situation professionnelle (Cas pratique)',
          title: 'Situation professionnelle',
          primaryCta: "J’ai compris la situation",
        },
        {
          id: 2 as StepId,
          badge: '🟡 TEMPLATE — Page 2',
          sectionTitle: 'Compréhension de la situation',
          title: 'Comment comprenez-vous la situation ?',
          primaryCta: 'Continuer',
        },
        {
          id: 3 as StepId,
          badge: '🟡 TEMPLATE — Page 3',
          sectionTitle: 'Décision',
          title: 'Décision retenue',
          primaryCta: 'Démarrer l’expérimentation',
        },
        {
          id: 4 as StepId,
          badge: '🟢 TEMPLATE — Page 4',
          sectionTitle: 'Action (Exécution)',
          title: 'Exécution',
          primaryCta: "Enregistrer l’action",
        },
        {
          id: 5 as StepId,
          badge: '🟠 TEMPLATE — Page 5',
          sectionTitle: 'Résultat',
          title: 'Résultat observé',
          primaryCta: 'Continuer',
        },
        {
          id: 6 as StepId,
          badge: '🔵 TEMPLATE — Page 6',
          sectionTitle: 'Synthèse personnelle',
          title: 'Synthèse',
          primaryCta: 'Terminer la mission',
        },
      ] as const,
    []
  );

  const [step, setStep] = useState<StepId>(0);
  const [acceptedCadre, setAcceptedCadre] = useState(false);

  const [situation, setSituation] = useState<ConsultingOperationnelSituation | null>(null);

  const [answers, setAnswers] = useState({
    page2_q1: '',
    page2_q2: '',
    page2_q3: '',
    objectifChoisi: '',
    pourquoiObjectif: '',
    hypothese: '',
    executionQuoi: '',
    executionPeriode: '',
    resultatAttendu: '',
    resultatReel: '',
    difference: '',
    syntheseAppris: '',
    syntheseDecision: '',
    syntheseAvenir: '',
  });

  useEffect(() => {
    const verify = async () => {
      const session = getSession();
      if (!session?.token) {
        navigate('/espace-consulting-operationnel');
        return;
      }

      const ok = await me(session.token);
      if (!ok) {
        clearSession();
        navigate('/espace-consulting-operationnel');
        return;
      }

      setParticipantId(ok.participantId);
      setParticipantToken(session.token);
    };

    void verify();
  }, [navigate]);

  useEffect(() => {
    try {
      const key = participantId ? answersStorageKeyForParticipant(participantId) : CONSULTING_OPERATIONNEL_ANSWERS_STORAGE_KEY;
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<typeof answers>;
      setAnswers((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore
    }
  }, [participantId]);

  useEffect(() => {
    const loadRemote = async () => {
      if (!participantToken) return;
      const remote = await getAnswers(participantToken);
      if (!remote) return;
      setAnswers((prev) => {
        const next = { ...prev, ...remote };
        try {
          const key = participantId
            ? answersStorageKeyForParticipant(participantId)
            : CONSULTING_OPERATIONNEL_ANSWERS_STORAGE_KEY;
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    };

    void loadRemote();
  }, [participantToken, participantId]);

  useEffect(() => {
    try {
      const key = participantId ? answersStorageKeyForParticipant(participantId) : CONSULTING_OPERATIONNEL_ANSWERS_STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(answers));
    } catch {
      // ignore
    }
  }, [answers]);

  useEffect(() => {
    if (!participantToken) return;
    const t = window.setTimeout(async () => {
      const ok = await saveAnswers(participantToken, answers);
      void ok;
    }, 600);

    return () => window.clearTimeout(t);
  }, [answers, participantToken]);

  const current = steps.find((s) => s.id === step) ?? steps[0];

  const canGoNext = () => {
    if (step === 0) return acceptedCadre;
    return true;
  };

  const goNext = () => {
    if (!canGoNext()) return;
    if (step >= 6) {
      navigate('/espace-consulting-operationnel/recap');
      return;
    }
    setStep((step + 1) as StepId);
  };

  const goPrev = () => {
    if (step <= 0) return;
    setStep((step - 1) as StepId);
  };

  useEffect(() => {
    const normalizeSituation = (payload: any): ConsultingOperationnelSituation => ({
      posteIntitule: String(payload?.posteIntitule ?? ''),
      entrepriseSecteur: String(payload?.entrepriseSecteur ?? ''),
      element1: String(payload?.element1 ?? ''),
      element2: String(payload?.element2 ?? ''),
      difficulte1: String(payload?.difficulte1 ?? ''),
      difficulte2: String(payload?.difficulte2 ?? ''),
      demandeDirection: String(payload?.demandeDirection ?? ''),
      session1DateTime: String(payload?.session1DateTime ?? ''),
      session1VideoUrl: String(payload?.session1VideoUrl ?? ''),
      session2DateTime: String(payload?.session2DateTime ?? ''),
      session2VideoUrl: String(payload?.session2VideoUrl ?? ''),
      session3DateTime: String(payload?.session3DateTime ?? ''),
      session3VideoUrl: String(payload?.session3VideoUrl ?? ''),
    });

    const loadFromStorage = (): ConsultingOperationnelSituation | null => {
      try {
        const raw = participantId
          ? localStorage.getItem(`${CONSULTING_OPERATIONNEL_SITUATION_STORAGE_KEY_PREFIX}${participantId}`)
          : null;
        if (!raw) return null;
        return normalizeSituation(JSON.parse(raw));
      } catch {
        return null;
      }
    };

    const fetchSituation = async () => {
      try {
        if (!participantToken) throw new Error('No participant token');
        const accountSituation = await getSituation(participantToken);
        if (!accountSituation) throw new Error('No situation');

        const normalized = normalizeSituation(accountSituation);
        setSituation(normalized);

        if (participantId) {
          localStorage.setItem(
            `${CONSULTING_OPERATIONNEL_SITUATION_STORAGE_KEY_PREFIX}${participantId}`,
            JSON.stringify(normalized)
          );
        }
      } catch {
        const cached = loadFromStorage();
        if (cached) setSituation(cached);
      }
    };

    fetchSituation();
  }, [participantToken, participantId]);

  const renderValue = (value?: string) => {
    const v = (value ?? '').trim();
    return v ? v : '______';
  };

  const renderDateTime = (value?: string) => {
    const v = (value ?? '').trim();
    return v ? v : '----------------';
  };

  const openVideo = (url?: string) => {
    const v = (url ?? '').trim();
    if (!v) return;
    window.open(v, '_blank', 'noopener,noreferrer');
  };

  const renderParts = (value?: string) => {
    const v = (value ?? '').trim();
    if (!v) return { left: '______', right: '______' };
    const parts = v.split('/').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) return { left: parts[0], right: parts.slice(1).join(' / ') };
    return { left: v, right: '______' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 rounded-2xl bg-white/80 backdrop-blur shadow-sm ring-1 ring-slate-200 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigate('/espace-consulting-operationnel/recap')}
              className="w-full sm:w-auto rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Voir le récapitulatif
            </button>

            <div className="text-center flex-1">
            <div className="text-sm font-semibold text-slate-600">Templates Plateforme — Service 2</div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">Consulting Opérationnel (Version française)</h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-200">
                {current.badge}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                Étape {step + 1} / 7
              </span>
            </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 sm:p-10">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-600">{current.sectionTitle}</div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{current.title}</h2>
          </div>

          {step === 0 && (
            <div className="mt-6 space-y-4 text-slate-700">
              <p>Ce parcours est basé sur des situations professionnelles réelles.</p>
              <p>Votre rôle en tant que participant est de :</p>
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="space-y-1 text-sm">
                  <div>Comprendre une situation professionnelle</div>
                  <div>Prendre des décisions</div>
                  <div>Expérimenter vos décisions dans la réalité</div>
                </div>
              </div>
              <p>Il n’y a aucun contenu de formation, aucun tutoriel, aucune méthode prête à l’emploi.</p>
              <p>Les sessions en direct avec l’expert sont dédiées exclusivement à l’analyse des décisions et à la correction du raisonnement.</p>
              <p>L’exécution reste entièrement sous votre responsabilité.</p>

              <label className="mt-2 flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <input
                  type="checkbox"
                  checked={acceptedCadre}
                  onChange={(e) => setAcceptedCadre(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-900">☑️ J’accepte le cadre</span>
              </label>

              <div className="mt-6 rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100">
                <div className="text-sm font-semibold text-blue-900">Phrase de référence</div>
                <div className="mt-2 text-sm text-blue-900">
                  <div>La plateforme structure la réflexion.</div>
                  <div>Les sessions corrigent le raisonnement.</div>
                  <div>L’exécution reste la responsabilité du participant.</div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 text-slate-700">
                <div className="text-sm font-semibold text-slate-900">Champs dynamiques</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 text-slate-700 space-y-2">
                <p>
                  Vous occupez le poste de{' '}
                  <span className="font-semibold">[ {renderValue(situation?.posteIntitule)} ]</span> au sein de{' '}
                  <span className="font-semibold">
                    [ {renderParts(situation?.entrepriseSecteur).left} / {renderParts(situation?.entrepriseSecteur).right} ]
                  </span>
                  .
                </p>
                <p>L’entreprise dispose de :</p>
                <div className="pl-4 space-y-1 text-sm">
                  <div>[ {renderValue(situation?.element1)} ]</div>
                  <div>[ {renderValue(situation?.element2)} ]</div>
                </div>
                <p>Cependant :</p>
                <div className="pl-4 space-y-1 text-sm">
                  <div>
                    [ {renderParts(situation?.difficulte1).left} / {renderParts(situation?.difficulte1).right} ]
                  </div>
                  <div>
                    [ {renderParts(situation?.difficulte2).left} / {renderParts(situation?.difficulte2).right} ]
                  </div>
                </div>
                <p>
                  La direction vous demande : <span className="font-semibold">« [ {renderValue(situation?.demandeDirection)} ] »</span>
                </p>
                <p>Aucun objectif précis, aucune méthode, aucun plan d’action ne vous est fourni.</p>
                <p className="font-semibold">📌 Ce sont les seules informations dont vous disposez.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 text-sm text-slate-700">
                📌 Il n’y a pas de bonne ou de mauvaise réponse à ce stade.
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  1️⃣ Comment reformulez-vous la demande de la direction avec vos propres mots ?
                </label>
                <textarea
                  value={answers.page2_q1}
                  onChange={(e) => setAnswers({ ...answers, page2_q1: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  2️⃣ Quels sont, selon vous, les objectifs possibles dans ce contexte ?
                </label>
                <div className="mt-1 text-xs text-slate-500">(Liste libre – un objectif par ligne)</div>
                <textarea
                  value={answers.page2_q2}
                  onChange={(e) => setAnswers({ ...answers, page2_q2: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  3️⃣ Qu’est-ce qui pourrait être considéré comme une amélioration de la situation ?
                </label>
                <textarea
                  value={answers.page2_q3}
                  onChange={(e) => setAnswers({ ...answers, page2_q3: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="rounded-xl bg-rose-50 p-4 ring-1 ring-rose-100">
                <div className="text-sm font-semibold text-rose-900">🔴 SESSION 1 — En direct avec l’expert</div>
                <div className="mt-1 text-sm text-rose-900">📌 Basée sur le contenu de la Page 2</div>
                <div className="text-sm text-rose-900">📌 Aucun template (échange oral)</div>
                <div className="mt-1 text-sm text-rose-900">📅 Date et l'heure : {renderDateTime(situation?.session1DateTime)}</div>
                <button
                  type="button"
                  onClick={() => openVideo(situation?.session1VideoUrl)}
                  disabled={!situation?.session1VideoUrl?.trim()}
                  className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  enregistrement vidéo SESSION 1
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">🎯 Objectif choisi :</label>
                <input
                  value={answers.objectifChoisi}
                  onChange={(e) => setAnswers({ ...answers, objectifChoisi: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="(Champ texte court)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">🤔 Pourquoi avoir choisi cet objectif en priorité ?</label>
                <textarea
                  value={answers.pourquoiObjectif}
                  onChange={(e) => setAnswers({ ...answers, pourquoiObjectif: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="(Justification)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">🔮 Hypothèse de travail :</label>
                <div className="mt-1 text-sm text-slate-600">« Si je me concentre sur cet objectif, je m’attends à ce que… »</div>
                <textarea
                  value={answers.hypothese}
                  onChange={(e) => setAnswers({ ...answers, hypothese: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 text-sm text-slate-700">
                📌 Cette décision servira de base à l’expérimentation.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Qu’avez-vous mis en œuvre concrètement ?</label>
                <div className="mt-1 text-xs text-slate-500">(Description factuelle et concise)</div>
                <textarea
                  value={answers.executionQuoi}
                  onChange={(e) => setAnswers({ ...answers, executionQuoi: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Sur quelle période ?</label>
                <div className="mt-1 text-xs text-slate-500">(Indication temporelle générale)</div>
                <input
                  value={answers.executionPeriode}
                  onChange={(e) => setAnswers({ ...answers, executionPeriode: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 text-sm text-slate-700">
                📌 Il s’agit uniquement d’un constat de réalité, sans détails techniques.
              </div>

              <div className="rounded-xl bg-rose-50 p-4 ring-1 ring-rose-100">
                <div className="text-sm font-semibold text-rose-900">🔴 SESSION 2 — En direct avec l’expert</div>
                <div className="mt-1 text-sm text-rose-900">📌 Analyse de la décision et du résultat</div>
                <div className="text-sm text-rose-900">📌 Aucune explication technique</div>
                <div className="mt-1 text-sm text-rose-900">📅 Date et l'heure : {renderDateTime(situation?.session2DateTime)}</div>
                <button
                  type="button"
                  onClick={() => openVideo(situation?.session2VideoUrl)}
                  disabled={!situation?.session2VideoUrl?.trim()}
                  className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  enregistrement vidéo SESSION 2
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">1️⃣ Qu’attendiez-vous comme résultat ?</label>
                <textarea
                  value={answers.resultatAttendu}
                  onChange={(e) => setAnswers({ ...answers, resultatAttendu: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">2️⃣ Qu’est-il réellement arrivé ?</label>
                <textarea
                  value={answers.resultatReel}
                  onChange={(e) => setAnswers({ ...answers, resultatReel: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">3️⃣ Quelle différence observez-vous entre l’attendu et le réel ?</label>
                <textarea
                  value={answers.difference}
                  onChange={(e) => setAnswers({ ...answers, difference: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 text-sm text-slate-700">
                📌 Même un résultat faible ou négatif constitue une donnée exploitable.
              </div>

              <div className="rounded-xl bg-rose-50 p-4 ring-1 ring-rose-100">
                <div className="text-sm font-semibold text-rose-900">🔴 SESSION 3 — En direct avec l’expert</div>
                <div className="mt-1 text-sm text-rose-900">📌 Stabilisation du raisonnement et de l’autonomie</div>
                <div className="mt-1 text-sm text-rose-900">📅 Date et l'heure : {renderDateTime(situation?.session3DateTime)}</div>
                <button
                  type="button"
                  onClick={() => openVideo(situation?.session3VideoUrl)}
                  disabled={!situation?.session3VideoUrl?.trim()}
                  className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  enregistrement vidéo SESSION 3
                </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Qu’avez-vous appris sur votre manière de raisonner dans cette situation ?</label>
                <textarea
                  value={answers.syntheseAppris}
                  onChange={(e) => setAnswers({ ...answers, syntheseAppris: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Quelle décision ne prendriez-vous plus de la même façon ?</label>
                <textarea
                  value={answers.syntheseDecision}
                  onChange={(e) => setAnswers({ ...answers, syntheseDecision: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Comment aborderiez-vous une situation similaire à l’avenir ?</label>
                <textarea
                  value={answers.syntheseAvenir}
                  onChange={(e) => setAnswers({ ...answers, syntheseAvenir: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100">
                <div className="text-sm font-semibold text-blue-900">Phrase de référence</div>
                <div className="mt-2 text-sm text-blue-900">
                  <div>La plateforme structure la réflexion.</div>
                  <div>Les sessions corrigent le raisonnement.</div>
                  <div>L’exécution reste la responsabilité du participant.</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 0}
              className="w-full sm:w-auto rounded-xl bg-white px-5 py-3 text-slate-900 font-semibold ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Retour
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext()}
              className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {current.primaryCta}
            </button>
          </div>

          {step === 0 && !acceptedCadre && (
            <div className="mt-4 text-center text-xs text-slate-500">
              Vous devez cocher <span className="font-semibold">J’accepte le cadre</span> pour continuer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultingOperationnelTemplatesPage;
