import React, { useState, useMemo, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import type { Partner, PartnerType } from '../services/partnersService';
import { listPartners, createPartner, deletePartner, seedPartnersIfEmpty } from '../services/partnersService';

// Using Partner and PartnerType from service for single source of truth

const PartnerManagementPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);

  const [activeTab, setActiveTab] = useState<PartnerType | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({ fullName: '', email: '', type: 'formateur' as PartnerType });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPartners = useMemo(() => {
    if (activeTab === 'all') return partners;
    return partners.filter(p => p.type === activeTab);
  }, [partners, activeTab]);

  useEffect(() => {
    seedPartnersIfEmpty();
    setPartners(listPartners());
  }, []);

  const refresh = () => setPartners(listPartners());

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    createPartner({ fullName: newPartner.fullName, email: newPartner.email, type: newPartner.type });
    refresh();
    setIsModalOpen(false);
    setNewPartner({ fullName: '', email: '', type: 'formateur' as PartnerType });
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce partenaire ?')) {
      deletePartner(id);
      refresh();
    }
  };

  const getBadgeColor = (type: PartnerType) => {
    switch (type) {
      case 'formateur': return 'bg-blue-100 text-blue-800';
      case 'freelancer': return 'bg-green-100 text-green-800';
      case 'commercial': return 'bg-yellow-100 text-yellow-800';
      case 'entreprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs: { id: PartnerType | 'all'; name: string }[] = [
    { id: 'all', name: 'Tous les Partenaires' },
    { id: 'formateur', name: 'Formateurs' },
    { id: 'freelancer', name: 'Freelancers' },
    { id: 'commercial', name: 'Commerciaux' },
    { id: 'entreprise', name: 'Entreprises' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Accès Partenaires</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter un Partenaire
        </button>
      </div>

      {/* Tabs for filtering */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${ 
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Partners Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom Complet</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPartners.map(partner => (
              <tr key={partner.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                  <div className="flex items-center gap-2">
                    <span>{partner.id}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(partner.id);
                          setCopiedId(partner.id);
                          setTimeout(() => setCopiedId(null), 1200);
                        } catch (err) {
                          // Clipboard API may be unavailable in some contexts
                          console.warn('Copy failed', err);
                        }
                      }}
                      title="Copier l'ID"
                      className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                    {copiedId === partner.id && (
                      <span className="text-xs text-green-600">Copié</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{partner.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{partner.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(partner.type)}`}>
                    {partner.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                  <button onClick={() => handleDelete(partner.id)} className="text-red-600 hover:text-red-900 ml-4"><TrashIcon className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Ajouter un nouveau partenaire</h2>
            <form onSubmit={handleAddPartner}>
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nom Complet</label>
                <input type="text" name="fullName" id="fullName" value={newPartner.fullName} onChange={e => setNewPartner({...newPartner, fullName: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" value={newPartner.email} onChange={e => setNewPartner({...newPartner, email: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div className="mb-6">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de Partenaire</label>
                <select id="type" name="type" value={newPartner.type} onChange={e => setNewPartner({...newPartner, type: e.target.value as PartnerType})} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="formateur">Formateur</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="commercial">Commercial</option>
                  <option value="entreprise">Entreprise</option>
                </select>
              </div>
              <div className="flex items-center justify-end space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Annuler</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerManagementPage;
