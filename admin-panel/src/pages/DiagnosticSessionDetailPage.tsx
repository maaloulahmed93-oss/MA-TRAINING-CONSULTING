import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import {
  diagnosticSessionsApiService,
  type DiagnosticSession,
} from '../services/diagnosticSessionsApiService';

type FinalOrientation = 'Foundations' | 'Structuring' | 'Advanced';
type ExpertDecision = 'service1' | 'orientation' | 'echange' | 'no-go';

const blocks = [
  {
    key: 'role',
    title: 'Clarté de rôle',
    open: [{ id: 'ro1', label: 'Décrivez votre rôle : mission, livrables, interlocuteurs.' }],
  },
  {
    key: 'decision',
    title: 'Périmètre de décision',
    open: [{ id: 'do1', label: 'Exemple : contexte, options, choix, conséquence.' }],
  },
  {
    key: 'reasoning',
    title: 'Raisonnement & priorisation',
    open: [{ id: 'po1', label: 'Méthode : prioriser 5 sujets urgents (étapes).' }],
  },
  {
    key: 'pressure',
    title: 'Comportement sous pression',
    open: [{ id: 'so1', label: 'Pression : réaction, résultat, apprentissage.' }],
  },
  {
    key: 'self',
    title: 'Conscience de soi',
    open: [{ id: 'ao1', label: 'Changement concret dans les 3 prochains mois.' }],
  },
] as const;

const DiagnosticSessionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [finalOrientation, setFinalOrientation] = useState<FinalOrientation>('Structuring');
  const [domain, setDomain] = useState('');
  const [recommendedRole, setRecommendedRole] = useState('');
  const [decision, setDecision] = useState<ExpertDecision>('service1');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState('');

  const fetchSession = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const res = await diagnosticSessionsApiService.getSession(id);
      if (!res.success) throw new Error('Failed to fetch');
      setSession(res.data);

      const suggested = (res.data.analysis?.finalOrientation || res.data.scores?.orientation || 'Structuring') as FinalOrientation;
      setFinalOrientation(suggested);
      setDomain((res.data.analysis as any)?.domain || '');
      setRecommendedRole((res.data.analysis as any)?.recommendedRole || '');
      setDecision(((res.data.analysis as any)?.decision || 'service1') as ExpertDecision);
      setNotes(res.data.analysis?.notes || '');
    } catch (err) {
      console.error('❌ Error fetching diagnostic session:', err);
      setError('Erreur lors du chargement de la session');
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const flatResponses = useMemo(() => {
    const r = session?.responses || {};
    const closed = (r as any).closedAnswers || {};
    const open = (r as any).openAnswers || {};
    return { closed, open };
  }, [session]);

  const openByBlock = useMemo(() => {
    const open = flatResponses.open || {};
    return blocks.map((b) => ({
      key: b.key,
      title: b.title,
      items: b.open.map((q) => ({
        id: q.id,
        label: q.label,
        value: String(open[q.id] || '').trim(),
      })),
    }));
  }, [flatResponses.open]);

  const handleSaveReview = async () => {
    if (!id) return;
    try {
      setSaving(true);
      setSaveError('');
      setSaveOk('');

      const res = await diagnosticSessionsApiService.reviewSession(id, {
        orientation_finale: finalOrientation,
        domaine: domain,
        role: recommendedRole,
        decision,
        notes,
      });

      if (!res.success) throw new Error('Review failed');
      setSession(res.data);
      setSaveOk('Décision validée');
    } catch (err) {
      console.error('❌ Error saving review:', err);
      setSaveError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Détail Diagnostic</h1>
            <p className="text-gray-600 text-sm">ID: {id}</p>
          </div>
        </div>

        <button
          onClick={fetchSession}
          className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-md bg-white hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">Chargement…</div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-rose-700">{error}</div>
      ) : !session ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">Session introuvable</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900">Participant</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div><span className="font-semibold">Prénom:</span> {session.participant.firstName}</div>
                <div><span className="font-semibold">Email:</span> {session.participant.email}</div>
                <div><span className="font-semibold">Situation:</span> {session.participant.situation}</div>
                <div><span className="font-semibold">Soumis:</span> {new Date(session.submittedAt).toLocaleString('fr-FR')}</div>
                <div><span className="font-semibold">Statut:</span> {session.status}</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900">Scoring</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div><span className="font-semibold">Total:</span> {session.scores?.total ?? 0} / 15</div>
                <div><span className="font-semibold">Orientation auto:</span> {session.scores?.orientation || '—'}</div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="text-sm font-semibold text-gray-900">Per block</div>
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  {Object.entries(session.scores?.perBlock || {}).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="font-medium">{k}</span>
                      <span>{v} / 3</span>
                    </div>
                  ))}
                  {Object.keys(session.scores?.perBlock || {}).length === 0 && (
                    <div className="text-gray-500">—</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900">Analyse expert</h2>

              {saveOk && (
                <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                  {saveOk}
                </div>
              )}
              {saveError && (
                <div className="mt-4 rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
                  {saveError}
                </div>
              )}

              <div className="mt-4">
                <div className="block text-sm font-semibold text-gray-900">Orientation finale</div>
                <div className="mt-2 space-y-2">
                  {(['Foundations', 'Structuring', 'Advanced'] as FinalOrientation[]).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-gray-800">
                      <input
                        type="radio"
                        name="finalOrientation"
                        value={opt}
                        checked={finalOrientation === opt}
                        onChange={() => setFinalOrientation(opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-900">Domaine pressenti</label>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-900">Type de rôle recommandé</label>
                <input
                  value={recommendedRole}
                  onChange={(e) => setRecommendedRole(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-900">Décision suivante</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as ExpertDecision)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="service1">Proposer Service 1 (Parcours)</option>
                  <option value="orientation">Orientation / repositionnement</option>
                  <option value="echange">Demande d’échange préalable</option>
                  <option value="no-go">NO-GO (rare, motivé)</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-900">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <button
                onClick={handleSaveReview}
                disabled={saving || !finalOrientation}
                className={`mt-4 w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white ${
                  saving || !finalOrientation
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {saving ? 'Validation…' : 'Valider la décision'}
              </button>

              {session.status === 'validated' && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
                  <div className="font-semibold text-gray-900">Statut final</div>
                  <div className="mt-2 space-y-1 text-gray-700">
                    <div><span className="font-semibold">Status:</span> validated</div>
                    <div><span className="font-semibold">Timestamp:</span> {session.analysis?.reviewedAt ? new Date(session.analysis.reviewedAt).toLocaleString('fr-FR') : '—'}</div>
                    <div><span className="font-semibold">Expert:</span> {(session.analysis as any)?.expertEmail || (session.analysis as any)?.expertId || '—'}</div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <button className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-semibold text-gray-900 hover:bg-gray-100">
                      Envoyer email participant
                    </button>
                    <button className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-semibold text-gray-900 hover:bg-gray-100">
                      Générer rapport PDF
                    </button>
                    <button className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-semibold text-gray-900 hover:bg-gray-100">
                      Créer accès Service 1
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900">Réponses ouvertes (par bloc)</h2>
              <div className="mt-4 space-y-5">
                {openByBlock.map((b) => (
                  <div key={b.key} className="rounded-lg border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-900">{b.title}</div>
                    <div className="mt-3 space-y-3">
                      {b.items.map((q) => (
                        <div key={q.id} className="rounded-md border border-gray-200 bg-white p-3">
                          <div className="text-xs font-semibold text-gray-500">{q.label}</div>
                          <div className="mt-2 whitespace-pre-wrap text-sm text-gray-900">{q.value || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900">Réponses fermées (brut)</h2>
              <div className="mt-4 space-y-2 text-sm">
                {Object.entries(flatResponses.closed || {}).map(([qid, val]) => (
                  <div key={qid} className="flex items-center justify-between border-b border-gray-100 py-2">
                    <span className="font-medium text-gray-700">{qid}</span>
                    <span className="font-semibold text-gray-900">{String(val)}</span>
                  </div>
                ))}
                {Object.keys(flatResponses.closed || {}).length === 0 && (
                  <div className="text-gray-500">—</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DiagnosticSessionDetailPage;
