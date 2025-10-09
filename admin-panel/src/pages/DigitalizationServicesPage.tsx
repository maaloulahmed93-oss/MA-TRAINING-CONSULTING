import React, { useState, useEffect } from 'react';
import { digitalizationServicesApi, DigitalizationServicesData } from '../services/digitalizationServicesApi';

const DigitalizationServicesPage: React.FC = () => {
  // State for services data
  const [title, setTitle] = useState<string>('Nos Services');
  const [intro, setIntro] = useState<string>('Des prestations complètes pour propulser votre transformation digitale');
  const [services, setServices] = useState<Array<{ id: string; title: string; items: string[] }>>([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);

  // Load services on component mount
  useEffect(() => {
    loadServices();
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    const connected = await digitalizationServicesApi.testConnection();
    setApiConnected(connected);
  };

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const servicesData = await digitalizationServicesApi.getServicesForAdmin();
      
      setTitle(servicesData.title);
      setIntro(servicesData.intro);
      setServices(servicesData.services);
      
      console.log('✅ Services loaded in component:', servicesData);
    } catch (error) {
      console.error('❌ Error loading services:', error);
      setError('Erreur lors du chargement des services');
    } finally {
      setIsLoading(false);
    }
  };

  const updateServiceTitle = (idx: number, value: string) => {
    const copy = [...services];
    copy[idx].title = value;
    setServices(copy);
  };

  const updateServiceItem = (sIdx: number, iIdx: number, value: string) => {
    const copy = [...services];
    copy[sIdx].items[iIdx] = value;
    setServices(copy);
  };

  const addServiceItem = (sIdx: number) => {
    const copy = [...services];
    copy[sIdx].items.push('');
    setServices(copy);
  };

  const onSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const servicesData: DigitalizationServicesData = {
        title,
        intro,
        services
      };
      
      console.log('💾 Saving services:', servicesData);
      
      const success = await digitalizationServicesApi.saveServices(servicesData);
      
      if (success) {
        setSuccessMessage('✅ Services enregistrés avec succès dans l\'API !');
      } else {
        setSuccessMessage('⚠️ Services sauvegardés localement (API indisponible)');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('❌ Error saving services:', error);
      setError('Erreur lors de la sauvegarde des services');
    } finally {
      setIsSaving(false);
    }
  };

  const onReset = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir remettre les services par défaut ? Cette action est irréversible.')) {
      try {
        setIsLoading(true);
        setError(null);
        
        const success = await digitalizationServicesApi.resetToDefault();
        
        if (success) {
          await loadServices(); // Reload services after reset
          setSuccessMessage('✅ Services remis par défaut avec succès !');
        } else {
          setError('Erreur lors de la remise à zéro des services');
        }
        
        setTimeout(() => setSuccessMessage(null), 3000);
        
      } catch (error) {
        console.error('❌ Error resetting services:', error);
        setError('Erreur lors de la remise à zéro des services');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Digitalisation — Services</h1>
        <p className="text-sm text-gray-600">Gérez le titre, l\'intro et les cartes de services.</p>
      </div>

      {/* Status indicators */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${apiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {apiConnected ? '🟢 API Connectée' : '🔴 API Déconnectée'}
          </div>
          {isLoading && (
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              🔄 Chargement...
            </div>
          )}
        </div>
        <button
          onClick={onReset}
          disabled={isLoading || isSaving}
          className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
        >
          🔄 Reset par défaut
        </button>
      </div>

      {/* Error and success messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">🔄 Chargement des services...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl border p-4">
            <label className="block text-sm font-medium mb-1">Titre section</label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full border rounded-lg px-3 py-2"
              disabled={isSaving}
            />
          </div>
          <div className="lg:col-span-3 bg-white rounded-xl border p-4">
            <label className="block text-sm font-medium mb-1">Introduction</label>
            <textarea 
              value={intro} 
              onChange={(e) => setIntro(e.target.value)} 
              className="w-full border rounded-lg px-3 py-2" 
              rows={3}
              disabled={isSaving}
            />
          </div>

          {services.map((s, sIdx) => (
            <div key={s.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  value={s.title}
                  onChange={(e) => updateServiceTitle(sIdx, e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 font-semibold"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                {s.items.map((it, iIdx) => (
                  <input
                    key={iIdx}
                    value={it}
                    onChange={(e) => updateServiceItem(sIdx, iIdx, e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isSaving}
                  />
                ))}
                <button 
                  onClick={() => addServiceItem(sIdx)} 
                  className="text-indigo-600 text-sm hover:text-indigo-800 disabled:opacity-50"
                  disabled={isSaving}
                >
                  + Ajouter un point
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button 
          onClick={onSave} 
          disabled={isSaving || isLoading}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? '💾 Enregistrement...' : '💾 Enregistrer'}
        </button>
      </div>
    </div>
  );
};

export default DigitalizationServicesPage;
