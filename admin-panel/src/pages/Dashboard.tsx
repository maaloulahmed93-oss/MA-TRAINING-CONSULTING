import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';

interface Payment {
  id: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
  dueDate: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showPayments, setShowPayments] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      clientName: 'Client A',
      invoiceNumber: 'INV-001',
      amount: 1500,
      paidAmount: 1500,
      status: 'paid',
      dueDate: '2025-02-15'
    },
    {
      id: '2',
      clientName: 'Client B',
      invoiceNumber: 'INV-002',
      amount: 2500,
      paidAmount: 1000,
      status: 'partial',
      dueDate: '2025-02-20'
    },
    {
      id: '3',
      clientName: 'Client C',
      invoiceNumber: 'INV-003',
      amount: 3000,
      paidAmount: 0,
      status: 'pending',
      dueDate: '2025-02-25'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'partial': return 'Partiel';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Système d'entreprise</h1>
        <p className="mt-1 text-sm text-gray-500">Bienvenue dans votre espace d'administration.</p>
      </div>

      {/* Cards */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Facturation/Devis Card */}
        <div 
          onClick={() => navigate(ROUTES.FACTURATION)}
          className="bg-white rounded-xl shadow-lg ring-1 ring-gray-200 p-8 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-blue-100 rounded-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Facturation / Devis</h3>
              <p className="text-base text-gray-600 mt-1">Gestion des factures et devis</p>
            </div>
          </div>
        </div>

        {/* Paiement Client Suivi Card */}
        <div 
          onClick={() => setShowPayments(!showPayments)}
          className="bg-white rounded-xl shadow-lg ring-1 ring-gray-200 p-8 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-green-100 rounded-xl">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Paiement Client Suivi</h3>
              <p className="text-base text-gray-600 mt-1">Suivi des paiements clients</p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Payment Tracking Section */}
      {showPayments && (
        <div className="bg-white rounded-xl shadow-lg ring-1 ring-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Suivi des Paiements Clients</h2>
              <button
                onClick={() => setShowPayments(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600">Total à recevoir</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('fr-FR')} €
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600">Montant reçu</p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {payments.reduce((sum, p) => sum + p.paidAmount, 0).toLocaleString('fr-FR')} €
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600">Reste à payer</p>
              <p className="mt-2 text-2xl font-bold text-red-600">
                {payments.reduce((sum, p) => sum + (p.amount - p.paidAmount), 0).toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant Payé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Échéance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {payment.amount.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {payment.paidAmount.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {(payment.amount - payment.paidAmount).toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
