import { AppProvider, useApp } from '@/lib/AppContext';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import PomodoroTimer from '@/components/PomodoroTimer';
import RecoveryCalendar from '@/components/RecoveryCalendar';
import UrgeSurfing from '@/components/UrgeSurfing';
import Journal from '@/components/Journal';
import Stats from '@/components/Stats';
import Achievements from '@/components/Achievements';
import TimeCapsule from '@/components/TimeCapsule';
import SquadMode from '@/components/SquadMode';
import MindsetMap from '@/components/MindsetMap';
import SettingsPage from '@/components/SettingsPage';
import Onboarding from '@/components/Onboarding';
import AuthPage from '@/components/AuthPage';
import { Brain } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Brain className="w-12 h-12 text-primary animate-pulse" />
      <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
    </div>
  );
}

function AppContent() {
  const { profile, activeModule, dataLoading } = useApp();

  if (dataLoading) return <LoadingScreen />;

  if (!profile.onboardingDone) {
    return <Onboarding />;
  }

  const modules = {
    dashboard: <Dashboard />,
    pomodoro: <PomodoroTimer />,
    calendar: <RecoveryCalendar />,
    urge: <UrgeSurfing />,
    journal: <Journal />,
    stats: <Stats />,
    achievements: <Achievements />,
    timecapsule: <TimeCapsule />,
    squad: <SquadMode />,
    mindmap: <MindsetMap />,
    settings: <SettingsPage />,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-16 p-4 md:p-6 max-w-2xl mx-auto w-full">
        {modules[activeModule]}
      </main>
    </div>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthPage />;

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default function Index() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
