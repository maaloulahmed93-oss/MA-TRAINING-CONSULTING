import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  answersStorageKeyForParticipant,
  clearSession,
  getAnswers,
  getSession,
  me,
} from '../services/consultingOperationnelParticipantService';

type Answers = {
  page2_q1: string;
  page2_q2: string;
  page2_q3: string;
  objectifChoisi: string;
  pourquoiObjectif: string;
  hypothese: string;
  executionQuoi: string;
  executionPeriode: string;
  resultatAttendu: string;
  resultatReel: string;
  difference: string;
  syntheseAppris: string;
  syntheseDecision: string;
  syntheseAvenir: string;
};

const emptyAnswers: Answers = {
  page2_q1: '',
  page2_q2: '',
  page2_q3: '',
  objectifChoisi: '',
  pourquoiObjectif: '',
  hypothese: '',
  executionQuoi: '',
  executionPeriode: '',
  resultatAttendu: '',
  resultatReel: '',
  difference: '',
  syntheseAppris: '',
  syntheseDecision: '',
  syntheseAvenir: '',
};

const ConsultingOperationnelRecapPage: React.FC = () => {
  const navigate = useNavigate();

  const [participantId, setParticipantId] = useState<string>('');
  const [participantToken, setParticipantToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState<Answers>(emptyAnswers);

  useEffect(() => {
    const verify = async () => {
      const session = getSession();
      if (!session?.token) {
        navigate('/espace-consulting-operationnel');
        return;
      }

      const ok = await me(session.token);
      if (!ok) {
        clearSession();
        navigate('/espace-consulting-operationnel');
        return;
      }

      setParticipantId(ok.participantId);
      setParticipantToken(session.token);
    };

    void verify();
  }, [navigate]);

  useEffect(() => {
    try {
      const key = participantId ? answersStorageKeyForParticipant(participantId) : 'consultingOperationnelAnswers_v1';
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Answers>;
      setAnswers((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore
    }
  }, [participantId]);

  useEffect(() => {
    const loadRemote = async () => {
      if (!participantToken) return;
      setLoading(true);
      const remote = await getAnswers(participantToken);
      if (remote) {
        setAnswers((prev) => {
          const next = { ...prev, ...(remote as Partial<Answers>) };
          try {
            const key = participantId ? answersStorageKeyForParticipant(participantId) : 'consultingOperationnelAnswers_v1';
            localStorage.setItem(key, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
      }
      setLoading(false);
    };

    void loadRemote();
  }, [participantToken, participantId]);

  const items = useMemo(
    () => [
      {
        section: 'Compréhension de la situation (Page 2)',
        q: '1️⃣ Comment reformulez-vous la demande de la direction avec vos propres mots ?',
        a: answers.page2_q1,
      },
      {
        section: 'Compréhension de la situation (Page 2)',
        q: '2️⃣ Quels sont, selon vous, les objectifs possibles dans ce contexte ?',
        a: answers.page2_q2,
      },
      {
        section: 'Compréhension de la situation (Page 2)',
        q: '3️⃣ Qu’est-ce qui pourrait être considéré comme une amélioration de la situation ?',
        a: answers.page2_q3,
      },
      {
        section: 'Décision (Page 3)',
        q: '🎯 Objectif choisi :',
        a: answers.objectifChoisi,
      },
      {
        section: 'Décision (Page 3)',
        q: '🤔 Pourquoi avoir choisi cet objectif en priorité ?',
        a: answers.pourquoiObjectif,
      },
      {
        section: 'Décision (Page 3)',
        q: '🔮 Hypothèse de travail :',
        a: answers.hypothese,
      },
      {
        section: 'Action / Exécution (Page 4)',
        q: 'Qu’avez-vous mis en œuvre concrètement ?',
        a: answers.executionQuoi,
      },
      {
        section: 'Action / Exécution (Page 4)',
        q: 'Sur quelle période ?',
        a: answers.executionPeriode,
      },
      {
        section: 'Résultat (Page 5)',
        q: '1️⃣ Qu’attendiez-vous comme résultat ?',
        a: answers.resultatAttendu,
      },
      {
        section: 'Résultat (Page 5)',
        q: '2️⃣ Qu’est-il réellement arrivé ?',
        a: answers.resultatReel,
      },
      {
        section: 'Résultat (Page 5)',
        q: '3️⃣ Quelle différence observez-vous entre l’attendu et le réel ?',
        a: answers.difference,
      },
      {
        section: 'Synthèse (Page 6)',
        q: 'Qu’avez-vous appris sur votre manière de raisonner dans cette situation ?',
        a: answers.syntheseAppris,
      },
      {
        section: 'Synthèse (Page 6)',
        q: 'Quelle décision ne prendriez-vous plus de la même façon ?',
        a: answers.syntheseDecision,
      },
      {
        section: 'Synthèse (Page 6)',
        q: 'Comment aborderiez-vous une situation similaire à l’avenir ?',
        a: answers.syntheseAvenir,
      },
    ],
    [answers]
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 rounded-2xl bg-white/80 backdrop-blur shadow-sm ring-1 ring-slate-200 p-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-slate-600">Récapitulatif — Service 2</div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">Consulting Opérationnel</h1>
            <div className="mt-2 text-xs text-slate-500">Toutes vos réponses (dans l’ordre)</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 sm:p-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Questions & réponses</h2>
            <div className="text-sm text-slate-600">Vous pouvez télécharger ce récapitulatif en PDF via l’impression.</div>
          </div>

          {loading && (
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">
              Chargement...
            </div>
          )}

          <div className="mt-6 space-y-4">
            {items.map((item, idx) => (
              <div key={`${item.section}-${idx}`} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-500">{item.section}</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{item.q}</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{item.a?.trim() ? item.a : '—'}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigate('/espace-consulting-operationnel/templates')}
              className="w-full sm:w-auto rounded-xl bg-white px-5 py-3 text-slate-900 font-semibold ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Retour
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
            >
              Télécharger PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultingOperationnelRecapPage;
