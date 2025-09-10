import React, { useState } from 'react';

const DigitalizationServicesPage: React.FC = () => {
  // Simple local state placeholders (replace later with API integration)
  const [title, setTitle] = useState<string>('Nos Services');
  const [intro, setIntro] = useState<string>('Des prestations complètes pour propulser votre transformation digitale');
  const [services, setServices] = useState<Array<{ id: string; title: string; items: string[] }>>([
    { id: 'creation', title: "Création digitale & présence en ligne", items: ['Sites vitrines', 'E-commerce', 'Branding'] },
    { id: 'automation', title: 'Automatisation & Applications IA', items: ['Chatbots', 'RPA', 'LLM Apps'] },
    { id: 'growth', title: 'Acquisition & Growth', items: ['SEO', 'Ads', 'Emailing'] },
    { id: 'saas', title: 'Solutions (SaaS)', items: ['CRM', 'Helpdesk', 'Analytics'] },
  ]);

  const updateServiceTitle = (idx: number, value: string) => {
    const copy = [...services];
    copy[idx].title = value;
    setServices(copy);
  };

  const updateServiceItem = (sIdx: number, iIdx: number, value: string) => {
    const copy = [...services];
    copy[sIdx].items[iIdx] = value;
    setServices(copy);
  };

  const addServiceItem = (sIdx: number) => {
    const copy = [...services];
    copy[sIdx].items.push('');
    setServices(copy);
  };

  const onSave = () => {
    // TODO: connect to backend
    console.log('Saving Services', { title, intro, services });
    alert('Services enregistrés (placeholder).');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Digitalisation — Services</h1>
        <p className="text-sm text-gray-600">Gérez le titre, l\'intro et les cartes de services.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl border p-4">
          <label className="block text-sm font-medium mb-1">Titre section</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div className="lg:col-span-3 bg-white rounded-xl border p-4">
          <label className="block text-sm font-medium mb-1">Introduction</label>
          <textarea value={intro} onChange={(e) => setIntro(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={3} />
        </div>

        {services.map((s, sIdx) => (
          <div key={s.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <input
                value={s.title}
                onChange={(e) => updateServiceTitle(sIdx, e.target.value)}
                className="w-full border rounded-lg px-3 py-2 font-semibold"
              />
            </div>
            <div className="space-y-2">
              {s.items.map((it, iIdx) => (
                <input
                  key={iIdx}
                  value={it}
                  onChange={(e) => updateServiceItem(sIdx, iIdx, e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              ))}
              <button onClick={() => addServiceItem(sIdx)} className="text-indigo-600 text-sm">+ Ajouter un point</button>
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

export default DigitalizationServicesPage;
