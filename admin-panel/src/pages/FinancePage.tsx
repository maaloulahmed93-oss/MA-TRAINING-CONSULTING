import React, { useEffect, useState } from 'react';
import { getPartnerExtraInfo, setPartnerExtraInfo, PartnerCategoryKey, PartnerExtraInfo } from '../data/partnerExtraInfoStore';
 

const FinancePage: React.FC = () => {
  const [currentCategory, setCurrentCategory] = useState<PartnerCategoryKey>('formateur');
  const [form, setForm] = useState<PartnerExtraInfo>(getPartnerExtraInfo('formateur'));

  useEffect(() => {
    setForm(getPartnerExtraInfo(currentCategory));
  }, [currentCategory]);

  const updateField = <K extends keyof PartnerExtraInfo>(key: K, value: PartnerExtraInfo[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };
  const updateArrayItem = (key: 'details' | 'requirements', index: number, value: string) => {
    setForm((f) => {
      const arr = [...f[key]];
      arr[index] = value;
      return { ...f, [key]: arr };
    });
  };
  const addArrayItem = (key: 'details' | 'requirements') => {
    setForm((f) => ({ ...f, [key]: [...f[key], ''] }));
  };
  const removeArrayItem = (key: 'details' | 'requirements', index: number) => {
    setForm((f) => {
      const arr = f[key].filter((_, i) => i !== index);
      return { ...f, [key]: arr };
    });
  };
  const handleSave = () => {
    const cleaned: PartnerExtraInfo = {
      ...form,
      details: form.details.filter((s) => s.trim().length > 0),
      requirements: form.requirements.filter((s) => s.trim().length > 0),
    };
    setPartnerExtraInfo(currentCategory, cleaned);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Autres infos partenaire</h1>
      <p className="text-sm text-gray-500 mb-6">Gérez les contenus détaillés de vos 4 cartes partenaires. Ces données seront utilisées côté site et dans le module Partenaires.</p>

      <div className="mb-6 flex flex-wrap gap-2">
        {(['formateur','freelance','commercial','entreprise'] as PartnerCategoryKey[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCurrentCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-sm border ${currentCategory===cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {cat === 'formateur' ? 'Formateur' : cat === 'freelance' ? 'Freelance' : cat === 'commercial' ? 'Commercial / Affilié' : 'Entreprise / École'}
          </button>
        ))}
      </div>

      <div className="bg-white ring-1 ring-gray-200 rounded-lg p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Titre</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.title} onChange={(e)=>updateField('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Sous-titre</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.subtitle} onChange={(e)=>updateField('subtitle', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Introduction</label>
          <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" rows={3} value={form.intro} onChange={(e)=>updateField('intro', e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Points de détail</h3>
            <button onClick={()=>addArrayItem('details')} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">+ Ajouter</button>
          </div>
          <div className="space-y-2">
            {form.details.map((d, i)=>(
              <div key={i} className="flex gap-2">
                <input className="flex-1 border border-gray-300 rounded-md px-3 py-2" value={d} onChange={(e)=>updateArrayItem('details', i, e.target.value)} />
                <button onClick={()=>removeArrayItem('details', i)} className="px-2 py-2 text-sm rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">Supprimer</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Conditions requises</h3>
            <button onClick={()=>addArrayItem('requirements')} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">+ Ajouter</button>
          </div>
          <div className="space-y-2">
            {form.requirements.map((r, i)=>(
              <div key={i} className="flex gap-2">
                <input className="flex-1 border border-gray-300 rounded-md px-3 py-2" value={r} onChange={(e)=>updateArrayItem('requirements', i, e.target.value)} />
                <button onClick={()=>removeArrayItem('requirements', i)} className="px-2 py-2 text-sm rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">Supprimer</button>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Label du bouton (CTA)</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.ctaLabel} onChange={(e)=>updateField('ctaLabel', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Adresse email de contact</label>
            <input
              type="email"
              placeholder="ex: entreprise@gmail.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.contactEmail || ''}
              onChange={(e)=>updateField('contactEmail', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Dernière mise à jour: {new Date(form.updatedAt).toLocaleString()}</span>
          <div className="text-center">
            <p className="text-sm text-gray-500">Adresse email de contact :</p>
            <a
              href={form.contactEmail ? `mailto:${form.contactEmail}` : undefined}
              className="text-lg font-semibold text-blue-600 hover:underline"
            >
              {form.contactEmail || '—'}
            </a>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
