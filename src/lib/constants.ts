export const QUOTES = {
  early: [
    "Hành trình vạn dặm bắt đầu từ một bước chân.",
    "Bạn không cần phải hoàn hảo, bạn chỉ cần bắt đầu.",
    "Mỗi ngày bạn chọn bản thân mình, bạn đang chiến thắng.",
    "Sự thay đổi nhỏ nhất hôm nay có thể tạo ra cuộc đời khác.",
    "Dũng cảm không phải là không sợ — mà là vẫn tiến bước dù sợ.",
    "Bạn mạnh hơn bạn nghĩ, và bạn đang chứng minh điều đó.",
    "Đừng đếm ngày — hãy làm cho mỗi ngày đáng đếm.",
    "Cơ thể bạn đang hồi phục. Tâm trí bạn đang mạnh lên.",
    "Hôm nay bạn chọn tự do. Đó là đủ.",
    "Ngay cả bão cũng sẽ tan. Hãy kiên nhẫn với chính mình.",
    "Con đường phía trước sáng hơn bạn tưởng.",
    "Bạn xứng đáng được tự do khỏi những gì làm tổn thương mình.",
    "Mỗi giây bạn kiên trì là một chiến thắng nhỏ.",
  ],
  mid: [
    "Kỷ luật là cầu nối giữa mục tiêu và thành tựu.",
    "Bạn không phải là quá khứ của mình. Bạn là sự lựa chọn hôm nay.",
    "Sức mạnh ý chí như cơ bắp — càng tập càng khỏe.",
    "Những ngày khó khăn nhất tạo ra phiên bản mạnh mẽ nhất của bạn.",
    "Thói quen tốt không phải là giới hạn — đó là tự do.",
    "Bạn đang xây dựng lại bộ não của mình, từng ngày một.",
    "Sự kiên trì lặng lẽ mạnh hơn mọi lời nói.",
    "Không ai thấy cuộc chiến bên trong bạn — nhưng bạn biết mình đang thắng.",
    "Bạn đã đi xa hơn nhiều người dám bắt đầu.",
    "Mỗi cám dỗ bạn vượt qua là một lần bạn chọn chính mình.",
    "Hãy tự hào. Bạn đang làm điều mà hầu hết người khác sợ bắt đầu.",
    "Tự do thực sự bắt đầu khi bạn kiểm soát được bản năng.",
  ],
  long: [
    "Bạn không còn là người cũ. Bạn đã tiến hóa.",
    "Sự tự chủ là siêu năng lực mạnh nhất.",
    "Bạn đã chứng minh rằng mình có thể làm những điều khó.",
    "Tâm trí bạn giờ sáng suốt hơn, mạnh mẽ hơn, tự do hơn.",
    "Bạn đã phá vỡ xiềng xích. Bây giờ hãy bay.",
    "Ý chí sắt đá không đến từ một ngày — nó đến từ hàng trăm ngày bạn đã kiên trì.",
    "Bạn là bằng chứng sống rằng con người có thể thay đổi.",
    "Tự do khỏi nghiện là món quà bạn tặng cho tương lai mình.",
    "Nhìn lại hành trình — bạn đã đi rất xa.",
    "Bạn không chỉ cai nghiện — bạn đang xây dựng một con người mới.",
  ],
};

export function getQuoteOfDay(streak: number): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  let pool: string[];
  if (streak <= 7) pool = QUOTES.early;
  else if (streak <= 30) pool = QUOTES.mid;
  else pool = QUOTES.long;
  return pool[dayOfYear % pool.length];
}

export const REFLECTION_PROMPTS = [
  "Điều gì đã giúp bạn mạnh mẽ hôm nay?",
  "Bạn đang chạy trốn điều gì?",
  "Khi nào bạn cảm thấy dễ bị cám dỗ nhất?",
  "Điều gì khiến bạn tự hào nhất tuần này?",
  "Bạn muốn phiên bản tương lai của mình là ai?",
  "Nếu bạn có thể nói với bản thân 1 tháng trước, bạn sẽ nói gì?",
  "Hôm nay bạn đã chăm sóc bản thân như thế nào?",
  "Cảm xúc nào xuất hiện nhiều nhất hôm nay?",
  "Bạn biết ơn điều gì hôm nay?",
  "Điều gì đang khiến bạn lo lắng?",
];

export function getDailyPrompt(): string {
  const day = Math.floor(Date.now() / 86400000);
  return REFLECTION_PROMPTS[day % REFLECTION_PROMPTS.length];
}

export const MOOD_EMOJIS = ['😣', '😔', '😐', '🙂', '😊'];
export const MOOD_LABELS = ['Rất tệ', 'Buồn', 'Bình thường', 'Tốt', 'Tuyệt vời'];

export const RELAPSE_REASONS = ['Stress', 'Buồn chán', 'Cô đơn', 'Thói quen cũ', 'Mất ngủ', 'Xem mạng xã hội', 'Khác'];

export const DISTRACTION_ACTIVITIES = [
  'Hít đất 20 cái', 'Đọc sách 10 phút', 'Đi dạo 15 phút', 'Nghe nhạc yêu thích',
  'Thiền 5 phút', 'Uống một ly nước lạnh', 'Gọi điện cho bạn bè', 'Viết nhật ký',
  'Tắm nước lạnh', 'Plank 1 phút', 'Vẽ hoặc tô màu', 'Nấu ăn gì đó',
  'Dọn dẹp phòng', 'Xem video hài', 'Học từ vựng mới', 'Chơi nhạc cụ',
];

