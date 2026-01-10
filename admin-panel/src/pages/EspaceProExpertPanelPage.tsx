import React, { useEffect, useMemo, useState } from 'react';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { EspaceProAccount } from '../types/espaceProAccount';
import type {
  EspaceProDossier,
  EspaceProDocumentCategory,
  EspaceProDocumentVisibility,
  EspaceProPhaseStatus,
} from '../types/espaceProDossier';
import * as espaceProAccountsService from '../services/espaceProAccountsService';
import { espaceProDossiersApiService } from '../services/espaceProDossiersApiService';

const statusLabel: Record<EspaceProPhaseStatus, string> = {
  A_VENIR: 'À venir',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
};

const visibilityLabel: Record<EspaceProDocumentVisibility, string> = {
  PARTICIPANT: 'Visible participant',
  INTERNAL: 'Interne',
};

const categoryLabel: Record<EspaceProDocumentCategory, string> = {
  DIAGNOSTIC: 'Diagnostic',
  PHASE: 'Phase',
};

type DecisionDraft = {
  decisionType: string;
  date: string;
  phaseId: number;
  noteInternal: string;
};

type DocumentDraft = {
  title: string;
  category: EspaceProDocumentCategory;
  phaseId: number;
  documentUrl: string;
  visibility: EspaceProDocumentVisibility;
};

