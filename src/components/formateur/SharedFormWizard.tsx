import React, { useEffect, useMemo, useState } from 'react';

import GlobalEmailService from '../../services/globalEmailService';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

type TimeSlotKey = 'morning' | 'afternoon' | 'evening';

const dayLabels: Record<DayKey, string> = {
  mon: 'Lundi',
  tue: 'Mardi',
  wed: 'Mercredi',
  thu: 'Jeudi',
  fri: 'Vendredi',
  sat: 'Samedi',
  sun: 'Dimanche',
};

const slotLabels: Record<TimeSlotKey, { label: string; range: string }> = {
  morning: { label: 'Matin', range: '08:00 - 12:00' },
  afternoon: { label: 'Après-midi', range: '13:00 - 18:00' },
  evening: { label: 'Soir', range: '19:00 - 22:00' },
};

type Availability = Record<DayKey, Record<TimeSlotKey, boolean>>;

type Submission = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dailyRate: number;
  availability: Availability;
  bio: string;
  createdAt: string;
};

type ProfileDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const STORAGE_PROFILE_KEY = 'formateur_shared_profile_draft';
const STORAGE_SUBMISSIONS_KEY = 'formateur_shared_submissions';
const STORAGE_UNLOCK_KEY = 'formateur_shared_admin_unlocked';

const ADMIN_PASSWORD = (import.meta as any)?.env?.VITE_FORMATEUR_DASH_PASSWORD || '1234';

const defaultProfile: ProfileDraft = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

const defaultAvailability = (): Availability => ({
  mon: { morning: false, afternoon: false, evening: false },
  tue: { morning: false, afternoon: false, evening: false },
  wed: { morning: false, afternoon: false, evening: false },
  thu: { morning: false, afternoon: false, evening: false },
  fri: { morning: false, afternoon: false, evening: false },
  sat: { morning: false, afternoon: false, evening: false },
  sun: { morning: false, afternoon: false, evening: false },
});

