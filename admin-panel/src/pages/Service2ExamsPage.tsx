import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../components/common/Modal';
import {
  createService2Exam,
  listService2Exams,
  Service2ExamDto,
} from '../services/service2ApiService';

function splitLines(value: string): string[] {
  return String(value || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
}

const Service2ExamsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<Service2ExamDto[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [assignedAccountId, setAssignedAccountId] = useState('');
  const [scenarioBrief, setScenarioBrief] = useState('');
  const [constraintsRaw, setConstraintsRaw] = useState('');
  const [criteriaRaw, setCriteriaRaw] = useState('');
  const [taskPrompt, setTaskPrompt] = useState('');
  const [verdictRulesRaw, setVerdictRulesRaw] = useState(
    JSON.stringify(
      [
        { if: 'score >= 80', then: { status: 'Validé', message: 'Mission validée' } },
        { if: 'score < 50', then: { status: 'Failed', message: 'Niveau trop faible' } },
        {
          if: 'constraint_violations > 2',
          then: { status: 'Failed', message: 'Contraintes non respectées' },
        },
      ],
      null,
      2
    )
  );

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await listService2Exams();
      setExams(list);
    } catch (e: any) {
      setError(String(e?.message || 'Erreur de chargement'));
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openCreate = () => {
    setTitle('');
    setAssignedAccountId('');
    setScenarioBrief('');
    setConstraintsRaw('');
    setCriteriaRaw('');
    setTaskPrompt('');
    setIsModalOpen(true);
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    let verdictRules: any[] = [];
    try {
      const parsed = JSON.parse(String(verdictRulesRaw || '[]'));
      verdictRules = Array.isArray(parsed) ? parsed : [];
    } catch {
      alert('Verdict rules JSON غير صالح');
      return;
    }

    try {
      await createService2Exam({
        title: title.trim(),
        assignedAccountId: assignedAccountId.trim() || undefined,
        scenarioBrief: scenarioBrief.trim(),
        constraints: splitLines(constraintsRaw),
        successCriteria: splitLines(criteriaRaw),
        tasks: taskPrompt.trim() ? [{ id: 'main', title: '', prompt: taskPrompt }] : [],
        verdictRules,
        isActive: true,
      });

      closeModal();
      await refresh();
    } catch (e: any) {
      alert(String(e?.message || 'Erreur création exam'));
    }
  };

  const filtered = useMemo(() => exams, [exams]);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service 2 — Exams</h1>
            <p className="mt-1 text-sm text-gray-600">Scenario + contraintes + critères + logique de verdict (JSON).</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Ajouter
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigné</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actif</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Créé le</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">Chargement...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">Aucun exam.</td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.title || '(sans titre)'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{e.assignedAccountId || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{e.isActive ? 'Oui' : 'Non'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Créer un exam (Service 2)">
        <form onSubmit={onCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre (optionnel)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned Account ID (optionnel)</label>
            <input
              value={assignedAccountId}
              onChange={(e) => setAssignedAccountId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="ObjectId du compte participant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Scenario Brief</label>
            <textarea
              value={scenarioBrief}
              onChange={(e) => setScenarioBrief(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Constraints (1 par ligne)</label>
            <textarea
              value={constraintsRaw}
              onChange={(e) => setConstraintsRaw(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Success Criteria (1 par ligne)</label>
            <textarea
              value={criteriaRaw}
              onChange={(e) => setCriteriaRaw(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Task Prompt (optionnel)</label>
            <textarea
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Verdict Rules (JSON array)</label>
            <textarea
              value={verdictRulesRaw}
              onChange={(e) => setVerdictRulesRaw(e.target.value)}
              rows={10}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Service2ExamsPage;
