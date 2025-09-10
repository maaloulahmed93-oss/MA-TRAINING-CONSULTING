import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { Pack, convertPrice } from '../data/themePacks';
import { addRegistration } from "../services/registrationService";

interface PackModalProps {
  pack: Pack | null;
  selectedCurrency: string;
  onClose: () => void;
}

const PackModal: React.FC<PackModalProps> = ({ pack, selectedCurrency, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Persist locally for admin panel list
    if (pack) {
      addRegistration({
        id: `${pack.packId}-${Date.now()}`,
        type: 'pack',
        itemId: pack.packId,
        itemName: pack.name,
        price: pack.details.price,
        currency: selectedCurrency,
        timestamp: new Date().toISOString(),
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          message: formData.message || undefined,
        },
      });
    }
    console.log('Inscription:', { pack: pack?.packId, ...formData });
    alert("Inscription envoyée avec succès ! Nous vous recontacterons bientôt.");
    onClose();
  };

  if (!pack) return null;

  return (
    <AnimatePresence>
      {pack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop amélioré */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

        {/* Modal avec design moderne */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden"
        >
          {/* Header premium avec gradient */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6 flex items-center justify-between rounded-t-3xl overflow-hidden">
            {/* Éléments décoratifs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform -translate-x-4 translate-y-4"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-2">{pack.name}</h2>
              <p className="text-blue-100 text-lg">{pack.description}</p>
            </div>
            <button
              onClick={onClose}
              className="relative z-10 p-3 hover:bg-white/20 rounded-full transition-colors duration-200 group"
            >
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Contenu principal avec scroll */}
          <div className="max-h-[calc(95vh-120px)] overflow-y-auto">
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Colonne gauche - Détails du pack */}
              <div className="space-y-8">
                {/* Prix avec design premium */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-blue-100 relative overflow-hidden">
                  {/* Éléments décoratifs */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-200/30 rounded-full blur-lg"></div>
                  
                  <div className="text-center relative z-10">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                      {convertPrice(pack.details.price, selectedCurrency)}
                    </div>
                    <p className="text-gray-600 font-medium">Formation complète • Accès à vie</p>
                  </div>
                </div>

                {/* Programmes et modules avec design amélioré */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                    Programmes et Planning
                  </h3>
                  <div className="space-y-6">
                    {pack.details.themes.map((theme) => (
                      <div key={theme.themeId} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                          <h4 className="text-lg font-bold text-gray-900">{theme.name}</h4>
                          <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full text-sm text-blue-700 font-medium">
                            <Clock className="w-4 h-4 mr-2" />
                            {new Date(theme.startDate).toLocaleDateString('fr-FR')} - {new Date(theme.endDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {theme.modules.map((module) => (
                            <div key={module.moduleId} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100">
                              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              <span className="text-gray-700 text-sm font-medium">{module.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avantages avec design premium */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Avantages inclus</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {pack.details.advantages.map((advantage, index) => (
                      <div key={index} className="flex items-center space-x-4 bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                        <div className="bg-emerald-500 rounded-full p-1.5">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-800 font-medium">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colonne droite - Formulaire d'inscription avec design premium */}
              <div className="sticky top-8">
                <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-8 border border-blue-100 shadow-lg backdrop-blur-sm">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Inscription</h3>
                    <p className="text-gray-600">Rejoignez ce pack dès maintenant</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Prénom *
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white"
                            placeholder="Votre prénom"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Nom *
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white"
                            placeholder="Votre nom"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white"
                          placeholder="votre@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Téléphone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white"
                          placeholder="+216 XX XXX XXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Message (optionnel)
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-blue-400" />
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none bg-white/80 backdrop-blur-sm hover:bg-white"
                          placeholder="Dites-nous en plus sur vos objectifs..."
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-5 px-8 rounded-2xl transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl relative overflow-hidden group"
                    >
                      {/* Effet de brillance */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      
                      <span className="relative z-10">S'inscrire maintenant</span>
                    </motion.button>

                    <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
                      En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PackModal;
