import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Brain, ArrowRight } from 'lucide-react';

const AVATARS = ['🧠', '🦁', '🐺', '🦅', '🔥', '💎', '🌿', '⚡', '🎯', '🏔️'];

export default function Onboarding() {
  const { setProfile, profile } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧠');
  const [reason, setReason] = useState('');
  const [target, setTarget] = useState(90);

  const finish = () => {
    setProfile({
      ...profile,
      name,
      avatar,
      reason,
      targetDays: target,
      startDate: new Date().toISOString().split('T')[0],
      onboardingDone: true,
    });
  };

  const steps = [
    // Step 0: Welcome
    <div key={0} className="text-center animate-fade-in">
      <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-2">ReWire</h1>
      <p className="text-lg text-primary font-medium mb-2">Break Free, Stay Focused</p>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
        Chào mừng bạn. Đây là công cụ giúp bạn xây dựng lại bản thân — từng ngày một, không phán xét, không xấu hổ.
      </p>
      <div className="space-y-3 max-w-xs mx-auto">
        <input type="text" placeholder="Tên của bạn" value={name} onChange={e => setName(e.target.value)}
          className="w-full bg-muted rounded-lg px-4 py-3 text-center text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
        <div className="flex flex-wrap justify-center gap-2">
          {AVATARS.map(a => (
            <button key={a} onClick={() => setAvatar(a)}
              className={`text-2xl p-2 rounded-lg transition-all ${avatar === a ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-muted'}`}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 1: Reason
    <div key={1} className="text-center animate-fade-in">
      <h2 className="text-2xl font-bold mb-2">Tại sao bạn ở đây?</h2>
      <p className="text-sm text-muted-foreground mb-6">Viết lý do của bạn. Nó sẽ nhắc nhở bạn mỗi ngày.</p>
      <textarea value={reason} onChange={e => setReason(e.target.value)}
        placeholder="Tôi muốn trở thành phiên bản tốt hơn của chính mình..."
        className="w-full max-w-md mx-auto bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-32 focus:ring-1 focus:ring-primary" />
    </div>,

    // Step 2: Target
    <div key={2} className="text-center animate-fade-in">
      <h2 className="text-2xl font-bold mb-2">Đặt mục tiêu</h2>
      <p className="text-sm text-muted-foreground mb-6">Bạn muốn kiên trì bao lâu?</p>
      <div className="flex flex-wrap justify-center gap-3">
        {[30, 60, 90, 180, 365].map(d => (
          <button key={d} onClick={() => setTarget(d)}
            className={`px-6 py-4 rounded-xl text-lg font-mono font-bold transition-all ${
              target === d ? 'bg-primary text-primary-foreground scale-105' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}>{d}<span className="text-xs font-sans font-normal ml-1">ngày</span></button>
        ))}
      </div>
    </div>,

    // Step 3: Start
    <div key={3} className="text-center animate-fade-in">
      <div className="text-6xl mb-4">🚀</div>
      <h2 className="text-2xl font-bold mb-2">Sẵn sàng, {name || 'bạn'}!</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        Hành trình {target} ngày bắt đầu ngay bây giờ. Mỗi ngày bạn kiên trì là một chiến thắng. Chúng tôi sẽ ở đây cùng bạn.
      </p>
    </div>,
  ];

  const canNext = step === 0 ? name.trim().length > 0 : step === 1 ? reason.trim().length > 0 : true;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-12 h-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      <div className="w-full max-w-lg">{steps[step]}</div>

      <div className="mt-8">
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 transition-all">
            Tiếp theo <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={finish}
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-lg transition-all pulse-glow">
            Bắt đầu hành trình 🌱
          </button>
        )}
      </div>
    </div>
  );
}
