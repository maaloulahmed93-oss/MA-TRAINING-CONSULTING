import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '../config/routes';
import {
  diagnosticSessionsApiService,
  type DiagnosticSession,
} from '../services/diagnosticSessionsApiService';

type ImplicitStatus = 'en_attente' | 'termine' | 'annule' | 'suspendu';

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

  const [implicitStatus, setImplicitStatus] = useState<ImplicitStatus>('en_attente');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusOk, setStatusOk] = useState('');

  const fetchSession = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const res = await diagnosticSessionsApiService.getSession(id);
      if (!res.success) throw new Error('Failed to fetch');
      setSession(res.data);

      setImplicitStatus(((res.data.analysis as any)?.implicitStatus || 'en_attente') as ImplicitStatus);
    } catch (err) {
      console.error('❌ Error fetching diagnostic session:', err);
      setError('Erreur lors du chargement de la session');
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveImplicitStatus = async (next: ImplicitStatus) => {
    if (!id) return;
    try {
      setSavingStatus(true);
      setStatusError('');
      setStatusOk('');

      const res = await diagnosticSessionsApiService.updateImplicitStatus(id, next);
      if (!res.success) throw new Error('Implicit status update failed');
      setSession(res.data);
      setImplicitStatus(next);
      setStatusOk('Statut mis à jour');
    } catch (err) {
      console.error('❌ Error saving implicit status:', err);
      setStatusError('Erreur lors de la mise à jour du statut');
    } finally {
      setSavingStatus(false);
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

  const wizardAnswers = useMemo(() => {
    const r = session?.responses || {};
    const answers = (r as any).answers;
    if (!Array.isArray(answers)) return [];
    return answers
      .map((a) => ({
        questionId: String(a?.questionId || ''),
        questionText: String(a?.questionText || ''),
        category: String(a?.category || ''),
        selectedLabel: String(a?.selectedOption?.label || ''),
        selectedScore: Number(a?.selectedOption?.score ?? 0),
      }))
      .filter((a) => a.questionText || a.selectedLabel);
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

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              if (!id) return;
              navigate(ROUTES.DIAGNOSTIC_SESSION_EXPERT_HANDOVER.replace(':id', id));
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-md bg-white hover:bg-gray-50"
          >
            Expert Handover
          </button>

          <button
            onClick={fetchSession}
            className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-md bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Actualiser
          </button>
        </div>
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
                <div><span className="font-semibold">Nom complet:</span> {session.participant.fullName || session.participant.firstName}</div>
                <div><span className="font-semibold">Email:</span> {session.participant.email}</div>
                <div><span className="font-semibold">WhatsApp:</span> {session.participant.whatsapp || '—'}</div>
                <div><span className="font-semibold">Situation:</span> {session.participant.situation}</div>
                <div><span className="font-semibold">Domaine (choisi):</span> {session.metadata?.selectedDomain || '—'}</div>
                <div><span className="font-semibold">Soumis:</span> {new Date(session.submittedAt).toLocaleString('fr-FR')}</div>
                <div><span className="font-semibold">Statut:</span> {session.status}</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900">Scoring</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div><span className="font-semibold">Total:</span> {session.scores?.total ?? 0}</div>
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
              <h2 className="text-lg font-semibold text-gray-900">Statut</h2>

              {statusOk && (
                <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                  {statusOk}
                </div>
              )}
              {statusError && (
                <div className="mt-4 rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
                  {statusError}
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-900">Statut ضمني</label>
                <select
                  value={implicitStatus}
                  onChange={(e) => handleSaveImplicitStatus(e.target.value as ImplicitStatus)}
                  disabled={savingStatus}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="en_attente">En attente</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                  <option value="suspendu">Suspendu (محضور)</option>
                </select>
              </div>
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
              <h2 className="text-lg font-semibold text-gray-900">
                {wizardAnswers.length > 0 ? 'Réponses (Wizard)' : 'Réponses fermées (brut)'}
              </h2>
              <div className="mt-4 space-y-2 text-sm">
                {wizardAnswers.length > 0 ? (
                  wizardAnswers.map((a, idx) => (
                    <div key={`${a.questionId || idx}`} className="rounded-lg border border-gray-200 p-4">
                      <div className="text-xs font-semibold text-gray-500">{a.category || '—'}</div>
                      <div className="mt-2 text-sm font-semibold text-gray-900">{a.questionText || '—'}</div>
                      <div className="mt-2 flex items-center justify-between gap-4">
                        <div className="text-sm text-gray-700">{a.selectedLabel || '—'}</div>
                        <div className="text-sm font-semibold text-gray-900">{Number.isFinite(a.selectedScore) ? a.selectedScore : 0}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {Object.entries(flatResponses.closed || {}).map(([qid, val]) => (
                      <div key={qid} className="flex items-center justify-between border-b border-gray-100 py-2">
                        <span className="font-medium text-gray-700">{qid}</span>
                        <span className="font-semibold text-gray-900">{String(val)}</span>
                      </div>
                    ))}
                    {Object.keys(flatResponses.closed || {}).length === 0 && (
                      <div className="text-gray-500">—</div>
                    )}
                  </>
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
