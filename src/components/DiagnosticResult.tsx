import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  totalScore: number;
  orientation?: string;
  pendingMessage?: string;
};

const DiagnosticResult: React.FC<Props> = ({ totalScore, orientation, pendingMessage }) => {
  const navigate = useNavigate();

  const level = useMemo(() => {
    if (Number.isFinite(totalScore) && totalScore < 20) return 'Beginner';
    if (Number.isFinite(totalScore) && totalScore < 40) return 'Intermediate';
    return 'Expert';
  }, [totalScore]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Result</h2>

      {pendingMessage && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {pendingMessage}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 text-sm text-slate-700 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-2">
        <div>
          <span className="font-semibold text-slate-900">Total:</span> {Number.isFinite(totalScore) ? totalScore : 0}
        </div>
        <div>
          <span className="font-semibold text-slate-900">Level:</span> {orientation ? orientation : level}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/ecosysteme')}
        className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
      >
        Procéder à l’inscription au diagnostic stratégique
      </button>
    </div>
  );
};

export default DiagnosticResult;
