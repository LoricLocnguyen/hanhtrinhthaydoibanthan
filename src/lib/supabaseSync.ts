import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, DayLog, PomodoroSession, JournalEntry, UrgeLog, TimeCapsuleEntry } from '@/lib/AppContext';

export async function loadProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (!data) return null;
  return {
    name: data.name,
    avatar: data.avatar,
    reason: data.reason,
    targetDays: data.target_days,
    startDate: data.start_date,
    onboardingDone: data.onboarding_done,
  };
}

export async function saveProfile(userId: string, profile: UserProfile) {
  await supabase.from('profiles').upsert({
    user_id: userId,
    name: profile.name,
    avatar: profile.avatar,
    reason: profile.reason,
    target_days: profile.targetDays,
    start_date: profile.startDate,
    onboarding_done: profile.onboardingDone,
  }, { onConflict: 'user_id' });
}

export async function loadDayLogs(userId: string): Promise<DayLog[]> {
  const { data } = await supabase
    .from('day_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1000);
  return (data || []).map(d => ({
    date: d.date,
    success: d.success,
    relapseReason: d.relapse_reason ?? undefined,
    relapseNote: d.relapse_note ?? undefined,
    mood: d.mood ?? undefined,
    moodNote: d.mood_note ?? undefined,
  }));
}

export async function saveDayLog(userId: string, log: DayLog) {
  await supabase.from('day_logs').upsert({
    user_id: userId,
    date: log.date,
    success: log.success,
    relapse_reason: log.relapseReason || null,
    relapse_note: log.relapseNote || null,
    mood: log.mood || null,
    mood_note: log.moodNote || null,
  }, { onConflict: 'user_id,date' });
}

export async function loadPomodoroSessions(userId: string): Promise<PomodoroSession[]> {
  const { data } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1000);
  return (data || []).map(d => ({
    id: d.id,
    date: d.date,
    task: d.task,
    tag: d.tag,
    duration: d.duration,
    timestamp: new Date(d.created_at).getTime(),
  }));
}

export async function savePomodoroSession(userId: string, s: PomodoroSession) {
  await supabase.from('pomodoro_sessions').insert({
    user_id: userId,
    date: s.date,
    task: s.task,
    tag: s.tag,
    duration: s.duration,
  });
}

export async function loadJournalEntries(userId: string): Promise<JournalEntry[]> {
  const { data } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1000);
  return (data || []).map(d => ({
    id: d.id,
    date: d.date,
    content: d.content,
    mood: d.mood,
    triggers: d.triggers || [],
    timestamp: new Date(d.created_at).getTime(),
  }));
}

export async function saveJournalEntry(userId: string, e: JournalEntry) {
  await supabase.from('journal_entries').insert({
    user_id: userId,
    date: e.date,
    content: e.content,
    mood: e.mood,
    triggers: e.triggers,
  });
}

export async function updateJournalEntryDb(userId: string, e: JournalEntry) {
  await supabase.from('journal_entries')
    .update({ content: e.content, mood: e.mood, triggers: e.triggers })
    .eq('id', e.id)
    .eq('user_id', userId);
}

export async function loadUrgeLogs(userId: string): Promise<UrgeLog[]> {
  const { data } = await supabase
    .from('urge_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1000);
  return (data || []).map(d => ({
    id: d.id,
    date: d.date,
    intensity: d.intensity,
    duration: d.duration,
    journalNote: d.journal_note,
    timestamp: new Date(d.created_at).getTime(),
  }));
}

export async function saveUrgeLog(userId: string, u: UrgeLog) {
  await supabase.from('urge_logs').insert({
    user_id: userId,
    date: u.date,
    intensity: u.intensity,
    duration: u.duration,
    journal_note: u.journalNote,
  });
}

export async function loadTimeCapsules(userId: string): Promise<TimeCapsuleEntry[]> {
  const { data } = await supabase
    .from('time_capsules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data || []).map(d => ({
    milestone: d.milestone,
    content: d.content,
    createdAt: new Date(d.created_at).getTime(),
  }));
}

export async function saveTimeCapsule(userId: string, entry: TimeCapsuleEntry) {
  await supabase.from('time_capsules').insert({
    user_id: userId,
    milestone: entry.milestone,
    content: entry.content,
  });
}
