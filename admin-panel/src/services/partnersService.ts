export type PartnerType = 'formateur' | 'freelancer' | 'commercial' | 'entreprise';

export interface Partner {
  id: string;
  fullName: string;
  email: string;
  type: PartnerType;
}

const STORAGE_KEY = 'partners';

const readAll = (): Partner[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Partner[]; } catch { return []; }
};

const writeAll = (items: Partner[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const prefixMap: Record<PartnerType, string> = {
  formateur: 'FOR',
  freelancer: 'FRE',
  commercial: 'COM',
  entreprise: 'ENT',
};

const generateId = (type: PartnerType, existing: Set<string>): string => {
  let id = '';
  do {
    const digits = Math.floor(100000 + Math.random() * 900000);
    id = `${prefixMap[type]}-${digits}`;
  } while (existing.has(id));
  return id;
};

export const listPartners = (): Partner[] => readAll();

export const createPartner = (input: Omit<Partner, 'id'>): Partner => {
  const all = readAll();
  const existingIds = new Set(all.map(p => p.id));
  const id = generateId(input.type, existingIds);
  const partner: Partner = { id, ...input };
  writeAll([...all, partner]);
  return partner;
};

export const updatePartner = (id: string, patch: Partial<Omit<Partner, 'id'>>): Partner | undefined => {
  const all = readAll();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return undefined;
  const updated: Partner = { ...all[idx], ...patch };
  all[idx] = updated;
  writeAll(all);
  return updated;
};

export const deletePartner = (id: string): boolean => {
  const all = readAll();
  const next = all.filter(p => p.id !== id);
  writeAll(next);
  return next.length !== all.length;
};

export const seedPartnersIfEmpty = () => {
  const current = readAll();
  if (current.length > 0) return;
  const demo: Omit<Partner, 'id'>[] = [
    { fullName: 'Ahmed Benali', email: 'ahmed.formateur@example.com', type: 'formateur' },
    { fullName: 'Fatima Zahra', email: 'fatima.freelancer@example.com', type: 'freelancer' },
    { fullName: 'Youssef Commercial', email: 'youssef.commercial@example.com', type: 'commercial' },
    { fullName: 'Société ABC', email: 'contact@abc.com', type: 'entreprise' },
  ];
  const seeded: Partner[] = [];
  const used = new Set<string>();
  for (const d of demo) {
    const id = generateId(d.type, used);
    used.add(id);
    seeded.push({ id, ...d });
  }
  writeAll(seeded);
};
