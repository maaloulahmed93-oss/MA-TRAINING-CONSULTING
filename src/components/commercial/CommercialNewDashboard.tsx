import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  TrophyIcon,
  PlusIcon,
  ArrowUpIcon,
  GiftIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { commercialNewApiService, CommercialNewData, CommercialService, NIVEAUX_INFO } from '../../services/commercialNewApiService';
import SalesManager from './SalesManager';
import ClientManager from './ClientManager';

interface CommercialNewDashboardProps {
  commercialData: CommercialNewData;
  onDataUpdate: (data: CommercialNewData) => void;
}

const CommercialNewDashboard: React.FC<CommercialNewDashboardProps> = ({
  commercialData,
  onDataUpdate
}) => {
  const [services, setServices] = useState<CommercialService[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Forms
  const [venteForm, setVenteForm] = useState({
    serviceId: '',
    client: '',
    clientEmail: '',
    montant: '',
    methodePaiement: ''
  });
  
  const [clientForm, setClientForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    tel: '',
    programme: '',
    montant: ''
  });

  const niveauInfo = NIVEAUX_INFO[commercialData.niveau];
  const progression = commercialNewApiService.calculerProgressionNiveau(commercialData.points, commercialData.niveau);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'ventes', name: 'Ventes', icon: CurrencyDollarIcon },
    { id: 'clients', name: 'Clients', icon: UserGroupIcon }
  ];

  const handleDataRefresh = async () => {
    // Refresh commercial data
    const result = await commercialNewApiService.getCommercialData(commercialData.partnerId);
    if (result.success && result.data) {
      onDataUpdate(result.data);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const result = await commercialNewApiService.getServices(commercialData.partnerId);
    if (result.success && result.data) {
      setServices(result.data);
    }
  };

  const handleVenteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const service = services.find(s => s._id === venteForm.serviceId);
      if (!service) return;

      const result = await commercialNewApiService.ajouterVente(commercialData.partnerId, {
        serviceId: venteForm.serviceId,
        client: venteForm.client,
        clientEmail: venteForm.clientEmail,
        montant: parseFloat(venteForm.montant),
        commission: service.commission,
        methodePaiement: venteForm.methodePaiement
      });

      if (result.success) {
        // Recharger données
        const updatedData = await commercialNewApiService.getCommercialData(commercialData.partnerId);
        if (updatedData.success && updatedData.data) {
          onDataUpdate(updatedData.data);
        }
        
        // Reset form
        setVenteForm({
          serviceId: '',
          client: '',
          clientEmail: '',
          montant: '',
          methodePaiement: ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commercialData.niveau < 2) return;
    
    setLoading(true);
    
    try {
      const result = await commercialNewApiService.ajouterClient(commercialData.partnerId, {
        nom: clientForm.nom,
        prenom: clientForm.prenom,
        email: clientForm.email,
        tel: clientForm.tel,
        programme: clientForm.programme,
        montant: parseFloat(clientForm.montant)
      });

      if (result.success) {
        const updatedData = await commercialNewApiService.getCommercialData(commercialData.partnerId);
        if (updatedData.success && updatedData.data) {
          onDataUpdate(updatedData.data);
        }
        
        setClientForm({
          nom: '',
          prenom: '',
          email: '',
          tel: '',
          programme: '',
          montant: ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransfert = async () => {
    if (commercialData.niveau !== 2 || commercialData.chiffreAffaires < 500) return;
    
    setLoading(true);
    
    try {
      const result = await commercialNewApiService.effectuerTransfert(commercialData.partnerId, 500);
      
      if (result.success) {
        const updatedData = await commercialNewApiService.getCommercialData(commercialData.partnerId);
        if (updatedData.success && updatedData.data) {
          onDataUpdate(updatedData.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Header avec niveau et progression */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{commercialData.fullName}</h2>
            <p className="opacity-90">ID: {commercialData.partnerId}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white text-blue-600">
              <TrophyIcon className="w-4 h-4 mr-2" />
              Niveau {commercialData.niveau}: {niveauInfo.nom}
            </div>
          </div>
        </div>
        
        {/* Barre de progression */}
        {commercialData.niveau < 3 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm opacity-90 mb-2">
              <span>Progression vers niveau suivant</span>
              <span>{progression.pourcentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progression.pourcentage}%` }}
              ></div>
            </div>
            <p className="text-xs opacity-75 mt-1">{niveauInfo.conditionSuivante}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {['dashboard', 'ventes', 'clients', 'transfert'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'dashboard' && 'Dashboard'}
            {tab === 'ventes' && 'Ventes'}
            {tab === 'clients' && 'Clients'}
            {tab === 'transfert' && 'Transfert'}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Points</p>
                <p className="text-2xl font-bold text-gray-900">{commercialData.points}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold text-gray-900">{commercialData.chiffreAffaires}€</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Commission</p>
                <p className="text-2xl font-bold text-gray-900">{commercialData.commissionTotale}€</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Ventes</p>
                <p className="text-2xl font-bold text-gray-900">{commercialData.ventes.length}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Ventes Tab */}
      {activeTab === 'ventes' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Ajouter une Vente</h3>
          
          <form onSubmit={handleVenteSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select
                  value={venteForm.serviceId}
                  onChange={(e) => setVenteForm({ ...venteForm, serviceId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Sélectionner un service</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.titre} - {service.prixCommercial}€ (Commission: {service.commission}€)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <input
                  type="text"
                  value={venteForm.client}
                  onChange={(e) => setVenteForm({ ...venteForm, client: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Client</label>
                <input
                  type="email"
                  value={venteForm.clientEmail}
                  onChange={(e) => setVenteForm({ ...venteForm, clientEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
                <input
                  type="number"
                  value={venteForm.montant}
                  onChange={(e) => setVenteForm({ ...venteForm, montant: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de Paiement</label>
                <input
                  type="text"
                  value={venteForm.methodePaiement}
                  onChange={(e) => setVenteForm({ ...venteForm, methodePaiement: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {loading ? 'Ajout...' : 'Ajouter Vente (+5 points)'}
            </button>
          </form>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          {commercialData.niveau >= 2 ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Gestion des Clients</h3>
              
              <form onSubmit={handleClientSubmit} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={clientForm.nom}
                      onChange={(e) => setClientForm({ ...clientForm, nom: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={clientForm.prenom}
                      onChange={(e) => setClientForm({ ...clientForm, prenom: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={clientForm.tel}
                      onChange={(e) => setClientForm({ ...clientForm, tel: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                    <input
                      type="text"
                      value={clientForm.programme}
                      onChange={(e) => setClientForm({ ...clientForm, programme: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
                    <input
                      type="number"
                      value={clientForm.montant}
                      onChange={(e) => setClientForm({ ...clientForm, montant: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  {loading ? 'Ajout...' : 'Ajouter Client'}
                </button>
              </form>
              
              {/* Liste des clients */}
              <div className="space-y-2">
                <h4 className="font-medium">Mes Clients ({commercialData.clients.length})</h4>
                {commercialData.clients.map((client, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{client.nom} {client.prenom}</p>
                      <p className="text-sm text-gray-600">{client.email} • {client.programme}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{client.montant}€</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        client.status === 'payé' ? 'bg-green-100 text-green-800' :
                        client.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Gestion des clients disponible à partir du niveau 2</p>
              <p className="text-sm text-gray-400">Il vous faut {1000 - commercialData.points} points de plus</p>
            </div>
          )}
        </div>
      )}

      {/* Transfert Tab */}
      {activeTab === 'transfert' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          {commercialData.niveau === 2 ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Transfert vers Entreprise</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  <strong>Chiffre d'affaires actuel:</strong> {commercialData.chiffreAffaires}€
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  Minimum requis pour transfert: 500€
                </p>
              </div>
              
              {commercialData.chiffreAffaires >= 500 ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">✅ Vous pouvez effectuer un transfert!</p>
                    <p className="text-green-600 text-sm">
                      Le transfert de 500€ vous fera passer au niveau 3 (Partenaire Officiel)
                    </p>
                  </div>
                  
                  <button
                    onClick={handleTransfert}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  >
                    <ArrowUpIcon className="w-5 h-5 mr-2" />
                    {loading ? 'Transfert...' : 'Transférer 500€ → Niveau 3'}
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    Il vous faut encore {500 - commercialData.chiffreAffaires}€ de chiffre d'affaires pour effectuer un transfert.
                  </p>
                </div>
              )}
            </>
          ) : commercialData.niveau === 3 ? (
            <div className="text-center py-8">
              <GiftIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Partenaire Officiel</h3>
              <p className="text-purple-700 mb-4">
                Vous recevez 20% de commission directe sur chaque vente + 5€/mois automatique
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-800">
                  <strong>Cadeaux mensuels reçus:</strong> {commercialData.cadeauxMensuels.length}
                </p>
                <p className="text-purple-600 text-sm">
                  Total cadeaux: {commercialData.cadeauxMensuels.length * 5}€
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BanknotesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Transfert disponible à partir du niveau 2</p>
              <p className="text-sm text-gray-400">Il vous faut {1000 - commercialData.points} points de plus</p>
            </div>
          )}
        </div>
      )}

      {/* Ventes Tab */}
      {activeTab === 'ventes' && (
        <SalesManager
          partnerId={commercialData.partnerId}
          services={services}
          ventes={commercialData.ventes}
          onVenteAdded={handleDataRefresh}
        />
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <ClientManager
          partnerId={commercialData.partnerId}
          clients={commercialData.clients}
          onClientAdded={handleDataRefresh}
        />
      )}
    </div>
  );
};

export default CommercialNewDashboard;
