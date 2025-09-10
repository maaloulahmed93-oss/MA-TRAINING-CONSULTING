import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

interface AddFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (feedback: { author: string; comment: string; rating: number }) => void;
}

const AddFeedbackModal: React.FC<AddFeedbackModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: string[] = [];
    if (!author.trim()) errs.push("Le nom de l'auteur est requis");
    if (!comment.trim()) errs.push('Le commentaire est requis');
    if (rating < 1 || rating > 5) errs.push('La note doit être entre 1 et 5');
    return errs;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (v.length) return;
    onAdd({ author: author.trim(), comment: comment.trim(), rating });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold">Ajouter un feedback</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <ul className="list-disc list-inside">{errors.map((e,i)=>(<li key={i}>{e}</li>))}</ul>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Auteur *</label>
            <input value={author} onChange={(e)=>setAuthor(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Note (1-5) *</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Star className="w-4 h-4 text-yellow-500 mr-2" />
              <input type="number" min={1} max={5} value={rating} onChange={(e)=>setRating(Number(e.target.value))} className="w-full outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Commentaire *</label>
            <textarea value={comment} onChange={(e)=>setComment(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-24" />
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

export default AddFeedbackModal;
