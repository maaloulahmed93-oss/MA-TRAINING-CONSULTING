import React, { useEffect, useState } from 'react';
import { getSubscribers, setSubscriberStatus, removeSubscriber } from '../services/newsletterService';
import newsletterApiService from '../services/newsletterApiService';
import { FunnelIcon, ArrowPathIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Unified interface for both local and API subscribers
interface UnifiedSubscriber {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  createdAt: string;
  updatedAt: string;
  source?: string;
}

const NewsletterPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');
  const [loading, setLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<UnifiedSubscriber[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try API first
      const apiHealth = await newsletterApiService.checkHealth();
      
      if (apiHealth) {
        console.log('📡 Loading newsletter data from API...');
        const response = await newsletterApiService.getSubscribers({
          status: status === 'all' ? undefined : status,
          search: query || undefined
        });
        
        if (response.success) {
          // Transform API data to unified interface
          const transformedData: UnifiedSubscriber[] = response.data.map(item => ({
            id: item._id,
            email: item.email,
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            source: item.source
          }));
          
          setData(transformedData);
          setApiAvailable(true);
          console.log(`✅ Loaded ${response.data.length} subscribers from API`);
        } else {
          throw new Error('API response not successful');
        }
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.log('⚠️ API failed, using localStorage fallback:', error);
      setApiAvailable(false);
      setError('API non disponible - utilisation des données locales');
      
      // Fallback to localStorage - transform to unified interface
      const localData = getSubscribers();
      const transformedLocalData: UnifiedSubscriber[] = localData.map(item => ({
        id: item.id,
        email: item.email,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        source: 'localStorage'
      }));
      setData(transformedLocalData);
      console.log(`📦 Loaded ${localData.length} subscribers from localStorage`);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const filtered = data.filter(s => {
    if (status !== 'all' && s.status !== status) return false;
    if (query) {
      const q = query.toLowerCase();
      return s.email.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    }
    return true;
  });

  const onToggle = async (s: UnifiedSubscriber) => {
    const next = s.status === 'subscribed' ? 'unsubscribed' : 'subscribed';
    
    try {
      if (apiAvailable) {
        await newsletterApiService.updateSubscriberStatus(s.id, next);
        console.log(`✅ Updated ${s.email} status to ${next} via API`);
      } else {
        setSubscriberStatus(s.id, next);
        console.log(`✅ Updated ${s.email} status to ${next} via localStorage`);
      }
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error updating status:', error);
      // Fallback to localStorage
      setSubscriberStatus(s.id, next);
      setRefreshKey(k => k + 1);
    }
  };

  const onRemove = async (s: UnifiedSubscriber) => {
    if (!confirm(`Supprimer ${s.email} ?`)) return;
    
    try {
      if (apiAvailable) {
        await newsletterApiService.deleteSubscriber(s.id);
        console.log(`✅ Deleted ${s.email} via API`);
      } else {
        removeSubscriber(s.id);
        console.log(`✅ Deleted ${s.email} via localStorage`);
      }
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      // Fallback to localStorage
      removeSubscriber(s.id);
      setRefreshKey(k => k + 1);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-600">Gestion des abonnés (Subscribed / Unsubscribed)</p>
          {!apiAvailable && (
            <div className="flex items-center gap-2 mt-2 text-amber-600">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span className="text-sm">Mode hors ligne - données locales</span>
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600 mt-1">{error}</div>
          )}
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Chargement...' : 'Rafraîchir'}
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
                    <span className={`status-${s.status === 'subscribed' ? 'subscribed' : 'unsubscribed'}`}>{s.status}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleString('fr-FR')}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.source || 'N/A'}</td>
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
