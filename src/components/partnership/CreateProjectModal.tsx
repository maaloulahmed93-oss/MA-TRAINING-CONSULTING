import React, { useState } from 'react';
import { X, Calendar, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import type { NewProjectInput } from '../../services/partnershipProjectsService';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: NewProjectInput) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState<NewProjectInput>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning',
    progress: 0,
    budget: undefined,
    participants: [],
    objectives: [],
    deliverables: [],
    teamMembers: [],
    contactEmail: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const field = target.name as keyof NewProjectInput;

    setForm(prev => {
      const next: NewProjectInput = { ...prev };
      switch (field) {
        case 'title':
          next.title = (target as HTMLInputElement | HTMLTextAreaElement).value;
          break;
        case 'description':
          next.description = (target as HTMLInputElement | HTMLTextAreaElement).value;
          break;
        case 'startDate':
          next.startDate = (target as HTMLInputElement).value;
          break;
        case 'endDate':
          next.endDate = (target as HTMLInputElement).value;
          break;
        case 'contactEmail':
          next.contactEmail = (target as HTMLInputElement).value;
          break;
        case 'status':
          next.status = (target as HTMLSelectElement).value as NewProjectInput['status'];
          break;
        case 'progress': {
          const v = Number((target as HTMLInputElement).value);
          next.progress = Number.isNaN(v) ? 0 : v;
          break;
        }
        case 'budget': {
          const v = Number((target as HTMLInputElement).value);
          next.budget = Number.isNaN(v) ? undefined : v;
          break;
        }
        case 'participants':
        case 'objectives':
        case 'deliverables':
        case 'teamMembers':
          // These are handled via handleList; ignore here
          break;
        default:
          break;
      }
      return next;
    });
  };

  const handleList = (name: 'participants' | 'objectives' | 'deliverables' | 'teamMembers', value: string) => {
    const items = value
      .split(/\r?\n|,/) // split by newline or comma
      .map(s => s.trim())
      .filter(Boolean);
    setForm(prev => ({ ...prev, [name]: items }));
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.title.trim()) errs.push('Le titre est requis');
    if (!form.description.trim()) errs.push('La description est requise');
    if (!form.startDate) errs.push('La date de début est requise');
    if (!form.endDate) errs.push('La date de fin est requise');
    if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
      errs.push('La date de début doit être antérieure à la date de fin');
    }
    if (typeof form.progress === 'number' && (form.progress < 0 || form.progress > 100)) {
      errs.push('La progression doit être entre 0 et 100');
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (v.length) return;
    setSubmitting(true);

    // Normalize optional number fields
    const payload: NewProjectInput = {
      ...form,
      budget: form.budget === undefined || Number.isNaN(form.budget as number) ? undefined : Number(form.budget),
      progress: typeof form.progress === 'number' ? form.progress : 0,
    };

    onCreate(payload);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold">Ajouter un projet</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-auto">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <ul className="list-disc list-inside">
                {errors.map((e, i) => (<li key={i}>{e}</li>))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Titre *</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email de contact</label>
              <input name="contactEmail" value={form.contactEmail} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 h-28" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Début *</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Fin *</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Statut</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
                <option value="planning">Planification</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="on_hold">En pause</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Progression (%)</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 text-gray-500 mr-2" />
                <input type="number" min={0} max={100} name="progress" value={form.progress ?? 0} onChange={handleChange} className="w-full outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Budget (€)</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                <input type="number" min={0} name="budget" value={typeof form.budget === 'number' ? form.budget : ''} onChange={handleChange} className="w-full outline-none" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Participants (séparés par virgule ou nouvelle ligne)</label>
              <textarea onChange={(e) => handleList('participants', e.target.value)} className="w-full border rounded-lg px-3 py-2 h-20" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Objectifs (1 par ligne)</label>
              <textarea onChange={(e) => handleList('objectives', e.target.value)} className="w-full border rounded-lg px-3 py-2 h-20" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Livrables (1 par ligne)</label>
              <textarea onChange={(e) => handleList('deliverables', e.target.value)} className="w-full border rounded-lg px-3 py-2 h-20" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>Les champs marqués * sont obligatoires</span>
            </div>
            <div className="space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">Annuler</button>
              <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60">{submitting ? 'Création...' : 'Créer le projet'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
