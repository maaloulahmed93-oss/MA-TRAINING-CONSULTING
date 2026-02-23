import React, { useEffect, useMemo, useState } from 'react';
import {
  diagnosticQuestionsApiService,
  type DiagnosticQuestion,
  type DiagnosticQuestionInput,
  type DiagnosticQuestionOption,
} from '../services/diagnosticQuestionsApiService';

const emptyOption = (): DiagnosticQuestionOption => ({ label: '', score: 1 });

const DiagnosticQuestionsPage: React.FC = () => {
  const [items, setItems] = useState<DiagnosticQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [editing, setEditing] = useState<DiagnosticQuestion | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [options, setOptions] = useState<DiagnosticQuestionOption[]>([
    emptyOption(),
    emptyOption(),
    emptyOption(),
    emptyOption(),
  ]);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const resetForm = () => {
    setEditing(null);
    setText('');
    setCategory('');
    setOrder(0);
    setIsActive(true);
    setOptions([emptyOption(), emptyOption(), emptyOption(), emptyOption()]);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (q: DiagnosticQuestion) => {
    setEditing(q);
    setText(q.text || '');
    setCategory(q.category || '');
    setOrder(typeof q.order === 'number' ? q.order : 0);
    setIsActive(Boolean(q.isActive));
    setOptions(
      (Array.isArray(q.options) && q.options.length ? q.options : [emptyOption(), emptyOption()]).map((o) => ({
        label: String(o.label || ''),
        score: Number(o.score ?? 0),
      }))
    );
    setShowForm(true);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await diagnosticQuestionsApiService.list();
      if (!res.success) throw new Error('Failed to fetch');
      setItems(res.data || []);
    } catch (e) {
      console.error('❌ Error fetching diagnostic questions:', e);
      setError('Erreur lors du chargement des questions');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      const c = String(i.category || '').trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const matchQuery = !q || String(i.text || '').toLowerCase().includes(q);
      const matchCategory = !categoryFilter || String(i.category || '') === categoryFilter;
      return matchQuery && matchCategory;
    });
  }, [items, query, categoryFilter]);

  const validatePayload = (payload: DiagnosticQuestionInput): string | null => {
    if (!payload.text || payload.text.trim().length < 3) return 'Texte de question invalide';
    if (!payload.category || payload.category.trim().length < 1) return 'Catégorie requise';
    if (!Array.isArray(payload.options) || payload.options.length < 2) return 'Au moins 2 options sont requises';

    const cleaned = payload.options
      .map((o) => ({ label: String(o.label || '').trim(), score: Number(o.score) }))
      .filter((o) => o.label.length > 0);

    if (cleaned.length < 2) return 'Au moins 2 options non-vides sont requises';

    const badScore = cleaned.find((o) => !Number.isFinite(o.score));
    if (badScore) return 'Score invalide dans une option';

    return null;
  };

  const handleSave = async () => {
    const payload: DiagnosticQuestionInput = {
      text: text.trim(),
      category: category.trim(),
      order,
      isActive,
      options: options
        .map((o) => ({ label: String(o.label || '').trim(), score: Number(o.score) }))
        .filter((o) => o.label.length > 0),
    };

    const err = validatePayload(payload);
    if (err) {
      setError(err);
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editing?._id) {
        const res = await diagnosticQuestionsApiService.update(editing._id, payload);
        if (!res.success) throw new Error('Update failed');
      } else {
        const res = await diagnosticQuestionsApiService.create(payload);
        if (!res.success) throw new Error('Create failed');
      }

      setShowForm(false);
      resetForm();
      await fetchItems();
    } catch (e) {
      console.error('❌ Error saving diagnostic question:', e);
      setError('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      setError('');
      await diagnosticQuestionsApiService.remove(id);
      await fetchItems();
    } catch (e) {
      console.error('❌ Error deleting diagnostic question:', e);
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingId('');
    }
  };

  const handleSeed = async () => {
    try {
      setSeedLoading(true);
      setSeedMessage('');
      setError('');
      const res = await diagnosticQuestionsApiService.seed();
      setSeedMessage(res.message || (typeof res.inserted === 'number' ? `Inserted: ${res.inserted}` : 'OK'));
      await fetchItems();
    } catch (e) {
      console.error('❌ Error seeding diagnostic questions:', e);
      setError('Erreur lors du seed');
    } finally {
      setSeedLoading(false);
    }
  };

  const updateOption = (index: number, next: Partial<DiagnosticQuestionOption>) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...next } : o)));
  };

  const addOption = () => setOptions((prev) => [...prev, emptyOption()]);
  const removeOption = (index: number) => setOptions((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Diagnostic Questions</h1>
          <p className="mt-1 text-sm text-gray-600">Gestion des questions génériques + poids (scores).</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeed}
            disabled={seedLoading}
            className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            {seedLoading ? 'Seeding...' : 'Seed (5 questions)'}
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            Ajouter
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{seedMessage}</div>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par texte..."
          className="w-full md:w-80 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-64 rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">Total: {filtered.length}</div>
          <button
            onClick={fetchItems}
            className="px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50"
          >
            Rafraîchir
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-600">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">Aucune question</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filtered.map((q) => (
              <div key={q._id} className="p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">{q.text}</div>
                    {!q.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Inactive</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Catégorie: {q.category} · Order: {q.order ?? 0}</div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(q.options || []).map((o, idx) => (
                      <div key={idx} className="text-xs rounded-md border border-gray-200 px-2 py-1 flex items-center justify-between">
                        <span className="text-gray-700">{o.label}</span>
                        <span className="font-semibold text-gray-900">{o.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(q)}
                    className="px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    disabled={deletingId === q._id}
                    className="px-3 py-1.5 rounded-md border border-red-200 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingId === q._id ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-2xl rounded-lg bg-white border border-gray-200 shadow-xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">{editing ? 'Modifier' : 'Ajouter'} une question</div>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Texte</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Leadership / Planning / ..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Order</label>
                  <input
                    value={String(order)}
                    onChange={(e) => setOrder(Number(e.target.value || 0))}
                    type="number"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="dq-active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="dq-active" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Options</label>
                  <button
                    onClick={addOption}
                    className="px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50"
                  >
                    Ajouter option
                  </button>
                </div>

                <div className="mt-2 space-y-2">
                  {options.map((o, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-2 md:items-center">
                      <input
                        value={o.label}
                        onChange={(e) => updateOption(idx, { label: e.target.value })}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder={`Option ${idx + 1}`}
                      />
                      <input
                        value={String(o.score)}
                        onChange={(e) => updateOption(idx, { score: Number(e.target.value || 0) })}
                        type="number"
                        className="w-full md:w-32 rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Score"
                      />
                      <button
                        onClick={() => removeOption(idx)}
                        disabled={options.length <= 2}
                        className="px-3 py-2 rounded-md border border-red-200 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-md border border-gray-200 text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticQuestionsPage;
