import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

console.log('📦 ProgramManager module loaded');

interface Module {
  title: string;
}

interface Session {
  title: string;
  date: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface Program {
  _id: string;
  title: string;
  description: string;
  category: string | { _id: string; name: string };
  level: string;
  price: number;
  duration: string;
  maxParticipants: string | number;
  sessionsPerYear: number;
  modules: Module[];
  sessions: Session[];
  isActive?: boolean;
}

console.log('🔗 API_BASE_URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);

const ProgramManager: React.FC = () => {
  console.log('🚀 ProgramManager component loaded');
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Omit<Program, '_id'>>({
    title: '',
    description: '',
    category: '',
    level: 'Débutant',
    price: 100,
    duration: '',
    maxParticipants: 10,
    sessionsPerYear: 1,
    modules: [{ title: '' }],
    sessions: [{ title: '', date: '' }]
  });

  const levels = ['Débutant', 'Intermédiaire', 'Avancé'];

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      console.log('📋 Récupération des catégories...');
      const response = await axios.get(`${API_BASE_URL}/categories`);
      
      if (response.data.success) {
        setCategories(response.data.data);
        console.log('✅ Categories loaded:', response.data.data.length);
      }
    } catch (err: any) {
      console.error('❌ Error fetching categories:', err);
    }
  };

  // Fetch programs from API using axios
  const fetchPrograms = async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      console.log('📋 Récupération des programmes...');
      console.log('🔗 URL:', `${API_BASE_URL}/programs`);
      console.log('🌐 Full URL:', `${API_BASE_URL}/programs`);
      
