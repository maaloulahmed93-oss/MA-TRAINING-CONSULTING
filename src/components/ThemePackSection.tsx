import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { themePacks, Pack } from '../data/themePacks';
import PackCard from './PackCard';
import PackModal from './PackModal';

interface ThemePackSectionProps {
  selectedCurrency: string;
}

const ThemePackSection: React.FC<ThemePackSectionProps> = ({ selectedCurrency }) => {
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);

  const handleOpenModal = (pack: Pack) => {
    console.log('Ouverture du modal pour:', pack.name);
    setSelectedPack(pack);
  };

  const handleCloseModal = () => {
    console.log('Fermeture du modal');
    setSelectedPack(null);
  };

  return (
    <>
      {/* Section principale */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
        {/* Éléments décoratifs de fond */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-100/40 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            {/* Header avec design amélioré */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              {/* Badge premium */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-200/50 rounded-full text-blue-700 text-sm font-medium mb-6 backdrop-blur-sm"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Packs Premium
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6 leading-tight">
                Packs par Thème
              </h2>
              
              {/* Ligne décorative */}
              <div className="flex items-center justify-center mb-6">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent w-24"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full mx-4"></div>
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent w-24"></div>
              </div>
              
              <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Économisez jusqu'à <span className="font-semibold text-blue-600">40%</span> avec nos packs complets et accédez à plusieurs formations spécialisées.<br className="hidden sm:block" />
                Chaque pack inclut un suivi personnalisé et des attestations d'expertise reconnues.
              </p>
            </motion.div>

            {/* Packs Grid avec espacement amélioré */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {themePacks.map((pack, index) => (
                <motion.div
                  key={pack.packId}
                  data-pack-id={pack.packId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <PackCard
                    pack={pack}
                    selectedCurrency={selectedCurrency}
                    onOpenModal={handleOpenModal}
                  />
                </motion.div>
              ))}
            </div>


          </div>
        </div>
      </section>

      {/* Modal */}
      <PackModal
        pack={selectedPack}
        selectedCurrency={selectedCurrency}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ThemePackSection;
