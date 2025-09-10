import React, { useState } from 'react';

type Product = {
  title: string;
  description: string;
  imageUrl?: string;
  details?: string[];
};

const DigitalizationProductsPage: React.FC = () => {
  const [title, setTitle] = useState('Démo & Produits Prêts');
  const [intro, setIntro] = useState('Découvrez nos solutions en action et testez nos produits avant de vous engager');
  const [products, setProducts] = useState<Product[]>([
    { title: 'Chatbot IA', description: 'Agent conversationnel pour support 24/7', imageUrl: '', details: ['WhatsApp', 'Web widget'] },
    { title: 'E-commerce Starter', description: 'Boutique rapide prête à vendre', imageUrl: '', details: ['Checkout optimisé', 'Analytics'] },
  ]);

  const updateProduct = (idx: number, key: keyof Product, value: string | string[] | undefined) => {
    const copy = [...products];
    (copy[idx] as Product)[key] = value as never;
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

  const addProduct = () => setProducts([...products, { title: '', description: '', imageUrl: '', details: [] }]);

  const onSave = () => {
    console.log('Saving Products', { title, intro, products });
    alert('Produits enregistrés (placeholder).');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Digitalisation — Produits / Démo</h1>
        <p className="text-sm text-gray-600">Gérez le titre, l\'intro et la liste des produits avec images et détails.</p>
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

        {products.map((p, idx) => (
          <div key={idx} className="bg-white rounded-xl border p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input value={p.title} onChange={(e) => updateProduct(idx, 'title', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <input value={p.description} onChange={(e) => updateProduct(idx, 'description', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input value={p.imageUrl || ''} onChange={(e) => updateProduct(idx, 'imageUrl', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium mb-2">Détails</label>
              <div className="space-y-2">
                {(p.details || []).map((d, dIdx) => (
                  <input key={dIdx} value={d} onChange={(e) => updateDetail(idx, dIdx, e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                ))}
                <button onClick={() => addDetail(idx)} className="text-indigo-600 text-sm">+ Ajouter un détail</button>
              </div>
            </div>
          </div>
        ))}

        <button onClick={addProduct} className="text-indigo-600">+ Ajouter un produit</button>
      </div>

      <div className="mt-6">
        <button onClick={onSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Enregistrer</button>
      </div>
    </div>
  );
};

export default DigitalizationProductsPage;
