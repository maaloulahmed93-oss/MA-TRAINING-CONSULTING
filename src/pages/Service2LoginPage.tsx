import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getSession, login, me } from '../services/consultingOperationnelParticipantService';

const Service2LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [participantId, setParticipantId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      const session = getSession();
      if (!session?.token) return;

      setLoading(true);
      setError(null);
      const ok = await me(session.token);
      setLoading(false);
      if (ok) {
        navigate('/service-2/mission');
        return;
      }
      clearSession();
    };

    void verify();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ participantId, password });
      navigate('/service-2/mission');
    } catch {
      setError('Identifiant ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-10">
          <div className="flex justify-start mb-6">
            <Link
              to="/"
              className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 ring-1 ring-slate-200"
            >
              Retour à l’accueil
            </Link>
          </div>

          <div className="text-center">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accès Participant</div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">Service 2 — Missions Professionnelles</h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
            )}

            <div>
              <label htmlFor="participantId" className="block text-sm font-medium text-slate-700">
                Identifiant participant
              </label>
              <input
                id="participantId"
                name="participantId"
                type="text"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Accéder'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Service2LoginPage;
