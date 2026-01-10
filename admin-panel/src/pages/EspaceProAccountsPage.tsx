import React, { useEffect, useMemo, useState } from "react";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Modal from "../components/common/Modal";
import type { EspaceProAccount } from "../types/espaceProAccount";
import * as espaceProAccountsService from "../services/espaceProAccountsService";

type AccountDraft = {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
};

const emptyDraft: AccountDraft = {
  firstName: "",
  lastName: "",
  phone: "",
  password: "",
};

const EspaceProAccountsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<EspaceProAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AccountDraft>(emptyDraft);

  const refresh = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await espaceProAccountsService.getAll();
      setAccounts(list);
    } catch (err) {
      console.error(err);
      setLoadError("Erreur lors du chargement des comptes");
      setAccounts(espaceProAccountsService.getAllLocal());
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
        a.firstName.toLowerCase().includes(q) ||
        a.lastName.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q)
      );
    });
  }, [accounts, search]);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setIsModalOpen(true);
  };

  const openEdit = (account: EspaceProAccount) => {
    setEditingId(account.id);
    setDraft({
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      phone: account.phone,
      password: "",
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

    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.phone.trim()) {
      alert("Veuillez remplir : Prénom, Nom et Téléphone");
      return;
    }

    try {
      if (!editingId) {
        if (!draft.password.trim()) {
          alert("Veuillez saisir un mot de passe");
          return;
        }

        await espaceProAccountsService.createAccount({
          firstName: draft.firstName.trim(),
          lastName: draft.lastName.trim(),
          phone: draft.phone.trim(),
          password: draft.password,
        });
      } else {
        await espaceProAccountsService.updateAccount(editingId, {
          firstName: draft.firstName.trim(),
          lastName: draft.lastName.trim(),
          phone: draft.phone.trim(),
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
      await espaceProAccountsService.remove(id);
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
            <h1 className="text-2xl font-bold text-gray-900">Comptes Espace Professionnel</h1>
            <p className="mt-1 text-sm text-gray-600">
              Créez les identifiants utilisés sur la page de connexion (Prénom, Nom, Téléphone, Mot de passe).
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
              placeholder="Rechercher par prénom, nom ou téléphone"
              className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loadError && (
          <div className="px-6 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">
            {loadError}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prénom</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Créé le</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    Aucun compte.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.firstName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{a.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{a.phone}</td>
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

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Modifier le compte" : "Ajouter un compte"}
      >
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Prénom</label>
              <input
                value={draft.firstName}
                onChange={(e) => setDraft((p) => ({ ...p, firstName: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Nom</label>
              <input
                value={draft.lastName}
                onChange={(e) => setDraft((p) => ({ ...p, lastName: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Téléphone</label>
              <input
                value={draft.phone}
                onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Mot de passe</label>
              <input
                type="text"
                value={draft.password}
                onChange={(e) => setDraft((p) => ({ ...p, password: e.target.value }))}
                placeholder={editingId ? "Laisser vide pour ne pas changer" : "Mot de passe"}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EspaceProAccountsPage;
