import { useApp } from '@/lib/AppContext';
import { MOOD_EMOJIS, RELAPSE_REASONS } from '@/lib/constants';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { useMemo } from 'react';

export default function Stats() {
  const { dayLogs, pomodoroSessions, journalEntries, currentStreak, longestStreak, willpower, privacyMode } = useApp();

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Pomodoro per day of week
  const pomodoroByDay = useMemo(() => {
    const counts = new Array(7).fill(0);
    pomodoroSessions.forEach(s => {
      const d = new Date(s.date).getDay();
      counts[d]++;
    });
    return counts;
  }, [pomodoroSessions]);
  const maxPomo = Math.max(...pomodoroByDay, 1);

  // Relapse reasons
  const relapseReasons = useMemo(() => {
    const counts: Record<string, number> = {};
    dayLogs.filter(l => !l.success && l.relapseReason).forEach(l => {
      counts[l.relapseReason!] = (counts[l.relapseReason!] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [dayLogs]);

  // Relapse by day of week
  const relapseByDay = useMemo(() => {
    const counts = new Array(7).fill(0);
    dayLogs.filter(l => !l.success).forEach(l => {
      counts[new Date(l.date).getDay()]++;
    });
    return counts;
  }, [dayLogs]);

  // Mood trend (last 30 days)
  const moodTrend = useMemo(() => {
    const last30: { date: string; mood: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const log = dayLogs.find(l => l.date === ds);
      if (log?.mood) last30.push({ date: ds, mood: log.mood });
    }
    return last30;
  }, [dayLogs]);

  // Weekly summary
  const thisWeek = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    const startStr = start.toISOString().split('T')[0];
    const successDays = dayLogs.filter(l => l.date >= startStr && l.success).length;
    const weekPomos = pomodoroSessions.filter(s => s.date >= startStr).length;
    const weekMoods = dayLogs.filter(l => l.date >= startStr && l.mood).map(l => l.mood!);
    const avgMood = weekMoods.length ? (weekMoods.reduce((a, b) => a + b, 0) / weekMoods.length).toFixed(1) : '-';
    return { successDays, weekPomos, avgMood };
  }, [dayLogs, pomodoroSessions]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Thống kê & Insights</h1>

      {/* Weekly summary */}
      <div className="card-rewire animate-fade-in">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">📊 Tóm tắt tuần này</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold font-mono text-primary">{privacyMode ? '•' : thisWeek.successDays}</div>
            <div className="text-xs text-muted-foreground">Ngày thành công</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-secondary">{privacyMode ? '•' : thisWeek.weekPomos}</div>
            <div className="text-xs text-muted-foreground">Pomodoro</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-streak-gold">{privacyMode ? '•' : thisWeek.avgMood}</div>
            <div className="text-xs text-muted-foreground">Mood TB</div>
          </div>
        </div>
      </div>

      {/* Pomodoro bar chart */}
      <div className="card-rewire">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Pomodoro theo thứ
        </h3>
        <div className="flex items-end gap-2 h-32">
          {pomodoroByDay.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-muted-foreground">{privacyMode ? '•' : count}</span>
              <div className="w-full rounded-t bg-primary/70 transition-all" style={{ height: `${(count / maxPomo) * 100}%`, minHeight: '4px' }} />
              <span className="text-[10px] text-muted-foreground">{weekDays[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood trend */}
      {moodTrend.length > 0 && (
        <div className="card-rewire">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Xu hướng tâm trạng (30 ngày)
          </h3>
          <div className="flex items-end gap-1 h-20">
            {moodTrend.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full rounded-t bg-secondary/70 transition-all" style={{ height: `${(m.mood / 5) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>{moodTrend[0]?.date.slice(5)}</span>
            <span>{moodTrend[moodTrend.length - 1]?.date.slice(5)}</span>
          </div>
        </div>
      )}

      {/* Relapse reasons */}
      {relapseReasons.length > 0 && (
        <div className="card-rewire">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> Lý do relapse
          </h3>
          <div className="space-y-2">
            {relapseReasons.map(([reason, count]) => {
              const total = relapseReasons.reduce((a, b) => a + b[1], 0);
              return (
                <div key={reason}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">{reason}</span>
                    <span className="text-muted-foreground">{privacyMode ? '•' : count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-warning rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Relapse by day */}
      {relapseByDay.some(c => c > 0) && (
        <div className="card-rewire">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Relapse theo thứ</h3>
          <div className="flex items-end gap-2 h-20">
            {relapseByDay.map((count, i) => {
              const max = Math.max(...relapseByDay, 1);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-muted-foreground">{privacyMode ? '•' : count}</span>
                  <div className="w-full rounded-t bg-warning/70 transition-all" style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? '4px' : '0' }} />
                  <span className="text-[10px] text-muted-foreground">{weekDays[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