const safeParseJson = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const SharedFormWizard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>('');

  const [contactEmail, setContactEmail] = useState(GlobalEmailService.getCachedEmail());

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string>('');

  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [dailyRate, setDailyRate] = useState<number | ''>('');
  const [availability, setAvailability] = useState<Availability>(() => defaultAvailability());
  const [bio, setBio] = useState('');

  const selectedSlotsCount = useMemo(() => {
    const days = Object.keys(dayLabels) as DayKey[];
    let count = 0;
    for (const d of days) {
      const slots = Object.keys(slotLabels) as TimeSlotKey[];
      for (const s of slots) {
        if (availability[d][s]) count += 1;
      }
    }
    return count;
  }, [availability]);

  useEffect(() => {
    GlobalEmailService.getGlobalEmail().then(setContactEmail).catch(() => {
      setContactEmail(GlobalEmailService.getCachedEmail());
    });

    const savedProfile = safeParseJson<ProfileDraft>(localStorage.getItem(STORAGE_PROFILE_KEY), defaultProfile);
    setFirstName(savedProfile.firstName || '');
    setLastName(savedProfile.lastName || '');
    setEmail(savedProfile.email || '');
    setPhone(savedProfile.phone || '');

    const rawSavedSubmissions = safeParseJson<any[]>(localStorage.getItem(STORAGE_SUBMISSIONS_KEY), []);
    const migrated: Submission[] = Array.isArray(rawSavedSubmissions)
      ? rawSavedSubmissions
          .filter(Boolean)
          .map((s: any) => {
            const legacyHours = typeof s?.hoursPerDay === 'number' ? s.hoursPerDay : undefined;
            const normalizedDailyRate = typeof s?.dailyRate === 'number' ? s.dailyRate : legacyHours;

            const baseAvailability = defaultAvailability();
            const legacyAvailableDays: DayKey[] = Array.isArray(s?.availableDays) ? (s.availableDays as DayKey[]) : [];

            let normalizedAvailability: Availability = baseAvailability;
            if (s?.availability && typeof s.availability === 'object') {
              const days = Object.keys(dayLabels) as DayKey[];
              const slots = Object.keys(slotLabels) as TimeSlotKey[];
              normalizedAvailability = defaultAvailability();
              for (const d of days) {
                const row = s.availability?.[d];
                if (row && typeof row === 'object') {
                  for (const sl of slots) {
                    normalizedAvailability[d][sl] = Boolean(row?.[sl]);
                  }
                }
              }
            } else if (legacyAvailableDays.length > 0) {
              normalizedAvailability = defaultAvailability();
              for (const d of legacyAvailableDays) {
                if (normalizedAvailability[d]) {
                  normalizedAvailability[d].morning = true;
                  normalizedAvailability[d].afternoon = true;
                  normalizedAvailability[d].evening = true;
                }
              }
            }

            return {
              id: String(s?.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`),
              firstName: String(s?.firstName || ''),
              lastName: String(s?.lastName || ''),
              email: String(s?.email || ''),
              phone: String(s?.phone || ''),
              dailyRate: typeof normalizedDailyRate === 'number' ? normalizedDailyRate : 0,
              availability: normalizedAvailability,
              bio: String(s?.bio || ''),
              createdAt: String(s?.createdAt || new Date().toISOString()),
            };
          })
      : [];

    setSubmissions(migrated);
    localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(migrated));

    const unlocked = sessionStorage.getItem(STORAGE_UNLOCK_KEY) === '1';
    setIsUnlocked(unlocked);
  }, []);

  const handleUnlock = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminError('');
      setIsUnlocked(true);
      sessionStorage.setItem(STORAGE_UNLOCK_KEY, '1');
      setAdminPassword('');
      return;
    }
    setAdminError('Mot de passe incorrect');
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setAdminError('');
    setAdminPassword('');
    sessionStorage.removeItem(STORAGE_UNLOCK_KEY);
  };

  const toggleSlot = (day: DayKey, slot: TimeSlotKey) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: !prev[day][slot],
      },
    }));
  };

  const resetFormFields = (profile?: ProfileDraft) => {
    setError('');
    setDailyRate('');
    setAvailability(defaultAvailability());
    setBio('');

    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
    }
  };

  const handleOpenForm = () => {
    const savedProfile = safeParseJson<ProfileDraft>(localStorage.getItem(STORAGE_PROFILE_KEY), defaultProfile);
    resetFormFields(savedProfile);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanBio = bio.trim();

    if (!cleanFirst || !cleanLast || !cleanEmail || !cleanPhone) {
      setError('Veuillez remplir: prénom, nom, email et téléphone.');
      return;
    }

    if (dailyRate === '' || Number(dailyRate) <= 0) {
      setError('Veuillez renseigner "التعريفة اليومية" (السعر اليومي).');
      return;
    }

    if (selectedSlotsCount === 0) {
      setError('Veuillez sélectionner au moins une plage horaire disponible.');
      return;
    }

    if (!cleanBio) {
      setError('Veuillez ajouter une petite définition (تعريف) عن نفسك.');
      return;
    }

    const profile: ProfileDraft = {
      firstName: cleanFirst,
      lastName: cleanLast,
      email: cleanEmail,
      phone: cleanPhone,
    };

    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));

    const newSubmission: Submission = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      firstName: cleanFirst,
      lastName: cleanLast,
      email: cleanEmail,
      phone: cleanPhone,
      dailyRate: Number(dailyRate),
      availability,
      bio: cleanBio,
      createdAt: new Date().toISOString(),
    };

    const next = [newSubmission, ...submissions];
    setSubmissions(next);
    localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(next));

    setShowForm(false);
    resetFormFields(profile);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Espace partagé - Formateur</h2>
            <p className="text-gray-600 mt-1 text-sm">Ajoute tes informations و تو تظهر هنا في الداشبورد.</p>
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">ملاحظة:</span> لازم تبعث السيرة الذاتية والبرتڨوليو على الإيميل:
                {' '}
                <a className="underline font-medium" href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenForm}
            className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ajouter des informations
          </button>
        </div>
      </div>

      {showForm ? (
        <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ajouter / Modifier tes informations</h3>
              <p className="text-xs text-gray-600 mt-1">Les champs identité sont pré-remplis automatiquement.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          ) : null}

          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="firstName">Prénom</label>
                <input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="lastName">Nom</label>
                <input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">Téléphone</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="dailyRate">التعريفة اليومية (السعر اليومي)</label>
              <input
                id="dailyRate"
                type="number"
                inputMode="numeric"
                min={1}
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">التوفر حسب الأيام والساعات</h4>
                  <p className="text-xs text-gray-600 mt-1">اختار الساعات اللي انت متاح فيهم لكل نهار</p>
                </div>
                <div className="text-xs text-gray-500">Sélections: {selectedSlotsCount}</div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-700 px-3 py-2 border-b border-gray-200">Jour</th>
                      {(Object.keys(slotLabels) as TimeSlotKey[]).map((slot) => (
                        <th key={slot} className="text-left text-xs font-semibold text-gray-700 px-3 py-2 border-b border-gray-200">
                          <div className="leading-tight">
                            <div>{slotLabels[slot].label}</div>
                            <div className="text-[11px] text-gray-500 font-medium">{slotLabels[slot].range}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(dayLabels) as DayKey[]).map((day) => (
                      <tr key={day} className="odd:bg-white even:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-800 border-b border-gray-200 whitespace-nowrap">{dayLabels[day]}</td>
                        {(Object.keys(slotLabels) as TimeSlotKey[]).map((slot) => (
                          <td key={`${day}-${slot}`} className="px-3 py-2 border-b border-gray-200">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={availability[day][slot]}
                                onChange={() => toggleSlot(day, slot)}
                              />
                              <span className="sr-only">{dayLabels[day]} {slotLabels[slot].label}</span>
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="bio">تعريف (عرّف بروحك)</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      ) : null}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {!isUnlocked ? (
          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Zone admin</h3>
              <div className="text-xs text-gray-500">Protégé</div>
            </div>

            <p className="text-sm text-gray-600 mt-3">أدخل كلمة السر باش تشوف المعلومات المسجّلة.</p>

            {adminError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                {adminError}
              </div>
            ) : null}

            <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full sm:max-w-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleUnlock}
                className="inline-flex items-center justify-center bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
              >
                Afficher
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Informations enregistrées</h3>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500">Total: {submissions.length}</div>
                <button
                  type="button"
                  onClick={handleLock}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 text-sm"
                >
                  Verrouiller
                </button>
              </div>
            </div>

            {submissions.length === 0 ? (
              <p className="text-sm text-gray-600 mt-4">ما فمّاش معلومات مسجّلة تو. اضغط على "Ajouter des informations".</p>
            ) : (
              <div className="mt-6 space-y-4">
                {submissions.map((s) => (
                  <div key={s.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{`${s.firstName} ${s.lastName}`.trim() || '—'}</div>
                        <div className="text-sm text-gray-700">{s.email} · {s.phone}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(s.createdAt).toLocaleString('fr-FR')}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-xs font-semibold text-gray-600">التعريفة اليومية</div>
                        <div className="text-gray-900">{s.dailyRate} DT / jour</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-xs font-semibold text-gray-600">الأيام المتاحة</div>
                        <div className="text-gray-900">
                          {(Object.keys(dayLabels) as DayKey[])
                            .filter((d) => Object.values(s.availability[d] || {}).some(Boolean))
                            .map((d) => {
                              const slots = (Object.keys(slotLabels) as TimeSlotKey[])
                                .filter((sl) => Boolean(s.availability?.[d]?.[sl]))
                                .map((sl) => slotLabels[sl].range);
                              return `${dayLabels[d]}: ${slots.join(', ')}`;
                            })
                            .join(' | ')}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-xs font-semibold text-gray-600">تعريف</div>
                      <div className="text-gray-900 whitespace-pre-wrap">{s.bio}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFormWizard;
