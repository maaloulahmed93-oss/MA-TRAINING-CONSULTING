import React, { useState } from 'react';

const DigitalizationContactsPage: React.FC = () => {
  const [email, setEmail] = useState('contact@example.com');
  const [phone, setPhone] = useState('+216 52 345 678');
  const [ctaLabel, setCtaLabel] = useState('Demander une démo');
  const [ctaLink, setCtaLink] = useState('mailto:contact@example.com');
  const [note, setNote] = useState('Nous répondons sous 24h.');

  const onSave = () => {
    console.log('Saving Contacts', { email, phone, ctaLabel, ctaLink, note });
    alert('Contacts enregistrés (placeholder).');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Digitalisation — Contacts</h1>
        <p className="text-sm text-gray-600">Gérez les coordonnées et l\'appel à l\'action.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Libellé CTA</label>
            <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lien CTA</label>
            <input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <label className="block text-sm font-medium mb-1">Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={3} />
        </div>
      </div>

      <div className="mt-6">
        <button onClick={onSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Enregistrer</button>
      </div>
    </div>
  );
};

export default DigitalizationContactsPage;
