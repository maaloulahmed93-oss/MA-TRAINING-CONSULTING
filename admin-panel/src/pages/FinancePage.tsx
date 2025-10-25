import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { getPartnerExtraInfo, setPartnerExtraInfo, PartnerCategoryKey, PartnerExtraInfo } from '../data/partnerExtraInfoStore';
import { safeLocalStorage, safeInit } from '../utils/safeInit';

// Default form data to prevent initialization errors
const DEFAULT_FORM: PartnerExtraInfo = {
  title: '',
  subtitle: '',
  intro: '',
  icon: '📄',
  color: 'blue',
  gradient: 'from-blue-500 to-blue-600',
  details: [],
  requirements: [],
  ctaLabel: '',
  isVisible: true,
  updatedAt: new Date().toISOString()
};

const FinancePage: React.FC = () => {
  const [currentCategory, setCurrentCategory] = useState<PartnerCategoryKey>('formateur');
  const [form, setForm] = useState<PartnerExtraInfo>(DEFAULT_FORM);
  const [globalContactEmail, setGlobalContactEmail] = useState<string>('ahmedmaalou78l@gmail.com');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [visibilityStates, setVisibilityStates] = useState<Record<PartnerCategoryKey, boolean>>({
    formateur: true,
    freelance: true,
    commercial: true,
    entreprise: true
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Safe initialization effect
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize global contact email safely
        const savedEmail = safeLocalStorage.getItem('global_contact_email');
        if (savedEmail) {
          setGlobalContactEmail(savedEmail);
        }

        // Initialize visibility states safely using safeInit
        const states = await safeInit(
          () => {
            const result: Record<PartnerCategoryKey, boolean> = {
              formateur: true,
              freelance: true,
              commercial: true,
              entreprise: true
            };

            (['formateur', 'freelance', 'commercial', 'entreprise'] as PartnerCategoryKey[]).forEach(cat => {
              try {
                const data = getPartnerExtraInfo(cat);
                result[cat] = data.isVisible !== false;
              } catch (error) {
                console.warn(`Error loading data for ${cat}:`, error);
                result[cat] = true; // Default to visible
              }
            });

            return result;
          },
          {
            formateur: true,
            freelance: true,
            commercial: true,
            entreprise: true
          }
        );

        setVisibilityStates(states);
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setIsInitialized(true); // Still mark as initialized to prevent infinite loading
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      const categoryData = getPartnerExtraInfo(currentCategory);
      console.log('Category data:', categoryData);
      setForm(categoryData);
    } catch (error) {
      console.error('Error loading category data:', error);
      setForm(DEFAULT_FORM);
    }
  }, [currentCategory, isInitialized]);

  const updateField = (field: keyof PartnerExtraInfo, value: string) => {
    setForm(prev => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
  };
  const updateArrayItem = (key: 'details' | 'requirements', index: number, value: string) => {
    setForm((f) => {
      const arr = [...f[key]];
      arr[index] = value;
      return { ...f, [key]: arr, updatedAt: new Date().toISOString() };
    });
  };
  const addArrayItem = (key: 'details' | 'requirements') => {
    setForm((f) => ({ ...f, [key]: [...f[key], ''], updatedAt: new Date().toISOString() }));
  };

  const removeArrayItem = (key: 'details' | 'requirements', index: number) => {
    setForm((f) => {
      const arr = [...f[key]];
      arr.splice(index, 1);
      return { ...f, [key]: arr, updatedAt: new Date().toISOString() };
    });
  };

  const toggleVisibility = async (category: PartnerCategoryKey) => {
    console.log(`🔥 TOGGLE FUNCTION CALLED FOR: ${category}`);
    console.log(`🔄 Toggling visibility for ${category}`);
    
    const currentVisibility = visibilityStates[category];
    const newVisibility = !currentVisibility;
    
    console.log(`Current: ${currentVisibility}, New: ${newVisibility}`);
    
    // Update local state immediately
    setVisibilityStates(prev => ({
      ...prev,
      [category]: newVisibility
    }));
    
    // Update localStorage
    const categoryData = getPartnerExtraInfo(category);
    const updatedData = {
      ...categoryData,
      isVisible: newVisibility,
      updatedAt: new Date().toISOString()
    };
    
    setPartnerExtraInfo(category, updatedData);
    
    // Update current form if it's the selected category
    if (category === currentCategory) {
      setForm(updatedData);
    }
    
    // Send visibility settings to Backend API
    try {
      const allSettings: Record<string, { isVisible: boolean }> = {};
      (['formateur', 'freelance', 'commercial', 'entreprise'] as PartnerCategoryKey[]).forEach(cat => {
        const data = cat === category ? updatedData : getPartnerExtraInfo(cat);
        allSettings[cat] = { isVisible: data.isVisible !== false };
      });
      
      console.log('🔄 Sending visibility settings to Backend:', allSettings);
      
      const response = await fetch(`${API_BASE_URL}/partnerships/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: allSettings })
      });
      
      if (response.ok) {
        console.log('✅ Visibility settings synced with Backend');
      } else {
        console.warn('⚠️ Failed to sync visibility settings with Backend');
      }
    } catch (error) {
      console.error('❌ Error syncing visibility settings:', error);
    }
    
    // Show notification
    const status = newVisibility ? 'VISIBLE sur le site web' : 'CACHÉ du site web';
    const icon = newVisibility ? '👁️' : '🚫';
    alert(`${icon} ${getPartnershipTitle(category)} est maintenant ${status}!\n\n${newVisibility ? '✅ Les visiteurs peuvent voir ce partenariat' : '❌ Les visiteurs ne peuvent pas voir ce partenariat'}`);
  };

  const saveGlobalEmail = async () => {
    // Validate email format on frontend first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!globalContactEmail || !emailRegex.test(globalContactEmail.trim())) {
      alert('❌ Veuillez entrer une adresse email valide');
      return;
    }

    setIsSavingEmail(true);

    try {
      safeLocalStorage.setItem('global_contact_email', globalContactEmail);
      
      // Save to backend as well
      const response = await fetch(`${API_BASE_URL}/partnerships/global-email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: globalContactEmail.trim() })
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Email de contact global sauvegardé avec succès!\n\n🌐 Le site web utilisera maintenant ce nouvel email.');
        console.log('📧 Email saved:', result);
      } else {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        alert(`❌ Erreur Backend: ${errorData.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('⚠️ Email sauvegardé localement (erreur de connexion Backend)');
    } finally {
      setIsSavingEmail(false);
    }
  };
  const handleSave = async () => {
    // Clean form data
    const cleanedForm = {
      ...form,
      details: form.details.filter((s) => s.trim().length > 0),
      requirements: form.requirements.filter((s) => s.trim().length > 0),
      updatedAt: new Date().toISOString()
    };
    
    // Save to localStorage first
    setPartnerExtraInfo(currentCategory, cleanedForm);
    console.log(`💾 Saving ${currentCategory} partnership...`);
    
    // Try to sync with Backend API
    try {
      const partnershipData = {
        type: currentCategory,
        title: cleanedForm.title,
        subtitle: cleanedForm.subtitle,
        intro: cleanedForm.intro,
        icon: cleanedForm.icon,
        color: cleanedForm.color,
        gradient: cleanedForm.gradient,
        details: cleanedForm.details,
        requirements: cleanedForm.requirements,
        ctaLabel: cleanedForm.ctaLabel
      };

      console.log(`🔄 Syncing ${currentCategory} to Backend...`, partnershipData);

      const response = await fetch(`${API_BASE_URL}/partnerships/${currentCategory}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnershipData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${currentCategory} synced to Backend successfully:`, result.data);
        alert(`✅ ${getPartnershipTitle(currentCategory)} sauvegardé avec succès!`);
      } else if (response.status === 404) {
        // 404 is expected - endpoint not implemented yet, but data is saved locally
        console.log(`📝 ${currentCategory} saved locally (Backend endpoint not available)`);
        alert(`✅ ${getPartnershipTitle(currentCategory)} sauvegardé avec succès!`);
      } else {
        const errorText = await response.text();
        console.warn(`⚠️ Backend sync failed for ${currentCategory} (${response.status}):`, errorText);
        alert(`⚠️ ${getPartnershipTitle(currentCategory)} sauvegardé localement\n\nErreur Backend: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error syncing ${currentCategory} to Backend:`, error);
      alert(`⚠️ ${getPartnershipTitle(currentCategory)} sauvegardé localement (erreur Backend)`);
    }
  };

  const getPartnershipIcon = (category: PartnerCategoryKey) => {
    switch (category) {
      case 'formateur': return '📘';
      case 'freelance': return '💻';
      case 'commercial': return '📈';
      case 'entreprise': return '🏢';
      default: return '📄';
    }
  };


  const getPartnershipTitle = (category: PartnerCategoryKey) => {
    switch (category) {
      case 'formateur': return 'Formateur';
      case 'freelance': return 'Freelance';
      case 'commercial': return 'Commercial / Affilié';
      case 'entreprise': return 'Entreprise / École';
      default: return category;
    }
  };

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement du panneau d'administration...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panneau d'Administration</h1>
          <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full text-lg font-semibold mb-4">
            Autres infos partenaire
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gérez les contenus détaillés de vos 4 cartes partenaires. Ces données seront utilisées côté site et dans le module Partenaires.
          </p>
        </div>

        {/* Global Contact Email Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                📧 Email de Contact Global
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Cet email sera utilisé pour toutes les candidatures et demandes de partenariat
              </p>
              <div className="flex items-center space-x-4">
                <input 
                  type="email"
                  className={`flex-1 border rounded-lg px-4 py-3 focus:ring-2 focus:border-transparent transition-colors ${
                    globalContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(globalContactEmail.trim())
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  value={globalContactEmail} 
                  onChange={(e) => setGlobalContactEmail(e.target.value)} 
                  placeholder="contact@example.com" 
                />
                <button 
                  onClick={saveGlobalEmail}
                  disabled={isSavingEmail}
                  className={`px-6 py-3 text-white font-medium rounded-lg transition-colors ${
                    isSavingEmail 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSavingEmail ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Partnership Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {(['formateur','freelance','commercial','entreprise'] as PartnerCategoryKey[]).map((cat) => {
            const categoryData = getPartnerExtraInfo(cat);
            const isSelected = currentCategory === cat;
            
            return (
              <div
                key={cat}
                onClick={() => setCurrentCategory(cat)}
                className={`relative cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  isSelected ? 'scale-105 ring-4 ring-indigo-300' : ''
                }`}
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
                  {/* Card Header */}
                  <div 
                    className="p-6 text-white relative"
                    style={{
                      background: cat === 'formateur' ? 'linear-gradient(to right, #3b82f6, #1d4ed8)' :
                                 cat === 'freelance' ? 'linear-gradient(to right, #10b981, #059669)' :
                                 cat === 'commercial' ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                                 cat === 'entreprise' ? 'linear-gradient(to right, #8b5cf6, #7c3aed)' :
                                 'linear-gradient(to right, #6b7280, #4b5563)'
                    }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                    
                    {/* Visibility Toggle */}
                    <div className="absolute top-3 right-3 z-50">
                      <button
                        onClick={(e) => {
                          console.log('🔥 BUTTON CLICKED!', cat);
                          e.stopPropagation();
                          e.preventDefault();
                          toggleVisibility(cat);
                        }}
                        className={`p-3 rounded-full transition-all duration-200 border-2 ${
                          visibilityStates[cat] 
                            ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200'
                        }`}
                        title={visibilityStates[cat] ? 'VISIBLE sur le site - Cliquer pour cacher' : 'CACHÉ du site - Cliquer pour afficher'}
                        style={{ 
                          zIndex: 1000, 
                          position: 'relative',
                          pointerEvents: 'auto',
                          cursor: 'pointer'
                        }}
                      >
                        <span className="text-lg font-bold">
                          {visibilityStates[cat] ? '👁️' : '🚫'}
                        </span>
                      </button>
                      
                      {/* Status Text */}
                      <div className={`mt-1 text-xs font-bold text-center ${
                        visibilityStates[cat] ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {visibilityStates[cat] ? 'VISIBLE' : 'CACHÉ'}
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className="text-4xl mb-3">{getPartnershipIcon(cat)}</div>
                      <h3 className="text-xl font-bold mb-2">{getPartnershipTitle(cat)}</h3>
                      <p className="text-white/90 text-sm">{categoryData.subtitle}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Card Content Preview */}
                  <div className="p-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Introduction</span>
                        <p className="text-sm text-gray-700 line-clamp-2">{categoryData.intro}</p>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{categoryData.details.length} détails</span>
                        <span>{categoryData.requirements.length} conditions</span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Mis à jour: {new Date(categoryData.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit Button */}
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentCategory(cat);
                      }}
                      className={`w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                      style={{
                        background: cat === 'formateur' ? 'linear-gradient(to right, #3b82f6, #1d4ed8)' :
                                   cat === 'freelance' ? 'linear-gradient(to right, #10b981, #059669)' :
                                   cat === 'commercial' ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                                   cat === 'entreprise' ? 'linear-gradient(to right, #8b5cf6, #7c3aed)' :
                                   'linear-gradient(to right, #6b7280, #4b5563)'
                      }}
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Card Editor */}
        {currentCategory && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: currentCategory === 'formateur' ? 'linear-gradient(to right, #3b82f6, #1d4ed8)' :
                           currentCategory === 'freelance' ? 'linear-gradient(to right, #10b981, #059669)' :
                           currentCategory === 'commercial' ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                           currentCategory === 'entreprise' ? 'linear-gradient(to right, #8b5cf6, #7c3aed)' :
                           'linear-gradient(to right, #6b7280, #4b5563)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{getPartnershipIcon(currentCategory)}</div>
                  <div>
                    <h2 className="text-2xl font-bold">Édition: {getPartnershipTitle(currentCategory)}</h2>
                    <p className="text-white/90">Modifiez les informations de cette carte partenaire</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem('partner_extra_info_v1');
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    🔄 Reset
                  </button>
                  <button
                    onClick={() => {
                      const freshData = getPartnerExtraInfo(currentCategory);
                      setForm(freshData);
                    }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    ↻ Recharger
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                    value={form.title} 
                    onChange={(e)=>updateField('title', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                    value={form.subtitle} 
                    onChange={(e)=>updateField('subtitle', e.target.value)} 
                  />
                </div>
              </div>

              {/* Visual Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                    value={form.icon} 
                    onChange={(e)=>updateField('icon', e.target.value)} 
                    placeholder="📘" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                    value={form.color} 
                    onChange={(e)=>updateField('color', e.target.value)}
                  >
                    <option value="blue">Bleu</option>
                    <option value="green">Vert</option>
                    <option value="orange">Orange</option>
                    <option value="purple">Violet</option>
                    <option value="red">Rouge</option>
                    <option value="yellow">Jaune</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gradient CSS</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                    value={form.gradient} 
                    onChange={(e)=>updateField('gradient', e.target.value)} 
                    placeholder="from-blue-500 to-blue-600" 
                  />
                </div>
              </div>

              {/* Introduction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Introduction</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  value={form.intro} 
                  onChange={(e)=>updateField('intro', e.target.value)} 
                />
              </div>

              {/* Details and Requirements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Points de détail */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Points de détail</label>
                    <button 
                      onClick={()=>addArrayItem('details')} 
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.details.map((detail, i)=>(
                      <div key={i} className="flex gap-2">
                        <input 
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                          value={detail} 
                          onChange={(e)=>updateArrayItem('details', i, e.target.value)} 
                        />
                        <button 
                          onClick={()=>removeArrayItem('details', i)} 
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conditions requises */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Conditions requises</label>
                    <button 
                      onClick={()=>addArrayItem('requirements')} 
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.requirements.map((requirement, i)=>(
                      <div key={i} className="flex gap-2">
                        <input 
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                          value={requirement} 
                          onChange={(e)=>updateArrayItem('requirements', i, e.target.value)} 
                        />
                        <button 
                          onClick={()=>removeArrayItem('requirements', i)} 
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {/* Save Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Dernière mise à jour: {new Date(form.updatedAt).toLocaleString()}
                </div>
                <button 
                  onClick={handleSave} 
                  className="px-8 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  style={{
                    background: currentCategory === 'formateur' ? 'linear-gradient(to right, #3b82f6, #1d4ed8)' :
                               currentCategory === 'freelance' ? 'linear-gradient(to right, #10b981, #059669)' :
                               currentCategory === 'commercial' ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                               currentCategory === 'entreprise' ? 'linear-gradient(to right, #8b5cf6, #7c3aed)' :
                               'linear-gradient(to right, #6b7280, #4b5563)'
                  }}
                >
                  💾 Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancePage;
