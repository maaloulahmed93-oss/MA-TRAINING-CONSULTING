import React, { useState } from 'react';
import { X, Calendar, CheckCircle } from 'lucide-react';
import type { FormationCoAnimee } from '../../services/partnershipFormationsCoAnimeesService';

export type NewFormationInput = {
  title: string;
  date: string; // ISO date
  trainers: string[];
  certificateAvailable: boolean;
  participants?: FormationCoAnimee['participants'];
  resources?: FormationCoAnimee['resources'];
};

interface CreateFormationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<FormationCoAnimee, 'id'>) => void;
}

const CreateFormationModal: React.FC<CreateFormationModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState<NewFormationInput>({
    title: '',
    date: '',
    trainers: [],
    certificateAvailable: false,
    participants: [],
    resources: []
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name } = target;
    if (name === 'title') setForm(prev => ({ ...prev, title: (target as HTMLInputElement).value }));
    if (name === 'date') setForm(prev => ({ ...prev, date: (target as HTMLInputElement).value }));
    if (name === 'certificateAvailable') setForm(prev => ({ ...prev, certificateAvailable: (target as HTMLInputElement).checked }));
  };

  const handleTrainers = (value: string) => {
    const items = value
      .split(/\r?\n|,/) // newline or comma
      .map(s => s.trim())
      .filter(Boolean);
    setForm(prev => ({ ...prev, trainers: items }));
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.title.trim()) errs.push('Le titre est requis');
    if (!form.date) errs.push('La date est requise');
    if (form.trainers.length === 0) errs.push('Au moins un formateur est requis');
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (v.length) return;
    setSubmitting(true);

    const payload: Omit<FormationCoAnimee, 'id'> = {
      title: form.title.trim(),
      date: form.date,
      trainers: form.trainers,
      certificateAvailable: form.certificateAvailable,
      participants: form.participants ?? [],
      resources: form.resources ?? [],
      feedbacks: []
    };

    onCreate(payload);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold">Ajouter une formation</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <ul className="list-disc list-inside">
                {errors.map((e, i) => (<li key={i}>{e}</li>))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Titre *</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Date *</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Formateurs (séparés par virgule ou nouvelle ligne) *</label>
              <textarea onChange={(e) => handleTrainers(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-24" />
            </div>
            <div className="flex items-center gap-2">
              <input id="cert" type="checkbox" name="certificateAvailable" checked={form.certificateAvailable} onChange={handleChange} className="h-4 w-4" />
              <label htmlFor="cert" className="text-sm text-gray-700 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Certificat disponible</label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">Annuler</button>
            <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60">{submitting ? 'Création...' : 'Créer la formation'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFormationModal;
