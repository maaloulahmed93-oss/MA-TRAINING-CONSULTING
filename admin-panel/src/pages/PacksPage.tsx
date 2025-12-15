import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Tag, List, BookOpen } from "lucide-react";
import { Pack } from "../types/index";
import PackFormModal from "../components/packs/PackFormModal";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const PacksPage: React.FC = () => {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clean pack data before sending to backend
  const cleanPackData = (pack: Pack) => {
    return {
      packId: pack.packId,
      name: pack.name,
      description: pack.description,
      image: pack.image || '',
      niveau: pack.niveau || 'Débutant',
      resourcesCount: typeof pack.resourcesCount === 'number' ? pack.resourcesCount : 0,
      details: {
        price: pack.details.price || 0,
        originalPrice: pack.details.originalPrice || 0,
        savings: pack.details.savings || 0,
        advantages: pack.details.advantages || [],
        themes: (pack.details.themes || []).map(theme => ({
          themeId: theme.themeId,
          name: theme.name,
          startDate: theme.startDate,
          endDate: theme.endDate,
          modules: (theme.modules || []).map(module => ({
            moduleId: module.moduleId,
            title: module.title
          }))
        }))
      }
    };
  };

  // Fetch packs from backend
  const fetchPacks = async () => {
    console.log('📦 Récupération des packs depuis le backend...');
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/packs`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('✅ Réponse reçue:', response.data);
      
      if (response.data.success) {
        setPacks(response.data.data);
        console.log(`✅ ${response.data.data.length} packs chargés`);
      } else {
        setError('Erreur lors du chargement des packs');
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des packs:', err);
      setError('Impossible de charger les packs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh des packs...');
      fetchPacks();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenModalForCreate = () => {
    setSelectedPack(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (pack: Pack) => {
    setSelectedPack(pack);
    setIsModalOpen(true);
  };

  const handleSavePack = async (packToSave: Pack) => {
    console.log('💾 Sauvegarde du pack:', packToSave);
    setLoading(true);
    setError('');

    try {
      const cleanedPack = cleanPackData(packToSave);
      console.log('🧹 Pack nettoyé avant envoi:', cleanedPack);
      
      let response: any;
      if (selectedPack) {
        // Update existing pack
        response = await axios.put(`${API_BASE_URL}/packs/${selectedPack.packId}`, cleanedPack);
      } else {
        // Create new pack
        response = await axios.post(`${API_BASE_URL}/packs`, cleanedPack);
      }

      console.log('📡 Réponse de sauvegarde:', response.data);

      if (response.data.success) {
        // Immediate refresh
        await fetchPacks();
        console.log('✅ Packs rechargés après sauvegarde (immediate)');
        
        // Delayed refresh to ensure DB propagation
        setTimeout(async () => {
          await fetchPacks();
          console.log('✅ Packs rechargés après sauvegarde (delayed)');
        }, 1000);
        
        // Final refresh
        setTimeout(async () => {
          await fetchPacks();
          console.log('✅ Packs rechargés après sauvegarde (final)');
        }, 2000);
        
        // Add pack directly to state for immediate display
        if (response.data.data) {
          setPacks(prevPacks => [response.data.data, ...prevPacks]);
          console.log('✅ Pack ajouté directement au state');
        }
        
        alert('✅ Pack sauvegardé avec succès!');
        setIsModalOpen(false);
      } else {
        console.log('❌ Erreur de sauvegarde:', response.data.message);
        setError(response.data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err: any) {
      console.log('💥 Erreur axios:', err);
      console.log('💥 Erreur response:', err.response?.data);
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        console.log('❌ Erreurs de validation détaillées:');
        errorData.errors.forEach((e: string, i: number) => {
          console.log(`   ${i + 1}. ${e}`);
        });
        setError(`Erreur: ${errorData.errors.join(', ')}`);
      } else {
        setError(errorData?.message || 'Erreur lors de la sauvegarde du pack');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePack = async (packId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce pack ?")) {
      console.log('🗑️ Suppression du pack:', packId);
      setLoading(true);
      
      try {
        const response = await axios.delete(`${API_BASE_URL}/packs/${packId}`);
        
        if (response.data.success) {
          await fetchPacks();
          alert('✅ Pack supprimé avec succès!');
        } else {
          setError('Erreur lors de la suppression');
        }
      } catch (err: any) {
        console.error('❌ Erreur lors de la suppression:', err);
        setError('Impossible de supprimer le pack');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredPacks = packs.filter(
    (pack) =>
      pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pack.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Gestion des Compte Premium– Ressources & Templates
          </h1>
          <p className="mt-1 md:mt-2 text-gray-600">
            Créez, modifiez et gérez vosCompte Premium– Ressources & Templates
          </p>
        </div>
        <button
          onClick={handleOpenModalForCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Nouveau
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border p-4 md:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un pack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPacks.map((pack) => (
          <div
            key={pack.packId}
            className="bg-white shadow-lg rounded-xl overflow-hidden border flex flex-col transition-transform hover:scale-105 duration-300"
          >
            <img
              src={pack.image}
              alt={pack.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-gray-800">
                <Tag size={18} className="inline mr-2 text-blue-500" />
                {pack.name}
              </h3>
              <p className="text-gray-600 text-sm mt-2 mb-4 flex-grow">
                {pack.description}
              </p>
              <div className="flex items-baseline mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  {pack.details.price.toLocaleString()} DT
                </span>
                <span className="ml-2 text-sm text-gray-500 line-through">
                  {pack.details.originalPrice.toLocaleString()} DT
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-700 mb-4 border-t pt-3">
                <p className="flex items-center">
                  <List
                    size={16}
                    className="inline mr-2 text-green-500 flex-shrink-0"
                  />
                  {pack.details.advantages.length} Avantages inclus
                </p>
                <p className="flex items-center">
                  <BookOpen
                    size={16}
                    className="inline mr-2 text-purple-500 flex-shrink-0"
                  />
                  {pack.details.themes.length} Thèmes principaux
                </p>
              </div>
              <div className="flex items-center justify-end space-x-1 border-t pt-3 mt-auto">
                <button
                  onClick={() => handleOpenModalForEdit(pack)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeletePack(pack.packId)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPacks.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border">
          <p className="text-gray-500">
            Aucun pack trouvé. Cliquez sur 'Nouveau Pack' pour en créer un.
          </p>
        </div>
      )}

      {isModalOpen && (
        <PackFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePack}
          pack={selectedPack as any}
        />
      )}
    </div>
  );
};

export default PacksPage;
