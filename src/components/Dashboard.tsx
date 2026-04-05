import { useApp } from '@/lib/AppContext';
import { getQuoteOfDay, MOOD_EMOJIS, MOOD_LABELS, MILESTONES } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { Flame, Zap, Trophy, Quote, Star } from 'lucide-react';

function StreakCounter() {
  const { currentStreak, privacyMode } = useApp();
  
  const getStreakColor = () => {
    if (currentStreak >= 90) return 'glow-lavender text-lavender';
    if (currentStreak >= 30) return 'glow-gold text-streak-gold';
    return 'glow-mint text-primary';
  };

  const nextMilestone = MILESTONES.find(m => m > currentStreak) || 365;
  const prevMilestone = [...MILESTONES].reverse().find(m => m <= currentStreak) || 0;
  const progress = ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100;

  return (
    <div className="card-rewire flex flex-col items-center py-8 animate-scale-in">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
        <Flame className="w-4 h-4 text-primary" />
        <span>Chuỗi ngày hiện tại</span>
      </div>
      <div className={`text-7xl font-bold font-mono ${getStreakColor()} transition-all duration-500`}>
        {privacyMode ? '••' : currentStreak}
      </div>
      <div className="text-muted-foreground mt-1">ngày</div>
      
      {/* Progress to next milestone */}
      <div className="w-full max-w-xs mt-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{prevMilestone} ngày</span>
          <span>{nextMilestone} ngày</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function RingProgress() {
  const { dayLogs, pomodoroSessions, privacyMode } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date();
  monthStart.setDate(1);

  const todayPomodoros = pomodoroSessions.filter(s => s.date === today).length;
  const weekPomodoros = pomodoroSessions.filter(s => s.date >= weekStart.toISOString().split('T')[0]).length;
  const monthPomodoros = pomodoroSessions.filter(s => s.date >= monthStart.toISOString().split('T')[0]).length;

  const rings = [
    { label: 'Hôm nay', value: todayPomodoros, max: 8, color: 'hsl(160, 77%, 67%)' },
    { label: 'Tuần này', value: weekPomodoros, max: 40, color: 'hsl(263, 86%, 76%)' },
    { label: 'Tháng này', value: monthPomodoros, max: 160, color: 'hsl(45, 93%, 58%)' },
  ];

  return (
    <div className="card-rewire animate-fade-in">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
        <Star className="w-4 h-4" /> Pomodoro Progress
      </h3>
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-32 h-32">
          {rings.map((ring, i) => {
            const r = 50 - i * 14;
            const circumference = 2 * Math.PI * r;
            const pct = Math.min(1, ring.value / ring.max);
            return (
              <g key={i}>
                <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(220,18%,16%)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r={r} fill="none" stroke={ring.color} strokeWidth="8"
                  strokeDasharray={`${circumference * pct} ${circumference}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-1000"
                />
              </g>
            );
          })}
        </svg>
        <div className="ml-4 space-y-2">
          {rings.map((ring, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ background: ring.color }} />
              <span className="text-muted-foreground">{ring.label}:</span>
              <span className="font-mono font-semibold text-foreground">
                {privacyMode ? '•' : ring.value}/{ring.max}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MoodCheckin() {
  const { addDayLog, dayLogs } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const todayLog = dayLogs.find(l => l.date === today);
  const [selected, setSelected] = useState<number | null>(todayLog?.mood ?? null);

  const handleMood = (mood: number) => {
    setSelected(mood);
    addDayLog({
      date: today,
      success: todayLog?.success ?? true,
      mood,
      relapseReason: todayLog?.relapseReason,
      relapseNote: todayLog?.relapseNote,
    });
  };

  return (
    <div className="card-rewire animate-fade-in">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Bạn cảm thấy thế nào?</h3>
      <div className="flex justify-between">
        {MOOD_EMOJIS.map((emoji, i) => (
          <button
            key={i}
            onClick={() => handleMood(i + 1)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              selected === i + 1 ? 'bg-primary/20 scale-110' : 'hover:bg-muted'
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-[10px] text-muted-foreground">{MOOD_LABELS[i]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuoteCard() {
  const { currentStreak } = useApp();
  const quote = getQuoteOfDay(currentStreak);
  return (
    <div className="card-rewire animate-fade-in border-primary/20">
      <div className="flex gap-3">
        <Quote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/90 italic leading-relaxed">{quote}</p>
      </div>
    </div>
  );
}

function StatsRow() {
  const { longestStreak, willpower, pomodoroSessions, privacyMode } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const todayPomodoros = pomodoroSessions.filter(s => s.date === today).length;

  const stats = [
    { icon: Trophy, label: 'Kỷ lục', value: `${longestStreak} ngày`, color: 'text-streak-gold' },
    { icon: Zap, label: 'Willpower', value: willpower, color: 'text-primary' },
    { icon: Flame, label: 'Hôm nay', value: `${todayPomodoros} 🍅`, color: 'text-secondary' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s, i) => (
        <div key={i} className="card-rewire text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
          <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
          <div className="text-lg font-bold font-mono">{privacyMode ? '••' : s.value}</div>
          <div className="text-xs text-muted-foreground">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function ReasonReminder() {
  const { profile } = useApp();
  if (!profile.reason) return null;
  return (
    <div className="card-rewire border-secondary/20 animate-fade-in">
      <div className="text-xs text-muted-foreground mb-1">Lý do của bạn</div>
      <p className="text-sm text-foreground/80 italic">"{profile.reason}"</p>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tổng quan</h1>
      <StreakCounter />
      <StatsRow />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RingProgress />
        <MoodCheckin />
      </div>
      <QuoteCard />
      <ReasonReminder />
    </div>
  );
}
