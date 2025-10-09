import React, { useState, useEffect } from 'react';
import { 
  digitalizationTestimonialsApiService, 
  TestimonialItem, 
  TestimonialsData 
} from '../services/digitalizationTestimonialsApiService';

const DigitalizationTestimonialsPage: React.FC = () => {
  const [title, setTitle] = useState('Témoignages Clients');
  const [subtitle, setSubtitle] = useState('Ce que disent nos clients de nos services de digitalisation');
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadTestimonialsData();
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    const isConnected = await digitalizationTestimonialsApiService.checkApiHealth();
    setApiConnected(isConnected);
    
    if (isConnected) {
      const statsData = await digitalizationTestimonialsApiService.getStats();
      setStats(statsData);
    }
  };

  const loadTestimonialsData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading testimonials data...');
      
      const data = await digitalizationTestimonialsApiService.getTestimonialsForAdmin();
      
      setTitle(data.title);
      setSubtitle(data.subtitle);
      setItems(data.items);
      
      console.log('✅ Testimonials data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading testimonials data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (idx: number, key: keyof TestimonialItem, value: string) => {
    const copy = [...items];
    (copy[idx] as TestimonialItem)[key] = value as never;
    setItems(copy);
  };

  const addItem = () => setItems([...items, { author: '', role: '', quote: '', rating: 5 }]);

  const onSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving Testimonials...', { title, subtitle, items });
      
      const testimonialsData: TestimonialsData = {
        title,
        subtitle,
        items
      };
      
      const success = await digitalizationTestimonialsApiService.saveTestimonials(testimonialsData);
      
      if (success) {
        alert('✅ Témoignages enregistrés avec succès!');
        // Refresh stats
        await checkApiStatus();
      } else {
        alert('⚠️ Témoignages sauvegardés localement (API non disponible)');
      }
      
    } catch (error) {
      console.error('❌ Error saving testimonials:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser les témoignages aux valeurs par défaut ?')) {
      try {
        setSaving(true);
        const success = await digitalizationTestimonialsApiService.resetToDefault();
        
        if (success) {
          alert('✅ Témoignages réinitialisés!');
          await loadTestimonialsData();
        } else {
          alert('❌ Erreur lors de la réinitialisation');
        }
      } catch (error) {
        console.error('❌ Error resetting testimonials:', error);
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
            <p className="mt-4 text-gray-600">Chargement des témoignages...</p>
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
            <h1 className="text-2xl font-bold">Digitalisation — Témoignages</h1>
            <p className="text-sm text-gray-600">Gérez le titre et les témoignages spécifiques à la page Digitalisation.</p>
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
                {stats.totalTestimonials} témoignages • ⭐ {stats.averageRating}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-4">
          <label className="block text-sm font-medium mb-1">Titre</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div className="bg-white rounded-xl border p-4">
          <label className="block text-sm font-medium mb-1">Sous-titre</label>
          <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} />
        </div>

        {items.map((t, idx) => (
          <div key={idx} className="bg-white rounded-xl border p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Nom" value={t.author} onChange={(e) => updateItem(idx, 'author', e.target.value)} className="border rounded-lg px-3 py-2" />
            <input placeholder="Rôle (optionnel)" value={t.role || ''} onChange={(e) => updateItem(idx, 'role', e.target.value)} className="border rounded-lg px-3 py-2" />
            <input placeholder="Citation" value={t.quote} onChange={(e) => updateItem(idx, 'quote', e.target.value)} className="border rounded-lg px-3 py-2 md:col-span-3" />
          </div>
        ))}
        <button onClick={addItem} className="text-indigo-600 text-sm">+ Ajouter un témoignage</button>
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
          onClick={loadTestimonialsData} 
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

export default DigitalizationTestimonialsPage;
