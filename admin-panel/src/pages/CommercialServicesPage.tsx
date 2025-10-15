import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface CommercialService {
  _id: string;
  titre: string;
  description: string;
  categorie: string;
  prixPublic: number;
  prixCommercial: number;
  commission: number;
  duree: string;
  commerciauxAutorises: Array<{
    partnerId: string;
    dateAjout: string;
  }>;
  statistiques: {
    totalVentes: number;
    chiffreAffaireGenere: number;
    commissionTotalePayee: number;
  };
  isActive: boolean;
}

interface Commercial {
  partnerId: string;
  fullName: string;
  email: string;
  niveau: number;
}

const CommercialServicesPage: React.FC = () => {
  const [services, setServices] = useState<CommercialService[]>([]);
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    commercialId: ''
  });

  useEffect(() => {
    loadServices();
    loadCommercials();
  }, []);

  const loadServices = async () => {
    console.log('🔄 Loading services...');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/commercial-services`);
      const result = await response.json();
      console.log('📡 API Response:', result);
      
      if (result.success && Array.isArray(result.data)) {
        console.log(`✅ ${result.data.length} services loaded successfully`);
        setServices(result.data);
        setError(null);
      } else {
        console.error('❌ Invalid response format:', result);
        setError('Format de réponse invalide');
        setServices([]);
      }
    } catch (error) {
      console.error('❌ Load error:', error);
      setError('Erreur de connexion au serveur');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCommercials = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/partners?type=commercial`);
      const result = await response.json();
      if (result.success) {
        setCommercials(result.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement commerciaux:', error);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convertir les valeurs numériques
      const serviceData = {
        ...serviceForm,
        prixPublic: Number(serviceForm.prixPublic) || 0,
        prixCommercial: Number(serviceForm.prixCommercial) || 0,
        commission: Number(serviceForm.commission) || 0
      };

      const response = await fetch(`${API_BASE_URL}/commercial-services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Service créé avec succès:', result.data);
        setSuccess('Service créé avec succès!');
        setShowAddForm(false);
        setServiceForm({
          titre: '',
          description: '',
          categorie: '',
          prixPublic: '',
          prixCommercial: '',
          commission: '',
          duree: ''
        });
        console.log('🔄 Appel loadServices() après création...');
        await loadServices();
        console.log('✅ loadServices() terminé après création');
      } else {
        console.error('❌ Création service échouée:', result.message);
        setError(result.message || 'Erreur lors de la création');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = (service: any) => {
    // TODO: Implement edit functionality
    console.log('Edit service:', service);
    alert(`Fonctionnalité d'édition pour "${service.titre}" à implémenter`);
  };

  const handleDeleteService = async (serviceId: string, serviceTitle: string) => {
    console.log('🗑️ Delete initiated:', { serviceId, serviceTitle });
    
    const confirmed = confirm(`Supprimer "${serviceTitle}" ?\n\nCette action est irréversible.`);
    if (!confirmed) {
      console.log('❌ Delete cancelled by user');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`📡 DELETE: /api/commercial-services/${serviceId}`);
      
      const response = await fetch(`${API_BASE_URL}/commercial-services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      console.log('📡 Delete response:', result);
      
      if (response.ok && result.success) {
        console.log(`✅ Service "${serviceTitle}" deleted successfully`);
        setSuccess(`Service "${serviceTitle}" supprimé avec succès!`);
        
        // Immediate UI update + API refresh for consistency
        setServices(prev => prev.filter(s => s._id !== serviceId));
        await loadServices();
      } else {
        const errorMsg = result.message || `Erreur ${response.status}`;
        console.error('❌ Delete failed:', errorMsg);
        setError(`Erreur lors de la suppression: ${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 🔍 DEBUG: Log form data
    console.log('🔍 Assignment Form Data:', assignForm);
    console.log('🔍 serviceId:', assignForm.serviceId);
    console.log('🔍 commercialId:', assignForm.commercialId);

    // Validation côté client
    if (!assignForm.serviceId || !assignForm.commercialId) {
      setError('Veuillez sélectionner un service et un commercial');
      setLoading(false);
      return;
    }

    try {
      const requestBody = {
        serviceId: assignForm.serviceId,
        partnerId: assignForm.commercialId
      };
      
      console.log('📡 Sending request:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/commercial-new/admin/assign-service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Service assigné avec succès!');
        setAssignForm({
          serviceId: '',
          commercialId: ''
        });
        loadServices();
      } else {
        setError(result.message || 'Erreur lors de l\'assignation');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Debug: Log services state on every render
  console.log('🎨 Render - services.length:', services?.length || 0);
  console.log('🎨 Render - services:', services || []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion des Services Commerciaux
        </h1>
        <p className="text-gray-600">
          Créez et assignez des services aux commerciaux
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nouveau Service
        </button>
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white rounded-xl shadow-lg p-6 border"
        >
          <h3 className="text-lg font-semibold mb-4">Créer un Nouveau Service</h3>
          
          <form onSubmit={handleCreateService} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du Service
                </label>
                <input
                  type="text"
                  value={serviceForm.titre}
                  onChange={(e) => setServiceForm({ ...serviceForm, titre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={serviceForm.categorie}
                  onChange={(e) => setServiceForm({ ...serviceForm, categorie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix Public (€)
                </label>
                <input
                  type="number"
                  value={serviceForm.prixPublic}
                  onChange={(e) => setServiceForm({ ...serviceForm, prixPublic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix Commercial (€)
                </label>
                <input
                  type="number"
                  value={serviceForm.prixCommercial}
                  onChange={(e) => setServiceForm({ ...serviceForm, prixCommercial: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission (€)
                </label>
                <input
                  type="number"
                  value={serviceForm.commission}
                  onChange={(e) => setServiceForm({ ...serviceForm, commission: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée
                </label>
                <input
                  type="text"
                  value={serviceForm.duree}
                  onChange={(e) => setServiceForm({ ...serviceForm, duree: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 3 mois, 6 semaines..."
                />
              </div>

            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer Service'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Services List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Services Disponibles</h3>
            <p className="text-xs text-gray-500">
              {services.length} services disponibles
            </p>
          </div>
          <button
            onClick={async () => {
              console.log('🔄 Force Refresh clicked');
              console.log('🔄 Current services before refresh:', services);
              console.log('🔄 Services length before:', services.length);
              
              try {
                await loadServices();
                console.log('🔄 loadServices completed');
                console.log('🔄 Services after loadServices:', services);
              } catch (error) {
                console.error('🔄 loadServices error:', error);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            🔄 Actualiser ({services.length})
          </button>
        </div>
        
        {services.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun service créé</p>
            <p className="text-sm">Créez votre premier service pour commencer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Commerciaux
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statistiques
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {service.titre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.categorie}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>Public: {service.prixPublic}€</div>
                      <div className="text-gray-500">Commercial: {service.prixCommercial}€</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      {service.commission}€
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <UserGroupIcon className="w-4 h-4 mr-1" />
                        {service.commerciauxAutorises.length}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>Ventes: {service.statistiques.totalVentes}</div>
                      <div>CA: {service.statistiques.chiffreAffaireGenere}€</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditService(service)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Modifier le service"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteService(service._id, service.titre)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Supprimer le service"
                          disabled={loading}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Service Form */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Assigner un Service à un Commercial</h3>
          <button
            type="button"
            onClick={async () => {
              console.log('🔄 Refresh Services for Assignment clicked');
              console.log('🔄 Services before assignment refresh:', services.length);
              console.log('🔄 Commercials before assignment refresh:', commercials.length);
              
              try {
                await loadServices();
                await loadCommercials();
                console.log('🔄 Assignment refresh completed');
                console.log('🔄 Services after assignment refresh:', services.length);
                console.log('🔄 Commercials after assignment refresh:', commercials.length);
              } catch (error) {
                console.error('🔄 Assignment refresh error:', error);
              }
            }}
            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            🔄 Actualiser Listes (S:{services.length} C:{commercials.length})
          </button>
        </div>
        
        <form onSubmit={handleAssignService} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service
              </label>
              <select
                value={assignForm.serviceId}
                onChange={(e) => setAssignForm({ ...assignForm, serviceId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">
                  Sélectionner un service ({services.length} disponibles)
                </option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.titre} - {service.commission}€
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commercial
              </label>
              <select
                value={assignForm.commercialId}
                onChange={(e) => setAssignForm({ ...assignForm, commercialId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un commercial ({commercials.length} disponibles)</option>
                {commercials.map((commercial) => (
                  <option key={commercial.partnerId} value={commercial.partnerId}>
                    {commercial.fullName} ({commercial.partnerId})
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Assignation...' : 'Assigner Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommercialServicesPage;
