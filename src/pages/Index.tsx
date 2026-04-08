import { AppProvider, useApp } from '@/lib/AppContext';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import PomodoroTimer from '@/components/PomodoroTimer';
import RecoveryCalendar from '@/components/RecoveryCalendar';
import UrgeSurfing from '@/components/UrgeSurfing';
import Journal from '@/components/Journal';
import Stats from '@/components/Stats';
import Achievements from '@/components/Achievements';
import TimeCapsule from '@/components/TimeCapsule';
import SettingsPage from '@/components/SettingsPage';
import Onboarding from '@/components/Onboarding';

function AppContent() {
  const { profile, activeModule } = useApp();

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

export default function Index() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
