import React from 'react';
import { CommercialNewData } from '../../services/commercialNewApiService-simple';

interface CommercialNewDashboardProps {
  commercialData: CommercialNewData;
  onDataUpdate: (data: CommercialNewData) => void;
}

const CommercialNewDashboard: React.FC<CommercialNewDashboardProps> = ({
  commercialData,
  onDataUpdate: _onDataUpdate
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{commercialData.fullName}</h2>
            <p className="opacity-90">ID: {commercialData.partnerId}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white text-blue-600">
              Niveau {commercialData.niveau}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm text-gray-600">Points</p>
              <p className="text-2xl font-bold text-gray-900">{commercialData.points}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm text-gray-600">Chiffre d'Affaires</p>
              <p className="text-2xl font-bold text-gray-900">{commercialData.chiffreAffaires}€</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm text-gray-600">Commission</p>
              <p className="text-2xl font-bold text-gray-900">{commercialData.commissionTotale}€</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm text-gray-600">Ventes</p>
              <p className="text-2xl font-bold text-gray-900">{commercialData.ventes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Dashboard Commercial</h3>
        <p className="text-gray-600">
          Bienvenue dans votre espace commercial. Votre niveau actuel est {commercialData.niveau}.
        </p>
        
        {commercialData.niveau === 1 && (
          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <p className="text-orange-800">
              <strong>Niveau 1 - Apprenti:</strong> Vous gagnez 5 points par vente confirmée. 
              Il vous faut 1000 points pour passer au niveau 2.
            </p>
          </div>
        )}

        {commercialData.niveau === 2 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              <strong>Niveau 2 - Confirmé:</strong> Vous pouvez gérer vos clients et effectuer des transferts. 
              Transférez 500€ pour passer au niveau 3.
            </p>
          </div>
        )}

        {commercialData.niveau === 3 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-purple-800">
              <strong>Niveau 3 - Partenaire:</strong> Vous recevez 20% de commission directe 
              et 5€ de cadeau automatique chaque mois.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommercialNewDashboard;
