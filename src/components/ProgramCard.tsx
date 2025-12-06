import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import { Program } from '../data/trainingPrograms';
import { convertPrice } from '../utils/currencyConverter';

interface ProgramCardProps {
  program: Program;
  selectedCurrency: string;
  onRegisterClick: (program: Program) => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  selectedCurrency,
  onRegisterClick
}) => {
  // Fonction pour formater le prix selon la devise avec conversion
  const formatPrice = (price?: number) => {
    if (!price) return "Prix sur demande";
    return convertPrice(price, selectedCurrency);
  };

  // Couleurs pour les badges de niveau
  const levelColors = {
    "Débutant": "bg-green-100 text-green-800",
    "Intermédiaire": "bg-yellow-100 text-yellow-800",
    "Avancé": "bg-red-100 text-red-800",
    "Expert": "bg-purple-100 text-purple-800"
  };

  // Couleurs pour les badges de catégorie
  const categoryColors = {
    "Développement": "bg-blue-100 text-blue-800",
    "Data Science": "bg-indigo-100 text-indigo-800",
    "Management": "bg-pink-100 text-pink-800",
    "Design": "bg-teal-100 text-teal-800",
    "Marketing": "bg-orange-100 text-orange-800"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100/50 backdrop-blur-sm relative"
    >
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      {/* Header avec badges améliorés */}
      <div className="p-8 pb-6 relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-wrap gap-3">
            <span className={`px-4 py-2 rounded-full text-xs font-semibold border ${
              levelColors[program.level as keyof typeof levelColors] || "bg-gray-100 text-gray-800"
            } border-current/20`}>
              {program.level}
            </span>
            <span className={`px-4 py-2 rounded-full text-xs font-semibold border ${
              categoryColors[
                (typeof program.category === 'object' && program.category?.name 
                  ? program.category.name 
                  : typeof program.category === 'string' 
                    ? program.category 
                    : 'Autre') as keyof typeof categoryColors
              ] || "bg-gray-100 text-gray-800"
            } border-current/20`}>
              {typeof program.category === 'object' && program.category?.name 
                ? program.category.name 
                : typeof program.category === 'string' 
                  ? program.category 
                  : 'Non défini'}
            </span>
          </div>
          {program.price && (
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(program.price)}
              </p>
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
          {program.title}
        </h3>

        <p className="text-gray-600 leading-relaxed mb-6">
          {program.description}
        </p>
      </div>

      {/* Informations du programme avec design moderne */}
      <div className="px-8 pb-6 flex-1 relative z-10 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">{program.duration}</span>
          </div>
          <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <Users className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-gray-700">Max {program.maxStudents}</span>
          </div>
        </div>

        {/* Étapes du parcours avec design moderne */}
        <div>
          <p className="text-sm font-bold text-gray-900 mb-3">Étapes du parcours :</p>
          <div className="space-y-2">
            {['Diagnostic', 'Ateliers', 'Exercices', 'Dossier final', 'Suivi'].map((step, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton d'inscription avec design premium */}
      <div className="p-8 pt-0 relative z-10">
        <motion.button
          onClick={() => onRegisterClick(program)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          
          <span className="relative z-10">Inscription</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProgramCard;
