import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type PublicSubscription = {
  active: boolean;
  subscriptionStatus: string;
  implicitStatus: string;
  selectedDomain: string;
  total: number;
  orientation: string;
};

type Phase0Profile = {
  fullName: string;
  currentRole: string;
  experience: number;
  skills: string[];
  summary: string;
};

type Phase0QuestionOption = {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
};

type Phase0Question = {
  id: string;
  question: string;
  options: Phase0QuestionOption[];
};

type Phase0InterviewStatus = 'ready' | 'in_progress' | 'completed';

type PhaseKey = 0 | 1 | 2 | 3 | 4 | 5 | 'final';

type FinalChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type FinalDocs = {
  markdown?: string;
  cvMarkdown?: string;
  motivationLetterMarkdown?: string;
  recommendationsMarkdown?: string;
  generatedAt?: string;
};

type AuditReportMeta = {
  url?: string;
  fileName?: string;
  uploadedAt?: string;
};

type DirectSessionAppointment = {
  scheduledAt?: string;
  notes?: string;
};

type Phase0State = {
  cv?: {
    fileName?: string;
    mimeType?: string;
    uploadedAt?: string;
  };

  profile?: Phase0Profile;
  initialObservation?: string;
  cadrageNote?: string;
  cadrageNoteGeneratedAt?: string;
  interview?: {
    status?: Phase0InterviewStatus;
    questionCount?: number;
    currentQuestion?: Phase0Question | null;
    completedAt?: string | null;
    history?: any[];
  };
  completed?: boolean;
};

type RenderPhase5Params = {
  phase5: Phase5State | null;
  phase5Error: string;
  phase5Loading: boolean;
  aggregatePhase5: (force?: boolean) => Promise<void> | void;
  fetchPhase5State: () => Promise<void> | void;
  phase5ShowRawAgg: boolean;
  setPhase5ShowRawAgg: (v: boolean) => void;
  phase5SelfDescription: string;
  setPhase5SelfDescription: (v: string) => void;
  submitPhase5SelfAwareness: () => Promise<void> | void;
  generatePhase5FinalActions: () => Promise<void> | void;
  selectPhase5FinalAction: (actionId: string) => Promise<void> | void;
  phase5GrandBusy: boolean;
  startPhase5GrandSimulation: () => Promise<void> | void;
  phase5GrandAnswerText: string;
  setPhase5GrandAnswerText: (v: string) => void;
  submitPhase5GrandAnswer: () => Promise<void> | void;
  phase5ExportBusy: boolean;
  phase5ExportMarkdown: string;
  phase5ExportShowAnnexes: boolean;
  setPhase5ExportShowAnnexes: (v: boolean) => void;
  fetchPhase5ExportMarkdown: () => Promise<string> | string;
  downloadPhase5ExportMd: () => Promise<void> | void;
  phase5ExportPdfBusy: boolean;
  downloadPhase5ExportPdf: () => Promise<void> | void;
  setPhase5ExportEl: (el: HTMLDivElement | null) => void;
};

