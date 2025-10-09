import React, { useState, useEffect } from 'react';
import { digitalizationProductsApi, DigitalizationProductsData, DigitalizationProduct } from '../services/digitalizationProductsApi';

const DigitalizationProductsPage: React.FC = () => {
  // State for products data
  const [title, setTitle] = useState('Démo & Produits Prêts');
  const [intro, setIntro] = useState('Découvrez nos solutions en action et testez nos produits avant de vous engager');
  const [products, setProducts] = useState<DigitalizationProduct[]>([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    const connected = await digitalizationProductsApi.testConnection();
    setApiConnected(connected);
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const productsData = await digitalizationProductsApi.getProductsForAdmin();
      
      setTitle(productsData.title);
      setIntro(productsData.intro);
      setProducts(productsData.products);
      
      console.log('✅ Products loaded in component:', productsData);
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setError('Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = (idx: number, key: keyof DigitalizationProduct, value: string | string[] | undefined) => {
    const copy = [...products];
    (copy[idx] as DigitalizationProduct)[key] = value as never;
    setProducts(copy);
  };

  const addDetail = (idx: number) => {
    const copy = [...products];
    copy[idx].details = copy[idx].details ? [...copy[idx].details!, ''] : [''];
    setProducts(copy);
  };

  const updateDetail = (pIdx: number, dIdx: number, value: string) => {
    const copy = [...products];
    if (!copy[pIdx].details) copy[pIdx].details = [];
    copy[pIdx].details![dIdx] = value;
    setProducts(copy);
  };

  const addProduct = () => {
    const newProduct: DigitalizationProduct = {
      id: `product-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: '',
      details: [],
      mailtoSubject: '',
      demoLink: '#demo',
      category: 'web',
      isActive: true
    };
    setProducts([...products, newProduct]);
  };

  const onSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const productsData: DigitalizationProductsData = {
        title,
        intro,
        products
      };
      
      console.log('💾 Saving products:', productsData);
      
      const success = await digitalizationProductsApi.saveProducts(productsData);
      
      if (success) {
        setSuccessMessage('✅ Produits enregistrés avec succès dans l\'API !');
      } else {
        setSuccessMessage('⚠️ Produits sauvegardés localement (API indisponible)');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('❌ Error saving products:', error);
      setError('Erreur lors de la sauvegarde des produits');
    } finally {
      setIsSaving(false);
    }
  };

  const onReset = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir remettre les produits par défaut ? Cette action est irréversible.')) {
      try {
        setIsLoading(true);
        setError(null);
        
        const success = await digitalizationProductsApi.resetToDefault();
        
        if (success) {
          await loadProducts(); // Reload products after reset
          setSuccessMessage('✅ Produits remis par défaut avec succès !');
        } else {
          setError('Erreur lors de la remise à zéro des produits');
        }
        
        setTimeout(() => setSuccessMessage(null), 3000);
        
      } catch (error) {
        console.error('❌ Error resetting products:', error);
        setError('Erreur lors de la remise à zéro des produits');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Digitalisation — Produits / Démo</h1>
        <p className="text-sm text-gray-600">Gérez le titre, l\'intro et la liste des produits avec images et détails.</p>
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
          <div className="text-gray-500">🔄 Chargement des produits...</div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <label className="block text-sm font-medium mb-1">Titre section</label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full border rounded-lg px-3 py-2"
              disabled={isSaving}
            />
          </div>
          <div className="bg-white rounded-xl border p-4">
            <label className="block text-sm font-medium mb-1">Introduction</label>
            <textarea 
              value={intro} 
              onChange={(e) => setIntro(e.target.value)} 
              className="w-full border rounded-lg px-3 py-2" 
              rows={3}
              disabled={isSaving}
            />
          </div>

          {products.map((p, idx) => (
            <div key={p.id || idx} className="bg-white rounded-xl border p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titre</label>
                  <input 
                    value={p.title} 
                    onChange={(e) => updateProduct(idx, 'title', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isSaving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input 
                    value={p.description} 
                    onChange={(e) => updateProduct(idx, 'description', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isSaving}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input 
                    value={p.imageUrl || ''} 
                    onChange={(e) => updateProduct(idx, 'imageUrl', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Catégorie</label>
                  <select 
                    value={p.category} 
                    onChange={(e) => updateProduct(idx, 'category', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isSaving}
                  >
                    <option value="web">Web</option>
                    <option value="marketing">Marketing</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="automation">Automation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lien Démo</label>
                  <input 
                    value={p.demoLink} 
                    onChange={(e) => updateProduct(idx, 'demoLink', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sujet Email</label>
                  <input 
                    value={p.mailtoSubject} 
                    onChange={(e) => updateProduct(idx, 'mailtoSubject', e.target.value)} 
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium mb-2">Détails</label>
                <div className="space-y-2">
                  {(p.details || []).map((d, dIdx) => (
                    <input 
                      key={dIdx} 
                      value={d} 
                      onChange={(e) => updateDetail(idx, dIdx, e.target.value)} 
                      className="w-full border rounded-lg px-3 py-2"
                      disabled={isSaving}
                    />
                  ))}
                  <button 
                    onClick={() => addDetail(idx)} 
                    className="text-indigo-600 text-sm hover:text-indigo-800 disabled:opacity-50"
                    disabled={isSaving}
                  >
                    + Ajouter un détail
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={addProduct} 
            className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
            disabled={isSaving}
          >
            + Ajouter un produit
          </button>
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

export default DigitalizationProductsPage;
