import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  XCircleIcon,
  EyeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

interface CommercialService {
  _id: string;
  titre: string;
  description?: string;
  categorie?: string;
  prixPublic: number;
  prixCommercial: number;
  commission: number;
  duree?: string;
  commerciauxAutorises: Array<{
    partnerId: string;
    dateAjout: string;
    ajoutePar: string;
  }>;
  statistiques: {
    totalVentes: number;
    chiffreAffaireGenere: number;
    commissionTotalePayee: number;
  };
  creePar: string;
  dateCreation: string;
  isActive: boolean;
}

interface Commercial {
  partnerId: string;
  fullName: string;
  email: string;
  niveau: number;
  isActive: boolean;
}

const CommercialServicesManager: React.FC = () => {
  const [services, setServices] = useState<CommercialService[]>([]);
  const [commerciaux, setCommerciaux] = useState<Commercial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  
  // Forms
  const [serviceForm, setServiceForm] = useState({
    titre: '',
    description: '',
    categorie: '',
    prixPublic: '',
    prixCommercial: '',
    commission: '',
    duree: ''
  });
  
  const [assignForm, setAssignForm] = useState({
    serviceId: '',
    partnerId: ''
  });
  
  const [secretCode, setSecretCode] = useState('');
  const [secretAction, setSecretAction] = useState<'create' | 'assign' | null>(null);
  const [secretError, setSecretError] = useState('');

  const API_BASE = `${API_BASE_URL}/commercial-new`;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger services
      const servicesResponse = await fetch(`${API_BASE}/admin/services`);
      const servicesResult = await servicesResponse.json();
      
      if (servicesResult.success) {
        setServices(servicesResult.data);
      }
      
      // Charger commerciaux (depuis API partners)
      const commerciauxResponse = await fetch(`${API_BASE_URL}/partners`);
      const commerciauxResult = await commerciauxResponse.json();
      
      if (commerciauxResult.success) {
        const commerciauxFiltered = commerciauxResult.data.filter(
          (p: any) => p.type === 'commercial' && p.isActive
        );
        setCommerciaux(commerciauxFiltered);
      }
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSecretSubmit = async () => {
    if (secretCode !== '20388542') {
      setSecretError('Code secret incorrect');
      return;
    }
    
    setSecretError('');
    setShowSecretModal(false);
    
    if (secretAction === 'create') {
      await createService();
    } else if (secretAction === 'assign') {
      await assignService();
    }
    
    setSecretCode('');
    setSecretAction(null);
  };

  const createService = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...serviceForm,
          prixPublic: parseFloat(serviceForm.prixPublic),
          prixCommercial: parseFloat(serviceForm.prixCommercial),
          commission: parseFloat(serviceForm.commission),
          secretCode: '20388542',
          adminId: 'admin'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setShowServiceModal(false);
        setServiceForm({
          titre: '',
          description: '',
          categorie: '',
          prixPublic: '',
          prixCommercial: '',
          commission: '',
          duree: ''
        });
        loadData();
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Erreur création service:', error);
      setError('Erreur lors de la création du service');
    }
  };

  const assignService = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/assign-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...assignForm,
          secretCode: '20388542',
          adminId: 'admin'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setShowAssignModal(false);
        setAssignForm({ serviceId: '', partnerId: '' });
        loadData();
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Erreur attribution service:', error);
      setError('Erreur lors de l\'attribution du service');
    }
  };

  const handleCreateService = () => {
    setSecretAction('create');
    setShowSecretModal(true);
  };

  const handleAssignService = (serviceId: string) => {
    setAssignForm({ ...assignForm, serviceId });
    setSecretAction('assign');
    setShowSecretModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Services Commerciaux</h1>
          <p className="text-gray-600">Gérer les programmes/services disponibles pour les commerciaux</p>
        </div>
        <button
          onClick={handleCreateService}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau Service
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commerciaux
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistiques
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{service.titre}</div>
                        <div className="text-sm text-gray-500">{service.categorie}</div>
                        {service.duree && (
                          <div className="text-xs text-gray-400">{service.duree}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Public: {service.prixPublic}€
                      </div>
                      <div className="text-sm text-green-600">
                        Commercial: {service.prixCommercial}€
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {service.commission}€
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {service.commerciauxAutorises.length} commerciaux
                      </div>
                      <button
                        onClick={() => handleAssignService(service._id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Attribuer
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600">
                        <div>Ventes: {service.statistiques.totalVentes}</div>
                        <div>CA: {service.statistiques.chiffreAffaireGenere}€</div>
                        <div>Commission: {service.statistiques.commissionTotalePayee}€</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Secret Code Modal */}
      {showSecretModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <LockClosedIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Code Secret Requis
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Veuillez saisir le code secret pour continuer cette action.
                      </p>
                      <input
                        type="password"
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Code secret"
                        autoFocus
                      />
                      {secretError && (
                        <p className="mt-2 text-sm text-red-600">{secretError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSecretSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => {
                    setShowSecretModal(false);
                    setSecretCode('');
                    setSecretError('');
                    setSecretAction(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Service Creation Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Créer un Nouveau Service
                </h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre</label>
                    <input
                      type="text"
                      value={serviceForm.titre}
                      onChange={(e) => setServiceForm({ ...serviceForm, titre: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                    <input
                      type="text"
                      value={serviceForm.categorie}
                      onChange={(e) => setServiceForm({ ...serviceForm, categorie: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prix Public (€)</label>
                    <input
                      type="number"
                      value={serviceForm.prixPublic}
                      onChange={(e) => setServiceForm({ ...serviceForm, prixPublic: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prix Commercial (€)</label>
                    <input
                      type="number"
                      value={serviceForm.prixCommercial}
                      onChange={(e) => setServiceForm({ ...serviceForm, prixCommercial: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Commission (€)</label>
                    <input
                      type="number"
                      value={serviceForm.commission}
                      onChange={(e) => setServiceForm({ ...serviceForm, commission: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Durée</label>
                    <input
                      type="text"
                      value={serviceForm.duree}
                      onChange={(e) => setServiceForm({ ...serviceForm, duree: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Créer
                </button>
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Assign Service Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Attribuer Service à Commercial
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Commercial</label>
                  <select
                    value={assignForm.partnerId}
                    onChange={(e) => setAssignForm({ ...assignForm, partnerId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner un commercial</option>
                    {commerciaux.map((commercial) => (
                      <option key={commercial.partnerId} value={commercial.partnerId}>
                        {commercial.fullName} ({commercial.partnerId}) - Niveau {commercial.niveau}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Attribuer
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommercialServicesManager;
