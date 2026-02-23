import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';
import DiagnosticResult from '../components/DiagnosticResult';

type PublicResult = {
  submittedAt: string;
  selectedDomain: string;
  total: number;
  orientation: string;
  implicitStatus: string;
};

type PublicSubscription = {
  active: boolean;
  subscriptionStatus: string;
  implicitStatus: string;
  selectedDomain: string;
  total: number;
  orientation: string;
};

const DiagnosticResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return String(params.get('email') || '').trim().toLowerCase();
  }, [location.search]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PublicResult | null>(null);
  const [subInfo, setSubInfo] = useState<PublicSubscription | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        setResult(null);
        setSubInfo(null);

        if (!email) {
          setError('Email requis');
          return;
        }

        const r = await fetch(buildApiUrl(`diagnostic-sessions/public-result?email=${encodeURIComponent(email)}`));
        if (!r.ok) {
          const text = await r.text();
          throw new Error(text || `HTTP ${r.status}`);
        }

        const json = await r.json();
        const data = json?.data as PublicResult;
        setResult(data);

        // Also fetch subscription status (decides CTA)
        try {
          const s = await fetch(buildApiUrl(`diagnostic-sessions/public-subscription?email=${encodeURIComponent(email)}`));
          if (s.ok) {
            const js = await s.json();
            setSubInfo(js?.data as PublicSubscription);
          }
        } catch {
          // ignore optional failure
        }
      } catch (e: any) {
        console.error('❌ Error loading diagnostic result:', e);
        setError('Impossible de charger la page résultat.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
            {error || 'Résultat introuvable'}
          </div>
          <button
            onClick={() => navigate('/diagnostic')}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const pendingMessage =
    result.implicitStatus === 'en_attente'
      ? 'Vous avez déjà un diagnostic en attente. Merci de patienter.'
      : result.implicitStatus === 'annule'
        ? 'Votre dernier diagnostic est annulé. Merci de contacter notre équipe.'
        : undefined;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(15,23,42,0.06),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(99,102,241,0.08),transparent_50%)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_26px_80px_-58px_rgba(15,23,42,0.35)] ring-1 ring-black/5 overflow-hidden">
          <div className="px-6 sm:px-10 py-7 border-b border-slate-200/70 bg-gradient-to-b from-white/90 to-white/60">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Professional Diagnostic</h1>
            <p className="mt-2 text-sm text-slate-600">Résultat de votre diagnostic</p>
          </div>

          <div className="px-6 sm:px-10 py-8 space-y-6">
            <DiagnosticResult totalScore={Number(result.total || 0)} orientation={String(result.orientation || '')} pendingMessage={pendingMessage} />

            <button
              type="button"
              onClick={() => {
                if (subInfo?.active) {
                  navigate(`/service-1?email=${encodeURIComponent(email)}`);
                } else {
                  navigate('/ecosysteme');
                }
              }}
              className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
            >
              {subInfo?.active ? 'Accéder au Service 1' : "S’inscrire au diagnostic stratégique"}
            </button>

            <button
              type="button"
              onClick={() => navigate('/diagnostic')}
              className="w-full rounded-2xl border border-slate-200 bg-white/85 px-6 py-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticResultPage;
