import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { RELAPSE_REASONS, MILESTONES } from '@/lib/constants';
import { ChevronLeft, ChevronRight, Check, X, Trophy } from 'lucide-react';

export default function RecoveryCalendar() {
  const { dayLogs, addDayLog, currentStreak, longestStreak, privacyMode } = useApp();
  const [viewDate, setViewDate] = useState(new Date());
  const [showRelapse, setShowRelapse] = useState(false);
  const [relapseReason, setRelapseReason] = useState('');
  const [relapseNote, setRelapseNote] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getDayColor = (dateStr: string) => {
    const log = dayLogs.find(l => l.date === dateStr);
    if (!log) return 'bg-muted/30';
    return log.success ? 'bg-primary/60' : 'bg-warning/60';
  };

  const handleCheckIn = (success: boolean) => {
    if (success) {
      addDayLog({ date: today, success: true });
    } else {
      setSelectedDate(today);
      setShowRelapse(true);
    }
  };

  const submitRelapse = () => {
    addDayLog({ date: selectedDate, success: false, relapseReason, relapseNote });
    setShowRelapse(false);
    setRelapseReason('');
    setRelapseNote('');
  };

  const todayLog = dayLogs.find(l => l.date === today);

  // Streak history
  const streaks: { start: string; length: number }[] = [];
  const sorted = [...dayLogs].sort((a, b) => a.date.localeCompare(b.date));
  let streakStart = '';
  let streakLen = 0;
  for (const log of sorted) {
    if (log.success) {
      if (!streakStart) streakStart = log.date;
      streakLen++;
    } else {
      if (streakLen > 0) streaks.push({ start: streakStart, length: streakLen });
      streakStart = '';
      streakLen = 0;
    }
  }
  if (streakLen > 0) streaks.push({ start: streakStart, length: streakLen });
  streaks.sort((a, b) => b.length - a.length);

  // Heatmap (last 365 days)
  const heatmapDays: { date: string; level: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const log = dayLogs.find(l => l.date === ds);
    heatmapDays.push({ date: ds, level: log ? (log.success ? 2 : 1) : 0 });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Lịch cai</h1>

      {/* Today Check-in */}
      {!todayLog && (
        <div className="card-rewire animate-fade-in">
          <p className="text-sm text-muted-foreground mb-3">Hôm nay thế nào?</p>
          <div className="flex gap-3">
            <button onClick={() => handleCheckIn(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-all">
              <Check className="w-5 h-5" /> Thành công
            </button>
            <button onClick={() => handleCheckIn(false)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-warning/20 hover:bg-warning/30 text-warning transition-all">
              <X className="w-5 h-5" /> Relapse
            </button>
          </div>
        </div>
      )}

      {/* Relapse modal */}
      {showRelapse && (
        <div className="card-rewire border-warning/30 animate-scale-in space-y-3">
          <p className="text-sm text-foreground">Bạn không phải bắt đầu lại từ đầu. Bạn bắt đầu lại với kinh nghiệm. 💛</p>
          <div className="flex flex-wrap gap-2">
            {RELAPSE_REASONS.map(r => (
              <button key={r} onClick={() => setRelapseReason(r)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  relapseReason === r ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
                }`}>{r}</button>
            ))}
          </div>
          <textarea
            placeholder="Ghi chú (tùy chọn)..."
            value={relapseNote}
            onChange={e => setRelapseNote(e.target.value)}
            className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20"
          />
          <button onClick={submitRelapse} className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            Lưu & Bắt đầu lại
          </button>
        </div>
      )}

      {/* Calendar */}
      <div className="card-rewire">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-1 rounded hover:bg-muted">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">{monthNames[month]} {year}</span>
          <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-1 rounded hover:bg-muted">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
            <div key={d} className="text-[10px] text-muted-foreground py-1">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = getDateStr(day);
            const isToday = dateStr === today;
            return (
              <div key={day}
                className={`aspect-square flex items-center justify-center rounded-md text-xs font-mono transition-all
                  ${getDayColor(dateStr)} ${isToday ? 'ring-1 ring-primary' : ''}`}
              >
                {privacyMode ? '•' : day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap */}
      <div className="card-rewire">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Heatmap 365 ngày</h3>
        <div className="flex flex-wrap gap-[2px]">
          {heatmapDays.map((d, i) => (
            <div key={i} title={d.date}
              className={`w-2.5 h-2.5 rounded-sm ${
                d.level === 2 ? 'bg-primary' : d.level === 1 ? 'bg-warning/70' : 'bg-muted/40'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-muted/40" /> Chưa có</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary" /> Thành công</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-warning/70" /> Relapse</span>
        </div>
      </div>

      {/* Streak records */}
      {streaks.length > 0 && (
        <div className="card-rewire">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-streak-gold" /> Kỷ lục cá nhân
          </h3>
          <div className="space-y-1">
            {streaks.slice(0, 5).map((s, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{s.start}</span>
                <span className="font-mono font-semibold text-foreground">{s.length} ngày</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
