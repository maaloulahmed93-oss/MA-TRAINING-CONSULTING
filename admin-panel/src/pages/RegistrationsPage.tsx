import React, { useEffect, useState } from 'react';
import { getRegistrations, type Registration as LocalRegistration } from '../services/registrationService';
import { registrationApiService, type Registration, type RegistrationFilters } from '../services/registrationApiService';
import { FunnelIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';

const RegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [localRegistrations, setLocalRegistrations] = useState<LocalRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'program' | 'pack'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [query, setQuery] = useState('');

  // Fetch registrations from API
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters: RegistrationFilters = {
        page: 1,
        limit: 100
      };
      
      if (typeFilter !== 'all') filters.type = typeFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (query.trim()) filters.search = query.trim();
      
      const response = await registrationApiService.getRegistrations(filters);
      
      if (response.success) {
        setRegistrations(response.data);
        console.log(`✅ Loaded ${response.data.length} registrations from API`);
      } else {
        throw new Error('Failed to fetch registrations');
      }
    } catch (err: any) {
      console.error('❌ Error fetching registrations:', err);
      setError('Erreur lors du chargement des inscriptions');
      
      // Fallback to localStorage
      setLocalRegistrations(getRegistrations());
      console.log('📦 Using localStorage fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [typeFilter, statusFilter, query]);

  // Combined registrations (API + localStorage)
  const allRegistrations = [...registrations, ...localRegistrations];
  
  // Remove duplicates based on email and itemName
  const uniqueRegistrations = allRegistrations.filter((reg, index, arr) => {
    return arr.findIndex(r => 
      r.user.email === reg.user.email && 
      r.itemName === reg.itemName
    ) === index;
  });

  const filtered = uniqueRegistrations;

  // CSV export of filtered rows
  const toCsvValue = (val: string | number | undefined | null) => {
    const s = val === undefined || val === null ? '' : String(val);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    const escaped = s.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const handleExportCsv = () => {
    const headers = [
      'Type',
      'Item',
      'Prénom',
      'Nom',
      'Email',
      'Prix',
      'Devise',
      'Session/Téléphone',
      'Statut',
      'Horodatage',
      'ID',
    ];
    const rows = filtered.map(r => {
      const isProgram = r.type === 'program';
      const sessionOrPhone = isProgram 
        ? ('sessionId' in r ? r.sessionId : 'N/A')
        : ('phone' in r.user ? r.user.phone : 'N/A');
      const timestamp = 'submittedAt' in r ? r.submittedAt : ('timestamp' in r ? (r as any).timestamp : new Date().toISOString());
      const id = '_id' in r ? r._id : ('id' in r ? (r as any).id : 'N/A');
      const status = 'status' in r ? r.status : 'pending';
      
      return [
        isProgram ? 'Programme' : 'Pack',
        r.itemName,
        r.user.firstName,
        r.user.lastName,
        r.user.email,
        r.price ?? '',
        r.currency ?? '',
        sessionOrPhone,
        status,
        new Date(timestamp).toISOString(),
        id,
      ];
    });

    const csv = [headers, ...rows]
      .map(cols => cols.map(toCsvValue).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.href = url;
    a.download = `registrations-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Update registration status
  const handleStatusUpdate = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      await registrationApiService.updateRegistration(id, { status });
      fetchRegistrations(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Delete registration
  const handleDeleteRegistration = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'inscription de ${name} ?\n\nCette action est irréversible.`)) {
      try {
        await registrationApiService.deleteRegistration(id);
        fetchRegistrations(); // Refresh data
        console.log(`✅ Inscription ${id} supprimée avec succès`);
      } catch (error) {
        console.error('Error deleting registration:', error);
        alert('Erreur lors de la suppression de l\'inscription');
      }
    }
  };

  // Delete all test registrations
  const handleDeleteAllTestRegistrations = async () => {
    const testEmails = [
      'ahmed.benali@example.com',
      'fatma.trabelsi@example.com',
      'mia@gmail.com',
      'gaxiges405@cspaus.com',
      'test@example.com'
    ];
    
    const testRegistrations = registrations.filter(r => 
      testEmails.includes(r.user.email.toLowerCase()) ||
      r.user.firstName.toLowerCase().includes('test') ||
      r.user.lastName.toLowerCase().includes('test') ||
      r.itemName.toLowerCase().includes('test')
    );

    if (testRegistrations.length === 0) {
      alert('Aucune inscription de test trouvée');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${testRegistrations.length} inscription(s) de test ?\n\nCette action est irréversible.`)) {
      try {
        let deleted = 0;
        for (const reg of testRegistrations) {
          try {
            await registrationApiService.deleteRegistration(reg._id);
            deleted++;
          } catch (error) {
            console.error(`Erreur suppression ${reg._id}:`, error);
          }
        }
        
        fetchRegistrations(); // Refresh data
        alert(`✅ ${deleted} inscription(s) de test supprimée(s) avec succès`);
      } catch (error) {
        console.error('Error deleting test registrations:', error);
        alert('Erreur lors de la suppression des inscriptions de test');
      }
    }
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-50' };
      case 'cancelled':
        return { icon: XCircleIcon, color: 'text-red-600', bg: 'bg-red-50' };
      default:
        return { icon: ClockIcon, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liste d'inscriptions</h1>
          <p className="text-gray-600">Inscriptions capturées depuis les formulaires Programmes et Packs</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDeleteAllTestRegistrations}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white border border-red-600 rounded-lg shadow-sm hover:bg-red-700"
            title="Supprimer toutes les inscriptions de test"
          >
            <TrashIcon className="w-5 h-5" />
            Supprimer Tests
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
            title="Exporter la vue filtrée au format CSV"
          >
            {/* simple download glyph */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600"><path d="M12 16a1 1 0 0 1-.707-.293l-4-4a1 1 0 1 1 1.414-1.414L11 12.586V3a1 1 0 1 1 2 0v9.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4A1 1 0 0 1 12 16Z" /><path d="M5 20a2 2 0 0 1-2-2v-1a1 1 0 1 1 2 0v1h14v-1a1 1 0 1 1 2 0v1a2 2 0 0 1-2 2H5Z"/></svg>
            Exporter CSV
          </button>
          <button
            onClick={fetchRegistrations}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'program' | 'pack')}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">Tous types</option>
            <option value="program">Programmes</option>
            <option value="pack">Packs</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'confirmed' | 'cancelled')}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">Tous statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Recherche par nom ou item..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 min-w-[260px]"
        />
        <span className="text-sm text-gray-500">
          {filtered.length} résultat(s)
          {loading && ' (chargement...)'}
        </span>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Programme/Pack</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prix</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Session / Téléphone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(r => {
              const id = '_id' in r ? r._id : ('id' in r ? (r as any).id : `temp-${Date.now()}`);
              const timestamp = 'submittedAt' in r ? r.submittedAt : ('timestamp' in r ? (r as any).timestamp : new Date().toISOString());
              const status = 'status' in r ? r.status : 'pending';
              const statusDisplay = getStatusDisplay(status);
              const StatusIcon = statusDisplay.icon;
              
              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.type === 'program' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {r.type === 'program' ? 'Programme' : 'Pack'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{r.itemName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{r.user.firstName} {r.user.lastName}</td>
                  <td className="px-4 py-3 text-sm text-blue-700"><a href={`mailto:${r.user.email}`}>{r.user.email}</a></td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {r.price ? `${r.price} ${r.currency || '€'}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {r.type === 'program'
                      ? ('sessionId' in r ? `Session: ${r.sessionId}` : 'N/A')
                      : ('phone' in r.user ? `Tél: ${r.user.phone}` : 'N/A')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status === 'pending' ? 'En attente' : status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    {'_id' in r && (
                      <div className="flex gap-1">
                        {status !== 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(r._id, 'confirmed')}
                            className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded hover:bg-green-50"
                            title="Confirmer"
                          >
                            ✓
                          </button>
                        )}
                        {status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusUpdate(r._id, 'cancelled')}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50"
                            title="Annuler"
                          >
                            ✗
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRegistration(r._id, `${r.user.firstName} ${r.user.lastName}`)}
                          className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50"
                          title="Supprimer définitivement"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500 text-sm">
                  {error ? 'Erreur lors du chargement' : 'Aucune inscription trouvée'}
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Chargement des inscriptions...
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationsPage;