const renderPhase5 = ({
  phase5,
  phase5Error,
  phase5Loading,
  aggregatePhase5,
  fetchPhase5State,
  phase5ShowRawAgg,
  setPhase5ShowRawAgg,
  phase5SelfDescription,
  setPhase5SelfDescription,
  submitPhase5SelfAwareness,
  generatePhase5FinalActions,
  selectPhase5FinalAction,
  phase5GrandBusy,
  startPhase5GrandSimulation,
  phase5GrandAnswerText,
  setPhase5GrandAnswerText,
  submitPhase5GrandAnswer,
  phase5ExportBusy,
  phase5ExportMarkdown,
  phase5ExportShowAnnexes,
  setPhase5ExportShowAnnexes,
  fetchPhase5ExportMarkdown,
  downloadPhase5ExportMd,
  phase5ExportPdfBusy,
  downloadPhase5ExportPdf,
  setPhase5ExportEl,
}: RenderPhase5Params) => {
    const status = String(phase5?.status || '').trim();
    const agg = (phase5?.aggregatedProfile || {}) as Phase5AggregatedProfile;
    const selfAwareness = (phase5?.selfAwareness || null) as Phase5SelfAwareness | null;
    const journeyText = String(phase5?.journeyRecap?.text || '').trim();
    const actions = (Array.isArray(phase5?.finalActions) ? phase5?.finalActions : []) as Phase5FinalAction[];
    const selectedAction = (phase5?.selectedFinalAction || null) as Phase5FinalAction | null;
    const skillGap = (phase5?.skillGap || null) as Phase5SkillGap | null;
    const scenario = String(phase5?.grandScenario || '').trim();
    const evaluation = (phase5?.evaluation || null) as Phase5Evaluation | null;
    const handover = (phase5?.handover || null) as Phase5Handover | null;

    const hasAgg = Boolean(phase5?.aggregatedProfile && typeof phase5.aggregatedProfile === 'object');
    const hasSelf = Boolean(selfAwareness && String(selfAwareness?.selfDescription || '').trim());
    const hasActions = actions.length === 3;
    const hasSelectedAction = Boolean(selectedAction && String(selectedAction.id || '').trim());
    const hasScenario = Boolean(scenario);
    const hasEvaluation = Boolean(evaluation && (Number.isFinite(Number(evaluation?.score)) || String(evaluation?.verdict || '').trim()));
    const hasHandover = Boolean(handover && (String(handover?.userMarkdown || '').trim() || String(handover?.expertFR || '').trim()));

    const exportPreviewMarkdown = (() => {
      const md = String(phase5ExportMarkdown || '').trim();
      if (!md) return '';
      if (phase5ExportShowAnnexes) return md;

      const start = md.indexOf('## Résumé expert (FR)');
      if (start === -1) return md;
      const afterStart = md.slice(start);
      const end = afterStart.indexOf('\n---\n');
      return (end === -1 ? afterStart : afterStart.slice(0, end)).trim();
    })();

    const readinessText =
      status === 'completed'
        ? 'Phase 5 terminée.'
        : status === 'awaiting_grand_answer'
        ? 'Entretien prêt : saisissez votre réponse.'
        : status === 'awaiting_grand_simulation'
        ? 'Scénario sélectionné. Prêt pour la simulation.'
        : status === 'awaiting_action_choice'
        ? 'Choisissez un scénario final.'
        : status === 'awaiting_self_description'
        ? 'Saisissez votre auto-description pour validation.'
        : '—';

    return (
      <div dir="rtl" className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Phase 5 — Entretien de validation final</h2>
            <p className="mt-1 text-sm text-slate-600">Validation finale + simulation d’entretien exigeante + handover pour l’expert</p>
          </div>
          <div className="text-xs text-slate-500">{readinessText}</div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          Avertissement : le ton de cette phase est volontairement exigeant et direct. Objectif : évaluer votre capacité en conditions réelles.
        </div>

        {phase5Error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{phase5Error}</div>
        ) : null}

        {phase5Loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Préparation de la phase 5…</div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={phase5Loading}
            onClick={() => aggregatePhase5(true)}
            className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Reconstruire l’agrégation
          </button>
          <button
            type="button"
            disabled={phase5Loading}
            onClick={fetchPhase5State}
            className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
          >
            Actualiser
          </button>
        </div>

        {!hasAgg ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
            Aucun instantané d’agrégation disponible pour le moment. Cliquez sur « Reconstruire l’agrégation » ou attendez la génération automatique.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Aggregated Profile</div>
                <div className="mt-1 text-xs text-slate-500">Synthèse issue des phases 0–4</div>
              </div>
              <div className="text-xs text-slate-500">{String(phase5?.snapshotGeneratedAt || '').trim() || ''}</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Rôle déclaré</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{String((agg as any)?.declaredRole || '').trim() || '—'}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Rôle réel</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{String((agg as any)?.realRole || '').trim() || '—'}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Niveau de maturité</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{String((agg as any)?.maturityLevel || '').trim() || '—'}</div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm font-semibold text-emerald-900">Points forts</div>
                <div className="mt-2 text-sm text-emerald-900/90">
                  {Array.isArray((agg as any)?.strengths) && (agg as any)?.strengths?.length
                    ? (agg as any).strengths.slice(0, 10).map((x: any, i: number) => <div key={i}>- {String(x || '').trim()}</div>)
                    : '—'}
                </div>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="text-sm font-semibold text-rose-900">Points faibles</div>
                <div className="mt-2 text-sm text-rose-900/90">
                  {Array.isArray((agg as any)?.weaknesses) && (agg as any)?.weaknesses?.length
                    ? (agg as any).weaknesses.slice(0, 10).map((x: any, i: number) => <div key={i}>- {String(x || '').trim()}</div>)
                    : '—'}
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-sm font-semibold text-amber-900">Exclusions</div>
                <div className="mt-2 text-sm text-amber-900/90">
                  {Array.isArray((agg as any)?.exclusions) && (agg as any)?.exclusions?.length
                    ? (agg as any).exclusions.slice(0, 10).map((x: any, i: number) => <div key={i}>- {String(x || '').trim()}</div>)
                    : '—'}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setPhase5ShowRawAgg(!phase5ShowRawAgg)}
                className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
              >
                {phase5ShowRawAgg ? 'Masquer les détails (JSON)' : 'Afficher les détails (JSON)'}
              </button>
            </div>

            {phase5ShowRawAgg ? (
              <div dir="ltr" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 overflow-auto text-xs">
                <pre>{JSON.stringify(agg || {}, null, 2)}</pre>
              </div>
            ) : null}

            {journeyText ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 leading-relaxed">{journeyText}</div>
            ) : null}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">1) Self-awareness check</div>
            <div className="mt-1 text-xs text-slate-500">Décrivez-vous tel que vous vous percevez professionnellement (avec précision).</div>
          </div>

          <textarea
            value={phase5SelfDescription}
            onChange={(e) => setPhase5SelfDescription(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200"
            placeholder="Exemple : Je suis Senior sur … et je pilote …"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={phase5Loading || !hasAgg}
              onClick={submitPhase5SelfAwareness}
              className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              Envoyer
            </button>
            <button
              type="button"
              disabled={phase5Loading}
              onClick={fetchPhase5State}
              className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
            >
              Actualiser
            </button>
          </div>

          {hasSelf ? (
            <div className={`rounded-2xl border p-4 text-sm ${selfAwareness?.match ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
              <div className="font-semibold">Résultat : {selfAwareness?.match ? 'Cohérent' : 'Non cohérent'}</div>
              <div className="mt-2 leading-relaxed">{String(selfAwareness?.reason || '').trim() || '—'}</div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">2) Final Actions</div>
              <div className="mt-1 text-xs text-slate-500">Choisissez un seul scénario final. Aucun choix « facile ».</div>
            </div>
            <button
              type="button"
              disabled={phase5Loading || !hasAgg}
              onClick={generatePhase5FinalActions}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
            >
              {hasActions ? 'Régénérer' : 'Générer'}
            </button>
          </div>

          {!hasActions ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">Les scénarios n’ont pas encore été générés.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {actions.map((a) => {
                const isSelected = String(selectedAction?.id || '') === String(a.id || '');
                return (
                  <div key={a.id} className={`rounded-2xl border p-4 space-y-3 ${isSelected ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">{a.title}</div>
                      <div className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold">{String(a.pressure || 'medium')}</div>
                    </div>
                    <div className="text-sm text-slate-700 leading-relaxed">{a.description}</div>
                    <button
                      type="button"
                      disabled={phase5Loading}
                      onClick={() => selectPhase5FinalAction(a.id)}
                      className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60 ${isSelected ? 'bg-emerald-700 text-white hover:bg-emerald-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      {isSelected ? 'Sélectionné' : 'Choisir ce scénario'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hasSelectedAction ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="text-sm font-semibold text-slate-900">3) Skill Gap</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Compétence critique</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{String(skillGap?.skillName || '').trim() || '—'}</div>
                <div className="mt-2 text-sm text-slate-700 leading-relaxed">{String(skillGap?.gapDescription || '').trim() || '—'}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Niveau</div>
                <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                  <div><span className="font-semibold">Current:</span> {String(skillGap?.currentLevel || '').trim() || '—'}</div>
                  <div className="mt-1"><span className="font-semibold">Required:</span> {String(skillGap?.requiredLevel || '').trim() || '—'}</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Micro-actions</div>
              <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                {Array.isArray(skillGap?.microActions) && skillGap?.microActions?.length
                  ? skillGap.microActions.slice(0, 8).map((x, i) => <div key={i}>- {x}</div>)
                  : '—'}
              </div>
            </div>
          </div>
        ) : null}

        {hasSelectedAction ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">4) The Grand Simulation</div>
                <div className="mt-1 text-xs text-slate-500">Une question, une réponse. Pas à pas.</div>
              </div>
              <button
                type="button"
                disabled={phase5GrandBusy || phase5Loading}
                onClick={startPhase5GrandSimulation}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {hasScenario ? 'Actualiser le scénario' : 'Démarrer la simulation'}
              </button>
            </div>

            {hasScenario ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">{scenario}</div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Cliquez sur « Démarrer la simulation » pour générer le scénario.</div>
            )}

            {hasScenario ? (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Votre réponse (plan étape par étape)</label>
                <textarea
                  value={phase5GrandAnswerText}
                  onChange={(e) => setPhase5GrandAnswerText(e.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200"
                  placeholder="1) ...\n2) ...\n3) ..."
                />
              </div>
            ) : null}

            {hasScenario ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={phase5GrandBusy}
                  onClick={submitPhase5GrandAnswer}
                  className="w-full sm:w-auto rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {phase5GrandBusy ? 'Évaluation en cours…' : 'Envoyer la réponse pour évaluation'}
                </button>
                <button
                  type="button"
                  disabled={phase5Loading}
                  onClick={fetchPhase5State}
                  className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                >
                  Actualiser
                </button>
              </div>
            ) : null}

            {hasEvaluation ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">Résultat final</div>
                  <div className="rounded-full bg-slate-900 text-white px-4 py-1 text-xs font-semibold">Score: {Number(evaluation?.score || 0)}</div>
                </div>
                <div className="text-sm text-slate-700 leading-relaxed">{String(evaluation?.verdict || '').trim() || '—'}</div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="text-sm font-semibold text-emerald-900">Points positifs</div>
                    <div className="mt-2 text-sm text-emerald-900/90">
                      {Array.isArray(evaluation?.good) && evaluation.good.length ? evaluation.good.slice(0, 8).map((x, i) => <div key={i}>- {x}</div>) : '—'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <div className="text-sm font-semibold text-rose-900">Points à améliorer</div>
                    <div className="mt-2 text-sm text-rose-900/90">
                      {Array.isArray(evaluation?.bad) && evaluation.bad.length ? evaluation.bad.slice(0, 8).map((x, i) => <div key={i}>- {x}</div>) : '—'}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-semibold text-amber-900">Actions finales (directes)</div>
                  <div className="mt-2 text-sm text-amber-900/90">
                    {Array.isArray(evaluation?.finalAdvice) && evaluation.finalAdvice.length
                      ? evaluation.finalAdvice.slice(0, 10).map((x, i) => <div key={i}>- {x}</div>)
                      : '—'}
                  </div>
                </div>
              </div>
            ) : null}

            {hasHandover ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="text-sm font-semibold text-slate-900">5) Handover</div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs text-slate-500">Report (AR)</div>
                    <div dir="rtl" className="prose prose-slate max-w-none">
                      <ReactMarkdown>{String(handover?.userMarkdown || '').trim() || '—'}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs text-slate-500">Résumé (FR)</div>
                    <div dir="ltr" className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{String(handover?.expertFR || '').trim() || '—'}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Export global — dossier complet</div>
              <div className="mt-1 text-xs text-slate-500">Un export unique regroupant les phases 0–5</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={phase5ExportBusy}
                onClick={downloadPhase5ExportMd}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                {phase5ExportBusy ? 'Préparation…' : 'Télécharger (MD)'}
              </button>
              <button
                type="button"
                disabled={phase5ExportPdfBusy || !phase5ExportMarkdown}
                onClick={downloadPhase5ExportPdf}
                className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {phase5ExportPdfBusy ? 'Préparation du PDF…' : 'Télécharger (PDF)'}
              </button>
            </div>
          </div>

          {!phase5ExportMarkdown ? (
            <button
              type="button"
              disabled={phase5ExportBusy}
              onClick={fetchPhase5ExportMarkdown}
              className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
            >
              {phase5ExportBusy ? 'Génération de l’export…' : 'Aperçu de l’export'}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">{phase5ExportShowAnnexes ? 'Résumé + annexes' : 'Résumé uniquement (sans annexes)'}</div>
                <button
                  type="button"
                  onClick={() => setPhase5ExportShowAnnexes(!phase5ExportShowAnnexes)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                >
                  {phase5ExportShowAnnexes ? 'Masquer les annexes' : 'Afficher les annexes'}
                </button>
              </div>

              <div ref={setPhase5ExportEl} dir="ltr" className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-4 overflow-auto max-h-[520px]">
                <ReactMarkdown>{exportPreviewMarkdown}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

type Phase1IncoherenceLevel = 'low' | 'high';

type Phase1Analysis = {
  claimedRole?: string;
  realRole?: string;
  rationale?: string;
  verdict?: string;
  consistency?: string[];
  incoherence?: string[];
  incoherenceLevel?: Phase1IncoherenceLevel;
  probeQuestion?: string;
};

type Phase1Status = 'idle' | 'awaiting_probe' | 'completed';

type Phase1State = {
  status?: Phase1Status;
  startedAt?: string;
  analysis?: Phase1Analysis;
  probe?: {
    question?: string;
    answer?: string;
    answeredAt?: string | null;
  } | null;
  reportMarkdown?: string;
  reportGeneratedAt?: string | null;
  completed?: boolean;
  completedAt?: string | null;
};

type Phase2ScenarioType = 'crisis' | 'teamwork' | 'execution' | '';

type Phase2ScenarioOption = {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
};

type Phase2Scenario = {
  id: string;
  type: Phase2ScenarioType;
  title?: string;
  question: string;
  options: Phase2ScenarioOption[];
};

type Phase2Answer = {
  scenarioId: string;
  type?: Phase2ScenarioType;
  selectedKey: 'A' | 'B' | 'C' | 'D';
  answeredAt?: string;
};

type Phase2Status = 'idle' | 'in_progress' | 'completed';

type Phase2State = {
  status?: Phase2Status;
  startedAt?: string;
  scenarios?: Phase2Scenario[];
  answers?: Phase2Answer[];
  reportMarkdown?: string;
  reportGeneratedAt?: string | null;
  completed?: boolean;
  completedAt?: string | null;
};

type Phase3PathType = 'skills' | 'experience' | 'mentoring' | '';

type Phase3Path = {
  id: string;
  type: Phase3PathType;
  title: string;
  description: string;
  successProbability: number;
  rationale?: string;
};

type Phase3State = {
  status?: 'in_progress' | 'completed';
  startedAt?: string;
  paths?: Phase3Path[];
  selectedGrowthPath?: Phase3Path | null;
  selectedAt?: string | null;
  completed?: boolean;
  completedAt?: string | null;
};

type Phase4ChecklistItem = {
  id: string;
  text: string;
  done?: boolean;
};

type Phase4Month = {
  month: number;
  title?: string;
  checklist: Phase4ChecklistItem[];
};

type Phase4State = {
  status?: 'in_progress' | 'completed';
  startedAt?: string;
  selectedGrowthPath?: Phase3Path | null;
  notePositionnementMarkdown?: string;
  planningMarkdown?: string;
  roadmap?: { months?: Phase4Month[] };
  reportGeneratedAt?: string;
  completed?: boolean;
  completedAt?: string;
};

type Phase5Status =
  | 'awaiting_self_description'
  | 'awaiting_action_choice'
  | 'awaiting_grand_simulation'
  | 'awaiting_grand_answer'
  | 'completed'
  | '';

type Phase5AggregatedProfile = {
  declaredRole?: string;
  realRole?: string;
  maturityLevel?: string;
  weaknesses?: string[];
  strengths?: string[];
  exclusions?: string[];
  selectedPath?: { id?: string; type?: string; title?: string } | null;
  roadmap?: any;
};

type Phase5SelfAwareness = {
  selfDescription?: string;
  match?: boolean;
  reason?: string;
  expertNoteFR?: string;
  at?: string;
};

type Phase5FinalActionPressure = 'low' | 'medium' | 'high';

type Phase5FinalAction = {
  id: string;
  title: string;
  description: string;
  pressure?: Phase5FinalActionPressure;
  selectedAt?: string;
};

type Phase5SkillGap = {
  skillName?: string;
  currentLevel?: string;
  requiredLevel?: string;
  gapDescription?: string;
  microActions?: string[];
  expertNoteFR?: string;
  at?: string;
};

type Phase5Evaluation = {
  score?: number;
  verdict?: string;
  good?: string[];
  bad?: string[];
  finalAdvice?: string[];
  evaluatedAt?: string;
};

type Phase5Handover = {
  userMarkdown?: string;
  expertFR?: string;
  generatedAt?: string;
};

type Phase5State = {
  status?: Phase5Status;
  startedAt?: string;
  snapshotGeneratedAt?: string;
  aggregatedProfile?: Phase5AggregatedProfile;
  selfAwareness?: Phase5SelfAwareness | null;
  journeyRecap?: { text?: string } | null;
  finalActions?: Phase5FinalAction[];
  selectedFinalAction?: Phase5FinalAction | null;
  skillGap?: Phase5SkillGap | null;
  grandScenario?: string | null;
  grandAnswer?: string | null;
  evaluation?: Phase5Evaluation | null;
  handover?: Phase5Handover | null;
  completed?: boolean;
  completedAt?: string | null;
};

const Service1DashboardGate: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return String(params.get('email') || '').trim().toLowerCase();
  }, [location.search]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subInfo, setSubInfo] = useState<PublicSubscription | null>(null);

  const [phase0Loading, setPhase0Loading] = useState(false);
  const [phase0Error, setPhase0Error] = useState('');
  const [phase0, setPhase0] = useState<Phase0State | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [interviewBusy, setInterviewBusy] = useState(false);
  const [selectedKey, setSelectedKey] = useState<'A' | 'B' | 'C' | 'D' | ''>('');
  const [doneMessage, setDoneMessage] = useState('');
  const [phase, setPhase] = useState<PhaseKey>(0);
  const [cadragePollCount, setCadragePollCount] = useState(0);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [noteEl, setNoteEl] = useState<HTMLDivElement | null>(null);

  const [phase1Loading, setPhase1Loading] = useState(false);
  const [phase1Error, setPhase1Error] = useState('');
  const [phase1, setPhase1] = useState<Phase1State | null>(null);
  const [phase1AutoComputeDone, setPhase1AutoComputeDone] = useState(false);
  const [probeAnswer, setProbeAnswer] = useState('');
  const [phase1PdfBusy, setPhase1PdfBusy] = useState(false);
  const [phase1El, setPhase1El] = useState<HTMLDivElement | null>(null);

  const [phase2Loading, setPhase2Loading] = useState(false);
  const [phase2Error, setPhase2Error] = useState('');
  const [phase2, setPhase2] = useState<Phase2State | null>(null);
  const [phase2AutoGenerateDone, setPhase2AutoGenerateDone] = useState(false);
  const [phase2SelectedKey, setPhase2SelectedKey] = useState<'A' | 'B' | 'C' | 'D' | ''>('');
  const [phase2PdfBusy, setPhase2PdfBusy] = useState(false);
  const [phase2El, setPhase2El] = useState<HTMLDivElement | null>(null);

  const [phase3Loading, setPhase3Loading] = useState(false);
  const [phase3Error, setPhase3Error] = useState('');
  const [phase3, setPhase3] = useState<Phase3State | null>(null);
  const [phase3AutoGenerateDone, setPhase3AutoGenerateDone] = useState(false);

  const [phase4Loading, setPhase4Loading] = useState(false);
  const [phase4Error, setPhase4Error] = useState('');
  const [phase4, setPhase4] = useState<Phase4State | null>(null);
  const [phase4AutoGenerateDone, setPhase4AutoGenerateDone] = useState(false);
  const [phase4PdfBusy, setPhase4PdfBusy] = useState(false);
  const [phase4NoteEl, setPhase4NoteEl] = useState<HTMLDivElement | null>(null);
  const [phase4PlanningEl, setPhase4PlanningEl] = useState<HTMLDivElement | null>(null);

  const [phase5Loading, setPhase5Loading] = useState(false);
  const [phase5Error, setPhase5Error] = useState('');
  const [phase5, setPhase5] = useState<Phase5State | null>(null);
  const [phase5AutoAggregateDone, setPhase5AutoAggregateDone] = useState(false);
  const [phase5ShowRawAgg, setPhase5ShowRawAgg] = useState(false);
  const [phase5SelfDescription, setPhase5SelfDescription] = useState('');
  const [phase5GrandAnswerText, setPhase5GrandAnswerText] = useState('');
  const [phase5GrandBusy, setPhase5GrandBusy] = useState(false);

  const [phase5ExportBusy, setPhase5ExportBusy] = useState(false);
  const [phase5ExportMarkdown, setPhase5ExportMarkdown] = useState('');
  const [phase5ExportShowAnnexes, setPhase5ExportShowAnnexes] = useState(false);
  const [phase5ExportEl, setPhase5ExportEl] = useState<HTMLDivElement | null>(null);
  const [phase5ExportPdfBusy, setPhase5ExportPdfBusy] = useState(false);

  const [finalChatMessages, setFinalChatMessages] = useState<FinalChatMessage[]>([]);
  const [finalChatInput, setFinalChatInput] = useState('');
  const [finalChatBusy, setFinalChatBusy] = useState(false);
  const [finalChatError, setFinalChatError] = useState('');
  const finalChatMessagesRef = useRef<FinalChatMessage[]>([]);

  const [finalDocs, setFinalDocs] = useState<FinalDocs | null>(null);
  const [finalDocsBusy, setFinalDocsBusy] = useState(false);
  const [finalDocsError, setFinalDocsError] = useState('');

  const [auditReport, setAuditReport] = useState<AuditReportMeta | null>(null);
  const [auditReportBusy, setAuditReportBusy] = useState(false);
  const [auditReportError, setAuditReportError] = useState('');

  const [appointment, setAppointment] = useState<DirectSessionAppointment | null>(null);
  const [appointmentBusy, setAppointmentBusy] = useState(false);
  const [appointmentError, setAppointmentError] = useState('');

  useEffect(() => {
    finalChatMessagesRef.current = finalChatMessages;
  }, [finalChatMessages]);

  const sendFinalChat = useCallback(async () => {
    const msg = finalChatInput.trim();
    if (!msg) return;

    setFinalChatBusy(true);
    setFinalChatError('');
    setFinalChatInput('');
    setFinalChatMessages((prev) => [...prev, { role: 'user', content: msg }]);

    try {
      const history = finalChatMessagesRef.current.slice(-10);

      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/final/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          message: msg,
          history,
        }),
      });

      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setFinalChatError(String(json?.message || 'Impossible d’envoyer le message.'));
        return;
      }

      const reply = String(json?.data?.reply || '').trim();
      if (reply) {
        setFinalChatMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (e: any) {
      setFinalChatError('Impossible de contacter le serveur.');
    } finally {
      setFinalChatBusy(false);
    }
  }, [email, finalChatInput]);

  const generateFinalDocs = useCallback(
    async (force?: boolean) => {
      setFinalDocsBusy(true);
      setFinalDocsError('');
      try {
        const r = await fetch(buildApiUrl('diagnostic-sessions/service1/final/docs/generate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, force: Boolean(force) }),
        });

        const json = await r.json().catch(() => null);
        if (!r.ok) {
          setFinalDocsError(String(json?.message || 'Impossible de générer les documents.'));
          return;
        }

        setFinalDocs((json?.data?.docs || null) as FinalDocs | null);
      } catch (e: any) {
        setFinalDocsError('Impossible de contacter le serveur.');
      } finally {
        setFinalDocsBusy(false);
      }
    },
    [email],
  );

  const fetchAuditReport = useCallback(async () => {
    setAuditReportBusy(true);
    setAuditReportError('');
    try {
      const r = await fetch(
        buildApiUrl(`diagnostic-sessions/service1/audit-report?email=${encodeURIComponent(email)}`),
        { method: 'GET' }
      );
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setAuditReportError(String(json?.message || 'Impossible de récupérer le rapport.'));
        setAuditReport(null);
        return;
      }
      setAuditReport((json?.data || null) as AuditReportMeta | null);
    } catch (e: any) {
      setAuditReportError('Impossible de contacter le serveur.');
      setAuditReport(null);
    } finally {
      setAuditReportBusy(false);
    }
  }, [email]);

  const openAuditReport = useCallback(async () => {
    if (!auditReport?.url) {
      await fetchAuditReport();
      return;
    }
    window.open(auditReport.url, '_blank', 'noopener,noreferrer');
  }, [auditReport?.url, fetchAuditReport]);

  const fetchAppointment = useCallback(async () => {
    setAppointmentBusy(true);
    setAppointmentError('');
    try {
      const r = await fetch(
        buildApiUrl(`diagnostic-sessions/service1/appointment?email=${encodeURIComponent(email)}`),
        { method: 'GET' }
      );
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setAppointmentError(String(json?.message || 'Impossible de récupérer le rendez-vous.'));
        setAppointment(null);
        return;
      }
      setAppointment((json?.data || null) as DirectSessionAppointment | null);
    } catch (e: any) {
      setAppointmentError('Impossible de contacter le serveur.');
      setAppointment(null);
    } finally {
      setAppointmentBusy(false);
    }
  }, [email]);

  const onDropCv = useCallback((acceptedFiles: File[]) => {
    setCvFile(acceptedFiles?.[0] || null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCv,
    multiple: false,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        setSubInfo(null);

        if (!email) {
          setError('Email requis');
          return;
        }

        const r = await fetch(buildApiUrl(`diagnostic-sessions/public-subscription?email=${encodeURIComponent(email)}`));
        if (!r.ok) {
          // If forbidden or not found, redirect back to result page (pending)
          navigate(`/diagnostic-result?email=${encodeURIComponent(email)}`);
          return;
        }
        const json = await r.json();
        setSubInfo(json?.data as PublicSubscription);
      } catch (e: any) {
        setError('Connexion indisponible.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [email, navigate]);

  useEffect(() => {
    if (loading) return;
    if (!subInfo) return;
    if (!subInfo.active) {
      navigate(`/diagnostic-result?email=${encodeURIComponent(email)}`);
    }
  }, [loading, subInfo, email, navigate]);

  const fetchPhase0State = useCallback(async () => {
    if (!email) return;
    setPhase0Loading(true);
    setPhase0Error('');
    try {
      const r = await fetch(buildApiUrl(`diagnostic-sessions/service1/phase0/state?email=${encodeURIComponent(email)}`));
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase0Error(String(json?.message || 'Impossible de charger la phase 0.'));
        return;
      }
      setPhase0((json?.data?.phase0 || {}) as Phase0State);
    } catch (e: any) {
      setPhase0Error('Impossible de contacter le serveur.');
    } finally {
      setPhase0Loading(false);
    }
  }, [email]);

  const fetchPhase5State = useCallback(async () => {
    if (!email) return;
    setPhase5Loading(true);
    setPhase5Error('');
    try {
      const r = await fetch(buildApiUrl(`diagnostic-sessions/service1/phase5/state?email=${encodeURIComponent(email)}`));
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase5Error(String(json?.message || 'Impossible de charger la phase 5.'));
        return;
      }
      const p5 = (json?.data?.phase5 || {}) as Phase5State;
      setPhase5(p5);

      const incomingSelf = String(p5?.selfAwareness?.selfDescription || '').trim();
      if (incomingSelf && !String(phase5SelfDescription || '').trim()) setPhase5SelfDescription(incomingSelf);
      const incomingAnswer = String(p5?.grandAnswer || '').trim();
      if (incomingAnswer && !String(phase5GrandAnswerText || '').trim()) setPhase5GrandAnswerText(incomingAnswer);
    } catch (e: any) {
      setPhase5Error('Impossible de contacter le serveur.');
    } finally {
      setPhase5Loading(false);
    }
  }, [email, phase5GrandAnswerText, phase5SelfDescription]);

  const fetchPhase3State = useCallback(async () => {
    if (!email) return;
    setPhase3Loading(true);
    setPhase3Error('');
    try {
      const r = await fetch(buildApiUrl(`diagnostic-sessions/service1/phase3/state?email=${encodeURIComponent(email)}`));
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase3Error(String(json?.message || 'Impossible de charger la phase 3.'));
        return;
      }
      setPhase3((json?.data?.phase3 || {}) as Phase3State);
    } catch (e: any) {
      setPhase3Error('Impossible de contacter le serveur.');
    } finally {
      setPhase3Loading(false);
    }
  }, [email]);

  const fetchPhase4State = useCallback(async () => {
    if (!email) return;
    setPhase4Loading(true);
    setPhase4Error('');
    try {
      const r = await fetch(buildApiUrl(`diagnostic-sessions/service1/phase4/state?email=${encodeURIComponent(email)}`));
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase4Error(String(json?.message || 'Impossible de charger la phase 4.'));
        return;
      }
      setPhase4((json?.data?.phase4 || {}) as Phase4State);
    } catch (e: any) {
      setPhase4Error('Impossible de contacter le serveur.');
    } finally {
      setPhase4Loading(false);
    }
  }, [email]);

  const fetchPhase2State = useCallback(async () => {
    if (!email) return;
    setPhase2Loading(true);
    setPhase2Error('');
    try {
      const r = await fetch(buildApiUrl(`diagnostic-sessions/service1/phase2/state?email=${encodeURIComponent(email)}`));
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase2Error(String(json?.message || 'Impossible de charger la phase 2.'));
        return;
      }
      setPhase2((json?.data?.phase2 || {}) as Phase2State);
    } catch (e: any) {
      setPhase2Error('Impossible de contacter le serveur.');
    } finally {
      setPhase2Loading(false);
    }
  }, [email]);

  const fetchPhase1State = useCallback(async () => {
    if (!email) return;
    setPhase1Loading(true);
    setPhase1Error('');
    try {
      const r = await fetch(buildApiUrl(`diagnostic-sessions/service1/phase1/state?email=${encodeURIComponent(email)}`));
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase1Error(String(json?.message || 'Impossible de charger la phase 1.'));
        return;
      }
      const p1 = (json?.data?.phase1 || {}) as Phase1State;
      setPhase1(p1);
      const incomingAnswer = String(p1?.probe?.answer || '').trim();
      if (incomingAnswer) setProbeAnswer(incomingAnswer);
    } catch (e: any) {
      setPhase1Error('Impossible de contacter le serveur.');
    } finally {
      setPhase1Loading(false);
    }
  }, [email]);

  useEffect(() => {
    if (!subInfo?.active) return;
    if (phase !== 0) return;
    fetchPhase0State();
  }, [phase, subInfo?.active, fetchPhase0State]);

  useEffect(() => {
    if (!subInfo?.active) return;
    if (phase !== 1) return;
    fetchPhase1State();
  }, [phase, subInfo?.active, fetchPhase1State]);

  useEffect(() => {
    if (!subInfo?.active) return;
    if (phase !== 2) return;
    fetchPhase2State();
  }, [phase, subInfo?.active, fetchPhase2State]);

  useEffect(() => {
    if (!subInfo?.active) return;
    if (phase !== 3) return;
    fetchPhase3State();
  }, [phase, subInfo?.active, fetchPhase3State]);

  useEffect(() => {
    if (!subInfo?.active) return;
    if (phase !== 4) return;
    fetchPhase4State();
  }, [phase, subInfo?.active, fetchPhase4State]);

  useEffect(() => {
    if (!subInfo?.active) return;
    if (phase !== 5) return;
    fetchPhase5State();
  }, [phase, subInfo?.active, fetchPhase5State]);

  useEffect(() => {
    if (!subInfo?.active) return;
    if (phase !== 4) return;
    if (phase3?.selectedGrowthPath) return;
    fetchPhase3State();
  }, [phase, subInfo?.active, fetchPhase3State, phase3?.selectedGrowthPath]);

  const computePhase1 = useCallback(async () => {
    if (!email) return;
    setPhase1Loading(true);
    setPhase1Error('');
    try {
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase1/compute'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase1Error(String(json?.message || 'Impossible d’exécuter la phase 1.'));
        return;
      }
      setPhase1((json?.data?.phase1 || {}) as Phase1State);
      const incomingAnswer = String(json?.data?.phase1?.probe?.answer || '').trim();
      if (incomingAnswer) setProbeAnswer(incomingAnswer);
    } catch (e: any) {
      setPhase1Error('Impossible de contacter le serveur pendant l’analyse.');
    } finally {
      setPhase1Loading(false);
    }
  }, [email]);

  useEffect(() => {
    if (phase !== 1) {
      if (phase1AutoComputeDone) setPhase1AutoComputeDone(false);
      return;
    }
    if (phase1Loading) return;
    if (phase1Error) return;
    if (phase1AutoComputeDone) return;

    const hasAnyStatus = Boolean(String(phase1?.status || '').trim());
    const hasReport = Boolean(String(phase1?.reportMarkdown || '').trim());
    if (!hasAnyStatus && !hasReport) {
      setPhase1AutoComputeDone(true);
      computePhase1();
    }
  }, [phase, phase1Loading, phase1Error, phase1AutoComputeDone, phase1?.status, phase1?.reportMarkdown, computePhase1]);

  const generatePhase2 = useCallback(async () => {
    if (!email) return;
    setPhase2Loading(true);
    setPhase2Error('');
    try {
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase2/generate-scenarios'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase2Error(String(json?.message || 'Impossible de générer les scénarios de la phase 2.'));
        return;
      }
      setPhase2((json?.data?.phase2 || {}) as Phase2State);
      setPhase2SelectedKey('');
    } catch (e: any) {
      setPhase2Error('Impossible de contacter le serveur pendant la génération des scénarios.');
    } finally {
      setPhase2Loading(false);
    }
  }, [email]);

  useEffect(() => {
    if (phase !== 2) {
      if (phase2AutoGenerateDone) setPhase2AutoGenerateDone(false);
      return;
    }
    if (phase2Loading) return;
    if (phase2Error) return;
    if (phase2AutoGenerateDone) return;

    const scenarios = Array.isArray(phase2?.scenarios) ? phase2?.scenarios : [];
    const report = String(phase2?.reportMarkdown || '').trim();
    if (scenarios.length !== 3 && !report) {
      setPhase2AutoGenerateDone(true);
      generatePhase2();
    }
  }, [phase, phase2Loading, phase2Error, phase2AutoGenerateDone, phase2?.scenarios, phase2?.reportMarkdown, generatePhase2]);

  const generatePhase3 = useCallback(async () => {
    if (!email) return;
    setPhase3Loading(true);
    setPhase3Error('');
    try {
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase3/generate-paths'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase3Error(String(json?.message || 'Impossible de générer les parcours.'));
        return;
      }
      setPhase3((json?.data?.phase3 || {}) as Phase3State);
    } catch (e: any) {
      setPhase3Error('Impossible de contacter le serveur pendant la génération des parcours.');
    } finally {
      setPhase3Loading(false);
    }
  }, [email]);

  useEffect(() => {
    if (phase !== 3) {
      if (phase3AutoGenerateDone) setPhase3AutoGenerateDone(false);
      return;
    }
    if (phase3Loading) return;
    if (phase3Error) return;
    if (phase3AutoGenerateDone) return;

    const paths = Array.isArray(phase3?.paths) ? phase3.paths : [];
    const selected = phase3?.selectedGrowthPath;
    if (paths.length !== 3 && !selected) {
      setPhase3AutoGenerateDone(true);
      generatePhase3();
    }
  }, [phase, phase3Loading, phase3Error, phase3AutoGenerateDone, phase3?.paths, phase3?.selectedGrowthPath, generatePhase3]);

  const selectPhase3Path = useCallback(async (pathId: string) => {
    if (!email) return;
    if (!pathId) return;
    setPhase3Loading(true);
    setPhase3Error('');
    try {
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase3/select'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pathId }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase3Error(String(json?.message || 'Impossible d’enregistrer le choix du parcours.'));
        return;
      }
      setPhase3((json?.data?.phase3 || {}) as Phase3State);
    } catch (e: any) {
      setPhase3Error('Impossible de contacter le serveur pendant l’enregistrement.');
    } finally {
      setPhase3Loading(false);
    }
  }, [email]);

  const generatePhase4 = useCallback(async () => {
    if (!email) return;
    setPhase4Loading(true);
    setPhase4Error('');
    try {
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase4/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase4Error(String(json?.message || 'Impossible de générer le plan.'));
        return;
      }
      setPhase4((json?.data?.phase4 || {}) as Phase4State);
    } catch (e: any) {
      setPhase4Error('Impossible de contacter le serveur pendant la génération du plan.');
    } finally {
      setPhase4Loading(false);
    }
  }, [email]);

  useEffect(() => {
    if (phase !== 4) {
      if (phase4AutoGenerateDone) setPhase4AutoGenerateDone(false);
      return;
    }
    if (phase4Loading) return;
    if (phase4Error) return;
    if (phase4AutoGenerateDone) return;

    const hasNote = Boolean(String(phase4?.notePositionnementMarkdown || '').trim());
    const hasPlanning = Boolean(String(phase4?.planningMarkdown || '').trim());
    const months = Array.isArray(phase4?.roadmap?.months) ? phase4?.roadmap?.months : [];
    if (!hasNote || !hasPlanning || months.length !== 3) {
      setPhase4AutoGenerateDone(true);
      generatePhase4();
    }
  }, [phase, phase4Loading, phase4Error, phase4AutoGenerateDone, phase4?.notePositionnementMarkdown, phase4?.planningMarkdown, phase4?.roadmap?.months, generatePhase4]);

  const aggregatePhase5 = useCallback(
    async (force?: boolean) => {
      if (!email) return;
      setPhase5Loading(true);
      setPhase5Error('');
      try {
        const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase5/aggregate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, force: Boolean(force) }),
        });
        const json = await r.json().catch(() => null);
        if (!r.ok) {
          setPhase5Error(String(json?.message || "Impossible de générer l’instantané d’agrégation."));
          return;
        }
        setPhase5((json?.data?.phase5 || {}) as Phase5State);
      } catch (e: any) {
        setPhase5Error("Impossible de contacter le serveur pendant la génération de l’instantané d’agrégation.");
      } finally {
        setPhase5Loading(false);
      }
    },
    [email]
  );

  useEffect(() => {
    if (phase !== 5) {
      if (phase5AutoAggregateDone) setPhase5AutoAggregateDone(false);
      return;
    }
    if (phase5Loading) return;
    if (phase5Error) return;
    if (phase5AutoAggregateDone) return;

    const hasAgg = Boolean(phase5?.aggregatedProfile && typeof phase5.aggregatedProfile === 'object');
    const snapshotAt = String(phase5?.snapshotGeneratedAt || '').trim();
    if (!hasAgg || !snapshotAt) {
      setPhase5AutoAggregateDone(true);
      aggregatePhase5(false);
    }
  }, [phase, phase5Loading, phase5Error, phase5AutoAggregateDone, phase5?.aggregatedProfile, phase5?.snapshotGeneratedAt, aggregatePhase5]);

  const submitPhase5SelfAwareness = useCallback(async () => {
    if (!email) return;
    const selfDescription = String(phase5SelfDescription || '').trim();
    if (!selfDescription) {
      setPhase5Error('Veuillez saisir votre description avant l’envoi.');
      return;
    }
    setPhase5Loading(true);
    setPhase5Error('');
    try {
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase5/self-awareness'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, selfDescription }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase5Error(String(json?.message || 'Impossible d’exécuter la vérification de cohérence.'));
        return;
      }
      setPhase5((json?.data?.phase5 || {}) as Phase5State);
    } catch (e: any) {
      setPhase5Error('Impossible de contacter le serveur pendant la vérification de cohérence.');
    } finally {
      setPhase5Loading(false);
    }
  }, [email, phase5SelfDescription]);

  const generatePhase5FinalActions = useCallback(async () => {
    if (!email) return;
    setPhase5Loading(true);
    setPhase5Error('');
    try {
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase5/final-actions/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase5Error(String(json?.message || 'Impossible de générer les actions finales.'));
        return;
      }
      setPhase5((json?.data?.phase5 || {}) as Phase5State);
    } catch (e: any) {
      setPhase5Error('Impossible de contacter le serveur pendant la génération des actions finales.');
    } finally {
      setPhase5Loading(false);
    }
  }, [email]);

  const selectPhase5FinalAction = useCallback(
    async (actionId: string) => {
      if (!email) return;
      if (!actionId) return;
      setPhase5Loading(true);
      setPhase5Error('');
      try {
        const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase5/final-actions/select'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, actionId }),
        });
        const json = await r.json().catch(() => null);
        if (!r.ok) {
          setPhase5Error(String(json?.message || 'Impossible de sélectionner le scénario.'));
          return;
        }
        setPhase5((json?.data?.phase5 || {}) as Phase5State);
      } catch (e: any) {
        setPhase5Error('Impossible de contacter le serveur pendant la sélection du scénario.');
      } finally {
        setPhase5Loading(false);
      }
    },
    [email]
  );

  const startPhase5GrandSimulation = useCallback(async () => {
    if (!email) return;
    if (phase5GrandBusy) return;
    try {
      setPhase5GrandBusy(true);
      setPhase5Error('');
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase5/grand-simulation/start'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase5Error(String(json?.message || 'Impossible de générer le scénario final.'));
        return;
      }
      setPhase5((json?.data?.phase5 || {}) as Phase5State);
    } catch (e: any) {
      setPhase5Error('Impossible de contacter le serveur pendant la génération du scénario final.');
    } finally {
      setPhase5GrandBusy(false);
    }
  }, [email, phase5GrandBusy]);

  const submitPhase5GrandAnswer = useCallback(async () => {
    if (!email) return;
    const answerText = String(phase5GrandAnswerText || '').trim();
    if (!answerText) {
      setPhase5Error('Merci de saisir votre réponse avant l’envoi.');
      return;
    }
    if (phase5GrandBusy) return;
    try {
      setPhase5GrandBusy(true);
      setPhase5Error('');
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase5/grand-simulation/answer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answerText }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase5Error(String(json?.message || 'Impossible d’évaluer la réponse.'));
        return;
      }
      setPhase5((json?.data?.phase5 || {}) as Phase5State);
    } catch (e: any) {
      setPhase5Error('Impossible de contacter le serveur pendant l’évaluation.');
    } finally {
      setPhase5GrandBusy(false);
    }
  }, [email, phase5GrandAnswerText, phase5GrandBusy]);

  const fetchPhase5ExportMarkdown = useCallback(async () => {
    if (!email) return '';
    if (phase5ExportBusy) return String(phase5ExportMarkdown || '').trim();
    try {
      setPhase5ExportBusy(true);
      setPhase5Error('');
      const r = await fetch(buildApiUrl(`diagnostic-sessions/service1/phase5/export?email=${encodeURIComponent(email)}`));
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase5Error(String(json?.message || 'Impossible de générer l’export global.'));
        return '';
      }
      const md = String(json?.data?.markdown || '').trim();
      setPhase5ExportMarkdown(md);
      return md;
    } catch (e: any) {
      setPhase5Error('Impossible de contacter le serveur pendant la génération de l’export global.');
      return '';
    } finally {
      setPhase5ExportBusy(false);
    }
  }, [email, phase5ExportBusy, phase5ExportMarkdown]);

  const downloadPhase5ExportMd = useCallback(async () => {
    if (!email) return;
    let md = String(phase5ExportMarkdown || '').trim();
    if (!md) {
      md = await fetchPhase5ExportMarkdown();
    }
    if (!md) return;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Service1_Export_Phases0-5_${email}_${date}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }, [email, phase5ExportMarkdown, fetchPhase5ExportMarkdown]);

  const downloadPhase5ExportPdf = useCallback(async () => {
    if (phase5ExportPdfBusy) return;
    if (!phase5ExportEl) {
      setPhase5Error('Veuillez d’abord ouvrir l’aperçu de l’export.');
      return;
    }
    const md = String(phase5ExportMarkdown || '').trim();
    if (!md) {
      setPhase5Error('L’export global n’est pas encore disponible.');
      return;
    }
    try {
      setPhase5ExportPdfBusy(true);
      const canvas = await html2canvas(phase5ExportEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 2) {
        pdf.addPage();
        position -= pageHeight;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`Service1_Export_Phases0-5_${email}_${date}.pdf`);
    } finally {
      setPhase5ExportPdfBusy(false);
    }
  }, [phase5ExportPdfBusy, phase5ExportEl, phase5ExportMarkdown, email]);

  useEffect(() => {
    if (phase !== 0) return;
    const isCompleted = Boolean(phase0?.completed || phase0?.interview?.status === 'completed');
    const hasNote = Boolean(String(phase0?.cadrageNote || '').trim());
    if (!isCompleted) {
      if (cadragePollCount !== 0) setCadragePollCount(0);
      return;
    }
    if (hasNote) return;
    if (cadragePollCount >= 5) return;

    const t = window.setTimeout(() => {
      fetchPhase0State();
      setCadragePollCount((n) => n + 1);
    }, 1500);

    return () => window.clearTimeout(t);
  }, [phase, phase0?.completed, phase0?.interview?.status, phase0?.cadrageNote, cadragePollCount, fetchPhase0State]);

  const handleAnalyzeCv = async () => {
    if (!cvFile) {
      setPhase0Error('Veuillez d’abord sélectionner votre fichier CV.');
      return;
    }

    setAnalyzing(true);
    setPhase0Error('');
    setDoneMessage('');
    setSelectedKey('');
    try {
      const fd = new FormData();
      fd.append('email', email);
      fd.append('cv', cvFile);

      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase0/analyze-cv'), {
        method: 'POST',
        body: fd,
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase0Error(String(json?.message || 'Échec de l’analyse du CV.'));
        return;
      }
      setPhase0Error('');
      setPhase0((json?.data?.phase0 || {}) as Phase0State);
    } catch (e: any) {
      setPhase0Error('Impossible de contacter le serveur pendant l’analyse.');
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadCadrageMarkdown = useCallback(() => {
    const note = String(phase0?.cadrageNote || '').trim();
    if (!note) return;
    const blob = new Blob([note], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Note_de_Cadrage_${email}_${date}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }, [phase0?.cadrageNote, email]);

  const downloadCadragePdf = useCallback(async () => {
    if (pdfBusy) return;
    if (!noteEl) return;
    const note = String(phase0?.cadrageNote || '').trim();
    if (!note) return;

    try {
      setPdfBusy(true);

      const canvas = await html2canvas(noteEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 2) {
        pdf.addPage();
        position -= pageHeight;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`Note_de_Cadrage_${email}_${date}.pdf`);
    } finally {
      setPdfBusy(false);
    }
  }, [pdfBusy, noteEl, phase0?.cadrageNote, email]);

  const submitProbeAnswer = useCallback(async () => {
    if (!email) return;
    const a = String(probeAnswer || '').trim();
    if (!a) {
      setPhase1Error('Veuillez saisir une réponse avant l’envoi.');
      return;
    }
    setPhase1Loading(true);
    setPhase1Error('');
    try {
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase1/probe/answer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answer: a }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase1Error(String(json?.message || 'Impossible d’enregistrer votre réponse de confirmation.'));
        return;
      }
      setPhase1((json?.data?.phase1 || {}) as Phase1State);
    } catch (e: any) {
      setPhase1Error('Impossible de contacter le serveur pendant l’envoi de la réponse.');
    } finally {
      setPhase1Loading(false);
    }
  }, [email, probeAnswer]);

  const downloadPhase1Markdown = useCallback(() => {
    const md = String(phase1?.reportMarkdown || '').trim();
    if (!md) return;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Fiche_Logique_Decisionnelle_${email}_${date}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }, [phase1?.reportMarkdown, email]);

  const downloadPhase1Pdf = useCallback(async () => {
    if (phase1PdfBusy) return;
    if (!phase1El) return;
    const md = String(phase1?.reportMarkdown || '').trim();
    if (!md) return;

    try {
      setPhase1PdfBusy(true);

      const canvas = await html2canvas(phase1El, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 2) {
        pdf.addPage();
        position -= pageHeight;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`Fiche_Logique_Decisionnelle_${email}_${date}.pdf`);
    } finally {
      setPhase1PdfBusy(false);
    }
  }, [phase1PdfBusy, phase1El, phase1?.reportMarkdown, email]);

  const downloadPhase2Markdown = useCallback(() => {
    const md = String(phase2?.reportMarkdown || '').trim();
    if (!md) return;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Note_Analyse_Strategique_${email}_${date}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }, [phase2?.reportMarkdown, email]);

  const downloadPhase2Pdf = useCallback(async () => {
    if (phase2PdfBusy) return;
    if (!phase2El) return;
    const md = String(phase2?.reportMarkdown || '').trim();
    if (!md) return;

    try {
      setPhase2PdfBusy(true);

      const canvas = await html2canvas(phase2El, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 2) {
        pdf.addPage();
        position -= pageHeight;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`Note_Analyse_Strategique_${email}_${date}.pdf`);
    } finally {
      setPhase2PdfBusy(false);
    }
  }, [phase2PdfBusy, phase2El, phase2?.reportMarkdown, email]);

  const submitPhase2Answer = useCallback(async (scenarioId: string) => {
    if (!email) return;
    const k = String(phase2SelectedKey || '').trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(k)) {
      setPhase2Error('Veuillez sélectionner une réponse (A/B/C/D) avant l’envoi.');
      return;
    }
    setPhase2Loading(true);
    setPhase2Error('');
    try {
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase2/answer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, scenarioId, selectedKey: k }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase2Error(String(json?.message || 'Impossible d’enregistrer la réponse (phase 2).'));
        return;
      }
      setPhase2((json?.data?.phase2 || {}) as Phase2State);
      setPhase2SelectedKey('');
    } catch (e: any) {
      setPhase2Error('Impossible de contacter le serveur pendant l’envoi de la réponse.');
    } finally {
      setPhase2Loading(false);
    }
  }, [email, phase2SelectedKey]);

  const togglePhase4Checklist = useCallback(
    async (itemId: string, done: boolean) => {
      if (!email) return;
      if (!itemId) return;
      setPhase4Error('');
      try {
        const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase4/checklist/toggle'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, itemId, done }),
        });
        const json = await r.json().catch(() => null);
        if (!r.ok) {
          setPhase4Error(String(json?.message || 'Impossible de mettre à jour la tâche.'));
          return;
        }
        setPhase4((json?.data?.phase4 || {}) as Phase4State);
      } catch (e: any) {
        setPhase4Error('Impossible de contacter le serveur pendant la mise à jour de la tâche.');
      }
    },
    [email]
  );

  const downloadPhase4NoteMd = useCallback(() => {
    const md = String(phase4?.notePositionnementMarkdown || '').trim();
    if (!md) return;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Note_Positionnement_${email}_${date}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }, [phase4?.notePositionnementMarkdown, email]);

  const downloadPhase4PlanningMd = useCallback(() => {
    const md = String(phase4?.planningMarkdown || '').trim();
    if (!md) return;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Document_Planning_${email}_${date}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }, [phase4?.planningMarkdown, email]);

  const downloadPhase4Pdf = useCallback(
    async (which: 'note' | 'planning') => {
      if (phase4PdfBusy) return;
      const el = which === 'note' ? phase4NoteEl : phase4PlanningEl;
      if (!el) return;
      const md = which === 'note' ? String(phase4?.notePositionnementMarkdown || '').trim() : String(phase4?.planningMarkdown || '').trim();
      if (!md) return;

      try {
        setPhase4PdfBusy(true);
        const canvas = await html2canvas(el, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 2) {
          pdf.addPage();
          position -= pageHeight;
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        const date = new Date().toISOString().slice(0, 10);
        const fileName = which === 'note' ? `Note_Positionnement_${email}_${date}.pdf` : `Document_Planning_${email}_${date}.pdf`;
        pdf.save(fileName);
      } finally {
        setPhase4PdfBusy(false);
      }
    },
    [phase4PdfBusy, phase4NoteEl, phase4PlanningEl, phase4?.notePositionnementMarkdown, phase4?.planningMarkdown, email]
  );

  const startInterview = async () => {
    setInterviewBusy(true);
    setPhase0Error('');
    setDoneMessage('');
    setSelectedKey('');
    try {
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase0/interview/start'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, profile: phase0?.profile }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase0Error(String(json?.message || 'Impossible de démarrer l’entretien.'));
        return;
      }
      setPhase0Error('');
      setPhase0((json?.data?.phase0 || phase0 || {}) as Phase0State);
    } catch (e: any) {
      setPhase0Error('Impossible de contacter le serveur pendant le démarrage de l’entretien.');
    } finally {
      setInterviewBusy(false);
    }
  };

  const submitAnswer = async () => {
    const q = phase0?.interview?.currentQuestion;
    if (!q?.id) {
      setPhase0Error('Aucune question active pour le moment.');
      return;
    }
    if (!selectedKey) {
      setPhase0Error('Veuillez sélectionner une réponse.');
      return;
    }

    setInterviewBusy(true);
    setPhase0Error('');
    try {
      const r = await fetch(buildApiUrl('diagnostic-sessions/service1/phase0/interview/answer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, selectedKey, profile: phase0?.profile, currentQuestion: q }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setPhase0Error(String(json?.message || 'Impossible d’enregistrer la réponse.'));
        return;
      }

      if (json?.data?.done) {
        setDoneMessage(String(json?.data?.message || 'La première étape du diagnostic est terminée. Merci.'));
      }
      setPhase0Error('');
      setPhase0((json?.data?.phase0 || phase0 || {}) as Phase0State);
      setSelectedKey('');
    } catch (e: any) {
      setPhase0Error('Impossible de contacter le serveur pendant l’enregistrement de la réponse.');
    } finally {
      setInterviewBusy(false);
    }
  };

  const PhaseTabs = () => (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {([
        0,
        1,
        2,
        3,
        4,
        5,
        ...(phase5?.status === 'completed' || phase5?.completed ? (['final'] as const) : []),
      ] as PhaseKey[]).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setPhase(p)}
          className={`rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold border transition ${
            phase === p
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {p === 'final' ? 'Final' : p === 0 ? 'Phase 0' : `Phase ${p}`}
        </button>
      ))}
    </div>
  );

  const renderFinal = () => {
    return (
      <div dir="rtl" className="space-y-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-2">
          <div className="text-lg font-semibold text-slate-900">Final</div>
          <div className="text-sm text-slate-600">Finalisation : échange cadré + documents professionnels générés par IA.</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)]">
          <div className="text-sm font-semibold text-slate-900">Rappel important</div>
          <div className="mt-1 text-xs text-slate-600">
            Afin de maximiser la valeur du parcours, veuillez appliquer les recommandations et actions proposées tout au long des phases 0 à 5.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Séance en direct (rendez-vous)</div>
              <div className="mt-1 text-xs text-slate-600">Le rendez-vous est défini par l’administration</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fetchAppointment}
                disabled={appointmentBusy}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                {appointmentBusy ? '...' : 'Actualiser'}
              </button>
            </div>
          </div>

          {appointmentError ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{appointmentError}</div>
          ) : null}

          {appointment?.scheduledAt ? (
            <div className="mt-2 text-xs text-slate-700" dir="ltr">
              <div>Date/heure: {appointment.scheduledAt}</div>
              {appointment.notes ? <div className="mt-1">Notes: {appointment.notes}</div> : null}
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-500">Aucun rendez-vous n’a encore été planifié</div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Rapport d'Audit de Positionnement Stratégique</div>
              <div className="mt-1 text-xs text-slate-600">Le rapport est déposé par l’administration (espace expert)</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={openAuditReport}
                disabled={auditReportBusy}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {auditReportBusy ? 'Téléchargement…' : auditReport?.url ? 'Télécharger' : 'Vérifier'}
              </button>
              <button
                type="button"
                onClick={fetchAuditReport}
                disabled={auditReportBusy}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                Actualiser
              </button>
            </div>
          </div>

          {auditReportError ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{auditReportError}</div>
          ) : null}

          {auditReport?.url ? (
            <div className="mt-2 text-xs text-slate-600" dir="ltr">
              {auditReport.fileName ? `File: ${auditReport.fileName}` : auditReport.url}
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-500">Non disponible pour le moment</div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] overflow-hidden">
            <div className="p-4 border-b border-slate-200/70 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">CV + lettre + recommandations</div>
                <div className="text-xs text-slate-600">Basés sur votre ancien CV et les résultats des phases 0 à 5</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => generateFinalDocs(false)}
                  disabled={finalDocsBusy}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {finalDocsBusy ? 'Génération…' : finalDocs ? 'Régénérer' : 'Générer'}
                </button>
                <button
                  type="button"
                  onClick={() => generateFinalDocs(true)}
                  disabled={finalDocsBusy}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                >
                  Force
                </button>
              </div>
            </div>

            {finalDocsError ? (
              <div className="p-4">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{finalDocsError}</div>
              </div>
            ) : null}

            <div className="p-4 space-y-4">
              {finalDocs?.cvMarkdown ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">CV</div>
                  <div dir="ltr" className="mt-3 prose prose-slate max-w-none">
                    <ReactMarkdown components={{ pre: () => null, code: () => null }}>{finalDocs.cvMarkdown}</ReactMarkdown>
                  </div>
                </div>
              ) : null}

              {finalDocs?.motivationLetterMarkdown ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">Lettre de motivation</div>
                  <div dir="ltr" className="mt-3 prose prose-slate max-w-none">
                    <ReactMarkdown components={{ pre: () => null, code: () => null }}>
                      {finalDocs.motivationLetterMarkdown}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : null}

              {finalDocs?.recommendationsMarkdown ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">Recommandations</div>
                  <div className="mt-3 prose prose-slate max-w-none" dir="rtl">
                    <ReactMarkdown components={{ pre: () => null, code: () => null }}>{finalDocs.recommendationsMarkdown}</ReactMarkdown>
                  </div>
                </div>
              ) : null}

              {!finalDocs ? <div className="text-sm text-slate-600">Cliquez sur « Générer » pour préparer vos documents.</div> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/85 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] overflow-hidden">
            <div className="p-4 border-b border-slate-200/70">
              <div className="text-sm font-semibold text-slate-900">Chat encadré</div>
              <div className="mt-1 text-xs text-slate-600">Posez vos questions uniquement sur les phases 0 à 5</div>
            </div>

            {finalChatError ? (
              <div className="p-4">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{finalChatError}</div>
              </div>
            ) : null}

            <div className="max-h-[420px] overflow-auto p-4 space-y-3">
            {finalChatMessages.length === 0 ? (
              <div className="text-sm text-slate-600">Écrivez votre première question…</div>
            ) : null}

            {finalChatMessages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {finalChatBusy ? <div className="text-xs text-slate-500">Réponse en cours de génération…</div> : null}
          </div>

            <div className="border-t border-slate-200/70 p-4">
              <div className="flex gap-2">
                <input
                  value={finalChatInput}
                  onChange={(e) => setFinalChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!finalChatBusy) sendFinalChat();
                    }
                  }}
                  placeholder="Écrivez votre question ici…"
                  disabled={finalChatBusy}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={sendFinalChat}
                  disabled={finalChatBusy || !finalChatInput.trim()}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPhase0 = () => {
    const profile = phase0?.profile;
    const interview = phase0?.interview;
    let status: Phase0InterviewStatus | '' = '';
    if (interview?.status) status = interview.status;
    else if (profile) status = 'ready';

    const currentQ = interview?.currentQuestion as Phase0Question | null | undefined;
    const answeredCount = Number(interview?.questionCount || 0) || 0;

    return (
      <div dir="rtl" className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Phase 0 — Analyse du CV et entretien intelligent</h2>
            <p className="mt-1 text-sm text-slate-600">Onboarding & cadrage (IA)</p>
          </div>
          <div className="text-xs text-slate-500">Service 1</div>
        </div>

        {phase0Error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{phase0Error}</div>
        ) : null}

        {phase0Loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Chargement des données de la phase…</div>
        ) : null}

        {!profile ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-4">
            <div>
              <div className="text-xl font-semibold text-slate-900">Démarrons votre diagnostic</div>
              <div className="mt-1 text-sm text-slate-600">Téléchargez votre CV (PDF ou DOCX) pour lancer l’analyse.</div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">Télécharger votre CV</label>
              <div
                {...getRootProps()}
                className={`rounded-2xl border border-dashed p-5 transition cursor-pointer ${
                  isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-white'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-sm font-semibold text-slate-900">Glissez le fichier ici ou cliquez pour sélectionner</div>
                <div className="mt-1 text-xs text-slate-600">Formats acceptés : PDF / DOCX (max. 10 Mo)</div>
              </div>
              {cvFile ? <div className="text-xs text-slate-600">Fichier sélectionné : {cvFile.name}</div> : null}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={!cvFile || analyzing}
                onClick={handleAnalyzeCv}
                className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed hover:bg-slate-800"
              >
                {analyzing ? 'Analyse en cours…' : 'Analyser'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/diagnostic-result?email=${encodeURIComponent(email)}`)}
                className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Retour
              </button>
            </div>
          </div>
        ) : null}

        {profile && status !== 'in_progress' && status !== 'completed' ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm text-slate-500">Fiche profil</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{profile.fullName || '—'}</div>
                <div className="mt-1 text-sm text-slate-700">{profile.currentRole || '—'}</div>
                <div className="mt-2 text-sm text-slate-600">Années d’expérience : {Number(profile.experience || 0)}</div>

                {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.skills.slice(0, 10).map((s, idx) => (
                      <span key={idx} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}

                {profile.summary ? <div className="mt-4 text-sm text-slate-700 leading-relaxed">{profile.summary}</div> : null}
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="text-sm font-semibold text-emerald-900">Observation initiale du système</div>
                <div className="mt-2 text-sm text-emerald-900 leading-relaxed">
                  {phase0?.initialObservation ||
                    `Analyse préliminaire de votre CV effectuée. Profil identifié : ${profile.currentRole || '—'} avec ${Number(profile.experience || 0)} ans d’expérience.`}
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={interviewBusy}
              onClick={startInterview}
              className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {interviewBusy ? 'Préparation…' : 'Démarrer le diagnostic maintenant'}
            </button>
          </div>
        ) : null}

        {profile && status === 'in_progress' && currentQ ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">Question {answeredCount + 1} sur 5</div>
              <div className="text-xs text-slate-500">Entretien adaptatif</div>
            </div>

            <div className="grid grid-cols-5 gap-2" aria-label="progress">
              {Array.from({ length: 5 }).map((_, i) => {
                const active = i <= answeredCount;
                return (
                  <div
                    key={i}
                    className={`h-2 rounded-full ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  />
                );
              })}
            </div>
            <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">{currentQ.question}</div>

            <div className="grid gap-3 sm:grid-cols-2">
              {currentQ.options.map((opt) => {
                const active = selectedKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelectedKey(opt.key)}
                    className={`text-right rounded-2xl border p-4 transition ${
                      active
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-500">{opt.key}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900 leading-relaxed">{opt.text}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={interviewBusy || !selectedKey}
                onClick={submitAnswer}
                className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {interviewBusy ? 'Envoi…' : 'Envoyer la réponse'}
              </button>
              <button
                type="button"
                disabled={interviewBusy}
                onClick={fetchPhase0State}
                className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                Actualiser
              </button>
            </div>

            {answeredCount >= 4 && interviewBusy ? (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                Analyse en cours et génération de la Note de Cadrage…
              </div>
            ) : null}
          </div>
        ) : null}

        {profile && (status === 'completed' || phase0?.completed) ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 space-y-4">
            <div className="text-lg font-semibold">Phase 0 terminée avec succès</div>
            <div className="text-sm leading-relaxed">{doneMessage || 'Les informations ont été consolidées.'}</div>

            {phase0?.cadrageNote ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-slate-500">Document final</div>
                    <div className="mt-1 text-base font-semibold text-slate-900">Note de Cadrage (FR)</div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={downloadCadrageMarkdown}
                      className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      Télécharger (MD)
                    </button>
                    <button
                      type="button"
                      disabled={pdfBusy}
                      onClick={downloadCadragePdf}
                      className="w-full sm:w-auto rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      {pdfBusy ? 'Préparation du PDF…' : 'Télécharger (PDF)'}
                    </button>
                  </div>
                  {phase0?.cadrageNoteGeneratedAt ? (
                    <div className="text-xs text-slate-500">{new Date(phase0.cadrageNoteGeneratedAt).toLocaleString()}</div>
                  ) : null}
                </div>

                <div ref={setNoteEl} dir="ltr" className="prose prose-slate max-w-none">
                  <ReactMarkdown>{phase0.cadrageNote}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                Analyse en cours et génération de la Note de Cadrage…
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={fetchPhase0State}
                    className="w-full sm:w-auto rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Actualiser le document
                  </button>
                  <div className="text-xs text-indigo-900/80 self-center">
                    {cadragePollCount > 0 ? `Tentative automatique : ${cadragePollCount}/5` : ''}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPhase(1)}
              className="w-full sm:w-auto rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Passer à la phase 1
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  const renderPhase3 = () => {
    const paths = (Array.isArray(phase3?.paths) ? phase3?.paths : []) as Phase3Path[];
    const selected = (phase3?.selectedGrowthPath || null) as Phase3Path | null;

    return (
      <div dir="rtl" className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Phase 3 — Choix du parcours de progression</h2>
            <p className="mt-1 text-sm text-slate-600">3 Growth Paths + Success Probability</p>
          </div>
          <div className="text-xs text-slate-500">Service 1</div>
        </div>

        {phase3Error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{phase3Error}</div>
        ) : null}

        {phase3Loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Préparation des parcours…</div>
        ) : null}

        {selected ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 space-y-3">
            <div className="text-sm">Parcours sélectionné</div>
            <div className="text-lg font-semibold">{selected.title}</div>
            <div className="text-sm text-emerald-900/90">{selected.description}</div>
            <div className="text-sm"><span className="font-semibold">Fit:</span> {selected.successProbability}%</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setPhase(4)}
                className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Passer à la phase 4
              </button>
              <button
                type="button"
                disabled={phase3Loading}
                onClick={fetchPhase3State}
                className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                Actualiser
              </button>
            </div>
          </div>
        ) : null}

        {!selected && paths.length !== 3 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-4">
            <div className="text-sm text-slate-700 leading-relaxed">Les parcours n’ont pas encore été générés. Cliquez pour lancer la génération.</div>
            <button
              type="button"
              disabled={phase3Loading}
              onClick={generatePhase3}
              className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {phase3Loading ? 'Génération…' : 'Générer 3 parcours'}
            </button>
          </div>
        ) : null}

        {!selected && paths.length === 3 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {paths.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">{p.title}</div>
                  <div className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold">{p.successProbability}% Fit</div>
                </div>
                <div className="text-sm text-slate-700 leading-relaxed">{p.description}</div>
                {p.rationale ? <div className="text-xs text-slate-500">{p.rationale}</div> : null}
                <button
                  type="button"
                  disabled={phase3Loading}
                  onClick={() => selectPhase3Path(p.id)}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  Choisir ce parcours
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderPhase4 = () => {
    const selected = (phase3?.selectedGrowthPath || phase4?.selectedGrowthPath || null) as Phase3Path | null;
    const noteMd = String(phase4?.notePositionnementMarkdown || '').trim();
    const planningMd = String(phase4?.planningMarkdown || '').trim();
    const months = (Array.isArray(phase4?.roadmap?.months) ? phase4?.roadmap?.months : []) as Phase4Month[];

    return (
      <div dir="rtl" className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Phase 4 — Structuration & planification</h2>
            <p className="mt-1 text-sm text-slate-600">Feuille de route (3 mois) + documents à télécharger</p>
          </div>
          <div className="text-xs text-slate-500">Service 1</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          📌 Ce plan est ajustable en fonction de l’évolution de votre situation professionnelle.
        </div>

        {!selected ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
            Vous devez d’abord sélectionner un parcours en phase 3.
            <div className="mt-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setPhase(3)}
                  className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Aller à la phase 3
                </button>
                <button
                  type="button"
                  disabled={phase3Loading}
                  onClick={fetchPhase3State}
                  className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                >
                  Actualiser le choix du parcours
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {phase4Error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{phase4Error}</div>
        ) : null}

        {phase4Loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Génération du plan d’exécution…</div>
        ) : null}

        {selected ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-3">
            <div className="text-xs text-slate-500">Parcours sélectionné</div>
            <div className="text-base font-semibold text-slate-900">{selected.title}</div>
            <div className="text-sm text-slate-700">{selected.description}</div>
          </div>
        ) : null}

        {selected && (!noteMd || !planningMd || months.length !== 3) ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="text-sm text-slate-700">Si le plan ne s’affiche pas automatiquement, cliquez ici pour le générer.</div>
            <button
              type="button"
              disabled={phase4Loading}
              onClick={generatePhase4}
              className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {phase4Loading ? 'Génération…' : 'Générer le plan'}
            </button>
          </div>
        ) : null}

        {noteMd && planningMd && months.length === 3 ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Feuille de route (3 mois)</div>
                  <div className="mt-1 text-xs text-slate-500">Cochez les tâches réalisées</div>
                </div>
                <button
                  type="button"
                  disabled={phase4Loading}
                  onClick={fetchPhase4State}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                >
                  Actualiser
                </button>
              </div>

              <div className="grid gap-4">
                {months
                  .slice()
                  .sort((a, b) => Number(a.month) - Number(b.month))
                  .map((m) => (
                    <div key={m.month} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">Mois {m.month}</div>
                        <div className="text-xs text-slate-500">{String(m.title || '').trim()}</div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {m.checklist.map((t) => (
                          <label key={t.id} className="flex items-start gap-3 rounded-xl bg-white p-3 border border-slate-200">
                            <input
                              type="checkbox"
                              checked={Boolean(t.done)}
                              onChange={(e) => togglePhase4Checklist(t.id, e.target.checked)}
                              className="mt-1"
                            />
                            <span className={`text-sm ${t.done ? 'line-through text-slate-500' : 'text-slate-900'}`}>{t.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Documents</div>
                  <div className="mt-1 text-xs text-slate-500">Note de positionnement + Document de planning</div>
                </div>
                <div className="text-xs text-slate-500">PDF/MD</div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">Note de positionnement</div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={downloadPhase4NoteMd}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                      >
                        MD
                      </button>
                      <button
                        type="button"
                        disabled={phase4PdfBusy}
                        onClick={() => downloadPhase4Pdf('note')}
                        className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                  <div ref={setPhase4NoteEl} dir="ltr" className="prose prose-slate max-w-none">
                    <ReactMarkdown>{noteMd}</ReactMarkdown>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">Document de Planning</div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={downloadPhase4PlanningMd}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                      >
                        MD
                      </button>
                      <button
                        type="button"
                        disabled={phase4PdfBusy}
                        onClick={() => downloadPhase4Pdf('planning')}
                        className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                  <div ref={setPhase4PlanningEl} dir="ltr" className="prose prose-slate max-w-none">
                    <ReactMarkdown>{planningMd}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const renderPhase2 = () => {
    const scenarios = (Array.isArray(phase2?.scenarios) ? phase2?.scenarios : []) as Phase2Scenario[];
    const answers = (Array.isArray(phase2?.answers) ? phase2?.answers : []) as Phase2Answer[];
    const report = String(phase2?.reportMarkdown || '').trim();

    const answeredIds = new Set(answers.map((a) => String(a?.scenarioId || '')));
    const current = scenarios.find((s) => !answeredIds.has(String(s?.id || '')));

    const answeredCount = answers.filter((a) => answeredIds.has(String(a?.scenarioId || ''))).length;
    const progressText = `${answeredCount}/3`;

    return (
      <div dir="rtl" className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Phase 2 — Analyse stratégique et verdict final</h2>
            <p className="mt-1 text-sm text-slate-600">3 scénarios + Note d’analyse stratégique (FR) + Verdict</p>
          </div>
          <div className="text-xs text-slate-500">Progression : {progressText}</div>
        </div>

        {phase2Error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{phase2Error}</div>
        ) : null}

        {phase2Loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Préparation de la phase 2…</div>
        ) : null}

        {!report && scenarios.length !== 3 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-4">
            <div className="text-sm text-slate-700 leading-relaxed">Les scénarios n’ont pas encore été générés. Cliquez pour lancer la génération.</div>
            <button
              type="button"
              disabled={phase2Loading}
              onClick={generatePhase2}
              className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {phase2Loading ? 'Génération…' : 'Générer 3 scénarios'}
            </button>
          </div>
        ) : null}

        {!report && current ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">Scenario: {String(current.type || '').toUpperCase() || '—'}</div>
              <div className="text-xs text-slate-500">{String(current.title || '').trim()}</div>
            </div>

            <div dir="ltr" className="text-base font-semibold text-slate-900 leading-relaxed">
              {current.question}
            </div>

            <div className="grid gap-2">
              {current.options.map((opt) => {
                const isSelected = phase2SelectedKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPhase2SelectedKey(opt.key)}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-left transition ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-semibold">{opt.key}.</span> {opt.text}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={phase2Loading}
                onClick={() => submitPhase2Answer(current.id)}
                className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {phase2Loading ? 'Envoi…' : 'Envoyer la réponse'}
              </button>
              <button
                type="button"
                disabled={phase2Loading}
                onClick={fetchPhase2State}
                className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                Actualiser
              </button>
            </div>
          </div>
        ) : null}

        {!report && scenarios.length === 3 && !current ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            Toutes les réponses ont été envoyées. Si le rapport n’apparaît pas encore, patientez quelques secondes ou cliquez sur « Actualiser ».
          </div>
        ) : null}

        {report ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 space-y-4">
            <div className="text-lg font-semibold">Note d’analyse stratégique professionnelle + verdict final</div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500">Rapport (FR)</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">Téléchargements</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={downloadPhase2Markdown}
                    className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Télécharger (MD)
                  </button>
                  <button
                    type="button"
                    disabled={phase2PdfBusy}
                    onClick={downloadPhase2Pdf}
                    className="w-full sm:w-auto rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {phase2PdfBusy ? 'Préparation du PDF…' : 'Télécharger (PDF)'}
                  </button>
                </div>
              </div>

              <div ref={setPhase2El} dir="ltr" className="prose prose-slate max-w-none">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const renderPhase1 = () => {
    const analysis = (phase1?.analysis || {}) as Phase1Analysis;
    const report = String(phase1?.reportMarkdown || '').trim();
    const status = String(phase1?.status || '').trim();
    const probeQ = String(phase1?.probe?.question || analysis?.probeQuestion || '').trim();
    const needsProbe = status === 'awaiting_probe' && Boolean(probeQ);

    return (
      <div dir="rtl" className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Phase 1 — Confrontation du CV avec la réalité de l’entretien</h2>
            <p className="mt-1 text-sm text-slate-600">Cross-reference & logique décisionnelle</p>
          </div>
          <div className="text-xs text-slate-500">Service 1</div>
        </div>

        {phase1Error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{phase1Error}</div>
        ) : null}

        {phase1Loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Analyse de cohérence en cours…</div>
        ) : null}

        {!needsProbe && !report ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-4">
            <div className="text-sm text-slate-700 leading-relaxed">
              Cliquez pour démarrer l’analyse, ou patientez quelques secondes si elle a démarré automatiquement.
            </div>
            <button
              type="button"
              disabled={phase1Loading}
              onClick={computePhase1}
              className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {phase1Loading ? 'Analyse…' : 'Démarrer l’analyse'}
            </button>
          </div>
        ) : null}

        {needsProbe ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)] space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 leading-relaxed">
              Des incohérences potentielles ont été détectées. Merci d’apporter une clarification rapide avant l’édition du rapport final.
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="text-sm text-slate-500">Question de confirmation (FR)</div>
              <div dir="ltr" className="text-base font-semibold text-slate-900 leading-relaxed">{probeQ}</div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">Votre réponse</label>
              <textarea
                value={probeAnswer}
                onChange={(e) => setProbeAnswer(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200"
                placeholder="Saisissez votre clarification ici…"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={phase1Loading}
                onClick={submitProbeAnswer}
                className="w-full sm:w-auto rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {phase1Loading ? 'Envoi…' : 'Envoyer la réponse'}
              </button>
              <button
                type="button"
                disabled={phase1Loading}
                onClick={fetchPhase1State}
                className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                Actualiser
              </button>
            </div>
          </div>
        ) : null}

        {report ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 space-y-4">
            <div className="text-lg font-semibold">Analyse de votre logique décisionnelle et de votre niveau réel</div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Consistency</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">Points de cohérence</div>
                <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {Array.isArray(analysis?.consistency) && analysis.consistency.length > 0
                    ? analysis.consistency.slice(0, 6).map((s, i) => <div key={i}>- {s}</div>)
                    : '—'}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Incoherence</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">Points d’incohérence</div>
                <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {Array.isArray(analysis?.incoherence) && analysis.incoherence.length > 0
                    ? analysis.incoherence.slice(0, 6).map((s, i) => <div key={i}>- {s}</div>)
                    : '—'}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Rôle</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">Rôle recommandé</div>
                <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                  <div><span className="font-semibold">Claimed:</span> {analysis?.claimedRole || '—'}</div>
                  <div className="mt-1"><span className="font-semibold">Real:</span> {analysis?.realRole || '—'}</div>
                  <div className="mt-1"><span className="font-semibold">Level:</span> {analysis?.incoherenceLevel || '—'}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500">Fiche (FR)</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">Fiche de logique décisionnelle</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={downloadPhase1Markdown}
                    className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Télécharger (MD)
                  </button>
                  <button
                    type="button"
                    disabled={phase1PdfBusy}
                    onClick={downloadPhase1Pdf}
                    className="w-full sm:w-auto rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {phase1PdfBusy ? 'Préparation du PDF…' : 'Télécharger (PDF)'}
                  </button>
                </div>
              </div>

              <div ref={setPhase1El} dir="ltr" className="prose prose-slate max-w-none">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">{error}</div>
          <button
            onClick={() => navigate(`/diagnostic-result?email=${encodeURIComponent(email)}`)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!subInfo?.active) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(15,23,42,0.06),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(99,102,241,0.08),transparent_50%)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_26px_80px_-58px_rgba(15,23,42,0.35)] ring-1 ring-black/5 overflow-hidden">
          <div className="px-6 sm:px-10 py-7 border-b border-slate-200/70 bg-gradient-to-b from-white/90 to-white/60">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Service 1 — Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Accès activé pour: {email}</p>
          </div>

          <div className="px-6 sm:px-10 py-8 space-y-6">
            <PhaseTabs />

            {phase === 0 ? (
              renderPhase0()
            ) : phase === 1 ? (
              renderPhase1()
            ) : phase === 2 ? (
              renderPhase2()
            ) : phase === 3 ? (
              renderPhase3()
            ) : phase === 4 ? (
              renderPhase4()
            ) : phase === 5 ? (
              renderPhase5({
                phase5,
                phase5Error,
                phase5Loading,
                aggregatePhase5,
                fetchPhase5State,
                phase5ShowRawAgg,
                setPhase5ShowRawAgg,
                phase5SelfDescription,
                setPhase5SelfDescription,
                submitPhase5SelfAwareness,
                generatePhase5FinalActions,
                selectPhase5FinalAction,
                phase5GrandBusy,
                startPhase5GrandSimulation,
                phase5GrandAnswerText,
                setPhase5GrandAnswerText,
                submitPhase5GrandAnswer,
                phase5ExportBusy,
                phase5ExportMarkdown,
                phase5ExportShowAnnexes,
                setPhase5ExportShowAnnexes,
                fetchPhase5ExportMarkdown,
                downloadPhase5ExportMd,
                phase5ExportPdfBusy,
                downloadPhase5ExportPdf,
                setPhase5ExportEl,
              })
            ) : phase === 'final' ? (
              renderFinal()
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 text-sm text-slate-700 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)]">
                Cette phase est en cours de préparation.
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate(`/diagnostic-result?email=${encodeURIComponent(email)}`)}
              className="w-full rounded-2xl border border-slate-200 bg-white/85 px-6 py-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
            >
              Retour au résultat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service1DashboardGate;
