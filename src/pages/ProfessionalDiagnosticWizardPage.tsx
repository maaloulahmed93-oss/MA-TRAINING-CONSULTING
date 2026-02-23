import React, { useEffect, useMemo, useState } from 'react';
import { buildApiUrl } from '../config/api';

type Step = 'domain' | 'questions' | 'result';

type DiagnosticQuestionOption = {
  label: string;
};

type DiagnosticQuestion = {
  _id: string;
  text: string;
  category: string;
  options: DiagnosticQuestionOption[];
  isActive: boolean;
  order: number;
};

type SelectedAnswer = {
  questionId: string;
  questionText: string;
  category: string;
  selectedOptionIndex: number;
  selectedLabel: string;
};

type EligibilityReason = 'new' | 'termine' | 'en_attente' | 'annule' | 'suspendu';
type EligibilityBlockedBy = 'none' | 'email' | 'ip';

const ProfessionalDiagnosticWizardPage: React.FC = () => {
  const [step, setStep] = useState<Step>('domain');

  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedOk, setSubmittedOk] = useState(false);

  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [serverOrientation, setServerOrientation] = useState<string>('');

  const [eligibilityChecking, setEligibilityChecking] = useState(false);
  const [eligibilityError, setEligibilityError] = useState('');
  const [eligibilityBlockedBy, setEligibilityBlockedBy] = useState<EligibilityBlockedBy>('none');
  const [eligibilityReason, setEligibilityReason] = useState<EligibilityReason>('new');

  const currentQuestion = questions[index];

  const selectedAnswers = useMemo<SelectedAnswer[]>(() => {
    return questions
      .filter((q) => typeof answersByQuestionId[q._id] === 'number')
      .map((q) => ({
        questionId: q._id,
        questionText: q.text,
        category: q.category,
        selectedOptionIndex: Number(answersByQuestionId[q._id]),
        selectedLabel: q.options?.[Number(answersByQuestionId[q._id])] ? q.options[Number(answersByQuestionId[q._id])].label : '',
      }));
  }, [answersByQuestionId, questions]);

  const progressPct = useMemo(() => {
    if (questions.length <= 0) return 0;
    return Math.round(((index + 1) / questions.length) * 100);
  }, [index, questions.length]);

  const answeredCount = useMemo(() => {
    return Object.keys(answersByQuestionId).length;
  }, [answersByQuestionId]);

  const currentSelectedIndex = currentQuestion ? answersByQuestionId[currentQuestion._id] : undefined;

  const canGoNext = Boolean(currentQuestion && typeof currentSelectedIndex === 'number');

  const identityOk = useMemo(() => {
    return Boolean(fullName.trim() && email.trim() && whatsapp.trim());
  }, [email, fullName, whatsapp]);

  const checkEligibility = async (): Promise<{ allowNew: boolean; reason: EligibilityReason; blockedBy: EligibilityBlockedBy }> => {
    const e = String(email || '').trim().toLowerCase();
    const r = await fetch(buildApiUrl(`diagnostic-sessions/eligibility?email=${encodeURIComponent(e)}`));
    if (!r.ok) {
      const text = await r.text();
      throw new Error(text || `HTTP ${r.status}`);
    }
    const json = await r.json();
    const allowNew = Boolean(json?.data?.allowNew);
    const reason = String(json?.data?.reason || 'new') as EligibilityReason;
    const blockedBy = String(json?.data?.blockedBy || 'none') as EligibilityBlockedBy;
    return { allowNew, reason, blockedBy };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [domainsRes, questionsRes] = await Promise.all([
        fetch(buildApiUrl('diagnostic-domains')),
        fetch(buildApiUrl('diagnostic-questions?activeOnly=true')),
      ]);

      if (!domainsRes.ok) throw new Error(`Domains HTTP ${domainsRes.status}`);
      if (!questionsRes.ok) throw new Error(`Questions HTTP ${questionsRes.status}`);

      const domainsJson = await domainsRes.json();
      const questionsJson = await questionsRes.json();

      const d = Array.isArray(domainsJson?.data) ? domainsJson.data.map((x: any) => String(x)) : [];
      const q = Array.isArray(questionsJson?.data) ? (questionsJson.data as DiagnosticQuestion[]) : [];

      setDomains(d);
      setQuestions(q);
      setIndex(0);
      setAnswersByQuestionId({});
      setSelectedDomain('');
      setFullName('');
      setEmail('');
      setWhatsapp('');
      setStep('domain');
      setSubmittedOk(false);
      setSubmitError('');
      setServerTotal(null);
      setServerOrientation('');
    } catch (e) {
      console.error('❌ Error loading diagnostic data:', e);
      setError('Erreur lors du chargement du diagnostic.');
    } finally {
      setLoading(false);
    }
  };

  const startFromDomain = async () => {
    if (!selectedDomain) return;
    if (!identityOk) return;
    if (!questions.length) return;

    try {
      setEligibilityChecking(true);
      setEligibilityError('');

      setEligibilityBlockedBy('none');
      setEligibilityReason('new');

      const { allowNew, reason, blockedBy } = await checkEligibility();
      setEligibilityBlockedBy(blockedBy);
      setEligibilityReason(reason);

      if (!allowNew) {
        if (reason === 'suspendu') {
          setEligibilityError('Accès bloqué (Suspendu).');
          return;
        }
        if (reason === 'en_attente') {
          setEligibilityError('Vous avez déjà un diagnostic en attente. Merci de patienter.');
          return;
        }
        if (reason === 'annule') {
          setEligibilityError('Votre dernier diagnostic est annulé. Merci de contacter notre équipe.');
          return;
        }

        setEligibilityError('Vous ne pouvez pas démarrer un nouveau diagnostic pour le moment.');
        return;
      }

      // Allowed: start a fresh run
      setIndex(0);
      setAnswersByQuestionId({});
      setSubmittedOk(false);
      setSubmitError('');
      setServerTotal(null);
      setServerOrientation('');
      setStep('questions');
    } catch (e) {
      console.error('❌ Eligibility check failed:', e);
      setEligibilityError('Vérification impossible. Réessayez.');
    } finally {
      setEligibilityChecking(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectOption = (optIndex: number) => {
    if (!currentQuestion) return;
    setAnswersByQuestionId((prev) => ({ ...prev, [currentQuestion._id]: optIndex }));
  };

  const goNext = () => {
    if (step === 'domain') {
      if (!selectedDomain) return;
      if (!identityOk) return;
      if (!questions.length) return;

      // Always start a fresh run when leaving the first step
      setIndex(0);
      setAnswersByQuestionId({});
      setSubmittedOk(false);
      setSubmitError('');
      setServerTotal(null);
      setServerOrientation('');
      setStep('questions');
      return;
    }

    if (step === 'questions') {
      if (!canGoNext) return;
      if (index < questions.length - 1) {
        setIndex((v) => v + 1);
        return;
      }
      setStep('result');
    }
  };

  const goBack = () => {
    if (step === 'questions') {
      if (index > 0) {
        setIndex((v) => v - 1);
        return;
      }
      setStep('domain');
      return;
    }
    if (step === 'result') {
      setStep('questions');
    }
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      setSubmitError('');

      const payload = {
        participant: {
          fullName: fullName.trim(),
          firstName: fullName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          situation: '',
        },
        responses: {
          answers: selectedAnswers.map((a) => ({
            questionId: a.questionId,
            selectedOptionIndex: a.selectedOptionIndex,
            selectedLabel: a.selectedLabel,
          })),
        },
        scores: {
          perBlock: {},
        },
        metadata: {
          source: 'web',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          selectedDomain,
        },
      };

      const r = await fetch(buildApiUrl('diagnostic-sessions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const text = await r.text();
        throw new Error(text || `HTTP ${r.status}`);
      }

      const json = await r.json();
      const total = Number(json?.data?.scores?.total);
      const orientation = String(json?.data?.scores?.orientation || '');
      setServerTotal(Number.isFinite(total) ? total : 0);
      setServerOrientation(orientation);

      setSubmittedOk(true);
    } catch (e) {
      console.error('❌ Error submitting diagnostic session:', e);
      setSubmitError('Soumission impossible pour le moment.');
      setSubmittedOk(false);
      setServerTotal(null);
      setServerOrientation('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">{error}</div>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(15,23,42,0.06),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(99,102,241,0.08),transparent_50%)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_26px_80px_-58px_rgba(15,23,42,0.35)] ring-1 ring-black/5 overflow-hidden">
          <div className="px-6 sm:px-10 py-7 border-b border-slate-200/70 bg-gradient-to-b from-white/90 to-white/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                  <span>MA-TRAINING-CONSULTING</span>
                </div>
                <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Professional Diagnostic</h1>
                <p className="mt-2 text-sm text-slate-600">Choisissez un domaine (statistiques) puis répondez aux questions.</p>
              </div>

              <div className="sm:min-w-[280px]">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>Progress</span>
                  <span>
                    {step === 'domain' && '1 / 3'}
                    {step === 'questions' && '2 / 3'}
                    {step === 'result' && '3 / 3'}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden ring-1 ring-inset ring-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{
                      width:
                        step === 'domain' ? '33%' : step === 'questions' ? '66%' : '100%',
                    }}
                  />
                </div>

                {step === 'questions' && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <span>Questions</span>
                      <span>
                        {index + 1} / {questions.length}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden ring-1 ring-inset ring-slate-200">
                      <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600">Answered: {answeredCount}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-10 py-8 space-y-6">
            {step === 'domain' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)]">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-slate-900">Full name</label>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900">Email</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                        placeholder="name@email.com"
                        type="email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900">WhatsApp</label>
                      <input
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                        placeholder="+216 ..."
                        type="tel"
                      />
                    </div>
                  </div>

                  <label className="mt-5 block text-sm font-semibold text-slate-900">Select your domain</label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                  >
                    <option value="">Choose...</option>
                    {domains.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 text-xs text-slate-600">
                    Domain selection is for statistics only. The questions remain generic.
                  </div>
                </div>

                {eligibilityError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                    <div className="space-y-3">
                      <div>{eligibilityError}</div>
                      {(eligibilityBlockedBy === 'email' && (eligibilityReason === 'en_attente' || eligibilityReason === 'annule')) && (
                        <button
                          type="button"
                          onClick={() => window.location.assign(`/diagnostic-result?email=${encodeURIComponent(String(email || '').trim().toLowerCase())}`)}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          Voir résultat
                          <span aria-hidden>→</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!questions.length && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                    No questions found. Please add questions from the admin panel.
                  </div>
                )}
              </div>
            )}

            {step === 'questions' && currentQuestion && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Question {index + 1}</div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">{currentQuestion.text}</h2>
                  <div className="mt-2 text-xs text-slate-600">Category: {currentQuestion.category}</div>
                </div>

                <div className="space-y-2">
                  {(currentQuestion.options || []).map((opt, i) => {
                    const active =
                      typeof currentSelectedIndex === 'number' && Number(currentSelectedIndex) === Number(i);

                    return (
                      <button
                        key={`${i}-${opt.label}`}
                        type="button"
                        onClick={() => selectOption(i)}
                        className={`w-full rounded-2xl border px-5 py-4 text-left text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 ${
                          active
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white/85 text-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="truncate">{opt.label}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 'result' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">Result</h2>

                <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 text-sm text-slate-700 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-2">
                  <div>
                    <span className="font-semibold text-slate-900">Domain:</span> {selectedDomain || '—'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Total:</span>{' '}
                    {submittedOk ? (serverTotal ?? 0) : '—'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Level:</span>{' '}
                    {submittedOk ? (serverOrientation || '—') : '—'}
                  </div>
                </div>

                {submitError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">{submitError}</div>
                )}

                {submittedOk && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                    Session saved successfully.
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)]">
                  <div className="text-sm font-semibold text-slate-900">Your answers</div>
                  <div className="mt-3 space-y-3">
                    {selectedAnswers.map((a) => (
                      <div key={a.questionId} className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
                        <div className="text-xs font-semibold text-slate-600">{a.category}</div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">{a.questionText}</div>
                        <div className="mt-2 text-sm text-slate-700">{a.selectedLabel}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 sm:px-10 py-6 border-t border-slate-200/70 bg-white/70">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              {(step === 'questions' || step === 'result') && (
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  Back
                </button>
              )}

              {step !== 'result' && (
                <button
                  type="button"
                  onClick={step === 'domain' ? startFromDomain : goNext}
                  disabled={(step === 'domain' && (!selectedDomain || !identityOk || eligibilityChecking)) || (step === 'questions' && !canGoNext) || !questions.length}
                  className={`w-full sm:w-auto rounded-xl px-5 py-3 text-sm font-semibold text-white ${
                    (step === 'domain' && (!selectedDomain || !identityOk || eligibilityChecking)) || (step === 'questions' && !canGoNext) || !questions.length
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200'
                  }`}
                >
                  {step === 'domain'
                    ? eligibilityChecking
                      ? 'Checking...'
                      : 'Start'
                    : index === questions.length - 1
                      ? 'See results'
                      : 'Next'}
                </button>
              )}

              {step === 'result' && (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting || submittedOk}
                  className={`w-full sm:w-auto rounded-xl px-5 py-3 text-sm font-semibold text-white ${
                    submitting || submittedOk
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200'
                  }`}
                >
                  {submittedOk ? 'Saved' : submitting ? 'Saving...' : 'Save result'}
                </button>
              )}

              {step === 'result' && (
                <button
                  type="button"
                  onClick={loadData}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  Restart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDiagnosticWizardPage;
