import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, GraduationCap, Search, Filter, ChevronRight } from 'lucide-react';

// Types pour le catalogue unifié
interface CatalogItem {
  id: string;
  name: string;
  type: 'pack' | 'programme';
  category: string;
  price: number;
  originalPrice?: number;
  savings?: number;
  description: string;
  level?: string;
  duration?: string;
  instructor?: string;
  themes?: number;
  modules?: number;
}

interface UnifiedCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemSelect: (item: CatalogItem) => void;
  catalogItems: CatalogItem[];
}

const UnifiedCatalogModal: React.FC<UnifiedCatalogModalProps> = ({
  isOpen,
  onClose,
  onItemSelect,
  catalogItems
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedCategory('all');
      setSelectedType('all');
    }
  }, [isOpen]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(catalogItems.map(item => item.category)))];

  // Filter items
  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleItemClick = (item: CatalogItem) => {
    onItemSelect(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎯 Choisissez votre formation ou pack
                </h2>
                <p className="text-gray-600">
                  Découvrez tous nos programmes et packs disponibles
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une formation ou un pack..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Tous les types</option>
                <option value="pack">🏷️ Packs seulement</option>
                <option value="programme">🎓 Programmes seulement</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Toutes les catégories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              {filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Items Grid */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleItemClick(item)}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    {/* Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.type === 'pack' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type === 'pack' ? (
                          <>
                            <Package className="w-3 h-3 mr-1" />
                            Pack
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-3 h-3 mr-1" />
                            Programme
                          </>
                        )}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Catégorie:</span>
                        <span className="font-medium text-gray-900">{item.category}</span>
                      </div>
                      
                      {item.level && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Niveau:</span>
                          <span className="font-medium text-gray-900">{item.level}</span>
                        </div>
                      )}
                      
                      {item.duration && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Durée:</span>
                          <span className="font-medium text-gray-900">{item.duration}</span>
                        </div>
                      )}

                      {item.themes && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Thèmes:</span>
                          <span className="font-medium text-gray-900">{item.themes}</span>
                        </div>
                      )}

                      {item.modules && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Modules:</span>
                          <span className="font-medium text-gray-900">{item.modules}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          {item.originalPrice && item.savings ? (
                            <div>
                              <span className="text-lg font-bold text-green-600">
                                {item.price}€
                              </span>
                              <span className="text-sm text-gray-500 line-through ml-2">
                                {item.originalPrice}€
                              </span>
                              <div className="text-xs text-green-600 font-medium">
                                Économisez {item.savings}€
                              </div>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              {item.price}€
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Cliquez pour</div>
                          <div className="text-xs font-medium text-blue-600">voir les détails</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                💡 Cliquez sur un élément pour être dirigé vers sa section
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnifiedCatalogModal;
