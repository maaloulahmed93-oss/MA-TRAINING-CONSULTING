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
  ConsultingOperationnelSituation,
} from "../types/consultingOperationnelAccount";
import * as consultingOperationnelAccountsService from "../services/consultingOperationnelAccountsService";

type AccountDraft = {
  id?: string;
  participantId: string;
  password: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
  entreprise: string;
  notesAdmin: string;
  situation: Required<ConsultingOperationnelSituation>;
};

const emptySituation: Required<ConsultingOperationnelSituation> = {
  posteIntitule: "",
  entrepriseSecteur: "",
  element1: "",
  element2: "",
  difficulte1: "",
  difficulte2: "",
  demandeDirection: "",
  session1DateTime: "",
  session1VideoUrl: "",
  session2DateTime: "",
  session2VideoUrl: "",
  session3DateTime: "",
  session3VideoUrl: "",
};

const emptyDraft: AccountDraft = {
  participantId: "",
  password: "",
  isActive: true,
  firstName: "",
  lastName: "",
  email: "",
  entreprise: "",
  notesAdmin: "",
  situation: emptySituation,
};

const ConsultingOperationnelAccountsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<ConsultingOperationnelAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AccountDraft>(emptyDraft);

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
      firstName: String(account.firstName ?? ""),
      lastName: String(account.lastName ?? ""),
      email: String(account.email ?? ""),
      entreprise: String(account.entreprise ?? ""),
      notesAdmin: String(account.notesAdmin ?? ""),
      situation: {
        posteIntitule: String(account.situation?.posteIntitule ?? ""),
        entrepriseSecteur: String(account.situation?.entrepriseSecteur ?? ""),
        element1: String(account.situation?.element1 ?? ""),
        element2: String(account.situation?.element2 ?? ""),
        difficulte1: String(account.situation?.difficulte1 ?? ""),
        difficulte2: String(account.situation?.difficulte2 ?? ""),
        demandeDirection: String(account.situation?.demandeDirection ?? ""),
        session1DateTime: String(account.situation?.session1DateTime ?? ""),
        session1VideoUrl: String(account.situation?.session1VideoUrl ?? ""),
        session2DateTime: String(account.situation?.session2DateTime ?? ""),
        session2VideoUrl: String(account.situation?.session2VideoUrl ?? ""),
        session3DateTime: String(account.situation?.session3DateTime ?? ""),
        session3VideoUrl: String(account.situation?.session3VideoUrl ?? ""),
      },
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
  };

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
          firstName: draft.firstName,
          lastName: draft.lastName,
          email: draft.email,
          entreprise: draft.entreprise,
          notesAdmin: draft.notesAdmin,
          situation: draft.situation,
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
          firstName: draft.firstName,
          lastName: draft.lastName,
          email: draft.email,
          entreprise: draft.entreprise,
          notesAdmin: draft.notesAdmin,
          situation: draft.situation,
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
              <label className="block text-sm font-medium text-gray-700">Entreprise (optionnel)</label>
              <input
                value={draft.entreprise}
                onChange={(e) => setDraft((p) => ({ ...p, entreprise: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nom (optionnel)</label>
              <input
                value={draft.lastName}
                onChange={(e) => setDraft((p) => ({ ...p, lastName: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom (optionnel)</label>
              <input
                value={draft.firstName}
                onChange={(e) => setDraft((p) => ({ ...p, firstName: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email (optionnel)</label>
              <input
                value={draft.email}
                onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                type="email"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes admin (optionnel)</label>
              <textarea
                value={draft.notesAdmin}
                onChange={(e) => setDraft((p) => ({ ...p, notesAdmin: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
              />
            </div>

            <div className="sm:col-span-2">
              <div className="mt-2 rounded-lg border border-gray-200 p-4">
                <div className="text-sm font-semibold text-gray-900">Informations mission (situation)</div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Intitulé du poste</label>
                    <input
                      value={draft.situation.posteIntitule}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, posteIntitule: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type d’entreprise / secteur</label>
                    <input
                      value={draft.situation.entrepriseSecteur}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, entrepriseSecteur: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Élément existant 1</label>
                    <input
                      value={draft.situation.element1}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, element1: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Élément existant 2</label>
                    <input
                      value={draft.situation.element2}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, element2: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dysfonctionnement / difficulté constatée</label>
                    <input
                      value={draft.situation.difficulte1}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, difficulte1: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manque de cohérence / duplication / résultats</label>
                    <input
                      value={draft.situation.difficulte2}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, difficulte2: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Demande générale de la direction</label>
                    <textarea
                      value={draft.situation.demandeDirection}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, demandeDirection: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">SESSION 1 — Date et l’heure</label>
                    <input
                      value={draft.situation.session1DateTime}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, session1DateTime: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Ex: 30/12/2025 - 14:00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">SESSION 1 — URL vidéo</label>
                    <input
                      value={draft.situation.session1VideoUrl}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, session1VideoUrl: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">SESSION 2 — Date et l’heure</label>
                    <input
                      value={draft.situation.session2DateTime}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, session2DateTime: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Ex: 02/01/2026 - 10:00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">SESSION 2 — URL vidéo</label>
                    <input
                      value={draft.situation.session2VideoUrl}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, session2VideoUrl: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">SESSION 3 — Date et l’heure</label>
                    <input
                      value={draft.situation.session3DateTime}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, session3DateTime: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Ex: 09/01/2026 - 16:00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">SESSION 3 — URL vidéo</label>
                    <input
                      value={draft.situation.session3VideoUrl}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          situation: { ...p.situation, session3VideoUrl: e.target.value },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
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
    </div>
  );
};

export default ConsultingOperationnelAccountsPage;
