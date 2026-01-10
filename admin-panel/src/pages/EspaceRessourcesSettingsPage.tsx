import React, { useEffect, useState } from 'react';
import {
  espaceRessourcesSettingsApiService,
  EspaceRessourcesSettings,
} from '../services/espaceRessourcesSettingsApiService';

const EspaceRessourcesSettingsPage: React.FC = () => {
  const [form, setForm] = useState<EspaceRessourcesSettings>({
    accessCode: '00000000',
    bonusCode: '00000000',
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
      const raw = localStorage.getItem('espaceRessourcesSettings');
      if (!raw) return;
      const parsed = JSON.parse(raw) as EspaceRessourcesSettings;
      setForm({
        accessCode: parsed.accessCode ?? '00000000',
        bonusCode: parsed.bonusCode ?? '00000000',
      });
    } catch {
      // ignore
    }
  };

  const saveToLocalStorage = (settings: EspaceRessourcesSettings) => {
    try {
      localStorage.setItem('espaceRessourcesSettings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  };

  const testApiConnection = async () => {
    const ok = await espaceRessourcesSettingsApiService.testConnection();
    setIsApiConnected(ok);
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await espaceRessourcesSettingsApiService.getSettings();
      if (settings) {
        setForm({
          accessCode: settings.accessCode ?? '00000000',
          bonusCode: settings.bonusCode ?? '00000000',
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

    const payload: Omit<EspaceRessourcesSettings, '_id' | 'createdAt' | 'updatedAt'> = {
      accessCode: form.accessCode,
      bonusCode: form.bonusCode,
    };

    try {
      const saved = await espaceRessourcesSettingsApiService.updateSettings(payload);
      if (saved) {
        saveToLocalStorage(saved);
        setForm({
          accessCode: saved.accessCode ?? payload.accessCode,
          bonusCode: saved.bonusCode ?? payload.bonusCode,
        });
        showMessage('success', 'Paramètres enregistrés');
      } else {
        saveToLocalStorage(payload as EspaceRessourcesSettings);
        showMessage('error', 'Échec API: sauvegarde locale uniquement');
      }
    } catch {
      saveToLocalStorage(payload as EspaceRessourcesSettings);
      showMessage('error', 'Erreur: sauvegarde locale uniquement');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Espace Ressources – Codes d’accès</h1>
          <p className="mt-1 text-gray-600">
            Configurez le code d’accès général et le code Bonus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`text-sm font-semibold ${
              isApiConnected ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {isApiConnected ? 'API Connectée' : 'API Non connectée'}
          </div>
          <button
            type="button"
            onClick={() => void loadSettings()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            Actualiser
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Code d’accès (Page 1)</label>
              <input
                type="text"
                value={form.accessCode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    accessCode: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="00000000"
              />
              <p className="mt-1 text-xs text-gray-500">
                Utilisé pour accéder à /espaces-ressources.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Code Bonus (Page 2)</label>
              <input
                type="text"
                value={form.bonusCode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    bonusCode: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="00000000"
              />
              <p className="mt-1 text-xs text-gray-500">
                Utilisé pour accéder aux ressources Bonus.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EspaceRessourcesSettingsPage;
