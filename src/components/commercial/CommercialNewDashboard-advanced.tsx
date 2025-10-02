import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  TrophyIcon,
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

  const niveauInfo = NIVEAUX_INFO[commercialData.niveau] || NIVEAUX_INFO[1];
  const progression = commercialNewApiService.calculerProgressionNiveau(commercialData.points || 0, commercialData.niveau || 1);

  const handleDataRefresh = async () => {
    const result = await commercialNewApiService.getCommercialData(commercialData.partnerId);
    if (result.success && result.data) {
      onDataUpdate(result.data);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    console.log(`🔄 loadServices() appelée pour: ${commercialData.partnerId}`);
    const result = await commercialNewApiService.getServices(commercialData.partnerId);
    console.log('📡 Result loadServices:', result);
    
    if (result.success && result.data) {
      console.log(`✅ Services chargés: ${result.data.length}`);
      setServices(result.data);
    } else {
      console.log('⚠️ Aucun service trouvé ou erreur');
      setServices([]);
    }
  };

  const handleTransfert = async () => {
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

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'ventes', name: 'Ventes', icon: CurrencyDollarIcon },
    { id: 'clients', name: 'Clients', icon: UserGroupIcon }
  ];

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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
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
                  Niveau {commercialData.niveau || 1}: {niveauInfo.nom}
                </div>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progression vers niveau {(commercialData.niveau || 1) + 1}</span>
                <span>{progression.pourcentage}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progression.pourcentage}%` }}
                ></div>
              </div>
              {(commercialData.niveau || 1) < 3 && (
                <p className="text-sm mt-2 opacity-90">
                  {progression.pointsManquants > 0 ? `${progression.pointsManquants} points manquants` : 'Objectif atteint!'}
                </p>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <TrophyIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Points</p>
                  <p className="text-2xl font-bold text-gray-900">{commercialData.points || 0}</p>
                  <p className="text-xs text-gray-500">+{commercialData.pointsHistoriques || 0} historiques</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Chiffre d'Affaires</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {commercialNewApiService.formatCurrency(commercialData.chiffreAffaires || 0)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <BanknotesIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Commission Totale</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {commercialNewApiService.formatCurrency(commercialData.commissionTotale || 0)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <UserGroupIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Ventes</p>
                  <p className="text-2xl font-bold text-gray-900">{commercialData.ventes?.length || 0}</p>
                  <p className="text-xs text-gray-500">{commercialData.clients?.length || 0} clients</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Niveau Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Informations sur votre niveau</h3>
            <div className={`bg-${niveauInfo.couleur}-50 border border-${niveauInfo.couleur}-200 rounded-lg p-4`}>
              <h4 className={`text-${niveauInfo.couleur}-900 font-semibold mb-2`}>
                Niveau {commercialData.niveau || 1}: {niveauInfo.nom}
              </h4>
              <p className={`text-${niveauInfo.couleur}-700 mb-3`}>
                {niveauInfo.description}
              </p>
              <div className="space-y-2">
                {niveauInfo.avantages.map((avantage, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full bg-${niveauInfo.couleur}-500 mr-3`}></div>
                    <span className={`text-${niveauInfo.couleur}-800 text-sm`}>{avantage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transfert Section (Niveau 2 seulement) */}
          {(commercialData.niveau || 1) === 2 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Transfert vers Niveau 3</h3>
              {(commercialData.chiffreAffaires || 0) >= 500 ? (
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
                    Il vous faut encore {commercialNewApiService.formatCurrency(500 - (commercialData.chiffreAffaires || 0))} de chiffre d'affaires pour effectuer un transfert.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Services Assignés */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Vos Services Assignés</h3>
            {services.length > 0 ? (
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={service._id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{service.titre}</h4>
                        {service.description && (
                          <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Prix Public:</span>
                            <span className="font-medium text-gray-900 ml-2">{service.prixPublic}€</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Prix Commercial:</span>
                            <span className="font-medium text-blue-600 ml-2">{service.prixCommercial}€</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Commission:</span>
                            <span className="font-bold text-green-600 ml-2">{service.commission}€</span>
                          </div>
                          {service.duree && (
                            <div>
                              <span className="text-gray-500">Durée:</span>
                              <span className="font-medium text-gray-900 ml-2">{service.duree}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Actif
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center">
                    <BanknotesIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">
                      Total services: {services.length} | Commission totale possible: {services.reduce((sum, s) => sum + (s.commission || 0), 0)}€
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BanknotesIcon className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service assigné</h3>
                <p className="text-gray-500 mb-4">
                  Contactez votre administrateur pour obtenir l'accès à des services commerciaux.
                </p>
              </div>
            )}
          </div>

          {/* Niveau 3 - Cadeaux mensuels */}
          {(commercialData.niveau || 1) === 3 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Partenaire Officiel - Avantages</h3>
              <div className="text-center py-8">
                <GiftIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Partenaire Officiel</h3>
                <p className="text-purple-700 mb-4">
                  Vous recevez 20% de commission directe sur chaque vente + 5€/mois automatique
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-purple-800">
                    <strong>Cadeaux mensuels reçus:</strong> {commercialData.cadeauxMensuels?.length || 0}
                  </p>
                  <p className="text-purple-600 text-sm">
                    Total cadeaux: {commercialNewApiService.formatCurrency((commercialData.cadeauxMensuels?.length || 0) * 5)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ventes Tab */}
      {activeTab === 'ventes' && (
        <SalesManager
          partnerId={commercialData.partnerId}
          services={services}
          ventes={commercialData.ventes || []}
          onVenteAdded={handleDataRefresh}
        />
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <ClientManager
          partnerId={commercialData.partnerId}
          clients={commercialData.clients || []}
          onClientAdded={handleDataRefresh}
        />
      )}
    </div>
  );
};

export default CommercialNewDashboard;
