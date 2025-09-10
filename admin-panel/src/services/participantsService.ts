import type { Participant } from "../types/participant";

const STORAGE_KEY = "matc_participants";

export function getAll(): Participant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAll(list: Participant[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getById(id: string): Participant | undefined {
  return getAll().find((p) => p.id === id);
}

export function upsert(p: Participant): void {
  const list = getAll();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...p, updatedAt: new Date().toISOString() };
  else list.unshift({ ...p, createdAt: p.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() });
  saveAll(list);
}

export function remove(id: string): void {
  const list = getAll().filter((x) => x.id !== id);
  saveAll(list);
}

export function seedIfEmpty(defaults: Participant[]): void {
  const cur = getAll();
  if (cur.length === 0) {
    saveAll(defaults);
  }
}

export function exportJSON(): string {
  return JSON.stringify(getAll(), null, 2);
}

export function importJSON(json: string, { overwrite } = { overwrite: false }): void {
  try {
    const incoming = JSON.parse(json) as Participant[];
    if (!Array.isArray(incoming)) return;
    if (overwrite) {
      saveAll(incoming);
      return;
    }
    // merge by id (incoming wins)
    const map = new Map<string, Participant>();
    for (const p of getAll()) map.set(p.id, p);
    for (const p of incoming) map.set(p.id, p);
    saveAll(Array.from(map.values()));
  } catch {
    // ignore invalid JSON
  }
}
