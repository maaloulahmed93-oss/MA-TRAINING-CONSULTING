export type FreelancerRevenue = { id: string; name: string; amount: number };

type TotalListener = (value: number) => void;
type ListListener = (list: FreelancerRevenue[]) => void;

const LIST_KEY = 'admin_freelancer_revenues';

const readList = (): FreelancerRevenue[] => {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LIST_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const arr = parsed as Array<Partial<FreelancerRevenue>>;
    return arr
      .map((x) => ({ id: String(x?.id ?? ''), name: String(x?.name ?? ''), amount: Number(x?.amount) }))
      .filter((x) => x.id && Number.isFinite(x.amount) && x.amount >= 0);
  } catch {
    return [];
  }
};

let listCache: FreelancerRevenue[] = readList();

const writeList = (list: FreelancerRevenue[]) => {
  listCache = list;
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(LIST_KEY, JSON.stringify(listCache));
  } catch (e) {
    if (typeof console !== 'undefined') console.debug('revenueStore:writeList failed', e);
  }
  const total = getRevenue();
  totalListeners.forEach((l) => l(total));
  listListeners.forEach((l) => l([...listCache]));
};

export const listFreelancerRevenues = (): FreelancerRevenue[] => [...listCache];

export const upsertFreelancerRevenue = (entry: FreelancerRevenue): void => {
  const idx = listCache.findIndex((e) => e.id === entry.id);
  const clean: FreelancerRevenue = {
    id: String(entry.id).trim(),
    name: String(entry.name || '').trim(),
    amount: Math.max(0, Number(entry.amount) || 0),
  };
  if (!clean.id) return;
  if (idx >= 0) {
    const copy = [...listCache];
    copy[idx] = clean;
    writeList(copy);
  } else {
    writeList([...listCache, clean]);
  }
};

export const removeFreelancerRevenue = (id: string): void => {
  writeList(listCache.filter((e) => e.id !== id));
};

export const getRevenue = (): number => listCache.reduce((s, e) => s + (Number(e.amount) || 0), 0);

const totalListeners: Set<TotalListener> = new Set();
const listListeners: Set<ListListener> = new Set();

export const subscribeRevenue = (l: TotalListener): (() => void) => {
  totalListeners.add(l);
  return () => totalListeners.delete(l);
};

export const subscribeRevenueList = (l: ListListener): (() => void) => {
  listListeners.add(l);
  return () => listListeners.delete(l);
};

// Deprecated: keep for backward compatibility; sets a single synthetic row with id "__total__"
export const setRevenue = (value: number): void => {
  const v = Math.max(0, Number(value) || 0);
  writeList([{ id: '__total__', name: 'Total', amount: v }]);
};
