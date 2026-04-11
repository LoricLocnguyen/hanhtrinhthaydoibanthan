import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { storage } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';
import * as sync from '@/lib/supabaseSync';

export type Module = 'dashboard' | 'pomodoro' | 'calendar' | 'urge' | 'journal' | 'stats' | 'achievements' | 'timecapsule' | 'squad' | 'mindmap' | 'settings';

export interface TimeCapsuleEntry {
  milestone: number;
  content: string;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  reason: string;
  targetDays: number;
  startDate: string;
  onboardingDone: boolean;
}

export interface DayLog {
  date: string;
  success: boolean;
  relapseReason?: string;
  relapseNote?: string;
  mood?: number;
  moodNote?: string;
}

export interface PomodoroSession {
  id: string;
  date: string;
  task: string;
  tag: string;
  duration: number;
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
  duration: number;
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
  timeCapsules: TimeCapsuleEntry[];
  addTimeCapsule: (entry: TimeCapsuleEntry) => void;
  dataLoading: boolean;
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
  const { user } = useAuth();
  const userId = user?.id;

  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);
  const [dayLogs, setDayLogsState] = useState<DayLog[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [urgeLogs, setUrgeLogs] = useState<UrgeLog[]>([]);
  const [customTags, setCustomTags] = useState<string[]>(() => storage.get('customTags', []));
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsuleEntry[]>([]);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Load data from DB when user logs in
  useEffect(() => {
    if (!userId) {
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    Promise.all([
      sync.loadProfile(userId),
      sync.loadDayLogs(userId),
      sync.loadPomodoroSessions(userId),
      sync.loadJournalEntries(userId),
      sync.loadUrgeLogs(userId),
      sync.loadTimeCapsules(userId),
    ]).then(([prof, days, pomo, journal, urges, capsules]) => {
      if (prof) setProfileState(prof);
      setDayLogsState(days);
      setPomodoroSessions(pomo);
      setJournalEntries(journal);
      setUrgeLogs(urges);
      setTimeCapsules(capsules);
      setDataLoading(false);
    }).catch(() => setDataLoading(false));
  }, [userId]);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    if (userId) sync.saveProfile(userId, p);
  }, [userId]);

  const setDayLogs = useCallback((logs: DayLog[]) => {
    setDayLogsState(logs);
  }, []);

  const addDayLog = useCallback((log: DayLog) => {
    setDayLogsState(prev => {
      const filtered = prev.filter(d => d.date !== log.date);
      return [...filtered, log];
    });
    if (userId) sync.saveDayLog(userId, log);
  }, [userId]);

  const addPomodoroSession = useCallback((s: PomodoroSession) => {
    setPomodoroSessions(prev => [...prev, s]);
    if (userId) sync.savePomodoroSession(userId, s);
  }, [userId]);

  const addJournalEntry = useCallback((e: JournalEntry) => {
    setJournalEntries(prev => [...prev, e]);
    if (userId) sync.saveJournalEntry(userId, e);
  }, [userId]);

  const updateJournalEntry = useCallback((e: JournalEntry) => {
    setJournalEntries(prev => prev.map(j => j.id === e.id ? e : j));
    if (userId) sync.updateJournalEntryDb(userId, e);
  }, [userId]);

  const addUrgeLog = useCallback((u: UrgeLog) => {
    setUrgeLogs(prev => [...prev, u]);
    if (userId) sync.saveUrgeLog(userId, u);
  }, [userId]);

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

  const addTimeCapsule = useCallback((entry: TimeCapsuleEntry) => {
    setTimeCapsules(prev => [...prev, entry]);
    if (userId) sync.saveTimeCapsule(userId, entry);
  }, [userId]);

  // Calculate streaks
  const { currentStreak, longestStreak } = React.useMemo(() => {
    if (dayLogs.length === 0) {
      const start = new Date(profile.startDate);
      const today = new Date();
      const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
      return { currentStreak: Math.max(0, diff), longestStreak: Math.max(0, diff) };
    }

    const sorted = [...dayLogs].sort((a, b) => b.date.localeCompare(a.date));
    let current = 0;
    const today = new Date().toISOString().split('T')[0];
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
      timeCapsules, addTimeCapsule,
      dataLoading,
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
