import type { Participant } from "../types/participant";

const STORAGE_KEY = "matc_participants";
import { API_BASE_URL } from '../config/api';
const API_BASE = API_BASE_URL;

// Get all participants from API with localStorage fallback
export async function getAllParticipants(): Promise<Participant[]> {
  try {
    const response = await fetch(`${API_BASE}/participants`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // Also save to localStorage for offline access
        saveAll(result.data);
        return result.data;
      }
    }
  } catch (error) {
    console.warn('API failed, using localStorage:', error);
  }
  
  // Fallback to localStorage
  return getAll();
}

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

// Create or update participant with API integration
export async function upsertParticipant(p: Participant): Promise<Participant> {
  try {
    let method = 'POST';
    let url = `${API_BASE}/participants`;
    
    // If participant has an ID, check if it exists first
    if (p.id && p.id !== '') {
      try {
        const checkResponse = await fetch(`${API_BASE}/participants/${p.id}`);
        if (checkResponse.ok) {
          // Participant exists, use PUT to update
          method = 'PUT';
          url = `${API_BASE}/participants/${p.id}`;
        }
        // If 404, participant doesn't exist, use POST to create (with custom ID)
      } catch (error) {
        // If check fails, default to POST
        console.warn('Failed to check participant existence, defaulting to POST:', error);
      }
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...p,
        partnerId: p.id // Pass the ID as partnerId for creation
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        // Also update localStorage for offline access
        upsert(result.data);
        console.log(`✅ Participant ${method} successful:`, result.data.id);
        return result.data;
      } else {
        throw new Error(`API response not successful: ${JSON.stringify(result)}`);
      }
    } else {
      console.error(`❌ API ${method} failed with status ${response.status}`);
      const errorText = await response.text();
      console.error(`❌ Error details:`, errorText);
      throw new Error(`API failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error(`❌ API failed, falling back to localStorage:`, error);
    // Fallback to localStorage
    upsert(p);
    return p;
  }
}

export function upsert(p: Participant): void {
  const list = getAll();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...p, updatedAt: new Date().toISOString() };
  else list.unshift({ ...p, createdAt: p.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() });
  saveAll(list);
}

// Delete participant with API integration
export async function removeParticipant(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/participants/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        // Also remove from localStorage
        remove(id);
        return true;
      }
    }
  } catch (error) {
    console.warn('API failed, using localStorage:', error);
  }
  
  // Fallback to localStorage
  remove(id);
  return true;
}

export function remove(id: string): void {
  const list = getAll().filter((x) => x.id !== id);
  saveAll(list);
}

// Seed participants if empty with API integration - DISABLED FOR PRODUCTION
export async function seedParticipantsIfEmpty(defaults: Participant[]): Promise<void> {
  // تم تعطيل التحميل التلقائي للبيانات التجريبية
  console.log('🚫 Auto-seeding disabled to prevent mock data in production');
  return;
}

export function seedIfEmpty(defaults: Participant[]): void {
  // تم تعطيل التحميل التلقائي للبيانات التجريبية
  console.log('🚫 localStorage seeding disabled to prevent mock data');
  return;
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
