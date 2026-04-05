import { useApp } from '@/lib/AppContext';
import { getCultivationLevel, getNextCultivationLevel, BADGES, BadgeStats } from '@/lib/constants';
import { Trophy, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

function CultivationCard() {
  const { currentStreak, privacyMode } = useApp();
  const level = getCultivationLevel(currentStreak);
  const nextLevel = getNextCultivationLevel(currentStreak);
  
  const progress = nextLevel 
    ? ((currentStreak - level.minStreak) / (nextLevel.minStreak - level.minStreak)) * 100
    : 100;

  return (
    <div className="card-rewire animate-fade-in">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" /> Cảnh giới tu luyện
      </h3>
      <div className="flex items-center gap-4">
        <div className="text-5xl">{level.emoji}</div>
        <div className="flex-1">
          <div className={`text-lg font-bold ${level.color} ${level.glowClass}`}>
            {level.name}
          </div>
          {nextLevel && (
            <>
              <div className="text-xs text-muted-foreground mt-1">
                Tiếp theo: {nextLevel.emoji} {nextLevel.name} ({privacyMode ? '•' : nextLevel.minStreak} ngày)
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {privacyMode ? '•' : currentStreak}/{nextLevel.minStreak} ngày
              </div>
            </>
          )}
          {!nextLevel && (
            <div className="text-xs text-primary mt-1">🐉 Đã đạt cảnh giới tối cao!</div>
          )}
        </div>
      </div>
    </div>
  );
}

function BadgeGrid() {
  const { currentStreak, longestStreak, pomodoroSessions, journalEntries, urgeLogs, dayLogs } = useApp();

  const stats: BadgeStats = useMemo(() => ({
    currentStreak,
    longestStreak,
    totalPomodoros: pomodoroSessions.length,
    totalJournalEntries: journalEntries.length,
    totalUrgesResisted: urgeLogs.length,
    totalDaysLogged: dayLogs.length,
  }), [currentStreak, longestStreak, pomodoroSessions, journalEntries, urgeLogs, dayLogs]);

  const earned = BADGES.filter(b => b.condition(stats));
  const locked = BADGES.filter(b => !b.condition(stats));

  return (
    <div className="card-rewire animate-fade-in">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4" /> Huy hiệu ({earned.length}/{BADGES.length})
      </h3>
      
      {earned.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
          {earned.map(b => (
            <div key={b.id} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-2xl">{b.emoji}</span>
              <span className="text-[9px] text-center text-foreground/80 leading-tight">{b.name}</span>
            </div>
          ))}
        </div>
      )}

      {locked.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {locked.map(b => (
            <div key={b.id} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 opacity-40">
              <span className="text-2xl grayscale">🔒</span>
              <span className="text-[9px] text-center text-muted-foreground leading-tight">{b.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Achievements() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Thành tựu</h1>
      <CultivationCard />
      <BadgeGrid />
    </div>
  );
}
