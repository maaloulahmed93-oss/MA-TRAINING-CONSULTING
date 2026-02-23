import React, { useEffect, useState } from 'react';
import {
  createFinishSlot,
  deleteFinishSlot,
  listAdminFinishSlots,
  Service2FinishSlotDto,
} from '../services/service2ApiService';

const Service2FinishSlotsPage: React.FC = () => {
  const [slots, setSlots] = useState<Service2FinishSlotDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [assignedAccountId, setAssignedAccountId] = useState('');

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await listAdminFinishSlots();
      setSlots(list);
    } catch (e: any) {
      setError(String(e?.message || 'Erreur de chargement'));
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startAt) {
      alert('StartAt obligatoire');
      return;
    }

    if (!assignedAccountId.trim()) {
      alert('Compte (PRT-xxx) obligatoire');
      return;
    }

    try {
      await createFinishSlot({
        title: title.trim(),
        startAt,
        endAt: endAt || undefined,
        isActive: true,
        assignedAccountId: assignedAccountId.trim(),
      });
      setTitle('');
      setStartAt('');
      setEndAt('');
      setAssignedAccountId('');
      await refresh();
    } catch (err: any) {
      alert(String(err?.message || 'Erreur création slot'));
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce slot ?')) return;
    try {
      await deleteFinishSlot(id);
      await refresh();
    } catch (err: any) {
      alert(String(err?.message || 'Erreur suppression'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Service 2 — Finish Slots</h1>
          <p className="text-sm text-gray-600">Slots (عرض فقط للمشارك) — Admin يضيف/يحذف.</p>
        </div>

        <form onSubmit={onCreate} className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Compte (PRT-xxx)</label>
            <input
              value={assignedAccountId}
              onChange={(e) => setAssignedAccountId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Ex: PRT-045"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Optionnel"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Start</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">End</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Compte</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">Chargement...</td>
                </tr>
              ) : slots.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">Aucun slot.</td>
                </tr>
              ) : (
                slots.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{s.assignedAccountId || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.title || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{s.startAt ? new Date(s.startAt).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{s.endAt ? new Date(s.endAt).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(s._id)}
                        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Service2FinishSlotsPage;
