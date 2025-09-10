import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Pack, convertPrice } from '../data/themePacks';

interface PackCardProps {
  pack: Pack;
  selectedCurrency: string;
  onOpenModal: (pack: Pack) => void;
}

const PackCard: React.FC<PackCardProps> = ({ pack, selectedCurrency, onOpenModal }) => {
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
      
      {/* Header avec gradient amélioré */}
      <div className="relative h-52 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
        {/* Éléments décoratifs de fond */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform -translate-x-4 translate-y-4"></div>
        
        {/* Badge économies avec design amélioré */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border border-white/20">
          <Sparkles className="w-3 h-3 inline mr-1" />
          -{convertPrice(pack.details.savings, selectedCurrency)}
        </div>
        
        {/* Contenu du header */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/30 to-transparent">
          <h3 className="text-xl font-bold mb-2 text-white leading-tight">{pack.name}</h3>
          <p className="text-blue-100 text-sm leading-relaxed">{pack.description}</p>
        </div>
      </div>

      {/* Contenu de la carte avec espacement amélioré */}
      <div className="p-6 space-y-6">
        {/* Statistiques rapides avec design moderne */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
            ))}
            <span className="text-gray-500 text-sm ml-2 font-medium">(4.9)</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-500 text-sm">
            <div className="flex items-center space-x-1.5 bg-gray-50 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">1 an</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-blue-50 px-2.5 py-1 rounded-full text-blue-600">
              <Users className="w-3.5 h-3.5" />
              <span className="font-medium">1,247</span>
            </div>
          </div>
        </div>

        {/* Aperçu des programmes avec design amélioré */}
        <div className="space-y-3">
          <p className="text-gray-700 text-sm font-medium">Inclut {pack.details.themes.length} programmes spécialisés :</p>
          <div className="flex flex-wrap gap-2">
            {pack.details.themes.slice(0, 3).map((theme) => (
              <span
                key={theme.themeId}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-100 hover:border-blue-200 transition-colors"
              >
                {theme.name}
              </span>
            ))}
            {pack.details.themes.length > 3 && (
              <span className="bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200">
                +{pack.details.themes.length - 3} autres
              </span>
            )}
          </div>
        </div>

        {/* Prix avec design premium */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-4 border border-gray-100">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                {convertPrice(pack.details.price, selectedCurrency)}
              </span>
              <span className="text-lg text-gray-400 line-through font-medium">
                {convertPrice(pack.details.originalPrice, selectedCurrency)}
              </span>
            </div>
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              <Sparkles className="w-3 h-3 mr-1" />
              Économisez {convertPrice(pack.details.savings, selectedCurrency)}
            </div>
          </div>
        </div>

        {/* Bouton Plus de détails avec design premium */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={() => {
            console.log('Bouton cliqué pour le pack:', pack.name);
            onOpenModal(pack);
          }}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center space-x-2 group shadow-lg hover:shadow-xl relative overflow-hidden"
        >
          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          
          <span className="relative z-10">Découvrir le pack</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PackCard;
