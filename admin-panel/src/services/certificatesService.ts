export type Level = "Débutant" | "Intermédiaire" | "Avancé" | "Expert";

export interface Certificate {
  id: string;
  firstName: string;
  lastName: string;
  program: string;
  skills: string[];
  techniques: string[];
  grade: number;
  level: Level;
  certificateUrl: string;
  recommendationUrl: string;
  evaluationUrl: string;
  completionDate: string;
}

const STORAGE_KEY = "matc_certificates";

export function getAll(): Certificate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAll(certs: Certificate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
}

export function getById(id: string): Certificate | undefined {
  return getAll().find((c) => c.id === id);
}

export function upsert(c: Certificate): void {
  const list = getAll();
  const idx = list.findIndex((x) => x.id === c.id);
  if (idx >= 0) list[idx] = c; else list.unshift(c);
  saveAll(list);
}

export function remove(id: string): void {
  const list = getAll().filter((x) => x.id !== id);
  saveAll(list);
}

export function seedIfEmpty(defaults: Certificate[]): void {
  const cur = getAll();
  if (cur.length === 0) {
    saveAll(defaults);
  }
}
