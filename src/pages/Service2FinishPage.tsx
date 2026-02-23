import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getSession, me } from '../services/consultingOperationnelParticipantService';
import { getFinishSlots, Service2FinishSlot } from '../services/service2ParticipantApiService';

const Service2FinishPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Service2FinishSlot[]>([]);

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

      try {
        setLoading(true);
        setError(null);
        const list = await getFinishSlots();
        setSlots(list);
      } catch (e: any) {
        setError(String(e?.message || 'Erreur'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [navigate]);

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
              <div className="text-sm font-semibold text-slate-600">Finish</div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">Créneaux disponibles</h1>
              <div className="mt-1 text-xs text-slate-500">(Affichage فقط — Admin يحدّدهم)</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
        )}

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 sm:p-10">
          {loading ? (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">Chargement...</div>
          ) : slots.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">Aucun créneau.</div>
          ) : (
            <div className="space-y-3">
              {slots.map((s) => (
                <div key={s._id} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-sm font-semibold text-slate-900">{s.title || 'Créneau'}</div>
                  <div className="mt-1 text-sm text-slate-700">
                    {s.startAt ? new Date(s.startAt).toLocaleString() : '-'}
                    {s.endAt ? ` → ${new Date(s.endAt).toLocaleString()}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Service2FinishPage;
