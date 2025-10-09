import React, { useState, useEffect } from 'react';
import { 
  digitalizationPortfolioApiService, 
  PortfolioCard, 
  PortfolioExample, 
  PortfolioData 
} from '../services/digitalizationPortfolioApiService';

const DigitalizationPortfolioPage: React.FC = () => {
  const [title, setTitle] = useState('Portfolio & Réalisations');
  const [intro, setIntro] = useState('Découvrez les résultats concrets obtenus pour nos clients');
  const [cards, setCards] = useState<PortfolioCard[]>([]);
  const [examples, setExamples] = useState<Record<string, PortfolioExample[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadPortfolioData();
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    const isConnected = await digitalizationPortfolioApiService.checkApiHealth();
    setApiConnected(isConnected);
    
    if (isConnected) {
      const statsData = await digitalizationPortfolioApiService.getStats();
      setStats(statsData);
    }
  };

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading portfolio data...');
      
      const data = await digitalizationPortfolioApiService.getPortfolioForAdmin();
      
      setTitle(data.title);
      setIntro(data.intro);
      setCards(data.cards);
      setExamples(data.examples);
      
      console.log('✅ Portfolio data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCard = (idx: number, key: keyof PortfolioCard, value: string | undefined) => {
    const copy = [...cards];
    (copy[idx] as PortfolioCard)[key] = value as never;
    setCards(copy);
  };

  const updateExample = (
    cat: string,
    eIdx: number,
    key: keyof PortfolioExample,
    value: string
  ) => {
    const group: PortfolioExample[] = examples[cat] ? [...examples[cat]] : [];
    const current: PortfolioExample = group[eIdx] || { name: '', detail: '' };
    group[eIdx] = { ...current, [key]: value } as PortfolioExample;
    setExamples({ ...examples, [cat]: group });
  };

  const addExample = (cat: string) => {
    const group = examples[cat] ? [...examples[cat]] : [];
    group.push({ name: '', detail: '', link: '' });
    setExamples({ ...examples, [cat]: group });
  };

  const onSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving Portfolio...', { title, intro, cards, examples });
      
      const portfolioData: PortfolioData = {
        title,
        intro,
        cards,
        examples
      };
      
      const success = await digitalizationPortfolioApiService.savePortfolio(portfolioData);
      
      if (success) {
        alert('✅ Portfolio enregistré avec succès!');
        // Refresh stats
        await checkApiStatus();
      } else {
        alert('⚠️ Portfolio sauvegardé localement (API non disponible)');
      }
      
    } catch (error) {
      console.error('❌ Error saving portfolio:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser le portfolio aux valeurs par défaut ?')) {
      try {
        setSaving(true);
        const success = await digitalizationPortfolioApiService.resetToDefault();
        
        if (success) {
          alert('✅ Portfolio réinitialisé!');
          await loadPortfolioData();
        } else {
          alert('❌ Erreur lors de la réinitialisation');
        }
      } catch (error) {
        console.error('❌ Error resetting portfolio:', error);
        alert('❌ Erreur lors de la réinitialisation');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Digitalisation — Portfolio</h1>
            <p className="text-sm text-gray-600">Gérez les cartes portfolio et les exemples réels.</p>
          </div>
          
          {/* API Status & Stats */}
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              apiConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {apiConnected ? '🟢 API Connecté' : '🔴 API Déconnecté'}
            </div>
            
            {stats && (
              <div className="text-xs text-gray-500">
                {stats.totalCards} cartes • {stats.totalExamples} exemples
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-4">
          <label className="block text-sm font-medium mb-1">Titre section</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div className="bg-white rounded-xl border p-4">
          <label className="block text-sm font-medium mb-1">Introduction</label>
          <textarea value={intro} onChange={(e) => setIntro(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={3} />
        </div>

        {cards.map((c, idx) => (
          <div key={idx} className="bg-white rounded-xl border p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Emoji</label>
                <input value={c.emoji || ''} onChange={(e) => updateCard(idx, 'emoji', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input value={c.title} onChange={(e) => updateCard(idx, 'title', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Description</label>
                <input value={c.description} onChange={(e) => updateCard(idx, 'description', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Résultat</label>
                <input value={c.result || ''} onChange={(e) => updateCard(idx, 'result', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Exemples réels</h3>
              {(examples[c.title] || []).map((ex, exIdx) => (
                <div key={exIdx} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                  <input placeholder="Nom" value={ex.name} onChange={(e) => updateExample(c.title, exIdx, 'name', e.target.value)} className="border rounded-lg px-3 py-2" />
                  <input placeholder="Détail" value={ex.detail} onChange={(e) => updateExample(c.title, exIdx, 'detail', e.target.value)} className="border rounded-lg px-3 py-2 md:col-span-2" />
                  <input placeholder="Lien (optionnel)" value={ex.link || ''} onChange={(e) => updateExample(c.title, exIdx, 'link', e.target.value)} className="border rounded-lg px-3 py-2" />
                </div>
              ))}
              <button onClick={() => addExample(c.title)} className="text-indigo-600 text-sm">+ Ajouter un exemple</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <button 
          onClick={onSave} 
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-white font-medium ${
            saving 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {saving ? '💾 Enregistrement...' : '💾 Enregistrer'}
        </button>
        
        <button 
          onClick={onReset} 
          disabled={saving}
          className={`px-4 py-2 rounded-lg border font-medium ${
            saving 
              ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
              : 'border-red-300 text-red-600 hover:bg-red-50'
          }`}
        >
          {saving ? '🔄 Traitement...' : '🔄 Réinitialiser'}
        </button>
        
        <button 
          onClick={loadPortfolioData} 
          disabled={saving}
          className={`px-4 py-2 rounded-lg border font-medium ${
            saving 
              ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
              : 'border-blue-300 text-blue-600 hover:bg-blue-50'
          }`}
        >
          🔄 Recharger
        </button>
      </div>
    </div>
  );
};

export default DigitalizationPortfolioPage;