const EspaceProExpertPanelPage: React.FC = () => {
  const [accounts, setAccounts] = useState<EspaceProAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<EspaceProAccount | null>(null);

  const [dossier, setDossier] = useState<EspaceProDossier | null>(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [dossierError, setDossierError] = useState<string | null>(null);

  const [situationDraft, setSituationDraft] = useState({ levelLabel: '', statusLabel: '' });
  const [notesDraft, setNotesDraft] = useState('');

  const [decisionDraft, setDecisionDraft] = useState<DecisionDraft>({
    decisionType: '',
    date: new Date().toISOString().slice(0, 10),
    phaseId: 1,
    noteInternal: '',
  });

  const [documentDraft, setDocumentDraft] = useState<DocumentDraft>({
    title: '',
    category: 'DIAGNOSTIC',
    phaseId: 1,
    documentUrl: '',
    visibility: 'PARTICIPANT',
  });

  const filteredAccounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => {
      return (
        a.firstName.toLowerCase().includes(q) ||
        a.lastName.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q)
      );
    });
  }, [accounts, query]);

  const loadAccounts = async () => {
    setAccountsLoading(true);
    setAccountsError(null);
    try {
      const list = await espaceProAccountsService.getAll();
      setAccounts(list);
    } catch (err) {
      console.error(err);
      setAccountsError('Erreur lors du chargement des comptes');
      setAccounts(espaceProAccountsService.getAllLocal());
    } finally {
      setAccountsLoading(false);
    }
  };

  const loadDossier = async (accountId: string) => {
    setDossierLoading(true);
    setDossierError(null);
    try {
      const response = await espaceProDossiersApiService.getDossier(accountId);
      if (!response.success || !response.data) throw new Error(response.message || 'API error');
      const data = response.data;
      setDossier(data);
      setSituationDraft({
        levelLabel: data.situationCurrent.levelLabel || '',
        statusLabel: data.situationCurrent.statusLabel || '',
      });
      setNotesDraft(data.notesVisibleToParticipant || '');
      setDecisionDraft((prev) => ({
        ...prev,
        phaseId: data.currentPhaseId || 1,
      }));
    } catch (err) {
      console.error(err);
      setDossierError("Erreur lors du chargement du dossier");
      setDossier(null);
    } finally {
      setDossierLoading(false);
    }
  };

  useEffect(() => {
    void loadAccounts();
  }, []);

  useEffect(() => {
    if (!selectedAccountId) return;
    const acc = accounts.find((a) => a.id === selectedAccountId) || null;
    setSelectedAccount(acc);
    void loadDossier(selectedAccountId);
  }, [selectedAccountId]);

  const handleSelectAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const handleRefresh = async () => {
    await loadAccounts();
    if (selectedAccountId) {
      await loadDossier(selectedAccountId);
    }
  };

  const saveSituation = async () => {
    if (!selectedAccountId) return;
    try {
      const res = await espaceProDossiersApiService.updateSituation(selectedAccountId, situationDraft);
      if (!res.success || !res.data) throw new Error(res.message || 'API error');
      setDossier(res.data);
    } catch (err) {
      console.error(err);
      window.alert("Erreur lors de l'enregistrement");
    }
  };

  const saveNotes = async () => {
    if (!selectedAccountId) return;
    try {
      const res = await espaceProDossiersApiService.updateNotesVisible(selectedAccountId, {
        notesVisibleToParticipant: notesDraft,
      });
      if (!res.success || !res.data) throw new Error(res.message || 'API error');
      setDossier(res.data);
    } catch (err) {
      console.error(err);
      window.alert("Erreur lors de l'enregistrement");
    }
  };

  const savePhase = async (phaseId: number) => {
    if (!selectedAccountId || !dossier) return;
    const phase = dossier.phases.find((p) => p.phaseId === phaseId);
    if (!phase) return;

    try {
      const res = await espaceProDossiersApiService.updatePhase(selectedAccountId, phaseId, {
        status: phase.status,
        shortDescription: phase.shortDescription,
        externalLinkUrl: phase.externalLinkUrl,
        setAsCurrent: dossier.currentPhaseId === phaseId,
      });
      if (!res.success || !res.data) throw new Error(res.message || 'API error');
      setDossier(res.data);
    } catch (err) {
      console.error(err);
      window.alert("Erreur lors de l'enregistrement");
    }
  };

  const addDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return;

    if (!decisionDraft.decisionType.trim()) {
      window.alert('Veuillez saisir le type de décision');
      return;
    }

    try {
      const res = await espaceProDossiersApiService.addDecision(selectedAccountId, {
        decisionType: decisionDraft.decisionType.trim(),
        date: new Date(decisionDraft.date).toISOString(),
        phaseId: decisionDraft.phaseId,
        noteInternal: decisionDraft.noteInternal,
      });
      if (!res.success || !res.data) throw new Error(res.message || 'API error');
      setDossier(res.data);
      setDecisionDraft((prev) => ({
        ...prev,
        decisionType: '',
        noteInternal: '',
      }));
    } catch (err) {
      console.error(err);
      window.alert("Erreur lors de l'enregistrement");
    }
  };

  const addDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return;

    if (!documentDraft.title.trim() || !documentDraft.documentUrl.trim()) {
      window.alert('Veuillez saisir un titre et un lien');
      return;
    }

    if (documentDraft.category === 'PHASE' && (!documentDraft.phaseId || documentDraft.phaseId < 1)) {
      window.alert('Veuillez choisir une phase');
      return;
    }

    try {
      const res = await espaceProDossiersApiService.addDocument(selectedAccountId, {
        title: documentDraft.title.trim(),
        category: documentDraft.category,
        phaseId: documentDraft.category === 'PHASE' ? documentDraft.phaseId : undefined,
        documentUrl: documentDraft.documentUrl.trim(),
        visibility: documentDraft.visibility,
      });
      if (!res.success || !res.data) throw new Error(res.message || 'API error');
      setDossier(res.data);
      setDocumentDraft((prev) => ({
        ...prev,
        title: '',
        documentUrl: '',
      }));
    } catch (err) {
      console.error(err);
      window.alert("Erreur lors de l'enregistrement");
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!selectedAccountId) return;
    const ok = window.confirm('Supprimer ce lien ?');
    if (!ok) return;

    try {
      const res = await espaceProDossiersApiService.deleteDocument(selectedAccountId, docId);
      if (!res.success || !res.data) throw new Error(res.message || 'API error');
      setDossier(res.data);
    } catch (err) {
      console.error(err);
      window.alert("Erreur lors de la suppression");
    }
  };

  const phasesForUi = useMemo(() => {
    if (!dossier) return [];
    const map = new Map(dossier.phases.map((p) => [p.phaseId, p]));
    return Array.from({ length: 5 }, (_, i) => {
      const id = i + 1;
      const existing = map.get(id);
      return (
        existing || {
          phaseId: id,
          status: 'A_VENIR' as EspaceProPhaseStatus,
          shortDescription: '',
          externalLinkUrl: '',
        }
      );
    });
  }, [dossier]);

  const updatePhaseLocal = (phaseId: number, patch: Partial<{ status: EspaceProPhaseStatus; shortDescription: string; externalLinkUrl: string }>) => {
    if (!dossier) return;
    const nextPhases = phasesForUi.map((p) => (p.phaseId === phaseId ? { ...p, ...patch } : p));
    setDossier({ ...dossier, phases: nextPhases });
  };

  const setCurrentPhaseLocal = (phaseId: number) => {
    if (!dossier) return;
    setDossier({ ...dossier, currentPhaseId: phaseId });
    setDecisionDraft((prev) => ({ ...prev, phaseId }));
  };

  const lastDecision = dossier?.decisionsHistory?.[0] || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expert Panel — Espace Professionnel</h1>
          <p className="mt-1 text-sm text-gray-600">L’expert est la source unique des informations visibles côté participant.</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Rafraîchir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher prénom, nom, téléphone"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {accountsError && <div className="mt-3 text-sm text-red-700">{accountsError}</div>}

          <div className="mt-4">
            {accountsLoading ? (
              <div className="text-sm text-gray-500">Chargement...</div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-sm text-gray-500">Aucun compte</div>
            ) : (
              <div className="space-y-2">
                {filteredAccounts.map((a) => {
                  const active = a.id === selectedAccountId;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleSelectAccount(a.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                        active ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{a.firstName} {a.lastName}</div>
                      <div className="text-xs text-gray-500">{a.phone}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          {!selectedAccountId ? (
            <div className="text-sm text-gray-600">Sélectionnez un compte participant pour ouvrir son dossier.</div>
          ) : dossierLoading ? (
            <div className="text-sm text-gray-600">Chargement du dossier...</div>
          ) : dossierError ? (
            <div className="text-sm text-red-700">{dossierError}</div>
          ) : !dossier ? (
            <div className="text-sm text-gray-600">Dossier introuvable.</div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Dossier</h2>
                  <p className="text-sm text-gray-600">{selectedAccount ? `${selectedAccount.firstName} ${selectedAccount.lastName} · ${selectedAccount.phone}` : selectedAccountId}</p>
                </div>
                <div className="text-xs text-gray-500">Dernière mise à jour: {new Date(dossier.updatedAt).toLocaleString()}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-gray-900">Situation actuelle</h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">Niveau professionnel</label>
                      <input
                        value={situationDraft.levelLabel}
                        onChange={(e) => setSituationDraft((p) => ({ ...p, levelLabel: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">Statut</label>
                      <input
                        value={situationDraft.statusLabel}
                        onChange={(e) => setSituationDraft((p) => ({ ...p, statusLabel: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={saveSituation}
                      className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-gray-900">Notes visibles (participant)</h3>
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={saveNotes}
                      className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900">Décision professionnelle</h3>
                <div className="mt-2 text-sm text-gray-600">
                  Dernière décision: {lastDecision ? `${lastDecision.decisionType} — Phase ${lastDecision.phaseId} — ${new Date(lastDecision.date).toLocaleDateString()}` : '—'}
                </div>

                <form onSubmit={addDecision} className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600">Type de décision</label>
                    <input
                      value={decisionDraft.decisionType}
                      onChange={(e) => setDecisionDraft((p) => ({ ...p, decisionType: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Date</label>
                    <input
                      type="date"
                      value={decisionDraft.date}
                      onChange={(e) => setDecisionDraft((p) => ({ ...p, date: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Phase</label>
                    <select
                      value={decisionDraft.phaseId}
                      onChange={(e) => setDecisionDraft((p) => ({ ...p, phaseId: Number(e.target.value) }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Phase {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      <PlusIcon className="h-5 w-5" />
                      Valider
                    </button>
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-xs font-semibold text-gray-600">Note interne (optionnel)</label>
                    <input
                      value={decisionDraft.noteInternal}
                      onChange={(e) => setDecisionDraft((p) => ({ ...p, noteInternal: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </form>

                <div className="mt-4">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Historique</h4>
                  {dossier.decisionsHistory.length === 0 ? (
                    <div className="mt-2 text-sm text-gray-500">Aucune décision</div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {dossier.decisionsHistory
                        .slice()
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((d) => (
                          <div key={d.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                            <div className="font-semibold text-gray-900">{d.decisionType}</div>
                            <div className="text-xs text-gray-600">{new Date(d.date).toLocaleString()} — Phase {d.phaseId}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900">Parcours — Phases 1 à 5</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phasesForUi.map((p) => {
                    const isCurrent = dossier.currentPhaseId === p.phaseId;
                    return (
                      <div key={p.phaseId} className={`rounded-lg border p-4 ${isCurrent ? 'border-primary-400 bg-primary-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-bold text-gray-900">Phase {p.phaseId}</div>
                          <button
                            type="button"
                            onClick={() => setCurrentPhaseLocal(p.phaseId)}
                            className={`rounded-md px-3 py-1 text-xs font-semibold ${isCurrent ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          >
                            {isCurrent ? 'Actuelle' : 'Définir actuelle'}
                          </button>
                        </div>

                        <div className="mt-3 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600">Statut</label>
                            <select
                              value={p.status}
                              onChange={(e) => updatePhaseLocal(p.phaseId, { status: e.target.value as EspaceProPhaseStatus })}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                              {(['A_VENIR', 'EN_COURS', 'TERMINEE'] as EspaceProPhaseStatus[]).map((s) => (
                                <option key={s} value={s}>{statusLabel[s]}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600">Description courte</label>
                            <input
                              value={p.shortDescription}
                              onChange={(e) => updatePhaseLocal(p.phaseId, { shortDescription: e.target.value })
                              }
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600">Lien externe</label>
                            <input
                              value={p.externalLinkUrl}
                              onChange={(e) => updatePhaseLocal(p.phaseId, { externalLinkUrl: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => savePhase(p.phaseId)}
                            className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900">Documents (liens externes)</h3>

                <form onSubmit={addDocument} className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600">Titre</label>
                    <input
                      value={documentDraft.title}
                      onChange={(e) => setDocumentDraft((p) => ({ ...p, title: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Type</label>
                    <select
                      value={documentDraft.category}
                      onChange={(e) => setDocumentDraft((p) => ({ ...p, category: e.target.value as EspaceProDocumentCategory }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      {(['DIAGNOSTIC', 'PHASE'] as EspaceProDocumentCategory[]).map((c) => (
                        <option key={c} value={c}>{categoryLabel[c]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Phase</label>
                    <select
                      value={documentDraft.phaseId}
                      onChange={(e) => setDocumentDraft((p) => ({ ...p, phaseId: Number(e.target.value) }))}
                      disabled={documentDraft.category !== 'PHASE'}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Phase {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Visibilité</label>
                    <select
                      value={documentDraft.visibility}
                      onChange={(e) => setDocumentDraft((p) => ({ ...p, visibility: e.target.value as EspaceProDocumentVisibility }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      {(['PARTICIPANT', 'INTERNAL'] as EspaceProDocumentVisibility[]).map((v) => (
                        <option key={v} value={v}>{visibilityLabel[v]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-xs font-semibold text-gray-600">Lien (Google Drive / externe)</label>
                    <input
                      value={documentDraft.documentUrl}
                      onChange={(e) => setDocumentDraft((p) => ({ ...p, documentUrl: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      <PlusIcon className="h-5 w-5" />
                      Ajouter
                    </button>
                  </div>
                </form>

                <div className="mt-4">
                  {dossier.documents.length === 0 ? (
                    <div className="text-sm text-gray-500">Aucun document</div>
                  ) : (
                    <div className="space-y-2">
                      {dossier.documents
                        .slice()
                        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
                        .map((doc) => (
                          <div key={doc.id} className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{doc.title}</div>
                                <div className="text-xs text-gray-600">
                                  {doc.category === 'PHASE' ? `Phase ${doc.phaseId}` : 'Diagnostic'} · {visibilityLabel[doc.visibility]} · {new Date(doc.addedAt).toLocaleString()}
                                </div>
                                <a
                                  href={doc.documentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-1 inline-block text-xs text-primary-700 hover:underline break-all"
                                >
                                  {doc.documentUrl}
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => deleteDocument(doc.id)}
                                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EspaceProExpertPanelPage;
