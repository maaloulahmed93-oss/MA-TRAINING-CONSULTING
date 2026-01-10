import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, PhoneIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config/api';

type EspaceProfessionnelSession = {
  accountId: string;
  token: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: number;
};

const STORAGE_KEY = 'espaceProfessionnelSession';

type View = 'overview' | 'documents' | 'parcours' | 'phase' | 'communication';

type PhaseStatus = 'done' | 'active' | 'pending';

type PhaseItem = {
  id: number;
  title: string;
  status: PhaseStatus;
  description: string;
  externalLinkUrl: string;
};

type DecisionHistoryItem = {
  id: string;
  date: string;
  decision: string;
  phase: string;
};

type DashboardPhaseStatus = 'A_VENIR' | 'EN_COURS' | 'TERMINEE';

type ParticipantDashboard = {
  ownerAccountId: string;
  situationCurrent: {
    levelLabel: string;
    statusLabel: string;
  };
  notesVisibleToParticipant: string;
  currentPhaseId: number;
  phases: {
    phaseId: number;
    status: DashboardPhaseStatus;
    shortDescription: string;
    externalLinkUrl: string;
  }[];
  lastDecision: {
    date: string;
    decisionType: string;
    phaseId: number;
  } | null;
  decisionsHistory: {
    id: string;
    date: string;
    decisionType: string;
    phaseId: number;
  }[];
  documents: {
    id: string;
    title: string;
    category: 'DIAGNOSTIC' | 'PHASE';
    phaseId?: number;
    documentUrl: string;
    addedAt: string;
  }[];
  updatedAt: string;
};

const EspaceProfessionnelPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('overview');
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [dashboard, setDashboard] = useState<ParticipantDashboard | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    password: '',
    phone: ''
  });

  const session: EspaceProfessionnelSession | null = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as EspaceProfessionnelSession;
    } catch {
      return null;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const verifySession = async () => {
      if (!session) return;

      if (!session.accountId || !session.token) {
        localStorage.removeItem(STORAGE_KEY);
        setIsAuthenticated(false);
        setView('overview');
        setSelectedPhaseId(null);
        setError('Veuillez vous reconnecter.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/espace-pro/me/dashboard`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem(STORAGE_KEY);
          setIsAuthenticated(false);
          setView('overview');
          setSelectedPhaseId(null);
          setDashboard(null);
          setError('Session expirée. Veuillez vous reconnecter.');
          return;
        }

        const payload = (await response.json()) as { success: boolean; data?: ParticipantDashboard; message?: string };
        if (!payload.success || !payload.data) {
          localStorage.removeItem(STORAGE_KEY);
          setIsAuthenticated(false);
          setView('overview');
          setSelectedPhaseId(null);
          setDashboard(null);
          setError(payload.message || 'Session expirée. Veuillez vous reconnecter.');
          return;
        }

        setDashboard(payload.data);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        setDashboard(null);
        setError('Connexion au serveur indisponible. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    void verifySession();
  }, [session]);

  const phases: PhaseItem[] = useMemo(() => {
    const source = dashboard?.phases || [];

    const mapped: PhaseItem[] = source
      .slice()
      .sort((a, b) => a.phaseId - b.phaseId)
      .map((p) => {
        const status: PhaseStatus =
          p.status === 'TERMINEE' ? 'done' : p.status === 'EN_COURS' ? 'active' : 'pending';
        return {
          id: p.phaseId,
          title: `Phase ${p.phaseId}`,
          status,
          description: p.shortDescription || '—',
          externalLinkUrl: p.externalLinkUrl || '',
        };
      });

    if (mapped.length === 0) {
      return Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        title: `Phase ${i + 1}`,
        status: 'pending' as PhaseStatus,
        description: '—',
        externalLinkUrl: '',
      }));
    }

    return mapped;
  }, [dashboard]);

  const activePhaseTitle = useMemo(() => {
    if (dashboard?.currentPhaseId) return `Phase ${dashboard.currentPhaseId}`;
    return phases.find((p) => p.status === 'active')?.title ?? 'Phase 1';
  }, [dashboard, phases]);

  const selectedPhase = useMemo(() => {
    if (!selectedPhaseId) return null;
    return phases.find((p) => p.id === selectedPhaseId) ?? null;
  }, [phases, selectedPhaseId]);

  const phaseStatusBadge = (status: PhaseStatus) => {
    if (status === 'done') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          ✔️ Terminée
        </span>
      );
    }
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
          🔵 En cours
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200">
        ⏳ À venir
      </span>
    );
  };

  const validatePhone = (value: string) => {
    const cleaned = value.replace(/\s+/g, '');
    return /^\+?[0-9]{6,15}$/.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.password.trim() || !form.phone.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (!validatePhone(form.phone)) {
      setError('Numéro de téléphone invalide.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/espace-pro-accounts/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          password: form.password
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      const result = (await response.json()) as {
        success: boolean;
        data?: { id: string; firstName: string; lastName: string; phone: string; token?: string };
        message?: string;
      };

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Identifiants invalides');
      }

      const newSession: EspaceProfessionnelSession = {
        accountId: result.data.id,
        token: result.data.token || '',
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        phone: result.data.phone,
        createdAt: Date.now()
      };

      if (!newSession.token) {
        throw new Error('Token manquant');
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      setIsAuthenticated(true);
      setForm({ firstName: '', lastName: '', password: '', phone: '' });
    } catch {
      setError('Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setView('overview');
    setSelectedPhaseId(null);
    setDashboard(null);
  };

  const goToView = (next: View) => {
    setView(next);
    setSelectedPhaseId(null);
  };

  const decisionHistory: DecisionHistoryItem[] = useMemo(() => {
    const list = dashboard?.decisionsHistory || [];
    return list
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((x) => ({
        id: x.id,
        date: new Date(x.date).toLocaleDateString(),
        decision: x.decisionType,
        phase: `Phase ${x.phaseId}`,
      }));
  }, [dashboard]);

  const documents = useMemo(() => {
    return (dashboard?.documents || []).map((doc) => {
      const label = doc.category === 'PHASE' ? `Phase ${doc.phaseId}` : 'Diagnostic initial';
      return {
        ...doc,
        label,
      };
    });
  }, [dashboard]);

  const openExternal = (url: string) => {
    const safe = String(url || '').trim();
    if (!safe) return;
    window.open(safe, '_blank', 'noopener,noreferrer');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Espace Professionnel</h1>
            <p className="text-gray-600">Connectez-vous pour accéder à votre espace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre nom"
                  required
                />
                <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-4" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre prénom"
                  required
                />
                <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-4" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre mot de passe"
                  required
                />
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-4" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <div className="relative">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+216XXXXXXXX"
                  required
                />
                <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-4" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">© 2025 MA Training & Consulting</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Espace Professionnel</h1>
                <p className="text-xs text-slate-500">{session ? `${session.firstName} ${session.lastName} · ${session.phone}` : ''}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex w-full flex-wrap rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200 sm:w-auto">
                <button
                  type="button"
                  aria-current={view === 'overview' ? 'page' : undefined}
                  onClick={() => goToView('overview')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${view === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Vue d’ensemble
                </button>
                <button
                  type="button"
                  aria-current={view === 'documents' ? 'page' : undefined}
                  onClick={() => goToView('documents')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${view === 'documents' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Documents
                </button>
                <button
                  type="button"
                  aria-current={view === 'parcours' || view === 'phase' ? 'page' : undefined}
                  onClick={() => goToView('parcours')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${view === 'parcours' || view === 'phase' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Parcours
                </button>
                <button
                  type="button"
                  aria-current={view === 'communication' ? 'page' : undefined}
                  onClick={() => goToView('communication')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${view === 'communication' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Communication
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-3 py-2 rounded-xl text-sm font-medium transition-colors bg-rose-50 hover:bg-rose-100 text-rose-700 ring-1 ring-rose-200"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {view === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Vue d’ensemble</h2>
                  <p className="text-slate-600 mt-1">Dossier professionnel de suivi : décisions, documents et phases.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-3">📌 Action attendue maintenant</h3>
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-700">Vous êtes en <span className="font-semibold text-slate-900">{activePhaseTitle}</span>.</p>
                <p className="text-sm text-slate-700 mt-2">Objectif : <span className="font-medium text-slate-900">{phases.find((p) => p.title === activePhaseTitle)?.description ?? '—'}</span></p>
              </div>

              {dashboard?.lastDecision && (
                <div className="mt-4 rounded-xl bg-blue-50 ring-1 ring-blue-100 p-4">
                  <p className="text-sm text-blue-900">
                    🔔 Dernière décision: <span className="font-medium">{dashboard.lastDecision.decisionType}</span> — Phase {dashboard.lastDecision.phaseId} —{' '}
                    <span className="font-medium">{new Date(dashboard.lastDecision.date).toLocaleDateString()}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3">1️⃣ Situation actuelle</h3>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-sm text-slate-700">Situation professionnelle</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {(dashboard?.situationCurrent?.levelLabel || '—')}{dashboard?.situationCurrent?.statusLabel ? ` — ${dashboard.situationCurrent.statusLabel}` : ''}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3">2️⃣ Dernière décision professionnelle</h3>
                <div className="rounded-xl bg-slate-50 p-4 space-y-2 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Type de décision</span>
                    <span className="text-sm font-medium text-slate-900">{dashboard?.lastDecision?.decisionType || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Date</span>
                    <span className="text-sm font-medium text-slate-900">{dashboard?.lastDecision?.date ? new Date(dashboard.lastDecision.date).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Phase actuelle</span>
                    <span className="text-sm font-medium text-slate-900">{dashboard?.currentPhaseId ? `Phase ${dashboard.currentPhaseId}` : '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">3️⃣ Accès rapide</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => goToView('documents')}
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ring-1 ring-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  📂 Documents
                </button>
                <button
                  type="button"
                  onClick={() => goToView('parcours')}
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ring-1 ring-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  🧭 Parcours
                </button>
                <button
                  type="button"
                  onClick={() => goToView('communication')}
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ring-1 ring-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  📩 Communication
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">📜 Historique des décisions professionnelles</h3>
              <div className="space-y-3">
                {decisionHistory.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 text-sm text-slate-600">Aucune décision pour le moment.</div>
                ) : decisionHistory.map((item) => (
                  <div key={item.id} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.decision}</div>
                        <div className="mt-1 text-xs text-slate-600">Phase concernée : <span className="font-medium text-slate-900">{item.phase}</span></div>
                      </div>
                      <div className="shrink-0 text-xs font-medium text-slate-600">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {dashboard?.notesVisibleToParticipant && (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3">📝 Notes professionnelles</h3>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{dashboard.notesVisibleToParticipant}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Documents professionnels</h2>
              <p className="text-slate-600 mt-1">Lecture uniquement / téléchargement uniquement</p>
              <p className="text-xs text-slate-500 mt-2">Ceci est la référence officielle du participant.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <div className="space-y-3">
                {documents.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 text-sm text-slate-600">Aucun document disponible.</div>
                ) : documents.map((doc) => {
                  return (
                    <div key={doc.id} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{doc.title}</div>
                        <div className="mt-1 inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                          {doc.label}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openExternal(doc.documentUrl)}
                        className="shrink-0 px-3 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        Télécharger
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {view === 'parcours' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Parcours professionnel</h2>
              <p className="text-slate-600 mt-1">Phases du parcours (sans dates obligatoires / Progress% / Scores)</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-2 sm:p-3">
              <div className="space-y-2">
                {phases.map((phase) => (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => {
                      setSelectedPhaseId(phase.id);
                      setView('phase');
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 ring-1 ring-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-slate-900">{phase.title}</div>
                      {phaseStatusBadge(phase.status)}
                    </div>
                    <div className="text-sm font-semibold text-blue-700">Voir</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'phase' && selectedPhase && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-slate-500">Parcours / {selectedPhase.title}</div>
                  <h2 className="text-lg font-semibold text-slate-900 mt-1">{selectedPhase.title}</h2>
                  <div className="mt-2">{phaseStatusBadge(selectedPhase.status)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    goToView('parcours');
                  }}
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Retour
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-2">Description courte</h3>
              <p className="text-slate-700">{selectedPhase.description}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-2">📌 Cadre de la phase</h3>
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-700">Cette situation vise à analyser votre manière de penser et de décider en contexte professionnel réel.</p>
                <p className="text-sm text-slate-700 mt-2">Il n'existe pas de réponse correcte ou incorrecte.</p>
                <p className="text-sm text-slate-700 mt-2">L'objectif est la réflexion, la justification et la responsabilité.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Accès</h3>
              {selectedPhase.status === 'done' ? (
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-semibold ring-1 ring-emerald-200">
                  ✔️ Phase complétée
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedPhase.externalLinkUrl) return;
                    openExternal(selectedPhase.externalLinkUrl);
                  }}
                  disabled={!selectedPhase.externalLinkUrl}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold transition-colors bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  👉 Accéder à la situation professionnelle
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-2">📌 Après l’envoi</h3>
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-700">Vous recevrez un rapport de soumission contenant vos questions et réponses.</p>
                <p className="text-sm text-slate-700 mt-2">Ce rapport sera analysé par un expert MA Consulting avant l'activation de la phase suivante.</p>
              </div>
            </div>
          </div>
        )}

        {view === 'communication' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Communication</h2>
              <p className="text-slate-600 mt-1">Choisissez un moyen de contact.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <div className="mb-4 p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">📌 Cadre de communication</h3>
                <p className="text-sm text-slate-700 mt-1">Cet espace est réservé aux échanges professionnels liés à votre parcours.</p>
                <p className="text-sm text-slate-700 mt-2">Aucune réponse immédiate ou accompagnement hors cadre n'est garanti.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="mailto:contact@matc.com"
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ring-1 ring-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  ✉️ Email
                </a>
                <a
                  href="tel:+21600000000"
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ring-1 ring-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  📞 Appeler
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EspaceProfessionnelPage;
