import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, BarChart3, Move } from 'lucide-react';
import { WebsitePage, WebsitePageFormData, CATEGORY_OPTIONS, ICON_OPTIONS, COLOR_OPTIONS } from '../types/websitePage';
import { WebsitePagesApiService } from '../services/websitePagesApiService';

const AppearancePage: React.FC = () => {
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<WebsitePage | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [formData, setFormData] = useState<WebsitePageFormData>({
    title: '',
    description: '',
    icon: '📄',
    buttonText: 'En savoir plus',
    buttonLink: '',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    category: 'other',
    order: 0
  });

  useEffect(() => {
    loadPages();
    loadStats();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await WebsitePagesApiService.getAllPages();
      setPages(data);
    } catch (error) {
      console.error('Error loading pages:', error);
      alert('Erreur lors du chargement des pages');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await WebsitePagesApiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPage) {
        await WebsitePagesApiService.updatePage(editingPage._id, formData);
        alert('Page mise à jour avec succès!');
      } else {
        await WebsitePagesApiService.createPage(formData);
        alert('Page créée avec succès!');
      }
      
      setShowModal(false);
      setEditingPage(null);
      resetForm();
      loadPages();
      loadStats();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (page: WebsitePage) => {
    if (page.isDefault) {
      alert('⚠️ Les pages par défaut ne peuvent pas être modifiées');
      return;
    }
    
    setEditingPage(page);
    setFormData({
      title: page.title,
      description: page.description,
      icon: page.icon,
      buttonText: page.buttonText,
      buttonLink: page.buttonLink,
      backgroundColor: page.backgroundColor,
      textColor: page.textColor,
      category: page.category,
      order: page.order
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      alert('⚠️ Les pages par défaut ne peuvent pas être supprimées');
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette page?')) {
      try {
        await WebsitePagesApiService.deletePage(id);
        alert('Page supprimée avec succès!');
        loadPages();
        loadStats();
      } catch (error: any) {
        alert(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await WebsitePagesApiService.togglePageStatus(id);
      loadPages();
      loadStats();
    } catch (error: any) {
      alert(error.message || 'Erreur lors du changement de statut');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: '📄',
      buttonText: 'En savoir plus',
      buttonLink: '',
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      category: 'other',
      order: 0
    });
  };

  const openCreateModal = () => {
    setEditingPage(null);
    resetForm();
    setShowModal(true);
  };

  const filteredPages = pages.filter(page => {
    const statusMatch = filter === 'all' || 
      (filter === 'active' && page.isActive) || 
      (filter === 'inactive' && !page.isActive);
    
    const categoryMatch = categoryFilter === 'all' || page.category === categoryFilter;
    
    return statusMatch && categoryMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Pages du Site</h1>
          <p className="text-gray-600">Gérez les pages dynamiques affichées sur le site principal</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Ajouter une Page
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total Pages</p>
                <p className="text-xl font-bold">{stats.totalPages}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <Eye className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Pages Actives</p>
                <p className="text-xl font-bold">{stats.activePages}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <EyeOff className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Pages Inactives</p>
                <p className="text-xl font-bold">{stats.inactivePages}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <Move className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Pages Par Défaut</p>
                <p className="text-xl font-bold">{stats.defaultPages}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <Plus className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Pages Personnalisées</p>
                <p className="text-xl font-bold">{stats.customPages}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Tous</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Toutes</option>
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Page
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPages.map((page) => (
              <tr key={page._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3"
                      style={{ backgroundColor: page.backgroundColor }}
                    >
                      <span className="text-lg">{page.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{page.title}</div>
                      <div className="text-sm text-gray-500">{page.description.substring(0, 50)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    page.isDefault 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {page.isDefault ? 'Par défaut' : 'Personnalisée'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {CATEGORY_OPTIONS.find(cat => cat.value === page.category)?.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    page.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {page.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {page.order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(page._id)}
                      className={`p-2 rounded-lg ${
                        page.isActive 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={page.isActive ? 'Désactiver' : 'Activer'}
                    >
                      {page.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleEdit(page)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
                      title="Modifier"
                      disabled={page.isDefault}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(page._id, page.isDefault)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                      title="Supprimer"
                      disabled={page.isDefault}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune page trouvée
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPage ? 'Modifier la Page' : 'Ajouter une Page Personnalisée'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Titre de la page"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Description de la page"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icône *
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>{icon} {icon}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texte du Bouton
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="En savoir plus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien du Bouton *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur de Fond
                  </label>
                  <select
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {COLOR_OPTIONS.map(color => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                  <div 
                    className="w-full h-8 rounded mt-2 border"
                    style={{ backgroundColor: formData.backgroundColor }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur du Texte
                  </label>
                  <select
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="#FFFFFF">Blanc</option>
                    <option value="#000000">Noir</option>
                    <option value="#374151">Gris Foncé</option>
                  </select>
                  <div 
                    className="w-full h-8 rounded mt-2 border flex items-center justify-center"
                    style={{ 
                      backgroundColor: formData.backgroundColor,
                      color: formData.textColor 
                    }}
                  >
                    Aperçu du texte
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingPage ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppearancePage;
