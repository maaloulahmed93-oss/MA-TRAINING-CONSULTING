import React, { useState } from 'react';

type DigiTestimonial = {
  author: string;
  role?: string;
  quote: string;
};

const DigitalizationTestimonialsPage: React.FC = () => {
  const [title, setTitle] = useState('Témoignages Clients');
  const [subtitle, setSubtitle] = useState('Ce que disent nos clients de nos services de digitalisation');
  const [items, setItems] = useState<DigiTestimonial[]>([
    { author: 'Client A', role: 'CEO', quote: 'Super accompagnement, résultats concrets.' },
  ]);

  const updateItem = (idx: number, key: keyof DigiTestimonial, value: string) => {
    const copy = [...items];
    (copy[idx] as DigiTestimonial)[key] = value as never;
    setItems(copy);
  };

  const addItem = () => setItems([...items, { author: '', role: '', quote: '' }]);

  const onSave = () => {
    console.log('Saving Digitalization Testimonials', { title, subtitle, items });
    alert('Témoignages enregistrés (placeholder).');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Digitalisation — Témoignages</h1>
        <p className="text-sm text-gray-600">Gérez le titre et les témoignages spécifiques à la page Digitalisation.</p>
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

      <div className="mt-6">
        <button onClick={onSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Enregistrer</button>
      </div>
    </div>
  );
};

export default DigitalizationTestimonialsPage;
