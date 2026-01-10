import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
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

const DiagnosticSessionsPage: React.FC = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState<'all' | DiagnosticSessionStatus>('all');
  const [query, setQuery] = useState('');
  const [scoreMin, setScoreMin] = useState<string>('');
  const [scoreMax, setScoreMax] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string>('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await diagnosticSessionsApiService.getSessions({
        page: 1,
        limit: 100,
        status: status === 'all' ? undefined : status,
        search: query.trim() ? query.trim() : undefined,
        scoreMin: scoreMin.trim() ? Number(scoreMin) : undefined,
        scoreMax: scoreMax.trim() ? Number(scoreMax) : undefined,
        from: from || undefined,
        to: to || undefined,
      });

      if (response.success) {
        setSessions(response.data);
      } else {
        throw new Error('Failed to fetch diagnostic sessions');
      }
    } catch (err) {
      console.error('❌ Error fetching diagnostic sessions:', err);
      setError('Erreur lors du chargement des sessions de diagnostic');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, query, scoreMin, scoreMax, from, to]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const pending = sessions.filter((s) => s.status === 'pending').length;
    const validated = sessions.filter((s) => s.status === 'validated').length;
    return { total, pending, validated };
  }, [sessions]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '—';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = window.confirm('Supprimer cette session ? Cette action est définitive.');
    if (!ok) return;

    try {
      setDeletingId(id);
      await diagnosticSessionsApiService.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error('❌ Error deleting diagnostic session:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diagnostic Sessions</h1>
          <p className="mt-2 text-gray-600">Liste des diagnostics soumis (raw réponses + scoring + revue).</p>
        </div>
        <button
          onClick={fetchSessions}
          className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-md bg-white hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-gray-900">Total</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-gray-900">À revoir</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">{stats.pending}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-gray-900">Validé</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">{stats.validated}</div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher (prénom, email)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tous</option>
                <option value="pending">À revoir</option>
                <option value="validated">Validé</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-2">
            <input
              value={scoreMin}
              onChange={(e) => setScoreMin(e.target.value)}
              placeholder="Score min"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="lg:col-span-2">
            <input
              value={scoreMax}
              onChange={(e) => setScoreMax(e.target.value)}
              placeholder="Score max"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="lg:col-span-3">
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              type="date"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="lg:col-span-3">
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              type="date"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Sessions ({sessions.length})</h3>
        </div>

        {loading ? (
          <div className="p-6 text-gray-600">Chargement…</div>
        ) : error ? (
          <div className="p-6 text-rose-700">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Situation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orientation auto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/diagnostic-sessions/${s._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(s.submittedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{s.participant.firstName}</div>
                      <div className="text-sm text-gray-500">{s.participant.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.participant.situation}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{s.scores?.total ?? 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.scores?.orientation || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge[s.status]}`}>
                        {statusLabel[s.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => handleDelete(e, s._id)}
                        disabled={deletingId === s._id}
                        className={`inline-flex items-center justify-center rounded-md border px-2 py-2 text-sm font-semibold ${
                          deletingId === s._id
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        }`}
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sessions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune session trouvée</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticSessionsPage;
