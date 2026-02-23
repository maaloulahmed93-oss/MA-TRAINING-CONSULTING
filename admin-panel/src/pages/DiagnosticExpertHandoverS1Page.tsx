import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { ROUTES } from '../config/routes';
import {
  diagnosticSessionsApiService,
  type DiagnosticSession,
  type DiagnosticSessionStatus,
} from '../services/diagnosticSessionsApiService';

const statusLabel: Record<DiagnosticSessionStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  reviewed: 'Revu',
  pending: 'À revoir',
  validated: 'Validé',
};

const statusBadge: Record<DiagnosticSessionStatus, string> = {
  draft: 'bg-slate-100 text-slate-800',
  submitted: 'bg-indigo-100 text-indigo-800',
  reviewed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  validated: 'bg-emerald-100 text-emerald-800',
};

const DiagnosticExpertHandoverS1Page: React.FC = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | DiagnosticSessionStatus>('all');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await diagnosticSessionsApiService.getSessions({
        page: 1,
        limit: 100,
        status: status === 'all' ? undefined : status,
        search: query.trim() ? query.trim() : undefined,
      });

      if (response.success) {
        setSessions(response.data);
      } else {
        throw new Error('Failed to fetch diagnostic sessions');
      }
    } catch (err) {
      console.error('❌ Error fetching diagnostic sessions:', err);
      setError('Erreur lors du chargement des sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const pending = sessions.filter((s) => s.status === 'pending').length;
    const validated = sessions.filter((s) => s.status === 'validated').length;
    return { total, pending, validated };
  }, [sessions]);

  const openExpert = (id: string) => {
    navigate(ROUTES.DIAGNOSTIC_SESSION_EXPERT_HANDOVER.replace(':id', id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expert Handover (S1)</h1>
          <p className="text-gray-600 text-sm">Liste + accès au résumé expert (Phases 0–5)</p>
        </div>

        <button
          onClick={fetchSessions}
          className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-md bg-white hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">À revoir</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{stats.pending}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Validé</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{stats.validated}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (prénom, email)…"
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full sm:w-56 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tous</option>
            <option value="pending">À revoir</option>
            <option value="validated">Validé</option>
            <option value="reviewed">Revu</option>
            <option value="submitted">Soumis</option>
            <option value="draft">Brouillon</option>
          </select>
        </div>

        {loading ? (
          <div className="text-gray-600">Chargement…</div>
        ) : error ? (
          <div className="text-rose-700">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Participant</th>
                  <th className="py-3 pr-4">Situation</th>
                  <th className="py-3 pr-4">Score</th>
                  <th className="py-3 pr-4">Statut</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s._id} className="border-b border-gray-100">
                    <td className="py-3 pr-4 text-gray-700">
                      {new Date(s.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-gray-900">{s.participant.fullName || s.participant.firstName}</div>
                      <div className="text-gray-500">{s.participant.email}</div>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{s.participant.situation}</td>
                    <td className="py-3 pr-4 text-gray-900 font-semibold">{s.scores?.total ?? 0}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusBadge[s.status] || 'bg-slate-100 text-slate-800'}`}>
                        {statusLabel[s.status] || s.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => openExpert(s._id)}
                        className="inline-flex items-center px-3 py-2 rounded-md bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700"
                      >
                        Ouvrir résumé
                      </button>
                    </td>
                  </tr>
                ))}

                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">Aucune session</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticExpertHandoverS1Page;
