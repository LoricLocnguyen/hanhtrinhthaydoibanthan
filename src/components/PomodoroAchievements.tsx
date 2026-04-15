import { useMemo, useState } from 'react';
import { useApp, PomodoroSession } from '@/lib/AppContext';
import { Trophy } from 'lucide-react';

type Tier = 'all' | 'luyen_khi' | 'truc_co' | 'kim_dan' | 'nguyen_anh';

interface PomoBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier: Exclude<Tier, 'all'>;
  condition: (ctx: PomoStats) => boolean;
}

interface PomoStats {
  totalPomodoros: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  uniqueTags: number;
  maxInOneDay: number;
  uniqueTagsInOneDay: number;
  consecutiveDays: number;
  sessions: PomodoroSession[];
}

const TIER_META: Record<Exclude<Tier, 'all'>, { label: string; color: string; borderColor: string; bgColor: string; dotColor: string }> = {
  luyen_khi: { label: 'Luyện Khí', color: 'text-blue-400', borderColor: 'border-blue-300/40', bgColor: 'bg-blue-50 dark:bg-blue-950/20', dotColor: 'bg-blue-400' },
  truc_co: { label: 'Trúc Cơ', color: 'text-green-400', borderColor: 'border-green-300/40', bgColor: 'bg-green-50 dark:bg-green-950/20', dotColor: 'bg-green-400' },
  kim_dan: { label: 'Kim Đan', color: 'text-yellow-400', borderColor: 'border-yellow-300/40', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20', dotColor: 'bg-yellow-400' },
  nguyen_anh: { label: 'Nguyên Anh', color: 'text-red-400', borderColor: 'border-red-300/40', bgColor: 'bg-red-50 dark:bg-red-950/20', dotColor: 'bg-red-400' },
};

const POMO_BADGES: PomoBadge[] = [
  // === Luyện Khí ===
  { id: 'pk_first', name: 'Bước Vào Đạo', icon: '🚪', description: 'Hoàn thành Pomodoro đầu tiên', tier: 'luyen_khi', condition: s => s.totalPomodoros >= 1 },
  { id: 'pk_5day', name: 'Nhập Định Sơ Cấp', icon: '🧘', description: 'Hoàn thành 5 Pomodoro trong 1 ngày', tier: 'luyen_khi', condition: s => s.maxInOneDay >= 5 },
  { id: 'pk_3streak', name: 'Căn Cơ Kiên Cố', icon: '💪', description: 'Học liên tục 3 ngày không bỏ lỡ', tier: 'luyen_khi', condition: s => s.consecutiveDays >= 3 },
  { id: 'pk_10h', name: 'Khí Hải Khai Mở', icon: '⏳', description: 'Tích lũy tổng 10 giờ tập trung', tier: 'luyen_khi', condition: s => s.totalMinutes >= 600 },
  { id: 'pk_focus1', name: 'Chuyên Tâm Nhất Chí', icon: '🎯', description: 'Hoàn thành 10 Pomodoro không gián đoạn', tier: 'luyen_khi', condition: s => s.totalPomodoros >= 10 },
  { id: 'pk_night', name: 'Luyện Công Về Đêm', icon: '🌙', description: 'Tích lũy 20 Pomodoro', tier: 'luyen_khi', condition: s => s.totalPomodoros >= 20 },
  { id: 'pk_morning', name: 'Tinh Thần Buổi Sáng', icon: '🌅', description: 'Tích lũy 30 Pomodoro', tier: 'luyen_khi', condition: s => s.totalPomodoros >= 30 },
  { id: 'pk_7combo', name: 'Thất Thức Phép', icon: '📿', description: 'Hoàn thành 7 Pomodoro liên tiếp trong 1 ngày', tier: 'luyen_khi', condition: s => s.maxInOneDay >= 7 },
  { id: 'pk_50total', name: 'Xây Nền Tu Đạo', icon: '🏗️', description: 'Tích lũy 50 Pomodoro tổng cộng', tier: 'luyen_khi', condition: s => s.totalPomodoros >= 50 },

  // === Trúc Cơ ===
  { id: 'tc_7streak', name: 'Thất Nhật Trường Trai', icon: '📅', description: 'Duy trì streak 7 ngày liên tục', tier: 'truc_co', condition: s => s.consecutiveDays >= 7 },
  { id: 'tc_5tags', name: 'Bác Lãm Quần Thư', icon: '📚', description: 'Học 5 chủ đề khác nhau', tier: 'truc_co', condition: s => s.uniqueTags >= 5 },
  { id: 'tc_3in1h', name: 'Điện Quang Thạch Hỏa', icon: '⚡', description: 'Hoàn thành 3+ Pomodoro trong 1 ngày (3 lần)', tier: 'truc_co', condition: s => s.maxInOneDay >= 3 && s.totalPomodoros >= 30 },
  { id: 'tc_calm', name: 'Tâm Như Chỉ Thủy', icon: '🌊', description: 'Tích lũy 75 Pomodoro', tier: 'truc_co', condition: s => s.totalPomodoros >= 75 },
  { id: 'tc_10tasks', name: 'Nhất Tâm Bất Loạn', icon: '🎯', description: 'Tích lũy 100 Pomodoro', tier: 'truc_co', condition: s => s.totalPomodoros >= 100 },
  { id: 'tc_100h', name: 'Công Phu Trăm Giờ', icon: '⏰', description: 'Tích lũy tổng 100 giờ tập trung', tier: 'truc_co', condition: s => s.totalMinutes >= 6000 },
  { id: 'tc_14streak', name: 'Luyện Hóa Không Tất', icon: '🔥', description: 'Duy trì streak 14 ngày liên tục', tier: 'truc_co', condition: s => s.consecutiveDays >= 14 },

  // === Kim Đan ===
  { id: 'kd_200', name: 'Kim Đan Ngưng Tụ', icon: '🏆', description: 'Tích lũy 200 Pomodoro tổng cộng', tier: 'kim_dan', condition: s => s.totalPomodoros >= 200 },
  { id: 'kd_balance', name: 'Âm Dương Điều Hòa', icon: '☯️', description: 'Tích lũy 250 giờ tập trung', tier: 'kim_dan', condition: s => s.totalMinutes >= 15000 },
  { id: 'kd_deep', name: 'Thiền Định Tịch Diệt', icon: '🧘‍♂️', description: 'Hoàn thành 10 Pomodoro trong 1 ngày', tier: 'kim_dan', condition: s => s.maxInOneDay >= 10 },
  { id: 'kd_30streak', name: 'Hằng Tâm Bất Biến', icon: '📅', description: 'Duy trì streak 30 ngày liên tục', tier: 'kim_dan', condition: s => s.consecutiveDays >= 30 },
  { id: 'kd_project', name: 'Thiên Tài Nhật Phượng', icon: '🦅', description: 'Tích lũy 300 Pomodoro', tier: 'kim_dan', condition: s => s.totalPomodoros >= 300 },
  { id: 'kd_notes', name: 'Linh Quang Loé Sáng', icon: '💡', description: 'Tích lũy 400 giờ tập trung', tier: 'kim_dan', condition: s => s.totalMinutes >= 24000 },
  { id: 'kd_5in1day', name: 'Ngũ Hành Dung Hợp', icon: '🌈', description: 'Học 5 môn khác nhau trong 1 ngày', tier: 'kim_dan', condition: s => s.uniqueTagsInOneDay >= 5 },

  // === Nguyên Anh ===
  { id: 'na_500', name: 'Nguyên Anh Xuất Thế', icon: '🌟', description: 'Tích lũy 500 Pomodoro tổng cộng', tier: 'nguyen_anh', condition: s => s.totalPomodoros >= 500 },
  { id: 'na_100streak', name: 'Nhật Nguyệt Đồng Huy', icon: '🌓', description: 'Streak 100 ngày liên tục', tier: 'nguyen_anh', condition: s => s.consecutiveDays >= 100 },
  { id: 'na_500h', name: 'Tinh Hà Vạn Lý', icon: '🌌', description: 'Tích lũy tổng 500 giờ tập trung', tier: 'nguyen_anh', condition: s => s.totalMinutes >= 30000 },
  { id: 'na_20day', name: 'Vô Địch Thiên Hạ', icon: '👑', description: 'Hoàn thành 20 Pomodoro trong 1 ngày', tier: 'nguyen_anh', condition: s => s.maxInOneDay >= 20 },
  { id: 'na_natural', name: 'Đạo Pháp Tự Nhiên', icon: '🍃', description: 'Tích lũy 750 Pomodoro', tier: 'nguyen_anh', condition: s => s.totalPomodoros >= 750 },
  { id: 'na_1000', name: 'Hóa Long Đăng Tiên', icon: '🐉', description: 'Hoàn thành 1000 Pomodoro tổng cộng', tier: 'nguyen_anh', condition: s => s.totalPomodoros >= 1000 },
  { id: 'na_all', name: 'Siêu Phàm Nhập Thánh', icon: '✨', description: 'Đạt tất cả thành tựu còn lại', tier: 'nguyen_anh', condition: (s) => {
    // Check all other badges except this one
    return POMO_BADGES.filter(b => b.id !== 'na_all').every(b => b.condition(s));
  }},
];

function computeStats(sessions: PomodoroSession[], currentStreak: number, longestStreak: number): PomoStats {
  const totalMinutes = sessions.reduce((s, p) => s + p.duration, 0);
  const uniqueTags = new Set(sessions.map(s => s.tag)).size;

  const byDate: Record<string, PomodoroSession[]> = {};
  sessions.forEach(s => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });

  const maxInOneDay = Math.max(0, ...Object.values(byDate).map(arr => arr.length));
  const uniqueTagsInOneDay = Math.max(0, ...Object.values(byDate).map(arr => new Set(arr.map(s => s.tag)).size));

  // Consecutive days with at least 1 pomodoro
  const dates = Object.keys(byDate).sort();
  let consecutiveDays = 0;
  let tempConsec = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      tempConsec++;
      consecutiveDays = Math.max(consecutiveDays, tempConsec);
    } else {
      tempConsec = 1;
    }
  }
  if (dates.length === 1) consecutiveDays = 1;
  consecutiveDays = Math.max(consecutiveDays, currentStreak);

  return {
    totalPomodoros: sessions.length,
    totalMinutes,
    currentStreak,
    longestStreak,
    uniqueTags,
    maxInOneDay,
    uniqueTagsInOneDay,
    consecutiveDays,
    sessions,
  };
}

export default function PomodoroAchievements() {
  const { pomodoroSessions, currentStreak, longestStreak } = useApp();
  const [filter, setFilter] = useState<Tier>('all');

  const stats = useMemo(() => computeStats(pomodoroSessions, currentStreak, longestStreak), [pomodoroSessions, currentStreak, longestStreak]);

  const badges = filter === 'all' ? POMO_BADGES : POMO_BADGES.filter(b => b.tier === filter);
  const totalEarned = POMO_BADGES.filter(b => b.condition(stats)).length;

  const filters: { key: Tier; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'luyen_khi', label: 'Luyện Khí' },
    { key: 'truc_co', label: 'Trúc Cơ' },
    { key: 'kim_dan', label: 'Kim Đan' },
    { key: 'nguyen_anh', label: 'Nguyên Anh' },
  ];

  return (
    <div className="card-rewire animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4" /> Thành tựu tu luyện Pomodoro
        </h3>
        <span className="text-xs text-muted-foreground">{totalEarned} / {POMO_BADGES.length} đã mở khóa</span>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(f => {
          const meta = f.key === 'all' ? null : TIER_META[f.key];
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === f.key
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-muted/50 border-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {meta && <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} />}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {badges.map(badge => {
          const earned = badge.condition(stats);
          const meta = TIER_META[badge.tier];
          return (
            <div
              key={badge.id}
              className={`relative p-4 rounded-xl border transition-all ${
                earned
                  ? `${meta.bgColor} ${meta.borderColor}`
                  : 'bg-muted/20 border-muted/30 opacity-60'
              }`}
            >
              {/* Tier tag */}
              <span className={`absolute top-2 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                earned ? `${meta.color} ${meta.borderColor}` : 'text-muted-foreground border-muted/30'
              }`}>
                {meta.label}
              </span>

              <div className="mt-5 flex flex-col items-start gap-1">
                <span className={`text-2xl ${earned ? '' : 'grayscale opacity-50'}`}>
                  {earned ? badge.icon : '🔒'}
                </span>
                <span className={`text-sm font-bold leading-tight ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {badge.name}
                </span>
                <span className="text-[11px] text-muted-foreground leading-snug">
                  {badge.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
