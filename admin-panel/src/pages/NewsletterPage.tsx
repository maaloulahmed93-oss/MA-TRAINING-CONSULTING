import React, { useEffect, useState } from 'react';
import { getSubscribers, setSubscriberStatus, removeSubscriber, type Subscriber } from '../services/newsletterService';
import { FunnelIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';

const NewsletterPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');

  const [data, setData] = useState<Subscriber[]>([]);

  useEffect(() => {
    setData(getSubscribers());
  }, [refreshKey]);

  const filtered = data.filter(s => {
    if (status !== 'all' && s.status !== status) return false;
    if (query) {
      const q = query.toLowerCase();
      return s.email.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    }
    return true;
  });

  const onToggle = (s: Subscriber) => {
    const next = s.status === 'subscribed' ? 'unsubscribed' : 'subscribed';
    setSubscriberStatus(s.id, next);
    setRefreshKey(k => k + 1);
  };

  const onRemove = (s: Subscriber) => {
    if (!confirm(`Supprimer ${s.email} ?`)) return;
    removeSubscriber(s.id);
    setRefreshKey(k => k + 1);
  };

  useEffect(() => {
    // initial load
    setData(getSubscribers());
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-600">Gestion des abonnés (Subscribed / Unsubscribed)</p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
        >
          <ArrowPathIcon className="w-5 h-5 text-gray-600" />
          Rafraîchir
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | 'subscribed' | 'unsubscribed')}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">Tous</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Recherche par email ou ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 min-w-[260px]"
        />
        <span className="text-sm text-gray-500">{filtered.length} résultat(s)</span>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Créé</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">MAJ</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{s.email}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.status === 'subscribed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.updatedAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onToggle(s)}
                      className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                    >
                      {s.status === 'subscribed' ? 'Unsubscribe' : 'Subscribe'}
                    </button>
                    <button
                      onClick={() => onRemove(s)}
                      className="px-2 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                      title="Supprimer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">Aucun abonné trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewsletterPage;
