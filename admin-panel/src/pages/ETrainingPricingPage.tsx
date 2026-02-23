import React, { useEffect, useState } from 'react';
import {
  eTrainingPricingApiService,
  ETrainingPricingSettings,
} from '../services/eTrainingPricingApiService';

const ETrainingPricingPage: React.FC = () => {
  const [form, setForm] = useState<ETrainingPricingSettings>({
    totalPrice: 1290,
    currency: 'TND',
    defaultDisplayCurrency: 'EUR',
    exchangeRates: {
      TND: 1,
      EUR: 0.29,
      USD: 0.31,
      MAD: 3.1,
      DZD: 43,
    },
    service1Price: 290,
    service2Price: 590,
    service3Price: 490,
    service1Duration: '7–14 jours',
    service2Duration: '2–4 semaines',
    service3Duration: '2–6 semaines',
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
      const raw = localStorage.getItem('eTrainingPricingSettings');
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ETrainingPricingSettings>;
      setForm({
        totalPrice: Number(parsed.totalPrice ?? 1290),
        currency: String(parsed.currency ?? 'TND'),
        defaultDisplayCurrency: String(parsed.defaultDisplayCurrency ?? 'EUR'),
        exchangeRates: (parsed.exchangeRates && typeof parsed.exchangeRates === 'object'
          ? (parsed.exchangeRates as Record<string, number>)
          : {
              TND: 1,
              EUR: 0.29,
              USD: 0.31,
              MAD: 3.1,
              DZD: 43,
            }),
        service1Price: Number(parsed.service1Price ?? 290),
        service2Price: Number(parsed.service2Price ?? 590),
        service3Price: Number(parsed.service3Price ?? 490),
        service1Duration: String(parsed.service1Duration ?? '7–14 jours'),
        service2Duration: String(parsed.service2Duration ?? '2–4 semaines'),
        service3Duration: String(parsed.service3Duration ?? '2–6 semaines'),
      });
    } catch {
      // ignore
    }
  };

  const saveToLocalStorage = (settings: ETrainingPricingSettings) => {
    try {
      localStorage.setItem('eTrainingPricingSettings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  };

  const testApiConnection = async () => {
    const ok = await eTrainingPricingApiService.testConnection();
    setIsApiConnected(ok);
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await eTrainingPricingApiService.getSettings();
      if (settings) {
        const normalized: ETrainingPricingSettings = {
          totalPrice: Number(settings.totalPrice ?? 1290),
          currency: String(settings.currency ?? 'TND'),
          defaultDisplayCurrency: String(settings.defaultDisplayCurrency ?? 'EUR'),
          exchangeRates:
            (settings.exchangeRates && typeof settings.exchangeRates === 'object'
              ? (settings.exchangeRates as Record<string, number>)
              : {
                  TND: 1,
                  EUR: 0.29,
                  USD: 0.31,
                  MAD: 3.1,
                  DZD: 43,
                }),
          service1Price: Number(settings.service1Price ?? 290),
          service2Price: Number(settings.service2Price ?? 590),
          service3Price: Number(settings.service3Price ?? 490),
          service1Duration: String(settings.service1Duration ?? '7–14 jours'),
          service2Duration: String(settings.service2Duration ?? '2–4 semaines'),
          service3Duration: String(settings.service3Duration ?? '2–6 semaines'),
        };
        setForm(normalized);
        saveToLocalStorage(normalized);
        showMessage('success', 'Prix chargés depuis la base de données');
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

    const payload = {
      totalPrice: Number(form.totalPrice),
      currency: 'TND',
      defaultDisplayCurrency: String(form.defaultDisplayCurrency || 'TND'),
      exchangeRates: form.exchangeRates && typeof form.exchangeRates === 'object' ? form.exchangeRates : undefined,
      service1Price: Number(form.service1Price),
      service2Price: Number(form.service2Price),
      service3Price: Number(form.service3Price),
      service1Duration: String(form.service1Duration || '7–14 jours'),
      service2Duration: String(form.service2Duration || '2–4 semaines'),
      service3Duration: String(form.service3Duration || '2–6 semaines'),
    };

    try {
      const saved = await eTrainingPricingApiService.updateSettings(payload);
      if (saved) {
        const normalized: ETrainingPricingSettings = {
          totalPrice: Number(saved.totalPrice ?? payload.totalPrice),
          currency: String(saved.currency ?? payload.currency),
          defaultDisplayCurrency: String(saved.defaultDisplayCurrency ?? payload.defaultDisplayCurrency),
          exchangeRates:
            (saved.exchangeRates && typeof saved.exchangeRates === 'object'
              ? (saved.exchangeRates as Record<string, number>)
              : payload.exchangeRates),
          service1Price: Number(saved.service1Price ?? payload.service1Price),
          service2Price: Number(saved.service2Price ?? payload.service2Price),
          service3Price: Number(saved.service3Price ?? payload.service3Price),
          service1Duration: String(saved.service1Duration ?? payload.service1Duration),
          service2Duration: String(saved.service2Duration ?? payload.service2Duration),
          service3Duration: String(saved.service3Duration ?? payload.service3Duration),
        };
        setForm(normalized);
        saveToLocalStorage(normalized);
        showMessage('success', 'Prix sauvegardés');
      } else {
        saveToLocalStorage(payload as ETrainingPricingSettings);
        showMessage('error', 'API indisponible, sauvegarde locale uniquement');
      }
    } catch (err) {
      console.error(err);
      saveToLocalStorage(payload as ETrainingPricingSettings);
      showMessage('error', 'Erreur lors de la sauvegarde (sauvegarde locale effectuée)');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des prix...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Prix E-Training</h1>
          <p className="text-gray-500 mt-1">Modifiez uniquement les prix affichés dans la section E-Training du site.</p>
          <div className="flex items-center mt-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${isApiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${isApiConnected ? 'text-green-600' : 'text-red-600'}`}>
              API {isApiConnected ? 'Connectée' : 'Déconnectée'}
            </span>
          </div>
          {message && (
            <div
              className={`mt-3 p-3 rounded border text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prix total (à partir de)</label>
            <input
              type="number"
              value={form.totalPrice}
              onChange={(e) => setForm((prev) => ({ ...prev, totalPrice: Number(e.target.value) }))}
              className="form-input"
              min={0}
              step={1}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Devise (base)</label>
            <input
              type="text"
              value={'TND'}
              readOnly
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Devise par défaut (affichage)</label>
            <select
              value={String(form.defaultDisplayCurrency || 'TND')}
              onChange={(e) => setForm((prev) => ({ ...prev, defaultDisplayCurrency: e.target.value }))}
              className="form-select"
            >
              <option value="TND">TND</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="MAD">MAD</option>
              <option value="DZD">DZD</option>
            </select>
          </div>

          <div className="md:col-span-2 rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-700 mb-4">Taux de change (base: TND)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">1 TND → EUR</label>
                <input
                  type="number"
                  value={Number(form.exchangeRates?.EUR ?? 0.29)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      exchangeRates: { ...(prev.exchangeRates || {}), EUR: Number(e.target.value) },
                    }))
                  }
                  className="form-input"
                  min={0}
                  step={0.0001}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">1 TND → USD</label>
                <input
                  type="number"
                  value={Number(form.exchangeRates?.USD ?? 0.31)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      exchangeRates: { ...(prev.exchangeRates || {}), USD: Number(e.target.value) },
                    }))
                  }
                  className="form-input"
                  min={0}
                  step={0.0001}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">1 TND → MAD</label>
                <input
                  type="number"
                  value={Number(form.exchangeRates?.MAD ?? 3.1)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      exchangeRates: { ...(prev.exchangeRates || {}), MAD: Number(e.target.value) },
                    }))
                  }
                  className="form-input"
                  min={0}
                  step={0.0001}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">1 TND → DZD</label>
                <input
                  type="number"
                  value={Number(form.exchangeRates?.DZD ?? 43)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      exchangeRates: { ...(prev.exchangeRates || {}), DZD: Number(e.target.value) },
                    }))
                  }
                  className="form-input"
                  min={0}
                  step={0.0001}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service 1 - Prix (à partir de)</label>
            <input
              type="number"
              value={form.service1Price}
              onChange={(e) => setForm((prev) => ({ ...prev, service1Price: Number(e.target.value) }))}
              className="form-input"
              min={0}
              step={1}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service 2 - Prix (à partir de)</label>
            <input
              type="number"
              value={form.service2Price}
              onChange={(e) => setForm((prev) => ({ ...prev, service2Price: Number(e.target.value) }))}
              className="form-input"
              min={0}
              step={1}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service 1 - Durée</label>
            <input
              type="text"
              value={form.service1Duration || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, service1Duration: e.target.value }))}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service 2 - Durée</label>
            <input
              type="text"
              value={form.service2Duration || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, service2Duration: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service 3 - Prix (à partir de)</label>
            <input
              type="number"
              value={form.service3Price}
              onChange={(e) => setForm((prev) => ({ ...prev, service3Price: Number(e.target.value) }))}
              className="form-input"
              min={0}
              step={1}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service 3 - Durée</label>
            <input
              type="text"
              value={form.service3Duration || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, service3Duration: e.target.value }))}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button type="submit" disabled={isSaving} className="btn-primary">
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button type="button" onClick={() => void loadSettings()} className="btn-secondary">
            Recharger
          </button>
        </div>
      </form>
    </div>
  );
};

export default ETrainingPricingPage;