      const response = await axios.get(`${API_BASE_URL}/programs`, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // Force no cache
          'Pragma': 'no-cache'
        }
        // Removed activeOnly filter to show all programs in admin panel
      });
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response data:', response.data);
      
      // Check if response has data
      if (response.data && typeof response.data === 'object') {
        if (response.data.success) {
          const programs = response.data.data || [];
          console.log('📊 Programs received:', programs.length);
          console.log('📊 First program:', programs[0]);
          
          setPrograms(programs); // Replace entire state to avoid duplicates
          
          if (programs.length === 0) {
            setError('Aucun programme trouvé dans la base de données');
          } else {
            setError(''); // Clear any previous errors
            console.log('✅ Programs loaded successfully');
          }
        } else {
          setError('Erreur dans la réponse du serveur');
          console.error('❌ API returned success=false');
        }
      } else {
        setError('Réponse invalide du serveur');
        console.error('❌ Invalid response format');
      }
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      if (err.code === 'ECONNREFUSED') {
        setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      } else if (err.response) {
        setError(`Erreur serveur: ${err.response.status} - ${err.response.statusText}`);
        console.error('❌ Response error:', err.response.data);
      } else if (err.request) {
        setError('Aucune réponse du serveur. Vérifiez votre connexion.');
        console.error('❌ Request error:', err.request);
      } else {
        setError(`Erreur: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered - fetching programs and categories');
    fetchPrograms();
    fetchCategories();
  }, []);

  // Auto-refresh disabled to prevent conflicts during form submission
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchPrograms();
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  // Handle form submission using axios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation des données obligatoires
    if (!formData.title || !formData.category || !formData.duration) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Envoi avec axios vers:', `${API_BASE_URL}/programs`);
      console.log('📦 Données à envoyer:', JSON.stringify(formData, null, 2));
      
      // Find the category ID from the selected category name
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      if (!selectedCategory) {
        setError('Catégorie invalide sélectionnée');
        setLoading(false);
        return;
      }

      // Ensure all required fields are present with defaults
      const programData = {
        title: formData.title,
        description: formData.description,
        category: selectedCategory._id,
        level: formData.level || 'Débutant',
        price: formData.price || 0,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants || 10,
        sessionsPerYear: formData.sessionsPerYear || 1,
        modules: formData.modules && formData.modules.length > 0 ? formData.modules : [{ title: 'Module par défaut' }],
        sessions: formData.sessions && formData.sessions.length > 0 ? formData.sessions : [{ title: 'Session par défaut', date: 'À définir' }],
        isActive: true
      };

      let response: any;
      if (editingProgram) {
        response = await axios.put(`${API_BASE_URL}/programs/${editingProgram._id}`, programData);
      } else {
        response = await axios.post(`${API_BASE_URL}/programs`, programData);
      }

      console.log('📡 Réponse axios complète:', response);
      console.log('📄 Données de réponse:', response.data);

      if (response.data.success) {
        console.log('✅ Programme sauvegardé avec succès via axios');
        console.log('🔄 Refresh des programmes...');
        
        // Un seul refresh pour éviter les doublons
        await fetchPrograms();
        console.log('✅ Programmes rechargés après sauvegarde');
        
        alert('✅ Programme créé avec succès!');
        resetForm();
        setIsModalOpen(false);
      } else {
        console.log('❌ Erreur de sauvegarde:', response.data.message);
        setError(response.data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err: any) {
      console.log('💥 Erreur axios:', err);
      console.log('💥 Erreur response:', err.response?.data);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Delete all programs
  const handleDeleteAll = async () => {
    if (!confirm('⚠️ ATTENTION: Êtes-vous ABSOLUMENT sûr de vouloir supprimer TOUS les programmes de façon DÉFINITIVE ?\n\nCette action ne peut pas être annulée!')) {
      console.log('🚫 Delete all cancelled by user');
      return;
    }

    // Double confirmation
    if (!confirm('⚠️ DERNIÈRE CONFIRMATION: Voulez-vous vraiment supprimer TOUS les programmes? Cette action est IRRÉVERSIBLE!')) {
      console.log('🚫 Delete all cancelled by user (second confirmation)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🗑️ Starting delete ALL process...');
      
      // Delete all programs one by one
      let deletedCount = 0;
      let failedCount = 0;
      
      for (const program of programs) {
        try {
          console.log(`🗑️ Deleting program: ${program._id} - ${program.title}`);
          
          const response = await axios.delete(`${API_BASE_URL}/programs/${program._id}`, {
            timeout: 15000,
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.data.success) {
            deletedCount++;
            console.log(`✅ Deleted: ${program.title}`);
          } else {
            failedCount++;
            console.error(`❌ Failed to delete: ${program.title}`);
          }
        } catch (error: any) {
          failedCount++;
          console.error(`❌ Error deleting ${program.title}:`, error.message);
        }
      }
      
      // Clear the programs list locally
      console.log('🔄 Clearing programs list...');
      setPrograms([]);
      
      // Refresh the programs list from API
      console.log('🔄 Refreshing programs list from API...');
      await fetchPrograms();
      
      console.log(`✅ Delete all completed: ${deletedCount} deleted, ${failedCount} failed`);
      alert(`✅ Suppression terminée!\n✅ Supprimés: ${deletedCount}\n❌ Échecs: ${failedCount}`);
      
    } catch (error: any) {
      console.error('💥 Delete all failed:', error);
      setError('Erreur lors de la suppression en masse');
      alert('❌ Une erreur est survenue lors de la suppression.');
    } finally {
      setLoading(false);
      console.log('🏁 Delete all process completed');
    }
  };

  // Delete program
  const handleDelete = async (id: string) => {
    console.log('🚀 handleDelete called with ID:', id);
    
    if (!id) {
      console.error('❌ No ID provided to handleDelete');
      alert('❌ Erreur: ID du programme manquant');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
      console.log('🚫 Delete cancelled by user');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      console.log('🗑️ Starting delete process for program:', id);
      console.log('🔗 Delete URL:', `${API_BASE_URL}/programs/${id}`);
      console.log('🌐 API Base URL:', API_BASE_URL);
      
      const response = await axios.delete(`${API_BASE_URL}/programs/${id}`, {
        timeout: 15000, // 15 seconds timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 Delete response:', response);
      console.log('📊 Response status:', response.status);
      console.log('📄 Response data:', response.data);
      
      // Refresh the programs list
      console.log('🔄 Refreshing programs list...');
      await fetchPrograms();
      
      console.log('✅ Program deleted successfully');
      alert('✅ Programme supprimé avec succès!');
      
    } catch (error: any) {
      console.error('💥 Delete failed with error:', error);
      
      let errorMessage = 'Erreur inconnue';
      
      if (error.response) {
        console.error('❌ Server responded with error:', error.response.status, error.response.data);
        errorMessage = `Erreur serveur ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
        setError(errorMessage);
      } else if (error.request) {
        console.error('❌ No response received:', error.request);
        errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion.';
        setError(errorMessage);
      } else {
        console.error('❌ Request setup error:', error.message);
        errorMessage = `Erreur: ${error.message}`;
        setError(errorMessage);
      }
      
      alert(`❌ Échec de la suppression: ${errorMessage}`);
    } finally {
      setLoading(false);
      console.log('🏁 Delete process completed');
    }
  };

  // Restore program (reactivate)
  const handleRestore = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir restaurer ce programme ?')) return;

    try {
      setLoading(true);
      console.log('🔄 Restoring program:', id);
      
      const response = await axios.put(`${API_BASE_URL}/programs/${id}`, {
        isActive: true
      });
      
      console.log('📡 Restore response:', response.data);
      await fetchPrograms(); // refresh list
      
      console.log('✅ Program restored successfully');
      alert('✅ Programme restauré avec succès!');
      
    } catch (error: any) {
      console.error('💥 Restore failed:', error);
      alert('❌ Échec de la restauration du programme');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      level: 'Débutant',
      price: 100,
      duration: '',
      maxParticipants: 10,
      sessionsPerYear: 1,
      modules: [{ title: '' }],
      sessions: [{ title: '', date: '' }]
    });
    setEditingProgram(null);
    setError('');
  };

  // Edit program
  const handleEdit = (program: Program) => {
    // Convert category ID back to category name for the form
    const categoryName = typeof program.category === 'object' && program.category.name 
      ? program.category.name 
      : typeof program.category === 'string' 
        ? categories.find(cat => cat._id === program.category)?.name || program.category
        : '';
    
    setFormData({
      ...program,
      category: categoryName
    });
    setEditingProgram(program);
    setIsModalOpen(true);
  };

  // Add module
  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { title: '' }]
    });
  };

  // Remove module
  const removeModule = (index: number) => {
    const newModules = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: newModules });
  };

  // Add session
  const addSession = () => {
    setFormData({
      ...formData,
      sessions: [...formData.sessions, { title: '', date: '' }]
    });
  };

  // Remove session
  const removeSession = (index: number) => {
    const newSessions = formData.sessions.filter((_, i) => i !== index);
    setFormData({ ...formData, sessions: newSessions });
  };


  // Debug info for current state
  console.log('🎨 Render state:', {
    programsCount: programs.length,
    loading,
    error,
    programs: programs.slice(0, 1) // Show only first program to avoid spam
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Programmes de parcours</h1>
        <div className="flex gap-3">
          <button
            onClick={handleDeleteAll}
            disabled={programs.length === 0 || loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon className="w-5 h-5" />
            Supprimer Tout
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Nouveau Programme
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="bg-gray-100 border border-gray-300 p-3 rounded mb-4 text-sm">
        <strong>Debug Info:</strong><br/>
        Programs: {programs.length} | Loading: {loading ? 'Yes' : 'No'} | Error: {error || 'None'}<br/>
        API URL: {API_BASE_URL}/programs<br/>
        <button 
          onClick={fetchPrograms}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
        >
          Reload Data
        </button>
      </div>


      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Programs List */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Titre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Catégorie
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Niveau
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Prix
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Statut
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  {loading ? 'Chargement des programmes...' : 'Aucun programme trouvé'}
                </td>
              </tr>
            ) : (
              programs.map((program) => (
                <tr key={program._id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{program.title}</div>
                    <div className="text-sm text-gray-500">{program.duration}</div>
                  </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {typeof program.category === 'object' && program.category?.name 
                      ? program.category.name 
                      : typeof program.category === 'string' 
                        ? program.category 
                        : 'Non défini'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {program.level}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {program.price}€
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    program.isActive !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {program.isActive !== false ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(program)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1 text-xs font-medium"
                      title="Modifier le programme"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Modifier
                    </button>
                    {program.isActive !== false ? (
                      <button
                        onClick={() => {
                          console.log('🗑️ Delete button clicked for program:', program);
                          console.log('🆔 Program ID:', program._id);
                          if (program._id) {
                            handleDelete(program._id);
                          } else {
                            console.error('❌ Program ID is missing!');
                            alert('❌ Erreur: ID du programme manquant');
                          }
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1 text-xs font-medium"
                        disabled={loading}
                        title="Supprimer le programme"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Supprimer
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(program._id!)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1 text-xs font-medium"
                        disabled={loading}
                        title="Restaurer le programme"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Restaurer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProgram ? 'Modifier le Programme' : 'Nouveau Programme'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: '2px solid #d1d5db'
                    }}>
                      <strong style={{color: '#1f2937', fontSize: '16px'}}>Titre du Programme</strong>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Programme React Avancée"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: '2px solid #d1d5db'
                    }}>
                      <strong style={{color: '#1f2937', fontSize: '16px'}}>Catégorie</strong>
                    </div>
                    <select
                      value={typeof formData.category === 'string' ? formData.category : ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    border: '2px solid #d1d5db'
                  }}>
                    <strong style={{color: '#1f2937', fontSize: '16px'}}>Description</strong>
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Décrivez le contenu et les objectifs du programme... (minimum 10 caractères)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      formData.description && formData.description.length < 10 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {formData.description && formData.description.length < 10 && (
                    <p className="text-red-500 text-sm mt-1">
                      Description doit contenir au moins 10 caractères ({formData.description.length}/10)
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: '2px solid #d1d5db'
                    }}>
                      <strong style={{color: '#1f2937', fontSize: '16px'}}>Durée du Programme</strong>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="4 semaines (minimum 3 caractères)"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className={`block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        formData.duration && formData.duration.length < 3 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                    />
                    {formData.duration && formData.duration.length < 3 && (
                      <p className="text-red-500 text-sm mt-1">
                        Durée doit contenir au moins 3 caractères ({formData.duration.length}/3)
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: '2px solid #d1d5db'
                    }}>
                      <strong style={{color: '#1f2937', fontSize: '16px'}}>Nombre Maximum de Participants</strong>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 1-10, 2-4, 5-8"
                      value={formData.maxParticipants || ''}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>


                {/* Modules */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Étapes du parcours</label>
                    <button
                      type="button"
                      onClick={addModule}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ajouter Étapes
                    </button>
                  </div>
                  {formData.modules.map((module, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        required
                        placeholder="Titre (minimum 3 caractères)"
                        value={module.title}
                        onChange={(e) => {
                          const newModules = [...formData.modules];
                          newModules[index].title = e.target.value;
                          setFormData({ ...formData, modules: newModules });
                        }}
                        className={`flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          module.title && module.title.length < 3 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                      />
                      {module.title && module.title.length < 3 && (
                        <span className="text-red-500 text-xs self-center ml-1">
                          {module.title.length}/3
                        </span>
                      )}
                      {formData.modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModule(index)}
                          className="text-red-600 hover:text-red-800 px-2"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  ))}
                </div>


                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={(e) => {
                      console.log('🔥 Bouton submit cliqué!');
                      console.log('🔍 Event:', e);
                      console.log('📋 FormData actuel:', formData);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : (editingProgram ? 'Modifier' : 'Enregistrer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManager;
