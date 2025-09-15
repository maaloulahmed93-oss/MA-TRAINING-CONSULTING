import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

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
  maxParticipants: number;
  sessionsPerYear: number;
  modules: Module[];
  sessions: Session[];
  isActive?: boolean;
}

const API_BASE_URL = '/api';

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
    price: 100, // Prix par défaut non-zéro
    duration: '',
    maxParticipants: 10, // Valeur par défaut non-zéro
    sessionsPerYear: 1, // Valeur par défaut non-zéro
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
      console.log('🌐 Full URL:', window.location.origin + `${API_BASE_URL}/programs`);
      
      const response = await axios.get(`${API_BASE_URL}/programs`, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // Force no cache
          'Pragma': 'no-cache'
        }
      });
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response data:', response.data);
      
      // Check if response has data
      if (response.data && typeof response.data === 'object') {
        if (response.data.success) {
          const programs = response.data.data || [];
          console.log('📊 Programs received:', programs.length);
          console.log('📊 First program:', programs[0]);
          
          setPrograms([...programs]);
          
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

  // Auto-refresh every 30 seconds to keep data synchronized
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPrograms();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle form submission using axios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation des données obligatoires
    if (!formData.title || !formData.description || !formData.category || !formData.level) {
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

      const programData = {
        ...formData,
        category: selectedCategory._id // Send category ID instead of name
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
        console.log('🔄 Force refresh des programmes...');
        
        // Force refresh immédiat + delayed refresh pour s'assurer de la mise à jour
        await fetchPrograms();
        
        // Deuxième refresh après délai pour s'assurer que la DB est mise à jour
        setTimeout(async () => {
          await fetchPrograms();
          console.log('✅ Programmes rechargés après sauvegarde (delayed)');
        }, 1000);
        
        // Troisième refresh pour être absolument sûr
        setTimeout(async () => {
          await fetchPrograms();
          console.log('✅ Programmes rechargés après sauvegarde (final)');
        }, 2000);
        
        // إضافة البرنامج الجديد مباشرة للـ state لضمان الظهور الفوري
        if (response.data.data) {
          setPrograms(prevPrograms => [response.data.data, ...prevPrograms]);
          console.log('✅ Programme ajouté directement au state');
        }
        
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

  // Delete program
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/programs/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchPrograms();
      } else {
        setError(data.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Error deleting program:', err);
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Programmes</h1>
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
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Niveau
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {loading ? 'Chargement des programmes...' : 'Aucun programme trouvé'}
                </td>
              </tr>
            ) : (
              programs.map((program) => (
                <tr key={program._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{program.title}</div>
                    <div className="text-sm text-gray-500">{program.duration}</div>
                  </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {typeof program.category === 'object' && program.category.name 
                      ? program.category.name 
                      : program.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {program.level}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {program.price}€
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(program)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(program._id!)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
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
                      placeholder="Ex: Formation React Avancée"
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
                      value={formData.category}
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
                    placeholder="Décrivez le contenu et les objectifs du programme..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
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
                      <strong style={{color: '#1f2937', fontSize: '16px'}}>Niveau</strong>
                    </div>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {levels.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: '2px solid #d1d5db'
                    }}>
                      <strong style={{color: '#1f2937', fontSize: '16px'}}>Prix du Programme (€)</strong>
                    </div>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="299"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
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
                      placeholder="4 semaines"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                      <strong style={{color: '#1f2937', fontSize: '16px'}}>Nombre Maximum de Participants</strong>
                    </div>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="20"
                      value={formData.maxParticipants || ''}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) || 0 })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: '2px solid #d1d5db'
                    }}>
                      <strong style={{color: '#1f2937', fontSize: '16px'}}>Nombre de Sessions par An</strong>
                    </div>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="4"
                      value={formData.sessionsPerYear || ''}
                      onChange={(e) => setFormData({ ...formData, sessionsPerYear: Number(e.target.value) || 0 })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Modules */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Modules Inclus</label>
                    <button
                      type="button"
                      onClick={addModule}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ajouter Module
                    </button>
                  </div>
                  {formData.modules.map((module, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        required
                        placeholder="Titre du module"
                        value={module.title}
                        onChange={(e) => {
                          const newModules = [...formData.modules];
                          newModules[index].title = e.target.value;
                          setFormData({ ...formData, modules: newModules });
                        }}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
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

                {/* Sessions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Sessions Disponibles</label>
                    <button
                      type="button"
                      onClick={addSession}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ajouter Session
                    </button>
                  </div>
                  {formData.sessions.map((session, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        required
                        placeholder="Titre de la session"
                        value={session.title}
                        onChange={(e) => {
                          const newSessions = [...formData.sessions];
                          newSessions[index].title = e.target.value;
                          setFormData({ ...formData, sessions: newSessions });
                        }}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Date (ex: 15 Août - 15 Nov)"
                        value={session.date}
                        onChange={(e) => {
                          const newSessions = [...formData.sessions];
                          newSessions[index].date = e.target.value;
                          setFormData({ ...formData, sessions: newSessions });
                        }}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.sessions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSession(index)}
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
