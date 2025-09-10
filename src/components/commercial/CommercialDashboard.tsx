import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Star, 
  ArrowRight, 
  Coins,
  Gift,
  TrendingUp,
  X
} from 'lucide-react';
import { 
  CommercialUser, 
  TrainingProgram, 
  getTrainingPrograms, 
  getProgramPrice,
  getCustomProgramsForDisplay,
  addCustomProgram,
  updateCustomProgram,
  deleteCustomProgram,
  convertPointsToCommission,
  getLevelInfo,
  addSale,
  loadCommercialData
} from '../../services/commercialData';
import { updateSale, deleteSale } from '../../services/commercialData';
import { Pencil, Trash2 } from 'lucide-react';

interface CommercialDashboardProps {
  commercialData: CommercialUser;
  onDataUpdate: (updatedData: CommercialUser) => void;
}

const CommercialDashboard: React.FC<CommercialDashboardProps> = ({
  commercialData,
  onDataUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'programs' | 'conversion'>('programs');
  const [isConverting, setIsConverting] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const STATUSES = ['payant', 'en_attente', 'annule'] as const;
  type StatusForm = typeof STATUSES[number];
  const isStatus = (value: string): value is StatusForm => (STATUSES as readonly string[]).includes(value);
  const [status, setStatus] = useState<StatusForm>('en_attente');
  const [submittingSale, setSubmittingSale] = useState(false);
  const [payoutNotice, setPayoutNotice] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editComputedAmount, setEditComputedAmount] = useState<number | null>(null);
  const [editComputedCommission, setEditComputedCommission] = useState<number | null>(null);
  // Custom program modal states
  const [addProgOpen, setAddProgOpen] = useState(false);
  const [cpName, setCpName] = useState('');
  const [cpPublicPrice, setCpPublicPrice] = useState('');
  const [cpPartnerPrice, setCpPartnerPrice] = useState('');
  const [cpCommission, setCpCommission] = useState('');
  const [cpCategory, setCpCategory] = useState('');
  const [cpDescription, setCpDescription] = useState('');
  const [cpDuration, setCpDuration] = useState('');
  const [cpSubmitting, setCpSubmitting] = useState(false);
  const [customPrograms, setCustomPrograms] = useState<TrainingProgram[]>(getCustomProgramsForDisplay(commercialData.id));
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  // Auth modal to gate access to add/edit custom programs
  const [authOpen, setAuthOpen] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authIntent, setAuthIntent] = useState<'add' | 'edit' | null>(null);

  const isValidPartnerCode = (code: string) => /^MA-00[1-9]$/.test(code.trim());
  
  const programs = [...getTrainingPrograms(), ...customPrograms];
  const levelInfo = getLevelInfo(commercialData.points);
  const availableCommission = Math.floor(commercialData.points / 100) * 10;
  const [filterProgram, setFilterProgram] = useState<string>('all');

  const handleConvertPoints = async () => {
    if (commercialData.points < 100) return;
    
    setIsConverting(true);
    
    // Simulate API call
    setTimeout(() => {
      const success = convertPointsToCommission(commercialData.id);
      if (success) {
        // Update the data
        const updatedData = {
          ...commercialData,
          commission: commercialData.commission + availableCommission,
          points: 0,
          level: 1
        };
        onDataUpdate(updatedData);
        // Show payout notice 7-15 days window
        setPayoutNotice('Votre conversion a été prise en compte. Le virement sera effectué via le moyen de paiement convenu dans un délai de 7 à 15 jours à partir d\'aujourd\'hui.');
        // Auto-hide after 7 seconds
        setTimeout(() => setPayoutNotice(null), 7000);
      }
      setIsConverting(false);
    }, 1500);
  };

  const handleOpenSellModal = (program: TrainingProgram) => {
    setSelectedProgram(program);
    setClientName('');
    setClientEmail('');
    setPaymentMethod('');
    setStatus('en_attente');
    setSellModalOpen(true);
  };

  const handleSubmitSale: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!selectedProgram) return;
    if (!clientName.trim() || !clientEmail.trim()) return;

    setSubmittingSale(true);

    const amount = getProgramPrice(selectedProgram, commercialData.level);
    // Use program.commission (10% of public price in mock data)
    const commissionAmount = selectedProgram.commission;

    const mappedStatus: 'Paid' | 'Pending' | 'Cancelled' =
      status === 'payant' ? 'Paid' : status === 'annule' ? 'Cancelled' : 'Pending';

    const ok = addSale(commercialData.id, {
      client: clientName.trim(),
      clientEmail: clientEmail.trim(),
      program: selectedProgram.name,
      amount,
      commission: commissionAmount,
      status: mappedStatus,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod.trim() || 'N/A'
    });

    // Simulate brief delay and refresh data from storage
    setTimeout(() => {
      setSubmittingSale(false);
      if (ok) {
        const refreshed = loadCommercialData(commercialData.id);
        if (refreshed) onDataUpdate(refreshed);
        setSellModalOpen(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('programs')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'programs'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Programmes
        </button>
        <button
          onClick={() => setActiveTab('conversion')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'conversion'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Conversion Points
        </button>
      </div>

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Programmes de Formation
            </h3>
            <p className="text-gray-600">
              Revendez nos formations avec vos prix préférentiels niveau {levelInfo.level}
            </p>
          </div>
          
          <div className="flex items-center justify-between px-6 pt-6">
            <div />
            <button
              onClick={() => { 
                setEditingCustomId(null);
                setCpName(''); setCpPublicPrice(''); setCpPartnerPrice(''); setCpCommission(''); setCpCategory(''); setCpDescription(''); setCpDuration('');
                setAuthIntent('add');
                setAuthCode('');
                setAuthError('');
                setAuthOpen(true);
              }}
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
            >
              + Ajouter programme/service
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix Public
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Votre Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Économie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {programs.map((program) => {
                  const yourPrice = getProgramPrice(program, commercialData.level);
                  const discount = program.publicPrice - yourPrice;
                  const discountPercent = Math.round((discount / program.publicPrice) * 100);
                  
                  return (
                    <tr key={program.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            {program.name}
                          </div>
                          {/* Custom badge */}
                          {program.id.startsWith('cprog-') && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-800">Personnalisé</span>
                          )}

      {/* Auth Modal for partner code */}
      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setAuthOpen(false); setAuthIntent(null); setAuthCode(''); setAuthError(''); }}></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
          >
            <button
              type="button"
              onClick={() => { setAuthOpen(false); setAuthIntent(null); setAuthCode(''); setAuthError(''); }}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Code partenaire requis</h3>
            <p className="text-sm text-gray-600 mb-4">Saisissez votre code (format MA-001 à MA-009) pour continuer.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isValidPartnerCode(authCode)) { setAuthError('Code invalide. Exemple: MA-001'); return; }
                setAuthOpen(false);
                setAuthError('');
                if (authIntent === 'add' || authIntent === 'edit') {
                  setAddProgOpen(true);
                }
                setAuthIntent(null);
                setAuthCode('');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="password"
                  value={authCode}
                  onChange={(e)=>setAuthCode(e.target.value)}
                  placeholder="MA-001"
                  className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  autoFocus
                />
                {authError && <p className="text-sm text-red-600 mt-1">{authError}</p>}
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setAuthOpen(false); setAuthIntent(null); setAuthCode(''); setAuthError(''); }} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700">Continuer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
                          <div className="text-sm text-gray-500">
                            {program.category} • {program.duration}
                          </div>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {program.rating} ({program.studentsCount} étudiants)
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {program.publicPrice}€
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">
                          {yourPrice}€
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-orange-600">
                            -{discount}€
                          </span>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            -{discountPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenSellModal(program)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Revendre
                          </button>
                          {program.id.startsWith('cprog-') && (
                            <>
                              <button
                                className="px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50 text-sm"
                                onClick={() => {
                                  // preload edit fields from custom program backing store
                                  const list = getCustomProgramsForDisplay(commercialData.id);
                                  const base = list.find(p => p.id === program.id);
                                  if (base) {
                                    setCpName(base.name);
                                    setCpCategory(base.category);
                                    setCpDescription(base.description);
                                    setCpDuration(base.duration);
                                    setCpPublicPrice(String(base.publicPrice));
                                    // partner price is stored across level prices identically
                                    setCpPartnerPrice(String(base.level1Price));
                                    setCpCommission(String(base.commission));
                                  }
                                  setEditingCustomId(program.id);
                                  setAuthIntent('edit');
                                  setAuthCode('');
                                  setAuthError('');
                                  setAuthOpen(true);
                                }}
                              >Modifier</button>
                              <button
                                className="px-2 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                                onClick={() => {
                                  if (window.confirm('Supprimer ce programme personnalisé ?')) {
                                    deleteCustomProgram(commercialData.id, program.id);
                                    setCustomPrograms(getCustomProgramsForDisplay(commercialData.id));
                                  }
                                }}
                              >Supprimer</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recent Sales */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-900">Reventes récentes</h4>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Filtrer par programme</label>
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="rounded-md border-gray-300 text-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="all">Tous</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programme</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(commercialData.sales || [])
                    .filter((s) => filterProgram === 'all' || s.program === filterProgram)
                    .slice(0, 10)
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{s.client}</td>
                        <td className="px-4 py-2 text-sm text-blue-600"><a href={`mailto:${s.clientEmail}`}>{s.clientEmail}</a></td>
                        <td className="px-4 py-2 text-sm text-gray-700">{s.program}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{s.amount}€</td>
                        <td className="px-4 py-2 text-sm font-medium text-green-600">+{s.commission}€</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            s.status === 'Paid' ? 'bg-green-100 text-green-800' : s.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {s.status === 'Paid' ? 'Payant' : s.status === 'Pending' ? 'En attente' : 'Annulé'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{s.date}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{s.paymentMethod}</td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              className="px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                              title="Modifier"
                              onClick={() => {
                                setEditingSaleId(s.id);
                                setEditClientName(s.client);
                                setEditClientEmail(s.clientEmail);
                                setEditPaymentMethod(s.paymentMethod);
                                setEditDate(s.date);
                                setStatus(s.status === 'Paid' ? 'payant' : s.status === 'Cancelled' ? 'annule' : 'en_attente');
                                // Auto-calc price & commission from program and level
                                try {
                                  const progs = getTrainingPrograms();
                                  const prog = progs.find(p => p.name === s.program);
                                  if (prog) {
                                    const amt = getProgramPrice(prog, commercialData.level);
                                    setEditComputedAmount(amt);
                                    setEditComputedCommission(prog.commission);
                                  } else {
                                    setEditComputedAmount(s.amount);
                                    setEditComputedCommission(s.commission);
                                  }
                                } catch {
                                  setEditComputedAmount(s.amount);
                                  setEditComputedCommission(s.commission);
                                }
                                setEditModalOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              className="px-2 py-1 rounded-md border border-red-200 hover:bg-red-50"
                              title="Supprimer"
                              onClick={() => {
                                if (window.confirm('Supprimer cette revente ?')) {
                                  const ok = deleteSale(commercialData.id, s.id);
                                  if (ok) {
                                    const refreshed = loadCommercialData(commercialData.id);
                                    if (refreshed) onDataUpdate(refreshed);
                                  }
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {(!commercialData.sales || commercialData.sales.length === 0) && (
                    <tr>
                      <td className="px-4 py-6 text-sm text-gray-500" colSpan={8}>Aucune revente pour le moment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Custom Program Modal */}
      {addProgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { 
            setAddProgOpen(false); 
            setEditingCustomId(null);
            setCpName(''); setCpPublicPrice(''); setCpPartnerPrice(''); setCpCommission(''); setCpCategory(''); setCpDescription(''); setCpDuration('');
          }}></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-6"
          >
            <button
              type="button"
              onClick={() => { 
                setAddProgOpen(false); 
                setEditingCustomId(null);
                setCpName(''); setCpPublicPrice(''); setCpPartnerPrice(''); setCpCommission(''); setCpCategory(''); setCpDescription(''); setCpDuration('');
              }}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{editingCustomId ? 'Modifier' : 'Ajouter'} programme/service (partenaire)</h3>
            <p className="text-sm text-gray-600 mb-4">Saisissez le prix public, votre prix et la commission. L'économie est calculée automatiquement dans la liste.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!cpName.trim()) return;
                const publicPrice = parseFloat(cpPublicPrice.replace(/,/g, '.')) || 0;
                const partnerPrice = parseFloat(cpPartnerPrice.replace(/,/g, '.')) || 0;
                const commission = parseFloat(cpCommission.replace(/,/g, '.')) || 0;
                if (publicPrice <= 0 || partnerPrice <= 0) return;
                setCpSubmitting(true);
                if (editingCustomId) {
                  updateCustomProgram(commercialData.id, editingCustomId, {
                    name: cpName.trim(),
                    publicPrice,
                    partnerPrice,
                    commission,
                    category: cpCategory.trim() || undefined,
                    description: cpDescription.trim() || undefined,
                    duration: cpDuration.trim() || undefined
                  });
                } else {
                  addCustomProgram(commercialData.id, {
                    name: cpName.trim(),
                    publicPrice,
                    partnerPrice,
                    commission,
                    category: cpCategory.trim() || undefined,
                    description: cpDescription.trim() || undefined,
                    duration: cpDuration.trim() || undefined
                  });
                }
                // Refresh
                setCustomPrograms(getCustomProgramsForDisplay(commercialData.id));
                setCpSubmitting(false);
                setAddProgOpen(false);
                setEditingCustomId(null);
                // reset
                setCpName(''); setCpPublicPrice(''); setCpPartnerPrice(''); setCpCommission(''); setCpCategory(''); setCpDescription(''); setCpDuration('');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input value={cpName} onChange={(e)=>setCpName(e.target.value)} className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input value={cpCategory} onChange={(e)=>setCpCategory(e.target.value)} className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix public (€)</label>
                  <input type="number" min="0" step="0.01" value={cpPublicPrice} onChange={(e)=>setCpPublicPrice(e.target.value)} className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Votre prix (€)</label>
                  <input type="number" min="0" step="0.01" value={cpPartnerPrice} onChange={(e)=>setCpPartnerPrice(e.target.value)} className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission (€)</label>
                  <input type="number" min="0" step="0.01" value={cpCommission} onChange={(e)=>setCpCommission(e.target.value)} className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={cpDescription} onChange={(e)=>setCpDescription(e.target.value)} rows={3} className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                <input value={cpDuration} onChange={(e)=>setCpDuration(e.target.value)} className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button type="button" onClick={()=>setAddProgOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Annuler</button>
                <button disabled={cpSubmitting} type="submit" className="inline-flex items-center px-4 py-2 rounded-md text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50">
                  {cpSubmitting ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Edit Sale Modal */}
      {editModalOpen && editingSaleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditModalOpen(false)}></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6"
          >
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Modifier la revente</h3>
            <p className="text-sm text-gray-600 mb-4">Mettre à jour les informations du client et le statut.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const mappedStatus: 'Paid' | 'Pending' | 'Cancelled' =
                  status === 'payant' ? 'Paid' : status === 'annule' ? 'Cancelled' : 'Pending';
                const ok = updateSale(commercialData.id, editingSaleId, {
                  client: editClientName.trim(),
                  clientEmail: editClientEmail.trim(),
                  paymentMethod: editPaymentMethod.trim(),
                  date: editDate || new Date().toISOString().split('T')[0],
                  status: mappedStatus,
                  amount: editComputedAmount ?? 0,
                  commission: editComputedCommission ?? 0
                });
                if (ok) {
                  const refreshed = loadCommercialData(commercialData.id);
                  if (refreshed) onDataUpdate(refreshed);
                  setEditModalOpen(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  required
                  className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email du client</label>
                <input
                  type="email"
                  value={editClientEmail}
                  onChange={(e) => setEditClientEmail(e.target.value)}
                  required
                  className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant (auto)</label>
                  <input
                    type="text"
                    value={editComputedAmount != null ? `${editComputedAmount}€` : ''}
                    readOnly
                    className="w-full rounded-md border-gray-200 bg-gray-50 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission (auto)</label>
                  <input
                    type="text"
                    value={editComputedCommission != null ? `+${editComputedCommission}€` : ''}
                    readOnly
                    className="w-full rounded-md border-gray-200 bg-gray-50 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                  <input
                    type="text"
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={status}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (isStatus(v)) setStatus(v);
                  }}
                  className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === 'payant' ? 'Payant' : s === 'en_attente' ? 'En attente' : 'Annulé'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 rounded-md text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Points Conversion Tab */}
      {activeTab === 'conversion' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Conversion Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Convertir vos Points
              </h3>
              <p className="text-gray-600">
                Transformez vos points en commission réelle
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {commercialData.points}
                </div>
                <div className="text-sm text-gray-600">Points disponibles</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <ArrowRight className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {availableCommission}€
                </div>
                <div className="text-sm text-gray-600">Commission disponible</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Gift className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {commercialData.commission}€
                </div>
                <div className="text-sm text-gray-600">Commission totale</div>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Règle de conversion :</strong> 100 points = 10€ de commission
                </p>
                {commercialData.points >= 3000 && (
                  <p className="text-sm text-purple-800 mt-2">
                    🎉 <strong>Bonus Niveau 4 :</strong> Après conversion, vous gardez votre commission et redémarrez au niveau 1 !
                  </p>
                )}
              </div>
              
              <button
                onClick={handleConvertPoints}
                disabled={commercialData.points < 100 || isConverting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isConverting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Conversion en cours...
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5 mr-2" />
                    Convertir {Math.floor(commercialData.points / 100) * 100} points → {availableCommission}€
                  </>
                )}
              </button>
              {payoutNotice && (
                <div className="mt-4 relative rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
                    onClick={() => setPayoutNotice(null)}
                    aria-label="Fermer"
                  >×</button>
                  {payoutNotice}
                </div>
              )}
              
              {commercialData.points < 100 && (
                <p className="text-sm text-gray-500 mt-2">
                  Minimum 100 points requis pour la conversion
                </p>
              )}
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Progression des Niveaux
            </h4>
            
            <div className="space-y-4">
              {[1, 2, 3, 4].map((level) => {
                const isCurrentLevel = level === commercialData.level;
                const isUnlocked = level <= commercialData.level;
                const levelData = getLevelInfo(level === 1 ? 0 : level === 2 ? 1000 : level === 3 ? 2000 : 3000);
                
                return (
                  <div key={level} className={`flex items-center p-4 rounded-lg ${
                    isCurrentLevel ? 'bg-orange-50 border-2 border-orange-200' : 
                    isUnlocked ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCurrentLevel ? 'bg-orange-500 text-white' :
                      isUnlocked ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {level}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          Niveau {level} - {levelData.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {level === 1 ? '0-999' : level === 2 ? '1000-1999' : level === 3 ? '2000-2999' : '3000+'} points
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Réduction : {level === 1 ? '10%' : level === 2 ? '20%' : level === 3 ? '30%' : '40%'} sur tous les programmes
                      </div>
                    </div>
                    {isCurrentLevel && (
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Actuel
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Resell Modal */}
      {sellModalOpen && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !submittingSale && setSellModalOpen(false)}></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6"
          >
            <button
              type="button"
              onClick={() => !submittingSale && setSellModalOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Créer une revente</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedProgram.name} • Votre prix: <span className="font-semibold text-green-600">{getProgramPrice(selectedProgram, commercialData.level)}€</span></p>

            <form onSubmit={handleSubmitSale} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Ex: Mohamed Ali"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email du client</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                  className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  placeholder="client@example.com"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement (optionnel)</label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    placeholder="Virement, Carte, Espèces..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={status}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (isStatus(v)) setStatus(v);
                    }}
                    className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s === 'payant' ? 'Payant' : s === 'en_attente' ? 'En attente' : 'Annulé'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => !submittingSale && setSellModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingSale}
                  className="inline-flex items-center px-4 py-2 rounded-md text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-60"
                >
                  {submittingSale ? 'Enregistrement...' : 'Enregistrer la revente'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CommercialDashboard;
