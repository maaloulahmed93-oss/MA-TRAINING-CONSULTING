import React, { useEffect, useMemo, useState } from 'react';
import { FreelancerOffer, OfferStatus, OfferVisibility } from '../types/freelancers';
import { listOffers, createOffer, updateOffer, deleteOffer, seedOffersIfEmpty, getAvailableFreelancers } from '../services/freelancerOffersService';

const defaultOffer = (): Omit<FreelancerOffer,'id'|'createdAt'|'updatedAt'> => ({
  title: '',
  company: '',
  locationType: 'remote',
  locationText: '',
  contractType: 'full-time',
  seniority: 'junior',
  salaryMin: undefined,
  salaryMax: undefined,
  currency: 'TND',
  workHours: '',
  skills: [],
  description: '',
  requirements: [],
  benefits: [],
  applicationLink: '',
  contactEmail: '',
  deadline: '',
  visibility: 'all',
  assignedFreelancerIds: [],
  status: 'draft',
  tags: [],
});

const FreelancerOffersPage: React.FC = () => {
  const [items, setItems] = useState<FreelancerOffer[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<OfferStatus | 'all'>('all');
  const [visibility, setVisibility] = useState<OfferVisibility | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FreelancerOffer | null>(null);
  const [form, setForm] = useState<Omit<FreelancerOffer,'id'|'createdAt'|'updatedAt'>>(defaultOffer());
  const [availableFreelancers, setAvailableFreelancers] = useState<{id: string, name: string, email: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await seedOffersIfEmpty();
      const offers = await listOffers();
      setItems(offers);
      
      // جلب قائمة الفريلانسرز المتاحين
      const freelancers = await getAvailableFreelancers();
      setAvailableFreelancers(freelancers);
      
    } catch (err) {
      setError('خطأ في تحميل البيانات');
      console.error('خطأ في تحميل البيانات:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    const offers = await listOffers();
    setItems(offers);
  };

  const filtered = useMemo(() => {
    return items.filter(o => {
      const byQuery = query
        ? [o.title, o.company, o.description, ...(o.tags||[])].join(' ').toLowerCase().includes(query.toLowerCase())
        : true;
      const byStatus = status === 'all' ? true : o.status === status;
      const byVisibility = visibility === 'all' ? true : o.visibility === visibility;
      return byQuery && byStatus && byVisibility;
    });
  }, [items, query, status, visibility]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultOffer());
    setModalOpen(true);
  };

  const openEdit = (item: FreelancerOffer) => {
    const { id, createdAt, updatedAt, ...rest } = item;
    setEditing(item);
    setForm(rest);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.company || !form.description || !form.contractType || !form.visibility) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    // Check assigned freelancers for 'assigned' visibility
    if (form.visibility === 'assigned') {
      const assignedIds = typeof form.assignedFreelancerIds === 'string' 
        ? form.assignedFreelancerIds.split(',').map(s => s.trim()).filter(Boolean)
        : (form.assignedFreelancerIds || []);
      
      if (assignedIds.length === 0) {
        setError('يرجى تحديد الفريلانسرز عند اختيار "مخصص"');
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    
    // Ensure CSV fields are converted to arrays before saving
    const formToSave = {
      ...form,
      skills: typeof form.skills === 'string' 
        ? form.skills.split(',').map(s => s.trim()).filter(Boolean)
        : (form.skills || []),
      tags: typeof form.tags === 'string' 
        ? form.tags.split(',').map(s => s.trim()).filter(Boolean)
        : (form.tags || []),
      assignedFreelancerIds: typeof form.assignedFreelancerIds === 'string' 
        ? form.assignedFreelancerIds.split(',').map(s => s.trim()).filter(Boolean)
        : (form.assignedFreelancerIds || [])
    };
    
    try {
      if (editing) {
        await updateOffer(editing.id, formToSave);
      } else {
        await createOffer(formToSave);
      }
      
      setModalOpen(false);
      await refresh();
      
    } catch (err) {
      setError('خطأ في حفظ العرض');
      console.error('خطأ في حفظ العرض:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette offre ?')) {
      setLoading(true);
      setError(null);
      
      try {
        await deleteOffer(id);
        await refresh();
      } catch (err) {
        setError('خطأ في حذف العرض');
        console.error('خطأ في حذف العرض:', err);
      } finally {
        setLoading(false);
      }
    }
  };


  return (
    <div className="space-y-6">
      {/* عرض رسائل الخطأ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Freelancer Offers</h1>
        <button 
          onClick={openCreate} 
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري التحميل...' : 'Ajouter une Offre'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-3 items-center">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher..." className="border rounded px-3 py-2" />
        <select value={status} onChange={e=>setStatus(e.target.value as any)} className="border rounded px-3 py-2">
          <option value="all">Tous statuts</option>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
        <select value={visibility} onChange={e=>setVisibility(e.target.value as any)} className="border rounded px-3 py-2">
          <option value="all">Toute visibilité</option>
          <option value="all">Tous</option>
          <option value="assigned">Assigné</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3 text-left">Titre</th>
              <th className="p-3 text-left">Entreprise</th>
              <th className="p-3">Contrat</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Visibilité</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{item.title}</td>
                <td className="p-3">{item.company}</td>
                <td className="p-3 text-center">{item.contractType}</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-1 text-xs rounded bg-gray-100">{item.status}</span>
                </td>
                <td className="p-3 text-center">{item.visibility}</td>
                <td className="p-3 flex gap-2 justify-center">
                  <button onClick={()=>openEdit(item)} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded">Modifier</button>
                  <button onClick={()=>handleDelete(item.id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded">Supprimer</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Aucune offre</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{editing ? 'Modifier l\'offre' : 'Nouvelle offre'}</h2>
              <button onClick={()=>setModalOpen(false)} className="px-3 py-1">✕</button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium">Titre</label>
                <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">Entreprise</label>
                <input value={form.company} onChange={e=>setForm({...form, company:e.target.value})} required className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Contrat</label>
                <select value={form.contractType} onChange={e=>setForm({...form, contractType:e.target.value as any})} className="mt-1 w-full border rounded px-3 py-2">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Niveau</label>
                <select value={form.seniority} onChange={e=>setForm({...form, seniority:e.target.value as any})} className="mt-1 w-full border rounded px-3 py-2">
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Type de lieu</label>
                <select value={form.locationType} onChange={e=>setForm({...form, locationType:e.target.value as any})} className="mt-1 w-full border rounded px-3 py-2">
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Lieu (texte)</label>
                <input value={form.locationText} onChange={e=>setForm({...form, locationText:e.target.value})} className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Salaire Min</label>
                <input type="number" value={form.salaryMin ?? ''} onChange={e=>setForm({...form, salaryMin: e.target.value? Number(e.target.value): undefined})} className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Salaire Max</label>
                <input type="number" value={form.salaryMax ?? ''} onChange={e=>setForm({...form, salaryMax: e.target.value? Number(e.target.value): undefined})} className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Compétences (séparées par ,)</label>
                <input 
                  value={Array.isArray(form.skills) ? form.skills.join(', ') : (form.skills || '')} 
                  onChange={e => {
                    // Store as string to allow typing, convert to array on blur or save
                    setForm({...form, skills: e.target.value});
                  }}
                  onBlur={e => {
                    // Convert to array when user finishes typing
                    const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setForm({...form, skills: skillsArray});
                  }}
                  placeholder="JavaScript, React, Node.js, TypeScript"
                  className="mt-1 w-full border rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Séparez les compétences par des virgules (ex: JavaScript, React, Node.js)
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required className="mt-1 w-full border rounded px-3 py-2" rows={4} />
              </div>
              <div>
                <label className="block text-sm font-medium">Email Contact</label>
                <input type="email" value={form.contactEmail||''} onChange={e=>setForm({...form, contactEmail:e.target.value})} className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Lien Candidature</label>
                <input value={form.applicationLink||''} onChange={e=>setForm({...form, applicationLink:e.target.value})} className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Date limite</label>
                <input type="date" value={form.deadline||''} onChange={e=>setForm({...form, deadline:e.target.value})} className="mt-1 w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Visibilité</label>
                <select value={form.visibility} onChange={e=>setForm({...form, visibility:e.target.value as any})} className="mt-1 w-full border rounded px-3 py-2">
                  <option value="all">Tous les freelances</option>
                  <option value="assigned">Assigné</option>
                </select>
              </div>
              {form.visibility === 'assigned' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Freelancers assignés</label>
                  {availableFreelancers.length > 0 ? (
                    <div className="space-y-2">
                      <select 
                        multiple 
                        value={form.assignedFreelancerIds || []} 
                        onChange={e => setForm({...form, assignedFreelancerIds: Array.from(e.target.selectedOptions, option => option.value)})}
                        className="mt-1 w-full border rounded px-3 py-2 min-h-[120px]"
                      >
                        {availableFreelancers.map(freelancer => (
                          <option key={freelancer.id} value={freelancer.id}>
                            {freelancer.id} - {freelancer.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-sm text-gray-600">Maintenez Ctrl/Cmd pour sélectionner plusieurs freelancers</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input 
                        value={Array.isArray(form.assignedFreelancerIds) ? form.assignedFreelancerIds.join(', ') : (form.assignedFreelancerIds || '')} 
                        onChange={e => {
                          // Store as string to allow typing, convert to array on blur or save
                          setForm({...form, assignedFreelancerIds: e.target.value});
                        }}
                        onBlur={e => {
                          // Convert to array when user finishes typing
                          const idsArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setForm({...form, assignedFreelancerIds: idsArray});
                        }}
                        placeholder="FRE-123456, FRE-789012, FRE-345678"
                        className="mt-1 w-full border rounded px-3 py-2"
                      />
                      <p className="text-sm text-gray-600">Saisissez les IDs séparés par des virgules (ex: FRE-123456, FRE-789012)</p>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium">Statut</label>
                <select value={form.status} onChange={e=>setForm({...form, status:e.target.value as any})} className="mt-1 w-full border rounded px-3 py-2">
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Tags (séparées par ,)</label>
                <input 
                  value={Array.isArray(form.tags) ? form.tags.join(', ') : (form.tags || '')} 
                  onChange={e => {
                    // Store as string to allow typing, convert to array on blur or save
                    setForm({...form, tags: e.target.value});
                  }}
                  onBlur={e => {
                    // Convert to array when user finishes typing
                    const tagsArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setForm({...form, tags: tagsArray});
                  }}
                  placeholder="remote, frontend, senior, urgent"
                  className="mt-1 w-full border rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Séparez les tags par des virgules (ex: remote, frontend, senior)
                </p>
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

export default FreelancerOffersPage;
