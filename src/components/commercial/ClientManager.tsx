import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  UserGroupIcon, 
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { commercialNewApiService, CommercialClient } from '../../services/commercialNewApiService';

interface ClientManagerProps {
  partnerId: string;
  clients: CommercialClient[];
  onClientAdded: () => void;
}

const ClientManager: React.FC<ClientManagerProps> = ({
  partnerId,
  clients,
  onClientAdded
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [clientForm, setClientForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    tel: '',
    programme: '',
    montant: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await commercialNewApiService.addClient(partnerId, clientForm);

      if (result.success) {
        setShowAddForm(false);
        setClientForm({
          nom: '',
          prenom: '',
          email: '',
          tel: '',
          programme: '',
          montant: 0
        });
        onClientAdded();
      } else {
        setError(result.message || 'Erreur lors de l\'ajout du client');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'payé':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'annulé':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'en_attente':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <UserGroupIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payé':
        return 'bg-green-100 text-green-800';
      case 'annulé':
        return 'bg-red-100 text-red-800';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'payé':
        return 'Payé';
      case 'annulé':
        return 'Annulé';
      case 'en_attente':
        return 'En attente';
      default:
        return 'Nouveau';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Gestion des Clients
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nouveau Client
        </button>
      </div>

      {/* Add Client Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border"
        >
          <h4 className="text-lg font-semibold mb-4">Ajouter un Nouveau Client</h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={clientForm.nom}
                  onChange={(e) => setClientForm({ ...clientForm, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={clientForm.prenom}
                  onChange={(e) => setClientForm({ ...clientForm, prenom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={clientForm.tel}
                  onChange={(e) => setClientForm({ ...clientForm, tel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programme d'Intérêt
                </label>
                <input
                  type="text"
                  value={clientForm.programme}
                  onChange={(e) => setClientForm({ ...clientForm, programme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Formation React, Consulting..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant Estimé (€)
                </label>
                <input
                  type="number"
                  value={clientForm.montant}
                  onChange={(e) => setClientForm({ ...clientForm, montant: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Ajout...' : 'Ajouter Client'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Clients List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold">Liste des Clients</h4>
        </div>
        
        {clients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun client enregistré</p>
            <p className="text-sm">Ajoutez votre premier client pour commencer</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {clients.map((client, index) => (
              <motion.div
                key={client.id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {getStatusIcon(client.status)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                      {getStatusText(client.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-semibold text-gray-900">
                    {client.prenom} {client.nom}
                  </h5>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    <span>{client.tel}</span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700 font-medium">
                      {client.programme}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {client.montant}€
                    </p>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Ajouté le {new Date(client.dateAjout).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {clients.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold mb-4">Résumé des Clients</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {clients.length}
              </div>
              <div className="text-sm text-gray-600">Total Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {clients.filter(c => c.status === 'payé').length}
              </div>
              <div className="text-sm text-gray-600">Payés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {clients.filter(c => c.status === 'en_attente').length}
              </div>
              <div className="text-sm text-gray-600">En Attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {clients.reduce((sum, c) => sum + c.montant, 0).toFixed(0)}€
              </div>
              <div className="text-sm text-gray-600">Potentiel Total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
