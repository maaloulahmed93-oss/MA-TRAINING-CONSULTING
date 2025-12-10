import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { themePacks, Pack } from '../data/themePacks';
import { getPacksWithFallback } from '../services/packsApi';
import PackCard from './PackCard';
import PackModal from './PackModal';

interface ThemePackSectionProps {
  selectedCurrency: string;
}

const ThemePackSection: React.FC<ThemePackSectionProps> = ({ selectedCurrency }) => {
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [packs, setPacks] = useState<Pack[]>(themePacks);

  // Load packs from API on component mount
  useEffect(() => {
    const loadPacks = async () => {
      try {
        const apiPacks = await getPacksWithFallback();
        if (apiPacks && apiPacks.length > 0) {
          setPacks(apiPacks);
        }
      } catch (error) {
        console.error('Error loading packs:', error);
        // Keep fallback packs if API fails
      }
    };
    
    loadPacks();
  }, []);

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
                Comptes Participants
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6 leading-tight">
                Ressources professionnelles clés en main
              </h2>
              
              {/* Ligne décorative */}
              <div className="flex items-center justify-center mb-6">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent w-24"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full mx-4"></div>
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent w-24"></div>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8">
                  Accédez instantanément à des comptes thématiques contenant des documents, modèles, outils, vidéos enregistrées et ressources exclusives.<br className="hidden sm:block" />
                  <span className="font-semibold text-blue-600">Aucun diagnostic ni parcours requis</span> — accès direct et immédiat.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📂</span>
                    <span className="text-sm sm:text-base">Documents & modèles professionnels</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎥</span>
                    <span className="text-sm sm:text-base">Vidéos enregistrées</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🧰</span>
                    <span className="text-sm sm:text-base">Outils pratiques & checklists</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📘</span>
                    <span className="text-sm sm:text-base">Guides & supports complets</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-lg p-4 mb-8 text-center">
                  <p className="text-blue-700 font-semibold text-lg">🔓 Accès illimité</p>
                </div>
                
                <p className="text-center text-gray-600 italic">
                  <span className="text-2xl font-bold text-blue-600">🔥</span> Comptes par Thème<br />
                  Découvrez des comptes spécialement organisés par domaine pour vous offrir toutes les ressources essentielles dans un seul espace.
                </p>
              </div>
            </motion.div>

            {/* Packs Grid avec espacement amélioré */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {packs.map((pack, index) => (
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
