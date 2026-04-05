import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { storage } from '@/lib/storage';

export type Module = 'dashboard' | 'pomodoro' | 'calendar' | 'urge' | 'journal' | 'stats' | 'achievements' | 'settings';

export interface UserProfile {
  name: string;
  avatar: string;
  reason: string;
  targetDays: number;
  startDate: string;
  onboardingDone: boolean;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  success: boolean;
  relapseReason?: string;
  relapseNote?: string;
  mood?: number; // 1-5
  moodNote?: string;
}

export interface PomodoroSession {
  id: string;
  date: string;
  task: string;
  tag: string;
  duration: number; // minutes
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: number;
  triggers: string[];
  timestamp: number;
}

export interface UrgeLog {
  id: string;
  date: string;
  intensity: number;
  duration: number; // seconds survived
  journalNote: string;
  timestamp: number;
}

interface AppState {
  activeModule: Module;
  setActiveModule: (m: Module) => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  dayLogs: DayLog[];
  setDayLogs: (logs: DayLog[]) => void;
  addDayLog: (log: DayLog) => void;
  pomodoroSessions: PomodoroSession[];
  addPomodoroSession: (s: PomodoroSession) => void;
  journalEntries: JournalEntry[];
  addJournalEntry: (e: JournalEntry) => void;
  updateJournalEntry: (e: JournalEntry) => void;
  urgeLogs: UrgeLog[];
  addUrgeLog: (u: UrgeLog) => void;
  currentStreak: number;
  longestStreak: number;
  willpower: number;
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  customTags: string[];
  addCustomTag: (tag: string) => void;
  removeCustomTag: (tag: string) => void;
}

const defaultProfile: UserProfile = {
  name: '',
  avatar: '🧠',
  reason: '',
  targetDays: 90,
  startDate: new Date().toISOString().split('T')[0],
  onboardingDone: false,
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [profile, setProfileState] = useState<UserProfile>(() => storage.get('profile', defaultProfile));
  const [dayLogs, setDayLogsState] = useState<DayLog[]>(() => storage.get('dayLogs', []));
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>(() => storage.get('pomodoroSessions', []));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => storage.get('journalEntries', []));
  const [urgeLogs, setUrgeLogs] = useState<UrgeLog[]>(() => storage.get('urgeLogs', []));
  const [customTags, setCustomTags] = useState<string[]>(() => storage.get('customTags', []));
  const [privacyMode, setPrivacyMode] = useState(false);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    storage.set('profile', p);
  }, []);

  const setDayLogs = useCallback((logs: DayLog[]) => {
    setDayLogsState(logs);
    storage.set('dayLogs', logs);
  }, []);

  const addDayLog = useCallback((log: DayLog) => {
    setDayLogsState(prev => {
      const filtered = prev.filter(d => d.date !== log.date);
      const next = [...filtered, log];
      storage.set('dayLogs', next);
      return next;
    });
  }, []);

  const addPomodoroSession = useCallback((s: PomodoroSession) => {
    setPomodoroSessions(prev => {
      const next = [...prev, s];
      storage.set('pomodoroSessions', next);
      return next;
    });
  }, []);

  const addJournalEntry = useCallback((e: JournalEntry) => {
    setJournalEntries(prev => {
      const next = [...prev, e];
      storage.set('journalEntries', next);
      return next;
    });
  }, []);

  const updateJournalEntry = useCallback((e: JournalEntry) => {
    setJournalEntries(prev => {
      const next = prev.map(j => j.id === e.id ? e : j);
      storage.set('journalEntries', next);
      return next;
    });
  }, []);

  const addUrgeLog = useCallback((u: UrgeLog) => {
    setUrgeLogs(prev => {
      const next = [...prev, u];
      storage.set('urgeLogs', next);
      return next;
    });
  }, []);

  const addCustomTag = useCallback((tag: string) => {
    setCustomTags(prev => {
      if (prev.includes(tag)) return prev;
      const next = [...prev, tag];
      storage.set('customTags', next);
      return next;
    });
  }, []);

  const removeCustomTag = useCallback((tag: string) => {
    setCustomTags(prev => {
      const next = prev.filter(t => t !== tag);
      storage.set('customTags', next);
      return next;
    });
  }, []);

  // Calculate streaks
  const { currentStreak, longestStreak } = React.useMemo(() => {
    if (dayLogs.length === 0) {
      // Count from start date
      const start = new Date(profile.startDate);
      const today = new Date();
      const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
      return { currentStreak: Math.max(0, diff), longestStreak: Math.max(0, diff) };
    }

    const sorted = [...dayLogs].sort((a, b) => b.date.localeCompare(a.date));
    let current = 0;
    const today = new Date().toISOString().split('T')[0];

    // Check from today backwards
    let checkDate = new Date(today);
    for (let i = 0; i < 1000; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const log = sorted.find(l => l.date === dateStr);
      if (log && !log.success) break;
      if (log && log.success) current++;
      else if (!log && dateStr >= profile.startDate) current++;
      else if (dateStr < profile.startDate) break;
      else break;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Find longest
    let longest = 0, tempStreak = 0;
    const allSorted = [...dayLogs].sort((a, b) => a.date.localeCompare(b.date));
    for (const log of allSorted) {
      if (log.success) { tempStreak++; longest = Math.max(longest, tempStreak); }
      else tempStreak = 0;
    }
    longest = Math.max(longest, current);

    return { currentStreak: current, longestStreak: longest };
  }, [dayLogs, profile.startDate]);

  const willpower = pomodoroSessions.length;

  // Privacy mode with P key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        setPrivacyMode(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <AppContext.Provider value={{
      activeModule, setActiveModule, profile, setProfile,
      dayLogs, setDayLogs, addDayLog,
      pomodoroSessions, addPomodoroSession,
      journalEntries, addJournalEntry, updateJournalEntry,
      urgeLogs, addUrgeLog,
      currentStreak, longestStreak, willpower,
      privacyMode, setPrivacyMode,
      customTags, addCustomTag, removeCustomTag,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
