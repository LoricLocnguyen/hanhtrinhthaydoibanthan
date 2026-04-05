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

export const POMODORO_TAGS = ['Toán', 'Anh văn', 'Code', 'Đọc sách', 'Nghiên cứu', 'Viết', 'Khác'];

export const MILESTONES = [3, 7, 14, 21, 30, 60, 90, 180, 365];
