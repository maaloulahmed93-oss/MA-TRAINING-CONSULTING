import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getSession, me } from '../services/consultingOperationnelParticipantService';
import {
  analyzePlanTask,
  analyzeTask,
  getMyExam,
  getMyPlan,
  submitTask,
  upsertMyPlan,
  Service2ActionPlan,
  Service2AiAnalysis,
  Service2Exam,
} from '../services/service2ParticipantApiService';
import { useI18n } from '../i18n/LanguageProvider';

const Service2MissionPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [exam, setExam] = useState<Service2Exam | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [analysis, setAnalysis] = useState<Service2AiAnalysis | null>(null);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);
  const [isSubmittingMain, setIsSubmittingMain] = useState(false);

  const [plan, setPlan] = useState<Service2ActionPlan | null>(null);
  const [planDraft, setPlanDraft] = useState<{ title: string; dueAt: string }[]>([]);
  const [planStatus, setPlanStatus] = useState<string | null>(null);

  const [taskReportText, setTaskReportText] = useState<Record<string, string>>({});
  const [taskPdf, setTaskPdf] = useState<Record<string, File | null>>({});
  const [taskSubmitting, setTaskSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const verifyAndLoad = async () => {
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
        const myExam = await getMyExam();
        if (!myExam) {
          setExam(null);
          setError(t('no_exam_assigned'));
          return;
        }
        setExam(myExam);

        const existingPlan = await getMyPlan(myExam.id);
        setPlan(existingPlan);
        if (existingPlan?.tasks?.length) {
          setPlanDraft(
            existingPlan.tasks.map((x) => ({
              title: x.title,
              dueAt: x.dueAt ? new Date(x.dueAt).toISOString().slice(0, 16) : '',
            }))
          );
        } else {
          setPlanDraft([]);
        }
      } catch (e: any) {
        setError(String(e?.message || t('error_loading_exam')));
      } finally {
        setLoading(false);
      }
    };

    void verifyAndLoad();
  }, [navigate, t]);

  const constraints = useMemo(() => (exam?.constraints || []).filter(Boolean), [exam]);
  const criteria = useMemo(() => (exam?.successCriteria || []).filter(Boolean), [exam]);

  const countdown = (dueAtIso: string | null) => {
    if (!dueAtIso) return '';
    const due = new Date(dueAtIso).getTime();
    const now = Date.now();
    const diff = due - now;
    if (!Number.isFinite(diff)) return '';
    if (diff <= 0) return '00:00:00';
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    return days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  };

  const addPlanTask = () => {
    setPlanDraft((prev) => [...prev, { title: '', dueAt: '' }]);
  };

  const updatePlanTask = (idx: number, patch: Partial<{ title: string; dueAt: string }>) => {
    setPlanDraft((prev) => prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  };

  const savePlan = async () => {
    if (!exam) return;
    try {
      setPlanStatus(null);
      setLoading(true);
      const tasks = planDraft
        .map((t) => ({ title: String(t.title || '').trim(), dueAt: t.dueAt ? new Date(t.dueAt).toISOString() : null }))
        .filter((t) => t.title);

      const saved = await upsertMyPlan({ examId: exam.id, tasks });
      setPlan(saved);
      setPlanStatus(t('plan_saved'));
    } catch (e: any) {
      setError(String(e?.message || t('error_generic')));
    } finally {
      setLoading(false);
    }
  };

  const sendTaskForAi = async (taskId: string) => {
    if (!plan) return;
    const reportText = String(taskReportText[taskId] || '').trim();
    const pdf = taskPdf[taskId];
    if (!reportText || !pdf) {
      setError(t('error_generic'));
      return;
    }

    try {
      setError(null);
      setTaskSubmitting((m) => ({ ...m, [taskId]: true }));
      const result = await analyzePlanTask({ planId: plan.id, taskId, reportText, pdf });
      setPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? result.task : t)),
        };
      });
      setTaskReportText((m) => ({ ...m, [taskId]: '' }));
      setTaskPdf((m) => ({ ...m, [taskId]: null }));
    } catch (e: any) {
      setError(String(e?.message || t('error_generic')));
    } finally {
      setTaskSubmitting((m) => ({ ...m, [taskId]: false }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam) return;

    try {
      setIsSubmittingMain(true);
      setError(null);

      const created = await submitTask({ examId: exam.id, taskId: 'main', submissionText });
      setLastSubmissionId(created.submissionId);

      const analyzed = await analyzeTask({
        examId: exam.id,
        taskId: 'main',
        submissionText,
        submissionId: created.submissionId,
      });

      setAnalysis(analyzed.analysis);
      setLastSubmissionId(analyzed.submissionId);
    } catch (err: any) {
      setError(String(err?.message || t('error_generic')));
    } finally {
      setIsSubmittingMain(false);
    }
  };

  const goFinal = () => {
    if (!exam) return;
    navigate(`/service-2/report?examId=${encodeURIComponent(exam.id)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 rounded-2xl bg-white/80 backdrop-blur shadow-sm ring-1 ring-slate-200 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                to="/"
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 ring-1 ring-slate-200 text-center"
              >
                {t('back_home')}
              </Link>
              <button
                type="button"
                onClick={() => navigate('/service-2/finish')}
                className="w-full sm:w-auto rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                {t('finish_slots')}
              </button>
            </div>

            <div className="text-center flex-1">
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">{t('service2_mission_title')}</h1>
            </div>

            <div className="flex justify-center sm:justify-end">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="w-full sm:w-auto rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Language"
              >
                <option value="fr">{t('lang_fr')}</option>
                <option value="en">{t('lang_en')}</option>
                <option value="ar">{t('lang_ar')}</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
        )}

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 sm:p-10 space-y-8">
          {loading && (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">{t('loading')}</div>
          )}

          {exam && (
            <>
              <div>
                <div className="text-sm font-semibold text-slate-600">{t('scenario')}</div>
                <div className="mt-2 whitespace-pre-wrap text-slate-800">{exam.scenarioBrief}</div>
              </div>

              {constraints.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-600">{t('constraints')}</div>
                  <ul className="mt-2 list-disc pl-5 text-slate-800">
                    {constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {criteria.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-600">{t('success_criteria')}</div>
                  <ul className="mt-2 list-disc pl-5 text-slate-800">
                    {criteria.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('your_answer')}</label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    rows={8}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                    disabled={isSubmittingMain}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={goFinal}
                    disabled={!exam}
                    className="w-full sm:w-auto rounded-xl bg-white px-5 py-3 text-slate-900 font-semibold ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {t('final_report')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || isSubmittingMain}
                    className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {t('send_analyze')}
                  </button>
                </div>

                {isSubmittingMain && (
                  <div className="text-xs text-slate-500">{t('loading')}</div>
                )}

                {lastSubmissionId && (
                  <div className="text-xs text-slate-500">{t('submission', { id: lastSubmissionId })}</div>
                )}
              </form>

              {analysis && (
                <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-slate-700">{t('ai_feedback')}</div>
                    <div className="text-sm font-bold text-slate-900">{t('score', { score: String(analysis.score) })}</div>
                  </div>

                  {analysis.summary && <div className="mt-3 text-sm text-slate-800">{analysis.summary}</div>}

                  {Array.isArray(analysis.warnings) && analysis.warnings.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-semibold text-rose-900">{t('warnings')}</div>
                      <ul className="mt-2 list-disc pl-5 text-sm text-rose-900">
                        {analysis.warnings.map((w: any, idx: number) => (
                          <li key={idx}>{String(w?.reason || w || '')}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(analysis.tips) && analysis.tips.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-semibold text-blue-900">{t('tips')}</div>
                      <ul className="mt-2 list-disc pl-5 text-sm text-blue-900">
                        {analysis.tips.map((t: any, idx: number) => (
                          <li key={idx}>{String(t || '')}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(analysis.constraintViolations) && analysis.constraintViolations.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-semibold text-slate-900">{t('constraint_violations')}</div>
                      <ul className="mt-2 list-disc pl-5 text-sm text-slate-800">
                        {analysis.constraintViolations.map((v: any, idx: number) => (
                          <li key={idx}>{String(v?.constraint || '')}: {String(v?.reason || '')}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6 space-y-4">
                <div>
                  <div className="text-lg font-bold text-slate-900">{t('plan_title')}</div>
                  <div className="mt-1 text-sm text-slate-600">{t('plan_help')}</div>
                </div>

                {planStatus && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">{planStatus}</div>}

                <div className="space-y-3">
                  {planDraft.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">{t('task_title')}</label>
                        <input
                          value={row.title}
                          onChange={(e) => updatePlanTask(idx, { title: e.target.value })}
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder={t('task_title')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700">{t('due_at')}</label>
                        <input
                          type="datetime-local"
                          value={row.dueAt}
                          onChange={(e) => updatePlanTask(idx, { dueAt: e.target.value })}
                          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={addPlanTask}
                    className="w-full sm:w-auto rounded-xl bg-white px-5 py-3 text-slate-900 font-semibold ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    {t('add_task')}
                  </button>
                  <button
                    type="button"
                    onClick={savePlan}
                    disabled={!exam || loading}
                    className="w-full sm:w-auto rounded-xl bg-slate-900 px-6 py-3 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {t('save_plan')}
                  </button>
                </div>

                {plan && plan.tasks.length > 0 && (
                  <div className="pt-2 space-y-4">
                    {plan.tasks.map((task) => (
                      <div key={task.id} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="font-semibold text-slate-900">{task.title}</div>
                          <div className="text-sm text-slate-700">
                            {task.status === 'done' ? (
                              <span className="font-semibold text-emerald-700">{t('task_done')}</span>
                            ) : task.dueAt ? (
                              <span>
                                <span className="font-semibold">{t('time_left')}:</span> {countdown(task.dueAt)}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700">{t('report_text')}</label>
                            <textarea
                              value={taskReportText[task.id] || ''}
                              onChange={(e) => setTaskReportText((m) => ({ ...m, [task.id]: e.target.value }))}
                              rows={4}
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700">{t('select_pdf')}</label>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => setTaskPdf((m) => ({ ...m, [task.id]: e.target.files?.[0] || null }))}
                              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => sendTaskForAi(task.id)}
                            disabled={Boolean(taskSubmitting[task.id])}
                            className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                          >
                            {t('send_for_ai')}
                          </button>
                        </div>

                        {task.aiFeedback && (
                          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                            <div className="flex items-center justify-between gap-4">
                              <div className="text-sm font-semibold text-slate-700">{t('ai_feedback')}</div>
                              <div className="text-sm font-bold text-slate-900">{t('score', { score: String(task.aiFeedback.score) })}</div>
                            </div>
                            {task.aiFeedback.summary && <div className="mt-3 text-sm text-slate-800">{task.aiFeedback.summary}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Service2MissionPage;
