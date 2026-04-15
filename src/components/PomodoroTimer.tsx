import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '@/lib/AppContext';
import { DEFAULT_POMODORO_TAGS } from '@/lib/constants';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle, Plus, X, Dumbbell, Gamepad2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import PomodoroAchievements from './PomodoroAchievements';

type Phase = 'focus' | 'break' | 'longBreak' | 'exercise' | 'play';
const SPECIAL_EMAIL = 'pinkblack0905@gmail.com';

export default function PomodoroTimer() {
  const { addPomodoroSession, pomodoroSessions, privacyMode, customTags, addCustomTag, removeCustomTag, currentStreak, longestStreak } = useApp();
  const { user } = useAuth();
  const isSpecialUser = user?.email === SPECIAL_EMAIL;
  const allTags = [...DEFAULT_POMODORO_TAGS, ...customTags];
  const today = new Date().toISOString().split('T')[0];

  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [phase, setPhase] = useState<Phase>('focus');
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [task, setTask] = useState('');
  const [tag, setTag] = useState(allTags[0]);
  const [newTag, setNewTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const getPhaseSeconds = (p: Phase) => {
    switch (p) {
      case 'focus': return focusMin * 60;
      case 'break': return breakMin * 60;
      case 'longBreak': return longBreakMin * 60;
      case 'exercise': return 10 * 60;
      case 'play': return 5 * 60;
    }
  };

  const totalSeconds = getPhaseSeconds(phase);
  const progress = 1 - seconds / totalSeconds;

  const handlePhaseComplete = useCallback(() => {
    setRunning(false);
    const phaseLabels: Record<Phase, string> = {
      focus: '🍅 Pomodoro hoàn thành!',
      break: '☕ Nghỉ xong rồi!',
      longBreak: '☕ Nghỉ dài xong rồi!',
      exercise: '💪 Thể dục xong rồi!',
      play: '🎮 Giờ chơi hết rồi!',
    };
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(phaseLabels[phase]);
    }
    if (phase === 'focus') {
      const newCount = completedCount + 1;
      setCompletedCount(newCount);
      addPomodoroSession({
        id: Date.now().toString(),
        date: today,
        task: task || 'Không tên',
        tag,
        duration: focusMin,
        timestamp: Date.now(),
      });
      if (isSpecialUser) {
        // Special flow: focus → exercise → play → focus
        setPhase('exercise');
        setSeconds(10 * 60);
        setRunning(true);
      } else if (newCount % 4 === 0) {
        setPhase('longBreak');
        setSeconds(longBreakMin * 60);
      } else {
        setPhase('break');
        setSeconds(breakMin * 60);
      }
    } else if (phase === 'exercise') {
      setPhase('play');
      setSeconds(5 * 60);
      setRunning(true);
    } else {
      setPhase('focus');
      setSeconds(focusMin * 60);
    }
  }, [phase, completedCount, task, tag, focusMin, breakMin, longBreakMin, today, addPomodoroSession, isSpecialUser]);

  // Timer logic — use timestamp-based approach so background tabs work correctly
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      endTimeRef.current = null;
      return;
    }
    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + seconds * 1000;
    }
    const tick = () => {
      const remaining = Math.round((endTimeRef.current! - Date.now()) / 1000);
      if (remaining <= 0) {
        setSeconds(0);
        handlePhaseComplete();
      } else {
        setSeconds(remaining);
      }
    };
    const interval = setInterval(tick, 500);
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [running, phase, handlePhaseComplete]);

  const reset = () => {
    setRunning(false);
    setPhase('focus');
    setSeconds(focusMin * 60);
    setCompletedCount(0);
  };

  const toggleTimer = () => {
    if (!running && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setRunning(!running);
  };

  // Ambient sound
  const toggleSound = () => {
    if (soundOn) {
      noiseNodeRef.current?.stop();
      noiseNodeRef.current = null;
      setSoundOn(false);
    } else {
      try {
        const ctx = audioCtxRef.current || new AudioContext();
        audioCtxRef.current = ctx;
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const gain = ctx.createGain();
        gain.gain.value = 0.3;
        source.connect(gain).connect(ctx.destination);
        source.start();
        noiseNodeRef.current = source;
        setSoundOn(true);
      } catch {}
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const phaseColors: Record<Phase, string> = {
    focus: 'hsl(160, 77%, 67%)',
    break: 'hsl(263, 86%, 76%)',
    longBreak: 'hsl(45, 93%, 58%)',
    exercise: 'hsl(20, 90%, 60%)',
    play: 'hsl(280, 70%, 65%)',
  };

  const phaseLabelsVi: Record<Phase, string> = {
    focus: 'Tập trung',
    break: 'Nghỉ ngắn',
    longBreak: 'Nghỉ dài',
    exercise: '💪 Thể dục',
    play: '🎮 Giờ chơi',
  };

  const todayCount = pomodoroSessions.filter(s => s.date === today).length;

  const circumference = 2 * Math.PI * 90;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pomodoro Timer</h1>

      {running && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 text-sm text-primary text-center animate-fade-in">
          {phase === 'exercise' ? '💪 Thời gian thể dục — Vận động nào!' : phase === 'play' ? '🎮 Giờ chơi — Thư giãn đi!' : '🧠 Đang trong vùng tập trung — Hãy duy trì!'}
        </div>
      )}

      {/* Timer Circle */}
      <div className="card-rewire flex flex-col items-center py-8">
        <div className="relative">
          <svg viewBox="0 0 200 200" className="w-56 h-56">
            <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(220,18%,16%)" strokeWidth="6" />
            <circle
              cx="100" cy="100" r="90" fill="none"
              stroke={phaseColors[phase]}
              strokeWidth="6"
              strokeDasharray={`${circumference * progress} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {phaseLabelsVi[phase]}
            </div>
            <div className="text-5xl font-mono font-bold" style={{ color: phaseColors[phase] }}>
              {privacyMode ? '••:••' : formatTime(seconds)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              #{completedCount + 1} • {privacyMode ? '•' : todayCount} 🍅 hôm nay
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button onClick={reset} className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <RotateCcw className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={toggleTimer}
            className="p-4 rounded-full bg-primary hover:bg-primary/90 transition-all pulse-glow"
          >
            {running ? <Pause className="w-6 h-6 text-primary-foreground" /> : <Play className="w-6 h-6 text-primary-foreground" />}
          </button>
          <button onClick={toggleSound} className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors">
            {soundOn ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Task Input */}
      <div className="card-rewire space-y-3">
        <input
          type="text"
          placeholder="Bạn đang làm gì?"
          value={task}
          onChange={e => setTask(e.target.value)}
          className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex flex-wrap gap-2">
          {allTags.map(t => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1 ${
                tag === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
              {customTags.includes(t) && (
                <X className="w-3 h-3 opacity-60 hover:opacity-100" onClick={e => { e.stopPropagation(); removeCustomTag(t); if (tag === t) setTag(allTags[0]); }} />
              )}
            </button>
          ))}
          {showAddTag ? (
            <form onSubmit={e => { e.preventDefault(); if (newTag.trim() && !allTags.includes(newTag.trim())) { addCustomTag(newTag.trim()); setTag(newTag.trim()); } setNewTag(''); setShowAddTag(false); }} className="flex items-center gap-1">
              <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Nhãn mới..." autoFocus
                className="w-20 px-2 py-1 rounded-full text-xs bg-muted text-foreground outline-none focus:ring-1 focus:ring-primary" />
              <button type="submit" className="p-1 rounded-full bg-primary text-primary-foreground"><Plus className="w-3 h-3" /></button>
            </form>
          ) : (
            <button onClick={() => setShowAddTag(true)} className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Plus className="w-3 h-3" /> Thêm
            </button>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="card-rewire">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Tập trung', value: focusMin, set: (v: number) => { setFocusMin(v); if (!running && phase === 'focus') setSeconds(v * 60); } },
            { label: 'Nghỉ ngắn', value: breakMin, set: (v: number) => { setBreakMin(v); if (!running && phase === 'break') setSeconds(v * 60); } },
            { label: 'Nghỉ dài', value: longBreakMin, set: (v: number) => { setLongBreakMin(v); if (!running && phase === 'longBreak') setSeconds(v * 60); } },
          ].map(({ label, value, set }) => (
            <div key={label} className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <input
                type="number"
                min={1} max={120}
                value={value}
                onChange={e => set(Number(e.target.value))}
                disabled={running}
                className="w-full bg-muted rounded-lg px-2 py-1.5 text-center text-sm font-mono text-foreground disabled:opacity-50 outline-none"
              />
              <div className="text-[10px] text-muted-foreground">phút</div>
            </div>
          ))}
        </div>
      </div>

      {/* Today Summary */}
      {(() => {
        const todaySessions = pomodoroSessions.filter(s => s.date === today);
        if (todaySessions.length === 0) return null;
        const totalMin = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        const byTag: Record<string, number> = {};
        todaySessions.forEach(s => { byTag[s.tag] = (byTag[s.tag] || 0) + s.duration; });
        const COLORS = ['hsl(160,77%,67%)', 'hsl(263,86%,76%)', 'hsl(45,93%,58%)', 'hsl(200,80%,60%)', 'hsl(340,75%,65%)', 'hsl(30,90%,60%)', 'hsl(120,50%,55%)'];
        const chartData = Object.entries(byTag).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
        return (
          <div className="card-rewire">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Hôm nay đã tập trung</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" innerRadius={35} outerRadius={60} paddingAngle={3} strokeWidth={0}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}m`} contentStyle={{ background: 'hsl(220,18%,14%)', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-primary">{Math.floor(totalMin / 60) > 0 ? `${Math.floor(totalMin / 60)}h${totalMin % 60 > 0 ? totalMin % 60 : ''}` : `${totalMin}m`}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {chartData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-foreground">{d.name}</span>
                    <span className="text-muted-foreground">{d.value}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* History Chart by Day */}
      {pomodoroSessions.length > 0 && (() => {
        const COLORS = ['hsl(160,77%,67%)', 'hsl(263,86%,76%)', 'hsl(45,93%,58%)', 'hsl(200,80%,60%)', 'hsl(340,75%,65%)', 'hsl(30,90%,60%)', 'hsl(120,50%,55%)'];
        const byDate: Record<string, Record<string, number>> = {};
        pomodoroSessions.forEach(s => {
          if (!byDate[s.date]) byDate[s.date] = {};
          byDate[s.date][s.tag] = (byDate[s.date][s.tag] || 0) + s.duration;
        });
        const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a)).slice(0, 7);
        const allTags = [...new Set(pomodoroSessions.map(s => s.tag))];
        return (
          <div className="card-rewire">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Lịch sử Pomodoro</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sortedDates.map(date => {
                const tagData = Object.entries(byDate[date]).map(([name, value]) => ({ name, value }));
                const total = tagData.reduce((s, d) => s + d.value, 0);
                return (
                  <div key={date} className="flex flex-col items-center">
                    <div className="text-[11px] text-muted-foreground/70 mb-1">{date === today ? 'Hôm nay' : date}</div>
                    <div className="relative w-20 h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={tagData} dataKey="value" innerRadius={18} outerRadius={32} paddingAngle={2} strokeWidth={0}>
                            {tagData.map((d, i) => <Cell key={i} fill={COLORS[allTags.indexOf(d.name) % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => `${v}m`} contentStyle={{ background: 'hsl(220,18%,14%)', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[11px] font-bold text-foreground">{total}m</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center border-t border-muted pt-3">
              {allTags.map((t, i) => (
                <div key={t} className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-foreground font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <PomodoroAchievements />
    </div>
  );
}
