import React, { useState } from 'react';

type PortfolioCard = {
  title: string;
  description: string;
  result?: string;
  emoji?: string;
};

type PortfolioExample = {
  name: string;
  detail: string;
  link?: string;
  imageUrl?: string;
};

const DigitalizationPortfolioPage: React.FC = () => {
  const [title, setTitle] = useState('Portfolio & Réalisations');
  const [intro, setIntro] = useState('Découvrez les résultats concrets obtenus pour nos clients');
  const [cards, setCards] = useState<PortfolioCard[]>([
    { title: 'Transformation E-commerce', description: 'Lancement boutique + campagnes acquisition', result: '+300% ventes', emoji: '🛒' },
    { title: 'Automatisation RH', description: 'Onboarding, signature, suivi candidats', result: '-70% temps', emoji: '🤖' },
    { title: 'Présence Digitale', description: 'Site, SEO, social, branding', result: '+250% visibilité', emoji: '✨' },
  ]);

  const [examples, setExamples] = useState<Record<string, PortfolioExample[]>>({
    'Transformation E-commerce': [
      { name: 'Boutique Alpha', detail: 'Shopify + Ads → CA x3', link: '' },
    ],
  });

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

  const onSave = () => {
    console.log('Saving Portfolio', { title, intro, cards, examples });
    alert('Portfolio enregistré (placeholder).');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Digitalisation — Portfolio</h1>
        <p className="text-sm text-gray-600">Gérez les cartes portfolio et les exemples réels.</p>
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

      <div className="mt-6">
        <button onClick={onSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Enregistrer</button>
      </div>
    </div>
  );
};

export default DigitalizationPortfolioPage;
