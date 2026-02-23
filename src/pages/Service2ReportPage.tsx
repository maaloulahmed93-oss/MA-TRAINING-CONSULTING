import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getSession, me } from '../services/consultingOperationnelParticipantService';
import { generateFinalVerdict, getFinalReport, Service2FinalReport } from '../services/service2ParticipantApiService';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Service2ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const q = useQuery();
  const examId = String(q.get('examId') || '').trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Service2FinalReport | null>(null);

  useEffect(() => {
    const load = async () => {
      const session = getSession();
      if (!session?.token) {
        navigate('/service-2');
        return;
      }

      const ok = await me(session.token);
      if (!ok) {
        clearSession();
        navigate('/service-2');
        return;
      }

      if (!examId) {
        setError('examId manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const existing = await getFinalReport(examId);
        if (existing) {
          setReport(existing);
          return;
        }

        const created = await generateFinalVerdict({ examId });
        setReport(created);
      } catch (e: any) {
        setError(String(e?.message || 'Erreur'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [examId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 rounded-2xl bg-white/80 backdrop-blur shadow-sm ring-1 ring-slate-200 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex justify-start">
              <Link
                to="/service-2/mission"
                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 ring-1 ring-slate-200"
              >
                Retour
              </Link>
            </div>

            <div className="text-center flex-1">
              <div className="text-sm font-semibold text-slate-600">Rapport — Service 2</div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">Évaluation finale</h1>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
        )}

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 sm:p-10">
          {loading && (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">Chargement...</div>
          )}

          {!loading && report && (
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-600">Statut</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{report.status}</div>
                {report.message && <div className="mt-2 text-sm text-slate-800">{report.message}</div>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="text-sm font-semibold text-slate-600">Score global</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">{report.globalScore}/100</div>
                </div>
                <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="text-sm font-semibold text-slate-600">Violations contraintes</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">{report.constraintViolationsCount}</div>
                </div>
              </div>

              {Array.isArray(report.strengths) && report.strengths.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-900">Points forts</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-800">
                    {report.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(report.weaknesses) && report.weaknesses.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-900">Points faibles</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-800">
                    {report.weaknesses.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(report.recommendations) && report.recommendations.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-900">Recommandations</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-800">
                    {report.recommendations.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.reportText && (
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-sm font-semibold text-slate-900">Résumé</div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{report.reportText}</pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/service-2/finish')}
                  className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
                >
                  Finish (Slots)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Service2ReportPage;
