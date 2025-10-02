import React, { useEffect, useMemo, useState } from 'react';
import { FreelancerMeeting, MeetingStatus, MeetingType } from '../types/freelancers';
import { listMeetings, createMeeting, updateMeeting, deleteMeeting, seedMeetingsIfEmpty } from '../services/freelancerMeetingsService';

const defaultMeeting = (): Omit<FreelancerMeeting,'id'|'createdAt'|'updatedAt'> => ({
  subject: '',
  type: 'visio',
  date: '',
  startTime: '',
  endTime: '',
  timezone: 'Africa/Tunis',
  locationText: '',
  meetingLink: '',
  withWhom: '',
  agenda: [],
  notes: '',
  attachments: [],
  organizerId: '',
  participantFreelancerIds: [],
  reminders: [],
  status: 'scheduled',
  outcome: 'pending',
  recordingLink: '',
});

const FreelancerMeetingsPage: React.FC = () => {
  const [items, setItems] = useState<FreelancerMeeting[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<MeetingStatus | 'all'>('all');
  const [type, setType] = useState<MeetingType | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FreelancerMeeting | null>(null);
  const [form, setForm] = useState<Omit<FreelancerMeeting,'id'|'createdAt'|'updatedAt'>>(defaultMeeting());

  useEffect(() => {
    const loadMeetings = async () => {
      seedMeetingsIfEmpty();
      const meetings = await listMeetings();
      setItems(meetings);
    };
    loadMeetings();
  }, []);

  const refresh = async () => {
    const meetings = await listMeetings();
    setItems(meetings);
  };

  const filtered = useMemo(() => {
    return items.filter(m => {
      const byQuery = query
        ? [m.subject, m.withWhom, m.locationText, m.meetingLink].join(' ').toLowerCase().includes(query.toLowerCase())
        : true;
      const byStatus = status === 'all' ? true : m.status === status;
      const byType = type === 'all' ? true : m.type === type;
      return byQuery && byStatus && byType;
    });
  }, [items, query, status, type]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultMeeting());
    setModalOpen(true);
  };

  const openEdit = (item: FreelancerMeeting) => {
    const { id, createdAt, updatedAt, ...rest } = item;
    setEditing(item);
    setForm(rest);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.date || !form.startTime || (form.type==='visio' && !form.meetingLink) || (form.type==='presentiel' && !form.locationText) || !form.participantFreelancerIds || form.participantFreelancerIds.length===0) return;
    
    try {
      if (editing) {
        await updateMeeting(editing.id, form);
      } else {
        await createMeeting(form);
      }
      setModalOpen(false);
      await refresh();
    } catch (error) {
      console.error('خطأ في حفظ الاجتماع:', error);
      alert('حدث خطأ في حفظ الاجتماع. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette réunion ?')) {
      try {
        await deleteMeeting(id);
        await refresh();
      } catch (error) {
        console.error('خطأ في حذف الاجتماع:', error);
        alert('حدث خطأ في حذف الاجتماع. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const parseCSVList = (v: string) => v.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Freelancer Meetings</h1>
        <button onClick={openCreate} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Programmer une Réunion</button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-3 items-center">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher..." className="border rounded px-3 py-2" />
        <select value={status} onChange={e=>setStatus(e.target.value as any)} className="border rounded px-3 py-2">
          <option value="all">Tous statuts</option>
          <option value="scheduled">Planifiée</option>
          <option value="completed">Terminée</option>
          <option value="cancelled">Annulée</option>
        </select>
        <select value={type} onChange={e=>setType(e.target.value as any)} className="border rounded px-3 py-2">
          <option value="all">Tous types</option>
          <option value="visio">Visio</option>
          <option value="presentiel">Présentiel</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3 text-left">Sujet</th>
              <th className="p-3">Date</th>
              <th className="p-3">Heure</th>
              <th className="p-3">Type</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((item, index) => (
              <tr key={item.id || (item as any)._id || `meeting-${index}`} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{item.subject}</td>
                <td className="p-3 text-center">{item.date}</td>
                <td className="p-3 text-center">{item.startTime}{item.endTime?` - ${item.endTime}`:''}</td>
                <td className="p-3 text-center">{item.type}</td>
                <td className="p-3 text-center"><span className="px-2 py-1 text-xs rounded bg-gray-100">{item.status}</span></td>
                <td className="p-3 flex gap-2 justify-center">
                  <button onClick={()=>openEdit(item)} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded">Modifier</button>
                  <button onClick={()=>handleDelete(item.id || (item as any)._id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded">Supprimer</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Aucune réunion</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{editing ? 'Modifier la réunion' : 'Nouvelle réunion'}</h2>
              <button onClick={()=>setModalOpen(false)} className="px-3 py-1">✕</button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Sujet</label>
                <input value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} required className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Type</label>
                <select value={form.type} onChange={e=>setForm({...form, type:e.target.value as any})} className="mt-1 w-full border rounded px-3 py-2">
                  <option key="visio" value="visio">Visio</option>
                  <option key="presentiel" value="presentiel">Présentiel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Date</label>
                <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Heure début</label>
                <input type="time" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} required className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Heure fin</label>
                <input type="time" value={form.endTime||''} onChange={e=>setForm({...form, endTime:e.target.value})} className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              {form.type==='presentiel' && (
                <div>
                  <label className="block text-sm font-medium">Lieu</label>
                  <input value={form.locationText||''} onChange={e=>setForm({...form, locationText:e.target.value})} className="mt-1 w-full border rounded px-3 py-2"/>
                </div>
              )}
              {form.type==='visio' && (
                <div>
                  <label className="block text-sm font-medium">Lien Visio</label>
                  <input value={form.meetingLink||''} onChange={e=>setForm({...form, meetingLink:e.target.value})} className="mt-1 w-full border rounded px-3 py-2"/>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Participants (Freelancer IDs séparées par ,)</label>
                <input value={(form.participantFreelancerIds||[]).join(', ')} onChange={e=>setForm({...form, participantFreelancerIds: parseCSVList(e.target.value)})} required className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Agenda (items séparés par ,)</label>
                <input value={(form.agenda||[]).join(', ')} onChange={e=>setForm({...form, agenda: parseCSVList(e.target.value)})} className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Notes</label>
                <textarea value={form.notes||''} onChange={e=>setForm({...form, notes:e.target.value})} className="mt-1 w-full border rounded px-3 py-2" rows={3}/>
              </div>
              <div>
                <label className="block text-sm font-medium">Statut</label>
                <select value={form.status} onChange={e=>setForm({...form, status:e.target.value as any})} className="mt-1 w-full border rounded px-3 py-2">
                  <option key="scheduled" value="scheduled">Planifiée</option>
                  <option key="completed" value="completed">Terminée</option>
                  <option key="cancelled" value="cancelled">Annulée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Résultat</label>
                <select value={form.outcome||'pending'} onChange={e=>setForm({...form, outcome:e.target.value as any})} className="mt-1 w-full border rounded px-3 py-2">
                  <option key="pending" value="pending">En attente</option>
                  <option key="accepted" value="accepted">Accepté</option>
                  <option key="rejected" value="rejected">Rejeté</option>
                  <option key="hired" value="hired">Embauché</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded border">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerMeetingsPage;
