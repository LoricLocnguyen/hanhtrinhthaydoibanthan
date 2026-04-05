// Safe localStorage wrapper
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(`rewire_${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(`rewire_${key}`, JSON.stringify(value));
      return true;
    } catch {
      console.warn('localStorage full or unavailable');
      return false;
    }
  },
  exportAll(): string {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('rewire_')) {
        try { data[key] = JSON.parse(localStorage.getItem(key)!); } catch { data[key] = localStorage.getItem(key); }
      }
    }
    return JSON.stringify(data, null, 2);
  },
  importAll(json: string): boolean {
    try {
      const data = JSON.parse(json);
      Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
      return true;
    } catch { return false; }
  }
};