export const DEFAULT_POMODORO_TAGS = ['Toán', 'Anh văn', 'Code', 'Đọc sách', 'Nghiên cứu', 'Viết', 'Khác'];
export const POMODORO_TAGS = DEFAULT_POMODORO_TAGS;

export const MILESTONES = [3, 7, 14, 21, 30, 60, 90, 180, 365];

// Cultivation levels (Tu Tiên system)
export interface CultivationLevel {
  name: string;
  emoji: string;
  minStreak: number;
  color: string; // tailwind class
  glowClass: string;
}

export const CULTIVATION_LEVELS: CultivationLevel[] = [
  { name: 'Phàm Nhân', emoji: '🧑', minStreak: 0, color: 'text-muted-foreground', glowClass: '' },
  { name: 'Luyện Khí', emoji: '💨', minStreak: 7, color: 'text-primary', glowClass: 'glow-mint' },
  { name: 'Trúc Cơ', emoji: '🏗️', minStreak: 14, color: 'text-primary', glowClass: 'glow-mint' },
  { name: 'Kim Đan', emoji: '🔮', minStreak: 30, color: 'text-streak-gold', glowClass: 'glow-gold' },
  { name: 'Nguyên Anh', emoji: '👶✨', minStreak: 60, color: 'text-secondary', glowClass: 'glow-lavender' },
  { name: 'Hóa Thần', emoji: '🌟', minStreak: 90, color: 'text-secondary', glowClass: 'glow-lavender' },
  { name: 'Luyện Hư', emoji: '🌌', minStreak: 180, color: 'text-streak-gold', glowClass: 'glow-gold' },
  { name: 'Đại Thừa', emoji: '🐉', minStreak: 365, color: 'text-streak-gold', glowClass: 'glow-gold' },
];

export function getCultivationLevel(streak: number): CultivationLevel {
  return [...CULTIVATION_LEVELS].reverse().find(l => streak >= l.minStreak) || CULTIVATION_LEVELS[0];
}

export function getNextCultivationLevel(streak: number): CultivationLevel | null {
  const next = CULTIVATION_LEVELS.find(l => l.minStreak > streak);
  return next || null;
}

// Achievement badges
export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  condition: (stats: BadgeStats) => boolean;
}

export interface BadgeStats {
  currentStreak: number;
  longestStreak: number;
  totalPomodoros: number;
  totalJournalEntries: number;
  totalUrgesResisted: number;
  totalDaysLogged: number;
}

export const BADGES: Badge[] = [
  { id: 'first_step', name: 'Bước đầu tiên', emoji: '👣', description: 'Hoàn thành ngày đầu tiên', condition: s => s.currentStreak >= 1 },
  { id: 'week_warrior', name: 'Chiến binh 7 ngày', emoji: '⚔️', description: 'Đạt streak 7 ngày', condition: s => s.longestStreak >= 7 },
  { id: 'two_weeks', name: 'Kiên định', emoji: '🛡️', description: 'Đạt streak 14 ngày', condition: s => s.longestStreak >= 14 },
  { id: 'monthly_master', name: 'Bậc thầy tháng', emoji: '👑', description: 'Đạt streak 30 ngày', condition: s => s.longestStreak >= 30 },
  { id: 'two_months', name: 'Ý chí sắt đá', emoji: '⚡', description: 'Đạt streak 60 ngày', condition: s => s.longestStreak >= 60 },
  { id: 'legendary', name: 'Huyền thoại', emoji: '🏆', description: 'Đạt streak 90 ngày', condition: s => s.longestStreak >= 90 },
  { id: 'pomodoro_5', name: 'Nhập môn tu luyện', emoji: '📿', description: 'Hoàn thành 5 pomodoro', condition: s => s.totalPomodoros >= 5 },
  { id: 'pomodoro_10', name: 'Tập trung cao', emoji: '🍅', description: 'Hoàn thành 10 pomodoro', condition: s => s.totalPomodoros >= 10 },
  { id: 'pomodoro_25', name: 'Khổ luyện', emoji: '⚒️', description: 'Hoàn thành 25 pomodoro', condition: s => s.totalPomodoros >= 25 },
  { id: 'pomodoro_50', name: 'Máy học bài', emoji: '🔥', description: 'Hoàn thành 50 pomodoro', condition: s => s.totalPomodoros >= 50 },
  { id: 'pomodoro_100', name: 'Siêu nhân học', emoji: '💎', description: 'Hoàn thành 100 pomodoro', condition: s => s.totalPomodoros >= 100 },
  { id: 'pomodoro_200', name: 'Đại sư tu luyện', emoji: '🏛️', description: 'Hoàn thành 200 pomodoro', condition: s => s.totalPomodoros >= 200 },
  { id: 'pomodoro_500', name: 'Tiên nhân học đạo', emoji: '🐲', description: 'Hoàn thành 500 pomodoro', condition: s => s.totalPomodoros >= 500 },
  { id: 'journal_5', name: 'Nhà văn', emoji: '✍️', description: 'Viết 5 nhật ký', condition: s => s.totalJournalEntries >= 5 },
  { id: 'journal_20', name: 'Triết gia', emoji: '📖', description: 'Viết 20 nhật ký', condition: s => s.totalJournalEntries >= 20 },
  { id: 'urge_5', name: 'Lướt sóng', emoji: '🏄', description: 'Vượt qua 5 cơn thôi thúc', condition: s => s.totalUrgesResisted >= 5 },
  { id: 'urge_20', name: 'Bất khả chiến bại', emoji: '🧘', description: 'Vượt qua 20 cơn thôi thúc', condition: s => s.totalUrgesResisted >= 20 },
];
