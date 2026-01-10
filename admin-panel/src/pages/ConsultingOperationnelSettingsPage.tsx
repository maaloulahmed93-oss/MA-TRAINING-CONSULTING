import React, { useEffect, useState } from 'react';
import {
  consultingOperationnelSettingsApiService,
  ConsultingOperationnelSettings,
} from '../services/consultingOperationnelSettingsApiService';

const ConsultingOperationnelSettingsPage: React.FC = () => {
  const [form, setForm] = useState<ConsultingOperationnelSettings>({
    posteIntitule: '',
    entrepriseSecteur: '',
    element1: '',
    element2: '',
    difficulte1: '',
    difficulte2: '',
    demandeDirection: '',
    session1DateTime: '',
    session1VideoUrl: '',
    session2DateTime: '',
    session2VideoUrl: '',
    session3DateTime: '',
    session3VideoUrl: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    void testApiConnection();
    void loadSettings();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadFromLocalStorage = () => {
    try {
      const raw = localStorage.getItem('consultingOperationnelSettings');
      if (!raw) return;
      const parsed = JSON.parse(raw) as ConsultingOperationnelSettings;
      setForm({
        posteIntitule: parsed.posteIntitule ?? '',
        entrepriseSecteur: parsed.entrepriseSecteur ?? '',
        element1: parsed.element1 ?? '',
        element2: parsed.element2 ?? '',
        difficulte1: parsed.difficulte1 ?? '',
        difficulte2: parsed.difficulte2 ?? '',
        demandeDirection: parsed.demandeDirection ?? '',
        session1DateTime: parsed.session1DateTime ?? '',
        session1VideoUrl: parsed.session1VideoUrl ?? '',
        session2DateTime: parsed.session2DateTime ?? '',
        session2VideoUrl: parsed.session2VideoUrl ?? '',
        session3DateTime: parsed.session3DateTime ?? '',
        session3VideoUrl: parsed.session3VideoUrl ?? '',
      });
    } catch {
      // ignore
    }
  };

  const saveToLocalStorage = (settings: ConsultingOperationnelSettings) => {
    try {
      localStorage.setItem('consultingOperationnelSettings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  };

  const testApiConnection = async () => {
    const ok = await consultingOperationnelSettingsApiService.testConnection();
    setIsApiConnected(ok);
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await consultingOperationnelSettingsApiService.getSettings();
      if (settings) {
        setForm({
          posteIntitule: settings.posteIntitule ?? '',
          entrepriseSecteur: settings.entrepriseSecteur ?? '',
          element1: settings.element1 ?? '',
          element2: settings.element2 ?? '',
          difficulte1: settings.difficulte1 ?? '',
          difficulte2: settings.difficulte2 ?? '',
          demandeDirection: settings.demandeDirection ?? '',
          session1DateTime: settings.session1DateTime ?? '',
          session1VideoUrl: settings.session1VideoUrl ?? '',
          session2DateTime: settings.session2DateTime ?? '',
          session2VideoUrl: settings.session2VideoUrl ?? '',
          session3DateTime: settings.session3DateTime ?? '',
          session3VideoUrl: settings.session3VideoUrl ?? '',
        });
        showMessage('success', 'Paramètres chargés depuis la base de données');
      } else {
        loadFromLocalStorage();
        showMessage('error', 'API indisponible, chargement des données locales');
      }
    } catch {
      loadFromLocalStorage();
      showMessage('error', 'Erreur de chargement, données locales utilisées');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: Omit<ConsultingOperationnelSettings, '_id' | 'createdAt' | 'updatedAt'> = {
      posteIntitule: form.posteIntitule,
      entrepriseSecteur: form.entrepriseSecteur,
      element1: form.element1,
      element2: form.element2,
      difficulte1: form.difficulte1,
      difficulte2: form.difficulte2,
      demandeDirection: form.demandeDirection,
      session1DateTime: form.session1DateTime,
      session1VideoUrl: form.session1VideoUrl,
      session2DateTime: form.session2DateTime,
      session2VideoUrl: form.session2VideoUrl,
      session3DateTime: form.session3DateTime,
      session3VideoUrl: form.session3VideoUrl,
    };

    try {
      const saved = await consultingOperationnelSettingsApiService.updateSettings(payload);
      if (saved) {
        saveToLocalStorage(saved);
        showMessage('success', 'Paramètres enregistrés');
      } else {
        saveToLocalStorage(payload as ConsultingOperationnelSettings);
        showMessage('error', 'Échec API: sauvegarde locale uniquement');
      }
    } catch {
      saveToLocalStorage(payload as ConsultingOperationnelSettings);
      showMessage('error', 'Erreur: sauvegarde locale uniquement');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Consulting Opérationnel (Service 2)</h1>
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              isApiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${isApiConnected ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
            {isApiConnected ? 'API Connecté' : 'API Déconnecté'}
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {isLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
            Chargement...
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Intitulé du poste</label>
              <input
                type="text"
                value={form.posteIntitule}
                onChange={(e) => setForm({ ...form, posteIntitule: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type d’entreprise / secteur</label>
              <input
                type="text"
                value={form.entrepriseSecteur}
                onChange={(e) => setForm({ ...form, entrepriseSecteur: e.target.value })}
                placeholder="Ex: Industrie / Services"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Élément existant 1</label>
              <input
                type="text"
                value={form.element1}
                onChange={(e) => setForm({ ...form, element1: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Élément existant 2</label>
              <input
                type="text"
                value={form.element2}
                onChange={(e) => setForm({ ...form, element2: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dysfonctionnement / difficulté constatée</label>
              <input
                type="text"
                value={form.difficulte1}
                onChange={(e) => setForm({ ...form, difficulte1: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Manque de cohérence / d’application / de résultats</label>
              <input
                type="text"
                value={form.difficulte2}
                onChange={(e) => setForm({ ...form, difficulte2: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Demande générale de la direction</label>
              <input
                type="text"
                value={form.demandeDirection}
                onChange={(e) => setForm({ ...form, demandeDirection: e.target.value })}
                placeholder='Ex: "Améliorez la situation"'
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="text-lg font-semibold text-gray-900">Sessions (Enregistrements vidéo)</div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">SESSION 1 — Date et l'heure</label>
                <input
                  type="text"
                  value={form.session1DateTime}
                  onChange={(e) => setForm({ ...form, session1DateTime: e.target.value })}
                  placeholder="Ex: 30/12/2025 - 14:00"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SESSION 1 — URL vidéo</label>
                <input
                  type="text"
                  value={form.session1VideoUrl}
                  onChange={(e) => setForm({ ...form, session1VideoUrl: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SESSION 2 — Date et l'heure</label>
                <input
                  type="text"
                  value={form.session2DateTime}
                  onChange={(e) => setForm({ ...form, session2DateTime: e.target.value })}
                  placeholder="Ex: 02/01/2026 - 10:00"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SESSION 2 — URL vidéo</label>
                <input
                  type="text"
                  value={form.session2VideoUrl}
                  onChange={(e) => setForm({ ...form, session2VideoUrl: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SESSION 3 — Date et l'heure</label>
                <input
                  type="text"
                  value={form.session3DateTime}
                  onChange={(e) => setForm({ ...form, session3DateTime: e.target.value })}
                  placeholder="Ex: 09/01/2026 - 16:00"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SESSION 3 — URL vidéo</label>
                <input
                  type="text"
                  value={form.session3VideoUrl}
                  onChange={(e) => setForm({ ...form, session3VideoUrl: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md shadow-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultingOperationnelSettingsPage;
