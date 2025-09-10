import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, Tag, List, BookOpen } from "lucide-react";
import { Pack } from "../types";
import PackFormModal from "../components/packs/PackFormModal";

// --- Mock Data ---
const initialPacks: Pack[] = [
  {
    packId: "pack-1",
    name: "Pack Marketing Digital",
    description:
      "Devenez un expert en marketing digital avec notre pack complet. Inclut SEO, SEM, et marketing sur les réseaux sociaux.",
    image:
      "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=2071&auto=format&fit=crop",
    details: {
      price: 2200,
      originalPrice: 3000,
      savings: 800,
      advantages: [
        "Accès à vie",
        "Certificat reconnu",
        "Support 24/7",
        "Projets pratiques",
      ],
      themes: [
        {
          themeId: "theme-1",
          name: "SEO & Référencement",
          startDate: "2024-09-01",
          endDate: "2024-09-30",
          modules: [
            { moduleId: "mod-1", title: "Introduction au SEO" },
            { moduleId: "mod-2", title: "SEO On-Page" },
          ],
        },
        {
          themeId: "theme-2",
          name: "Publicité en Ligne",
          startDate: "2024-10-01",
          endDate: "2024-10-31",
          modules: [{ moduleId: "mod-3", title: "Google Ads" }],
        },
      ],
    },
  },
  {
    packId: "pack-2",
    name: "Pack Développement Web",
    description:
      "Maîtrisez les technologies front-end et back-end les plus demandées sur le marché.",
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1974&auto=format&fit=crop",
    details: {
      price: 3500,
      originalPrice: 5000,
      savings: 1500,
      advantages: [
        "Projets réels",
        "Mentorat individuel",
        "Accès aux outils pro",
      ],
      themes: [
        {
          themeId: "theme-3",
          name: "Front-End",
          startDate: "2024-09-01",
          endDate: "2024-09-30",
          modules: [
            { moduleId: "mod-4", title: "React" },
            { moduleId: "mod-5", title: "TypeScript" },
          ],
        },
        {
          themeId: "theme-4",
          name: "Back-End",
          startDate: "2024-10-01",
          endDate: "2024-10-31",
          modules: [{ moduleId: "mod-6", title: "Node.js & Express" }],
        },
      ],
    },
  },
];

const PacksPage: React.FC = () => {
  const [packs, setPacks] = useState<Pack[]>(initialPacks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenModalForCreate = () => {
    setSelectedPack(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (pack: Pack) => {
    setSelectedPack(pack);
    setIsModalOpen(true);
  };

  const handleSavePack = (packToSave: Pack) => {
    const existing = packs.find((p) => p.packId === packToSave.packId);
    if (existing) {
      setPacks(
        packs.map((p) => (p.packId === packToSave.packId ? packToSave : p))
      );
    } else {
      // For new packs, generate a unique ID
      const newPackWithId = { ...packToSave, packId: `pack-${Date.now()}` };
      setPacks([...packs, newPackWithId]);
    }
    setIsModalOpen(false);
  };

  const handleDeletePack = (packId: string) => {
    // In a real app, you'd show a confirmation dialog first
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce pack ?")) {
      setPacks(packs.filter((p) => p.packId !== packId));
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
            Gestion des Packs
          </h1>
          <p className="mt-1 md:mt-2 text-gray-600">
            Créez, modifiez et gérez vos packs de formation.
          </p>
        </div>
        <button
          onClick={handleOpenModalForCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Nouveau Pack
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border p-4 md:p-6">
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
          pack={selectedPack}
        />
      )}
    </div>
  );
};

export default PacksPage;
