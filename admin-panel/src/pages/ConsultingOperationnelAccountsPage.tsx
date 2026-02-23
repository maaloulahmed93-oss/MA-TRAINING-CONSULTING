import React, { useEffect, useMemo, useState } from "react";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Modal from "../components/common/Modal";
import type {
  ConsultingOperationnelAccount,
} from "../types/consultingOperationnelAccount";
import * as consultingOperationnelAccountsService from "../services/consultingOperationnelAccountsService";
import { generateService2AccountReport, getService2AccountHistory } from "../services/service2ApiService";

type AccountDraft = {
  id?: string;
  participantId: string;
  password: string;
  isActive: boolean;
  notesAdmin: string;
};

const emptyDraft: AccountDraft = {
  participantId: "",
  password: "",
  isActive: true,
  notesAdmin: "",
};

const ConsultingOperationnelAccountsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<ConsultingOperationnelAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AccountDraft>(emptyDraft);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportTarget, setReportTarget] = useState<ConsultingOperationnelAccount | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await consultingOperationnelAccountsService.getAll();
      setAccounts(list);
    } catch (err) {
      console.error(err);
      setLoadError("Erreur lors du chargement des comptes");
      setAccounts(consultingOperationnelAccountsService.getAllLocal());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => {
      return (
        a.participantId.toLowerCase().includes(q) ||
        String(a.firstName || "").toLowerCase().includes(q) ||
        String(a.lastName || "").toLowerCase().includes(q) ||
        String(a.email || "").toLowerCase().includes(q)
      );
    });
  }, [accounts, search]);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setIsModalOpen(true);
  };

  const openEdit = (account: ConsultingOperationnelAccount) => {
    setEditingId(account.id);
    setDraft({
      id: account.id,
      participantId: account.participantId,
      password: "",
      isActive: account.isActive ?? true,
      notesAdmin: String(account.notesAdmin ?? ""),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReportLoading(false);
    setReportGenerating(false);
    setReportError(null);
    setReportData(null);
    setReportTarget(null);
  };

  const openReport = async (account: ConsultingOperationnelAccount) => {
    setIsReportModalOpen(true);
    setReportTarget(account);
    setReportError(null);
    setReportData(null);

    try {
      setReportLoading(true);
      const data = await getService2AccountHistory({ assignedAccountId: account.participantId });
      setReportData(data);
    } catch (err: any) {
      setReportError(String(err?.message || "Erreur"));
    } finally {
      setReportLoading(false);
    }
  };

  const onGenerateFullReport = async () => {
    if (!reportTarget) return;
    try {
      setReportGenerating(true);
      setReportError(null);
      await generateService2AccountReport({ assignedAccountId: reportTarget.participantId });
      const data = await getService2AccountHistory({ assignedAccountId: reportTarget.participantId });
      setReportData(data);
    } catch (err: any) {
      setReportError(String(err?.message || "Erreur"));
    } finally {
      setReportGenerating(false);
    }
  };

  const formatAiText = (ai: any): string => {
    if (!ai || typeof ai !== 'object') return '';

    const lines: string[] = [];
    if (typeof ai.score !== 'undefined') lines.push(`Score: ${String(ai.score)}`);
    if (ai.summary) lines.push(`Résumé: ${String(ai.summary)}`);

    if (Array.isArray(ai.warnings) && ai.warnings.length > 0) {
      lines.push('Avertissements:');
      for (const w of ai.warnings) lines.push(`- ${String(w)}`);
    }

    if (Array.isArray(ai.tips) && ai.tips.length > 0) {
      lines.push('Conseils:');
      for (const t of ai.tips) lines.push(`- ${String(t)}`);
    }

    if (Array.isArray(ai.constraintViolations) && ai.constraintViolations.length > 0) {
      lines.push('Violations contraintes:');
      for (const v of ai.constraintViolations) {
        const c = v?.constraint ? String(v.constraint) : '';
        const r = v?.reason ? String(v.reason) : '';
        lines.push(`- ${c}${r ? ` — ${r}` : ''}`.trim());
      }
    }

    if (Array.isArray(ai.successCriteria) && ai.successCriteria.length > 0) {
      lines.push('Critères de succès:');
      for (const sc of ai.successCriteria) {
        const crit = sc?.criterion ? String(sc.criterion) : '';
        const met = typeof sc?.met === 'boolean' ? (sc.met ? 'OK' : 'Non') : '';
        const r = sc?.reason ? String(sc.reason) : '';
        const head = [crit, met].filter(Boolean).join(' — ');
        lines.push(`- ${head}${r ? ` : ${r}` : ''}`.trim());
      }
    }

    if (Array.isArray(ai.strengths) && ai.strengths.length > 0) {
      lines.push('Points forts:');
      for (const x of ai.strengths) lines.push(`- ${String(x)}`);
    }

    if (Array.isArray(ai.weaknesses) && ai.weaknesses.length > 0) {
      lines.push('Points faibles:');
      for (const x of ai.weaknesses) lines.push(`- ${String(x)}`);
    }

    if (Array.isArray(ai.recommendations) && ai.recommendations.length > 0) {
      lines.push('Recommandations:');
      for (const x of ai.recommendations) lines.push(`- ${String(x)}`);
    }

    return lines.join('\n');
  };

  const exportText = useMemo(() => {
    if (!reportData) return "";

    const lines: string[] = [];

    lines.push(`Compte: ${String(reportData?.account?.participantId || "")}`);
    lines.push(`Examen: ${String(reportData?.exam?.title || "")}`);
    lines.push('');

    if (Array.isArray(reportData?.submissions) && reportData.submissions.length > 0) {
      lines.push('Soumissions (réponses du participant):');
      for (const s of reportData.submissions) {
        lines.push('');
        lines.push(`Tâche: ${String(s?.taskId || 'main')} (tentative ${String(s?.attempt || 1)})`);
        if (s?.createdAt) lines.push(`Date: ${new Date(s.createdAt).toLocaleString()}`);
        lines.push('');
        lines.push('Réponse du participant:');
        lines.push(String(s?.submissionText || ''));
        lines.push('');
        lines.push('Analyse de l’IA:');
        lines.push(formatAiText(s?.aiAnalysis) || '');
      }
      lines.push('');
    }

    if (reportData?.actionPlan?.tasks?.length) {
      lines.push("Plan d'action (feedback IA):");
      for (const t of reportData.actionPlan.tasks) {
        lines.push('');
        lines.push(`Tâche: ${String(t?.title || '')}`);
        lines.push('Feedback de l’IA:');
        lines.push(formatAiText(t?.aiFeedback) || '');
      }
      lines.push('');
    }

    const fr = reportData?.finalReport;
    if (fr) {
      lines.push('Feedback final:');
      lines.push(`Score global: ${String(fr?.globalScore ?? '')}/100`);
      lines.push(`Statut: ${String(fr?.status ?? '')}`);
      if (fr?.message) lines.push(`Message: ${String(fr?.message ?? '')}`);
      lines.push('');
      if (fr?.reportText) {
        lines.push('Résumé final:');
        lines.push(String(fr.reportText));
        lines.push('');
      }
      if (Array.isArray(fr?.strengths) && fr.strengths.length > 0) {
        lines.push('Points forts:');
        for (const x of fr.strengths) lines.push(`- ${String(x)}`);
        lines.push('');
      }
      if (Array.isArray(fr?.weaknesses) && fr.weaknesses.length > 0) {
        lines.push('Points faibles:');
        for (const x of fr.weaknesses) lines.push(`- ${String(x)}`);
        lines.push('');
      }
      if (Array.isArray(fr?.recommendations) && fr.recommendations.length > 0) {
        lines.push('Recommandations:');
        for (const x of fr.recommendations) lines.push(`- ${String(x)}`);
        lines.push('');
      }
    }

    if (reportData?.finalReport?.aiFullReportText) {
      lines.push('Rapport complet (IA):');
      lines.push(String(reportData.finalReport.aiFullReportText));
      lines.push('');
    }

    return lines.join('\n');
  }, [reportData]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!draft.participantId.trim()) {
      alert("Veuillez saisir l'identifiant (participantId)");
      return;
    }

    try {
      if (!editingId) {
        const payload: any = {
          participantId: draft.participantId.trim(),
          isActive: draft.isActive,
          notesAdmin: draft.notesAdmin,
        };

        if (draft.password.trim()) payload.password = draft.password;

        const created = await consultingOperationnelAccountsService.createAccount(payload);

        if (created.generatedPassword) {
          alert(
            `Compte créé.\nIdentifiant: ${created.account.participantId}\nMot de passe: ${created.generatedPassword}`
          );
        }
      } else {
        await consultingOperationnelAccountsService.updateAccount(editingId, {
          participantId: draft.participantId.trim(),
          isActive: draft.isActive,
          notesAdmin: draft.notesAdmin,
          ...(draft.password.trim() ? { password: draft.password } : {}),
        });
      }

      await refresh();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce compte ?")) return;

    try {
      await consultingOperationnelAccountsService.remove(id);
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comptes Consulting Opérationnel (S2)</h1>
            <p className="mt-1 text-sm text-gray-600">
              Création unique: Identifiant + Mot de passe (session 10 jours côté participant).
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par identifiant / nom / email"
              className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loadError && (
          <div className="px-6 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">{loadError}</div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Identifiant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actif</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Créé le</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">Chargement...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">Aucun compte.</td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.participantId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{a.isActive ? 'Oui' : 'Non'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void openReport(a)}
                          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          Rapport
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(a)}
                          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(a.id)}
                          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Modifier le compte' : 'Créer un compte'}>
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Identifiant participant</label>
              <input
                value={draft.participantId}
                onChange={(e) => setDraft((p) => ({ ...p, participantId: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ex: PRT-045"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                value={draft.password}
                onChange={(e) => setDraft((p) => ({ ...p, password: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder={editingId ? 'Laisser vide pour ne pas changer' : 'Laisser vide pour générer automatiquement'}
                type="text"
              />
              {!editingId && (
                <div className="mt-1 text-xs text-gray-500">Si vide: le système génère un mot de passe et l’affiche.</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Actif</label>
              <select
                value={draft.isActive ? 'true' : 'false'}
                onChange={(e) => setDraft((p) => ({ ...p, isActive: e.target.value === 'true' }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes admin (optionnel)</label>
              <textarea
                value={draft.notesAdmin}
                onChange={(e) => setDraft((p) => ({ ...p, notesAdmin: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
              Annuler
            </button>
            <button type="submit" className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        title={reportTarget ? `Rapport — ${reportTarget.participantId}` : 'Rapport'}
      >
        <div className="space-y-4">
          {reportError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{reportError}</div>
          )}

          {reportLoading ? (
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-200">Chargement...</div>
          ) : reportData ? (
            <>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-sm text-gray-700">
                  <div className="font-semibold text-gray-900">Exam</div>
                  <div className="mt-1">{reportData?.exam?.title || '—'}</div>
                </div>
                <button
                  type="button"
                  onClick={onGenerateFullReport}
                  disabled={reportGenerating}
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {reportGenerating ? 'Génération...' : 'Générer rapport complet'}
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm font-semibold text-gray-900">Export complet (sans manques)</div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(exportText || '');
                      } catch {
                        // ignore
                      }
                    }}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Copier
                  </button>
                </div>
                <div className="whitespace-pre-wrap font-sans text-sm text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200 max-h-80 overflow-auto">
                  {exportText || ''}
                </div>
              </div>

              {reportData?.finalReport && (
                <div className="rounded-lg border border-gray-200 p-4 space-y-2">
                  <div className="text-sm font-semibold text-gray-900">Feedback final (verdict)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-800">
                    <div>
                      <div className="text-xs text-gray-500">Score</div>
                      <div className="font-semibold">{String(reportData.finalReport.globalScore ?? '-')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Statut</div>
                      <div className="font-semibold">{String(reportData.finalReport.status ?? '-')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Message</div>
                      <div className="font-semibold">{String(reportData.finalReport.message ?? '-')}</div>
                    </div>
                  </div>
                  {reportData.finalReport.reportText && (
                    <div className="whitespace-pre-wrap font-sans text-sm text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200 max-h-60 overflow-auto">
                      {String(reportData.finalReport.reportText)}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-700">Points forts</div>
                      <div className="mt-1 whitespace-pre-wrap font-sans text-sm text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200 max-h-40 overflow-auto">
                        {(Array.isArray(reportData.finalReport.strengths) ? reportData.finalReport.strengths : []).map(String).join('\n')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-700">Points faibles</div>
                      <div className="mt-1 whitespace-pre-wrap font-sans text-sm text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200 max-h-40 overflow-auto">
                        {(Array.isArray(reportData.finalReport.weaknesses) ? reportData.finalReport.weaknesses : []).map(String).join('\n')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-700">Recommandations</div>
                      <div className="mt-1 whitespace-pre-wrap font-sans text-sm text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200 max-h-40 overflow-auto">
                        {(Array.isArray(reportData.finalReport.recommendations) ? reportData.finalReport.recommendations : []).map(String).join('\n')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-gray-200 p-4 space-y-2">
                <div className="text-sm font-semibold text-gray-900">Rapport complet (AI)</div>
                <div className="text-xs text-gray-500">
                  {reportData?.finalReport?.aiFullReportGeneratedAt
                    ? `Généré le: ${new Date(reportData.finalReport.aiFullReportGeneratedAt).toLocaleString()}`
                    : 'Pas encore généré'}
                  {reportData?.finalReport?.aiFullReportModel ? ` — modèle: ${String(reportData.finalReport.aiFullReportModel)}` : ''}
                </div>
                {reportData?.finalReport?.aiFullReportText ? (
                  <div className="whitespace-pre-wrap font-sans text-sm text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200 max-h-80 overflow-auto">
                    {String(reportData.finalReport.aiFullReportText)}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Clique sur “Générer rapport complet” pour le créer.</div>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="text-sm font-semibold text-gray-900">Soumissions & Analyses</div>
                {Array.isArray(reportData?.submissions) && reportData.submissions.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.submissions.map((s: any) => (
                      <div key={s.id} className="rounded-md bg-white border border-gray-200 p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="text-sm font-semibold text-gray-900">
                            {String(s.taskId || 'main')} — tentative {String(s.attempt || 1)}
                          </div>
                          <div className="text-xs text-gray-500">{s.createdAt ? new Date(s.createdAt).toLocaleString() : ''}</div>
                        </div>

                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-blue-700">Voir la réponse du participant</summary>
                          <div className="mt-2 whitespace-pre-wrap font-sans text-sm text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200 max-h-60 overflow-auto">
                            {String(s.submissionText || '')}
                          </div>
                        </details>

                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-blue-700">Voir l'analyse AI</summary>
                          <div className="mt-2 whitespace-pre-wrap font-sans text-sm text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200 max-h-60 overflow-auto">
                            {formatAiText(s.aiAnalysis) || ''}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Aucune soumission.</div>
                )}
              </div>

              {reportData?.actionPlan && (
                <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="text-sm font-semibold text-gray-900">Plan d'action (AI feedback seulement)</div>
                  {Array.isArray(reportData.actionPlan.tasks) && reportData.actionPlan.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {reportData.actionPlan.tasks.map((t: any) => (
                        <div key={t.id} className="rounded-md bg-white border border-gray-200 p-3">
                          <div className="text-sm font-semibold text-gray-900">{String(t.title || '')}</div>
                          {t.aiFeedback ? (
                            <div className="mt-2 whitespace-pre-wrap font-sans text-sm text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200 max-h-60 overflow-auto">
                              {formatAiText(t.aiFeedback) || ''}
                            </div>
                          ) : (
                            <div className="mt-2 text-sm text-gray-600">Pas d'analyse AI.</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">Aucune tâche.</div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-600">Sélectionne un compte.</div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeReportModal}
              className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConsultingOperationnelAccountsPage;
