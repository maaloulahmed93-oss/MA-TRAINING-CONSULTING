import React, { useEffect, useState } from 'react';
import { getRegistrations, type Registration, type PackRegistration } from '../services/registrationService';
import { FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const RegistrationsPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    setRegistrations(getRegistrations());
  }, [refreshKey]);

  const [typeFilter, setTypeFilter] = useState<'all' | 'program' | 'pack'>('all');
  const [query, setQuery] = useState('');

  const filtered = registrations.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        r.itemName.toLowerCase().includes(q) ||
        (r.type === 'program'
          ? `${r.user.firstName} ${r.user.lastName}`.toLowerCase().includes(q)
          : `${r.user.firstName} ${r.user.lastName}`.toLowerCase().includes(q))
      );
    }
    return true;
  });

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
      'Horodatage',
      'ID',
    ];
    const rows = filtered.map(r => {
      const isProgram = r.type === 'program';
      const sessionOrPhone = isProgram ? r.sessionId : (r as PackRegistration).user.phone;
      return [
        isProgram ? 'Programme' : 'Pack',
        r.itemName,
        r.user.firstName,
        r.user.lastName,
        r.user.email,
        r.price ?? '',
        r.currency ?? '',
        sessionOrPhone,
        new Date(r.timestamp).toISOString(),
        r.id,
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liste d'inscriptions</h1>
          <p className="text-gray-600">Inscriptions capturées depuis les formulaires Programmes et Packs</p>
        </div>
        <div className="flex gap-3">
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
            onClick={() => setRefreshKey(k => k + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-600" />
            Rafraîchir
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'program' | 'pack')}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">Tous</option>
            <option value="program">Programmes</option>
            <option value="pack">Packs</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Recherche par nom ou item..."
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Programme/Pack</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prix</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Devise</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Session / Téléphone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.type === 'program' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                    {r.type === 'program' ? 'Programme' : 'Pack'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{r.itemName}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{r.user.firstName} {r.user.lastName}</td>
                <td className="px-4 py-3 text-sm text-blue-700"><a href={`mailto:${r.user.email}`}>{r.user.email}</a></td>
                <td className="px-4 py-3 text-sm text-gray-900">{r.price ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{r.currency ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {r.type === 'program'
                    ? `Session: ${r.sessionId}`
                    : `Tél: ${(r as PackRegistration).user.phone}`}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">Aucune inscription trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationsPage;
