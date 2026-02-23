import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clearSession, getSession, login, me } from '../services/consultingOperationnelParticipantService';

const EspaceConsultingOperationnelPage: React.FC = () => {
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
        return;
      }
      clearSession();
    };

    void verify();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ participantId, password });
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
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accès Participant (Service 2)</div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">Service 2 — Espace de mission professionnelle</h1>
          </div>

          <div className="mt-6">
            <h2 className="text-base font-semibold text-slate-900">Texte d’introduction</h2>
            <div className="mt-3 space-y-3 text-slate-700">
              <p>Cet espace est strictement réservé aux participants engagés dans une mission opérationnelle encadrée.</p>
              <p>L’accès est personnel et sécurisé.</p>
              <p>Il permet le suivi des décisions, des expérimentations et des sessions avec l’expert.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Champs de connexion</h3>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                  {error}
                </div>
              )}

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="participantId" className="block text-sm font-medium text-slate-700">
                    Identifiant participant
                  </label>
                  <div className="mt-1 text-xs text-slate-500">(fourni par l’organisation)</div>
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
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {loading ? 'Connexion...' : '👉 Accéder à mon espace'}
              </button>
            </div>

            <div className="text-center text-xs text-slate-500">
              <p>Aucun contenu pédagogique ou de formation n’est accessible depuis cet espace.</p>
              <p className="mt-1">L’accès est conditionné à la validation préalable du participant.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EspaceConsultingOperationnelPage;
