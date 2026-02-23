import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowPathIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  diagnosticSessionsApiService,
  type DiagnosticSession,
} from '../services/diagnosticSessionsApiService';

const DiagnosticSessionExpertHandoverPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportMarkdown, setExportMarkdown] = useState('');
  const [showAnnexes, setShowAnnexes] = useState(false);

  const [auditFile, setAuditFile] = useState<File | null>(null);
  const [auditBusy, setAuditBusy] = useState(false);
  const [auditError, setAuditError] = useState('');

  const [apptScheduledAt, setApptScheduledAt] = useState('');
  const [apptNotes, setApptNotes] = useState('');
  const [apptBusy, setApptBusy] = useState(false);
  const [apptError, setApptError] = useState('');

  const expertOnlyMarkdown = useMemo(() => {
    const md = String(exportMarkdown || '');
    if (!md.trim()) return '';

    const start = md.indexOf('## Résumé expert (FR)');
    if (start === -1) return md.trim();
    const afterStart = md.slice(start);
    const end = afterStart.indexOf('\n---\n');
    if (end === -1) return afterStart.trim();
    return afterStart.slice(0, end).trim();
  }, [exportMarkdown]);

  const fetchSession = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const res = await diagnosticSessionsApiService.getSession(id);
      if (!res.success) throw new Error('Failed to fetch');
      setSession(res.data);
    } catch (err) {
      console.error('❌ Error fetching diagnostic session:', err);
      setError('Erreur lors du chargement de la session');
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchExport = async () => {
    const email = String(session?.participant?.email || '').trim();
    if (!email) {
      setExportError('Email participant introuvable.');
      return;
    }
    try {
      setExportLoading(true);
      setExportError('');
      const res = await diagnosticSessionsApiService.getService1Phase5Export(email);
      if (!res.success) throw new Error('Export failed');
      const md = String((res.data as any)?.markdown || '').trim();
      setExportMarkdown(md);
    } catch (err) {
      console.error('❌ Error fetching export markdown:', err);
      setExportError('Erreur lors du chargement du résumé complet');
      setExportMarkdown('');
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!session) return;
    fetchExport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?._id]);

  const phaseStatuses = useMemo(() => {
    const svc = ((session as any)?.responses?.service1 || {}) as any;
    const p0 = svc.phase0 || {};
    const p1 = svc.phase1 || {};
    const p2 = svc.phase2 || {};
    const p3 = svc.phase3 || {};
    const p4 = svc.phase4 || {};
    const p5 = svc.phase5 || {};

    const isDone = (p: any) => Boolean(p?.completed || p?.completedAt || p?.status === 'completed');

    return [
      { key: 'Phase 0', done: isDone(p0) },
      { key: 'Phase 1', done: isDone(p1) },
      { key: 'Phase 2', done: isDone(p2) },
      { key: 'Phase 3', done: isDone(p3) },
      { key: 'Phase 4', done: isDone(p4) },
      { key: 'Phase 5', done: isDone(p5) },
    ];
  }, [session]);

  const appointment = useMemo(() => {
    const svc = ((session as any)?.responses?.service1 || {}) as any;
    const ap = (svc.directSessionAppointment || {}) as any;
    return {
      scheduledAt: String(ap?.scheduledAt || '').trim(),
      notes: String(ap?.notes || '').trim(),
      updatedAt: String(ap?.updatedAt || '').trim(),
    };
  }, [session]);

  useEffect(() => {
    setApptScheduledAt(appointment.scheduledAt);
    setApptNotes(appointment.notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?._id]);

  const saveAppointment = async () => {
    if (!id) return;
    if (!apptScheduledAt.trim()) {
      setApptError('Veuillez saisir une date/heure.');
      return;
    }
    try {
      setApptBusy(true);
      setApptError('');
      await diagnosticSessionsApiService.setService1Appointment(id, {
        scheduledAt: apptScheduledAt.trim(),
        notes: apptNotes.trim() || undefined,
      });
      await fetchSession();
    } catch (err: any) {
      console.error('❌ Error saving appointment:', err);
      setApptError(String(err?.message || 'Erreur enregistrement'));
    } finally {
      setApptBusy(false);
    }
  };

  const auditReport = useMemo(() => {
    const svc = ((session as any)?.responses?.service1 || {}) as any;
    const ar = (svc.auditReport || {}) as any;
    return {
      url: String(ar?.url || '').trim(),
      fileName: String(ar?.fileName || '').trim(),
      uploadedAt: String(ar?.uploadedAt || '').trim(),
    };
  }, [session]);

  const uploadAudit = async () => {
    if (!id) return;
    if (!auditFile) {
      setAuditError('Veuillez choisir un fichier PDF.');
      return;
    }
    try {
      setAuditBusy(true);
      setAuditError('');
      await diagnosticSessionsApiService.uploadService1AuditReport(id, auditFile);
      setAuditFile(null);
      await fetchSession();
    } catch (err: any) {
      console.error('❌ Error uploading audit report:', err);
      setAuditError(String(err?.message || 'Erreur upload'));
    } finally {
      setAuditBusy(false);
    }
  };

  const downloadMd = () => {
    const md = String(exportMarkdown || '').trim();
    if (!md) return;

    const email = String(session?.participant?.email || '').trim() || 'participant';
    const date = new Date().toISOString().slice(0, 10);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Expert_Handover_Phases0-5_${email}_${date}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expert Handover</h1>
            <p className="text-gray-600 text-sm">Résumé complet (Phases 0-5)</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={fetchSession}
            className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-md bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Actualiser
          </button>

          <button
            onClick={downloadMd}
            disabled={!exportMarkdown}
            className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-md bg-white hover:bg-gray-50 disabled:opacity-60"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Télécharger (MD)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">Chargement…</div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-rose-700">{error}</div>
      ) : !session ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">Session introuvable</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900">Participant</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div><span className="font-semibold">Nom complet:</span> {session.participant.fullName || session.participant.firstName}</div>
                <div><span className="font-semibold">Email:</span> {session.participant.email}</div>
                <div><span className="font-semibold">WhatsApp:</span> {session.participant.whatsapp || '—'}</div>
                <div><span className="font-semibold">Situation:</span> {session.participant.situation}</div>
                <div><span className="font-semibold">Domaine (choisi):</span> {session.metadata?.selectedDomain || '—'}</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900">Progression (Service 1)</h2>
              <div className="mt-4 space-y-2 text-sm">
                {phaseStatuses.map((p) => (
                  <div key={p.key} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{p.key}</span>
                    <span className={p.done ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                      {p.done ? 'Terminé' : 'En cours'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900">Résumé complet</h2>
              <div className="mt-4 text-sm text-gray-700">
                {exportLoading ? 'Chargement du résumé…' : exportError ? exportError : exportMarkdown ? 'Prêt.' : '—'}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={fetchExport}
                  disabled={exportLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-md bg-white hover:bg-gray-50 disabled:opacity-60"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Recharger
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900">Rapport d'Audit de Positionnement Stratégique</h2>

            {auditReport.url ? (
              <div className="mt-3 text-sm text-gray-700">
                <div><span className="font-semibold">Fichier:</span> {auditReport.fileName || '—'}</div>
                <div className="mt-1">
                  <a className="text-indigo-600 hover:underline" href={auditReport.url} target="_blank" rel="noreferrer">
                    Ouvrir / Télécharger
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-600">Aucun rapport uploadé.</div>
            )}

            {auditError ? <div className="mt-3 text-sm text-rose-700">{auditError}</div> : null}

            <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setAuditFile(e.target.files?.[0] || null)}
              />
              <button
                onClick={uploadAudit}
                disabled={!auditFile || auditBusy}
                className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-md bg-white hover:bg-gray-50 disabled:opacity-60"
              >
                {auditBusy ? 'Upload…' : 'Uploader PDF'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900">Séance directe (RDV)</h2>

            {appointment.scheduledAt ? (
              <div className="mt-3 text-sm text-gray-700">
                <div><span className="font-semibold">Date/heure:</span> {appointment.scheduledAt}</div>
                {appointment.notes ? <div className="mt-1"><span className="font-semibold">Notes:</span> {appointment.notes}</div> : null}
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-600">Aucun RDV défini.</div>
            )}

            {apptError ? <div className="mt-3 text-sm text-rose-700">{apptError}</div> : null}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600">Date/heure</label>
                <input
                  type="datetime-local"
                  value={apptScheduledAt}
                  onChange={(e) => setApptScheduledAt(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">Notes (optionnel)</label>
                <input
                  type="text"
                  value={apptNotes}
                  onChange={(e) => setApptNotes(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Ex: lien Meet / adresse / instructions"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={saveAppointment}
                disabled={apptBusy}
                className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-md bg-white hover:bg-gray-50 disabled:opacity-60"
              >
                {apptBusy ? 'Enregistrement…' : 'Enregistrer RDV'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900">Document (Markdown)</h2>

            <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="text-xs text-gray-500">Affichage: {showAnnexes ? 'Résumé + annexes' : 'Résumé uniquement'}</div>
              <button
                type="button"
                onClick={() => setShowAnnexes((v) => !v)}
                className="inline-flex items-center px-3 py-2 border border-gray-200 text-xs font-semibold rounded-md bg-white hover:bg-gray-50"
              >
                {showAnnexes ? 'Masquer les annexes' : 'Afficher les annexes'}
              </button>
            </div>

            {exportLoading ? (
              <div className="mt-4 text-gray-600">Chargement…</div>
            ) : exportError ? (
              <div className="mt-4 text-rose-700">{exportError}</div>
            ) : exportMarkdown ? (
              <div className="mt-4 prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {showAnnexes ? exportMarkdown : expertOnlyMarkdown}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="mt-4 text-gray-600">Aucun contenu</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DiagnosticSessionExpertHandoverPage;
