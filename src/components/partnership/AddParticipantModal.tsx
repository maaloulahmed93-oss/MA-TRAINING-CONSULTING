import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (participant: { id?: string; name: string; email: string }) => void;
}

const AddParticipantModal: React.FC<AddParticipantModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push('Le nom est requis');
    if (!email.trim()) errs.push("L'email est requis");
    return errs;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (v.length) return;
    onAdd({ name: name.trim(), email: email.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold">Ajouter un participant</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <ul className="list-disc list-inside">{errors.map((e,i)=>(<li key={i}>{e}</li>))}</ul>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nom *</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email *</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Mail className="w-4 h-4 text-gray-500 mr-2" />
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParticipantModal;
