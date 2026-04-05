import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/AppContext';
import { DISTRACTION_ACTIVITIES } from '@/lib/constants';
import { ShieldAlert, Wind, Dices, Phone, PenLine } from 'lucide-react';

function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<'in' | 'hold1' | 'out' | 'hold2'>('in');
  const [count, setCount] = useState(4);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          setPhase(p => {
            if (p === 'in') return 'hold1';
            if (p === 'hold1') return 'out';
            if (p === 'out') return 'hold2';
            return 'in';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  const phaseLabel = { in: 'Hít vào', hold1: 'Giữ', out: 'Thở ra', hold2: 'Giữ' };
  const scale = phase === 'in' || phase === 'hold1' ? 'scale-100' : 'scale-75';

  return (
    <div className="card-rewire text-center">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center justify-center gap-2">
        <Wind className="w-4 h-4" /> Thở hộp (Box Breathing)
      </h3>
      {active ? (
        <div className="flex flex-col items-center gap-4">
          <div className={`w-32 h-32 rounded-full bg-secondary/30 border-2 border-secondary flex items-center justify-center transition-transform duration-1000 ${scale}`}>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-secondary">{count}</div>
              <div className="text-xs text-muted-foreground">{phaseLabel[phase]}</div>
            </div>
          </div>
          <button onClick={() => setActive(false)} className="text-xs text-muted-foreground hover:text-foreground">
            Dừng
          </button>
        </div>
      ) : (
        <button onClick={() => setActive(true)} className="px-6 py-3 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-all text-sm">
          Bắt đầu thở
        </button>
      )}
    </div>
  );
}

function UrgeTimer() {
  const { addUrgeLog } = useApp();
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(900); // 15 min
  const [survived, setSurvived] = useState(false);

  useEffect(() => {
    if (!active || seconds <= 0) return;
    const i = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setSurvived(true);
          setActive(false);
          addUrgeLog({
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            intensity: 5,
            duration: 900,
            journalNote: '',
            timestamp: Date.now(),
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [active, seconds, addUrgeLog]);

  const reset = () => { setActive(false); setSeconds(900); setSurvived(false); };

  return (
    <div className="card-rewire text-center">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-primary" /> Urge Timer
      </h3>
      {survived ? (
        <div className="animate-scale-in">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-primary font-semibold">Bạn đã vượt qua!</p>
          <p className="text-xs text-muted-foreground mt-1">Cơn thôi thúc đã qua. Bạn mạnh hơn bạn nghĩ.</p>
          <button onClick={reset} className="mt-3 text-xs text-muted-foreground hover:text-foreground">Đóng</button>
        </div>
      ) : active ? (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Cơn thôi thúc sẽ qua trong...</p>
          <div className="text-5xl font-mono font-bold text-primary glow-mint">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </div>
          <div className="breathing-circle w-20 h-20 mx-auto mt-4 rounded-full bg-primary/20 border border-primary/40" />
          <button onClick={reset} className="mt-4 text-xs text-muted-foreground hover:text-foreground">Hủy</button>
        </div>
      ) : (
        <button onClick={() => { setActive(true); setSeconds(900); setSurvived(false); }}
          className="px-8 py-4 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-lg font-semibold transition-all pulse-glow">
          Tôi đang có cơn thôi thúc
        </button>
      )}
    </div>
  );
}

function DistractionWheel() {
  const [result, setResult] = useState('');
  const spin = () => {
    const idx = Math.floor(Math.random() * DISTRACTION_ACTIVITIES.length);
    setResult(DISTRACTION_ACTIVITIES[idx]);
  };

  return (
    <div className="card-rewire text-center">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center justify-center gap-2">
        <Dices className="w-4 h-4" /> Hoạt động thay thế
      </h3>
      {result ? (
        <div className="animate-scale-in">
          <p className="text-lg font-semibold text-primary mb-3">🎯 {result}</p>
          <button onClick={spin} className="text-xs text-muted-foreground hover:text-foreground">Quay lại</button>
        </div>
      ) : (
        <button onClick={spin} className="px-6 py-3 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-all text-sm">
          🎲 Quay ngẫu nhiên
        </button>
      )}
    </div>
  );
}

function QuickJournal() {
  const [note, setNote] = useState('');
  const { addUrgeLog } = useApp();
  const save = () => {
    if (!note.trim()) return;
    addUrgeLog({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      intensity: 3,
      duration: 0,
      journalNote: note,
      timestamp: Date.now(),
    });
    setNote('');
  };

  return (
    <div className="card-rewire">
      <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <PenLine className="w-4 h-4" /> Ghi nhanh cảm xúc
      </h3>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Bạn đang cảm thấy gì..."
        className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20"
      />
      <button onClick={save} disabled={!note.trim()} className="mt-2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs disabled:opacity-50">
        Lưu
      </button>
    </div>
  );
}

function ActionChecklist() {
  const items = ['Uống một ly nước', 'Đi ra ngoài 5 phút', 'Hít thở sâu 10 lần', 'Gọi điện cho ai đó', 'Rửa mặt bằng nước lạnh'];
  const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));

  return (
    <div className="card-rewire">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">✅ Checklist chuyển hướng</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={checked[i]} onChange={() => {
              const next = [...checked]; next[i] = !next[i]; setChecked(next);
            }} className="accent-primary" />
            <span className={checked[i] ? 'line-through text-muted-foreground' : 'text-foreground'}>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function UrgeSurfing() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Công cụ khẩn cấp</h1>
      <UrgeTimer />
      <BreathingExercise />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DistractionWheel />
        <ActionChecklist />
      </div>
      <QuickJournal />
    </div>
  );
}
