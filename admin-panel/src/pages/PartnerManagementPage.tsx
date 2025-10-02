import React, { useState, useMemo, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import type { PartnerType } from '../services/partnersService';
import partnersApiService, { type ApiPartner } from '../services/partnersApiService';

// Using ApiPartner and PartnerType from service for single source of truth

const PartnerManagementPage: React.FC = () => {
  const [partners, setPartners] = useState<ApiPartner[]>([]);
  const [activeTab, setActiveTab] = useState<PartnerType | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({ fullName: '', email: '', type: 'formateur' as PartnerType });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredPartners = useMemo(() => {
    if (activeTab === 'all') return partners;
    return partners.filter(p => p.type === activeTab);
  }, [partners, activeTab]);

  useEffect(() => {
    loadPartners();
  }, [activeTab]);

  const loadPartners = async () => {
    try {
      const partnersData = await partnersApiService.getAllPartners(activeTab === 'all' ? undefined : activeTab);
      setPartners(partnersData);
    } catch (error) {
      console.error('Erreur lors du chargement des partenaires:', error);
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    // Validation côté client
    if (!newPartner.fullName.trim()) {
      setError('Le nom complet est requis');
      setIsLoading(false);
      return;
    }
    
    if (!newPartner.email.trim()) {
      setError('L\'email est requis');
      setIsLoading(false);
      return;
    }
    
    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newPartner.email.trim())) {
      setError('Format d\'email invalide');
      setIsLoading(false);
      return;
    }
    
    // Vérifier si l'email existe déjà côté client
    const existingPartner = partners.find(p => p.email.toLowerCase() === newPartner.email.toLowerCase());
    if (existingPartner) {
      setError(`Un partenaire avec cet email existe déjà: ${existingPartner.fullName} (${existingPartner.partnerId})`);
      setIsLoading(false);
      return;
    }
    
    try {
      await partnersApiService.createPartner({ 
        fullName: newPartner.fullName.trim(), 
        email: newPartner.email.toLowerCase().trim(), 
        type: newPartner.type,
        isActive: true
      });
      await loadPartners();
      setIsModalOpen(false);
      setNewPartner({ fullName: '', email: '', type: 'formateur' as PartnerType });
      setSuccess(`Partenaire ${newPartner.type} créé avec succès!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Erreur lors de la création du partenaire:', error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = 'Erreur lors de la création du partenaire';
      
      if (error.message) {
        if (error.message.includes('email existe déjà')) {
          errorMessage = 'Un partenaire avec cet email existe déjà dans la base de données';
        } else if (error.message.includes('validation')) {
          errorMessage = 'Données invalides. Vérifiez les champs requis';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce partenaire ?')) {
      try {
        await partnersApiService.deletePartner(id);
        await loadPartners();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du partenaire');
      }
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

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccess(null)}
                className="inline-flex text-green-400 hover:text-green-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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
              <tr key={partner.partnerId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                  <div className="flex items-center gap-2">
                    <span>{partner.partnerId}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(partner.partnerId);
                          setCopiedId(partner.partnerId);
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
                    {copiedId === partner.partnerId && (
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
                  <button onClick={() => handleDelete(partner.partnerId)} className="text-red-600 hover:text-red-900 ml-4"><TrashIcon className="h-5 w-5" /></button>
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
              {/* Messages d'erreur dans le modal */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex items-center justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                    setNewPartner({ fullName: '', email: '', type: 'formateur' as PartnerType });
                  }} 
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création...
                    </>
                  ) : (
                    'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerManagementPage;
