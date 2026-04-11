import { useApp, Module } from '@/lib/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, Timer, CalendarDays, ShieldAlert, 
  BookOpen, BarChart3, Settings, Brain, Trophy, Mail, Users, Map, LogOut
} from 'lucide-react';
import { getAvatarForStreak, AVATAR_CORRUPTED } from '@/lib/avatars';
import { getCultivationLevel } from '@/lib/constants';

const NAV_ITEMS: { id: Module; icon: React.ElementType; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { id: 'pomodoro', icon: Timer, label: 'Pomodoro' },
  { id: 'calendar', icon: CalendarDays, label: 'Lịch cai' },
  { id: 'urge', icon: ShieldAlert, label: 'Khẩn cấp' },
  { id: 'journal', icon: BookOpen, label: 'Nhật ký' },
  { id: 'stats', icon: BarChart3, label: 'Thống kê' },
  { id: 'achievements', icon: Trophy, label: 'Thành tựu' },
  { id: 'timecapsule', icon: Mail, label: 'Thư tương lai' },
  { id: 'squad', icon: Users, label: 'Đồng hành' },
  { id: 'mindmap', icon: Map, label: 'Bản đồ tâm trí' },
  { id: 'settings', icon: Settings, label: 'Cài đặt' },
];

export default function Sidebar() {
  const { activeModule, setActiveModule, profile, privacyMode, currentStreak, dayLogs } = useApp();
  const { signOut } = useAuth();

  // Check relapse for avatar
  const isCorrupted = dayLogs.length > 0 && (() => {
    const sorted = [...dayLogs].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0] && !sorted[0].success;
  })();
  const avatarSrc = isCorrupted ? AVATAR_CORRUPTED : getAvatarForStreak(currentStreak);

  return (
    <aside className="sidebar-nav fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 group">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <Brain className="w-8 h-8 text-primary shrink-0" />
        <span className="text-lg font-bold text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ReWire
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveModule(id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
              activeModule === id
                ? 'bg-sidebar-accent text-primary'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {label}
            </span>
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={avatarSrc} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0 border border-primary/30" width={32} height={32} />
          <span className="text-sm text-sidebar-foreground/80 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {privacyMode ? '••••••' : profile.name || 'Người dùng'}
          </span>
        </div>
      </div>
    </aside>
  );
}
