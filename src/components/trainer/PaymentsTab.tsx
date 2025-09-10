import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Calendar,
  User,
  BookOpen,
  TrendingUp,
  Download,
  Filter,
  CreditCard,
  Banknote,
  Wallet
} from 'lucide-react';
import { Payment, Participant, Programme, TrainerStats } from '../../types/trainer';
import {
  getPayments,
  getParticipants,
  getProgrammes
} from '../../services/trainerStorage';

interface PaymentsTabProps {
  stats: TrainerStats;
}

const PaymentsTab = ({ stats }: PaymentsTabProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPayments(getPayments());
    setParticipants(getParticipants());
    setProgrammes(getProgrammes());
  };

  const getParticipantName = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant ? `${participant.firstName} ${participant.lastName}` : 'Participant inconnu';
  };

  const getProgrammeName = (programmeId: string) => {
    const programme = programmes.find(p => p.id === programmeId);
    return programme ? programme.title : 'Programme inconnu';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Payé': return 'bg-green-100 text-green-800';
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      case 'Remboursé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Carte': return CreditCard;
      case 'Virement': return Banknote;
      case 'Espèces': return Wallet;
      case 'Chèque': return Banknote;
      default: return DollarSign;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const methodMatch = filterMethod === 'all' || payment.method === filterMethod;
    const statusMatch = filterStatus === 'all' || payment.status === filterStatus;
    
    let dateMatch = true;
    if (dateRange !== 'all') {
      const paymentDate = new Date(payment.paymentDate);
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          dateMatch = paymentDate.toDateString() === now.toDateString();
          break;
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateMatch = paymentDate >= weekAgo;
          break;
        }
        case 'month':
          dateMatch = paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
          break;
        case 'year':
          dateMatch = paymentDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return methodMatch && statusMatch && dateMatch;
  });

  const calculatePeriodStats = () => {
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCommission = filteredPayments.reduce((sum, payment) => sum + payment.commission, 0);
    return { totalAmount, totalCommission };
  };

  const periodStats = calculatePeriodStats();

  const exportData = () => {
    const csvContent = [
      ['Date', 'Participant', 'Programme', 'Montant', 'Commission', 'Méthode', 'Statut'].join(','),
      ...filteredPayments.map(payment => [
        new Date(payment.paymentDate).toLocaleDateString(),
        getParticipantName(payment.participantId),
        getProgrammeName(payment.programmeId),
        payment.amount,
        payment.commission,
        payment.method,
        payment.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Paiements & Commissions</h2>
          <p className="text-gray-600">Suivez vos revenus et commissions</p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenus Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(0)} DT</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Commission Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCommission.toFixed(0)} DT</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ce Mois</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyCommission.toFixed(0)} DT</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Période Filtrée</p>
              <p className="text-2xl font-bold text-gray-900">{periodStats.totalCommission.toFixed(0)} DT</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Toutes les méthodes</option>
          <option value="Carte">Carte</option>
          <option value="Virement">Virement</option>
          <option value="Espèces">Espèces</option>
          <option value="Chèque">Chèque</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="Payé">Payé</option>
          <option value="En attente">En attente</option>
          <option value="Remboursé">Remboursé</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission (25%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => {
                const MethodIcon = getMethodIcon(payment.method);
                return (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {getParticipantName(payment.participantId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {getProgrammeName(payment.programmeId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {payment.amount} DT
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        {payment.commission.toFixed(2)} DT
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <MethodIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {payment.method}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun paiement trouvé pour les filtres sélectionnés</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredPayments.length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Résumé de la Période</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700">Nombre de Paiements</p>
              <p className="text-2xl font-bold text-blue-900">{filteredPayments.length}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Revenus Total</p>
              <p className="text-2xl font-bold text-blue-900">{periodStats.totalAmount.toFixed(2)} DT</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Commission Total</p>
              <p className="text-2xl font-bold text-blue-900">{periodStats.totalCommission.toFixed(2)} DT</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
