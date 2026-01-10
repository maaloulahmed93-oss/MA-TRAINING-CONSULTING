import React, { useEffect, useMemo, useState } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Modal from '../components/common/Modal';
import {
  participationVerificationsApiService,
  type ParticipationStatus,
  type ParticipationVerificationRecord,
} from '../services/participationVerificationsApiService';

const ParticipationVerificationsPage: React.FC = () => {
  const [rows, setRows] = useState<ParticipationVerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selected, setSelected] = useState<ParticipationVerificationRecord | null>(null);

  const [formParticipationId, setFormParticipationId] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formStatus, setFormStatus] = useState<ParticipationStatus>('Complétée');
  const [formService1, setFormService1] = useState(true);
  const [formService2, setFormService2] = useState(false);
  const [formServicesListText, setFormServicesListText] = useState('');
  const [formUpdatedAt, setFormUpdatedAt] = useState<string>('');

  const parseServicesList = (text: string): string[] => {
    return text
      .split(/\r?\n|,/g)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const load = async (q?: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await participationVerificationsApiService.list(q);
      setRows(data);
    } catch (e: any) {
      console.error('Error loading participation verifications:', e);
      setError(e?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      r.participationId.toLowerCase().includes(q) || r.fullName.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const openAdd = () => {
    setModalMode('add');
    setSelected(null);
    setFormParticipationId('');
    setFormFullName('');
    setFormStatus('Complétée');
    setFormService1(true);
    setFormService2(false);
    setFormServicesListText(
      'Diagnostic stratégique & positionnement professionnel\nMissions professionnelles encadrées (le cas échéant)'
    );
    setFormUpdatedAt('');
    setIsModalOpen(true);
  };

  const openEdit = (r: ParticipationVerificationRecord) => {
    setModalMode('edit');
    setSelected(r);
    setFormParticipationId(r.participationId);
    setFormFullName(r.fullName);
    setFormStatus(r.status);
    setFormService1(Boolean(r.services?.service1));
    setFormService2(Boolean(r.services?.service2));
    setFormServicesListText((r.servicesList || []).join('\n'));
    setFormUpdatedAt(r.updatedAt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formFullName.trim()) {
        alert('Nom et prénom requis');
        return;
      }

      if (modalMode === 'add') {
        const servicesList = parseServicesList(formServicesListText);
        await participationVerificationsApiService.create({
          participationId: formParticipationId.trim() || undefined,
          fullName: formFullName.trim(),
          status: formStatus,
          servicesList: servicesList.length ? servicesList : undefined,
          services: {
            service1: formService1,
            service2: formService2,
          },
          isActive: true,
        });
      } else if (selected) {
        const servicesList = parseServicesList(formServicesListText);
        await participationVerificationsApiService.update(selected.participationId, {
          fullName: formFullName.trim(),
          status: formStatus,
          servicesList: servicesList.length ? servicesList : undefined,
          services: {
            service1: formService1,
            service2: formService2,
          },
        });
      }

      closeModal();
      await load(query);
    } catch (e: any) {
      console.error('Error saving participation verification:', e);
      alert(e?.message || 'Erreur lors de l’enregistrement');
    }
  };

  const handleDelete = async (r: ParticipationVerificationRecord) => {
    if (!window.confirm(`Supprimer ${r.participationId} ?`)) return;

    try {
      await participationVerificationsApiService.remove(r.participationId);
      await load(query);
    } catch (e: any) {
      console.error('Error deleting participation verification:', e);
      alert(e?.message || 'Erreur lors de la suppression');
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vérification de participation</h1>
          <p className="mt-2 text-gray-600">
            Ajoutez, modifiez ou supprimez des participations (ID: MTC-AP-YYYY-####).
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Ajouter
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par ID ou nom..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {loading ? 'Chargement...' : `${filtered.length} élément(s)`}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom & prénom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maj</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Chargement...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Aucune participation</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{r.participationId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Array.isArray(r.servicesList) && r.servicesList.length > 0
                        ? r.servicesList.join(' | ')
                        : `${r.services?.service1 ? 'S1' : ''}${r.services?.service1 && r.services?.service2 ? ' + ' : ''}${r.services?.service2 ? 'S2' : ''}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(r.updatedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-2 text-gray-500 hover:text-primary-600"
                          title="Modifier"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-2 text-gray-500 hover:text-red-600"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
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
        title={modalMode === 'add' ? 'Ajouter une participation' : 'Modifier la participation'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Identifiant (optionnel)</label>
            <input
              type="text"
              value={modalMode === 'edit' ? formParticipationId : formParticipationId}
              onChange={(e) => setFormParticipationId(e.target.value)}
              disabled={modalMode === 'edit'}
              placeholder="Laisser vide pour génération automatique (MTC-AP-YYYY-####)"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
            />
            {modalMode === 'edit' && (
              <p className="mt-1 text-xs text-gray-500">L’ID ne peut pas être modifié.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nom et prénom</label>
            <input
              type="text"
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as ParticipationStatus)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Complétée">Complétée</option>
              <option value="En cours">En cours</option>
              <option value="Active">Active</option>
            </select>
          </div>

          {modalMode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de dernière mise à jour</label>
              <input
                type="text"
                value={formUpdatedAt ? formatDate(formUpdatedAt) : ''}
                readOnly
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Service(s) concerné(s)</label>
            <textarea
              value={formServicesListText}
              onChange={(e) => setFormServicesListText(e.target.value)}
              rows={4}
              placeholder="Une ligne par service (ou séparé par virgules)"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Astuce: tu peux coller plusieurs services, un par ligne.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formService1}
                onChange={(e) => setFormService1(e.target.checked)}
                className="h-4 w-4"
              />
              Service 1
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formService2}
                onChange={(e) => setFormService2(e.target.checked)}
                className="h-4 w-4"
              />
              Service 2
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ParticipationVerificationsPage;
