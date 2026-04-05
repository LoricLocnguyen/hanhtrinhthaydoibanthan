import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/lib/AppContext';
import { POMODORO_TAGS } from '@/lib/constants';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle } from 'lucide-react';

type Phase = 'focus' | 'break' | 'longBreak';

export default function PomodoroTimer() {
  const { addPomodoroSession, pomodoroSessions, privacyMode } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [phase, setPhase] = useState<Phase>('focus');
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [task, setTask] = useState('');
  const [tag, setTag] = useState(POMODORO_TAGS[0]);
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const totalSeconds = phase === 'focus' ? focusMin * 60 : phase === 'break' ? breakMin * 60 : longBreakMin * 60;
  const progress = 1 - seconds / totalSeconds;

  // Timer logic
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handlePhaseComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, phase]);

  const handlePhaseComplete = useCallback(() => {
    setRunning(false);
    // Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(phase === 'focus' ? '🍅 Pomodoro hoàn thành!' : '☕ Nghỉ xong rồi!');
    }

    if (phase === 'focus') {
      const newCount = completedCount + 1;
      setCompletedCount(newCount);
      addPomodoroSession({
        id: Date.now().toString(),
        date: today,
        task: task || 'Không tên',
        tag,
        duration: focusMin,
        timestamp: Date.now(),
      });
      // Next phase
      if (newCount % 4 === 0) {
        setPhase('longBreak');
        setSeconds(longBreakMin * 60);
      } else {
        setPhase('break');
        setSeconds(breakMin * 60);
      }
    } else {
      setPhase('focus');
      setSeconds(focusMin * 60);
    }
  }, [phase, completedCount, task, tag, focusMin, breakMin, longBreakMin, today, addPomodoroSession]);

  const reset = () => {
    setRunning(false);
    setPhase('focus');
    setSeconds(focusMin * 60);
    setCompletedCount(0);
  };

  const toggleTimer = () => {
    if (!running && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setRunning(!running);
  };

  // Ambient sound
  const toggleSound = () => {
    if (soundOn) {
      noiseNodeRef.current?.stop();
      noiseNodeRef.current = null;
      setSoundOn(false);
    } else {
      try {
        const ctx = audioCtxRef.current || new AudioContext();
        audioCtxRef.current = ctx;
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const gain = ctx.createGain();
        gain.gain.value = 0.3;
        source.connect(gain).connect(ctx.destination);
        source.start();
        noiseNodeRef.current = source;
        setSoundOn(true);
      } catch {}
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const phaseColors = {
    focus: 'hsl(160, 77%, 67%)',
    break: 'hsl(263, 86%, 76%)',
    longBreak: 'hsl(45, 93%, 58%)',
  };

  const todayCount = pomodoroSessions.filter(s => s.date === today).length;

  const circumference = 2 * Math.PI * 90;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pomodoro Timer</h1>

      {running && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 text-sm text-primary text-center animate-fade-in">
          🧠 Đang trong vùng tập trung — Hãy duy trì!
        </div>
      )}

      {/* Timer Circle */}
      <div className="card-rewire flex flex-col items-center py-8">
        <div className="relative">
          <svg viewBox="0 0 200 200" className="w-56 h-56">
            <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(220,18%,16%)" strokeWidth="6" />
            <circle
              cx="100" cy="100" r="90" fill="none"
              stroke={phaseColors[phase]}
              strokeWidth="6"
              strokeDasharray={`${circumference * progress} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {phase === 'focus' ? 'Tập trung' : phase === 'break' ? 'Nghỉ ngắn' : 'Nghỉ dài'}
            </div>
            <div className="text-5xl font-mono font-bold" style={{ color: phaseColors[phase] }}>
              {privacyMode ? '••:••' : formatTime(seconds)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              #{completedCount + 1} • {privacyMode ? '•' : todayCount} 🍅 hôm nay
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button onClick={reset} className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <RotateCcw className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={toggleTimer}
            className="p-4 rounded-full bg-primary hover:bg-primary/90 transition-all pulse-glow"
          >
            {running ? <Pause className="w-6 h-6 text-primary-foreground" /> : <Play className="w-6 h-6 text-primary-foreground" />}
          </button>
          <button onClick={toggleSound} className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors">
            {soundOn ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Task Input */}
      <div className="card-rewire space-y-3">
        <input
          type="text"
          placeholder="Bạn đang làm gì?"
          value={task}
          onChange={e => setTask(e.target.value)}
          className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex flex-wrap gap-2">
          {POMODORO_TAGS.map(t => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                tag === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="card-rewire">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Tập trung', value: focusMin, set: (v: number) => { setFocusMin(v); if (!running && phase === 'focus') setSeconds(v * 60); } },
            { label: 'Nghỉ ngắn', value: breakMin, set: (v: number) => { setBreakMin(v); if (!running && phase === 'break') setSeconds(v * 60); } },
            { label: 'Nghỉ dài', value: longBreakMin, set: (v: number) => { setLongBreakMin(v); if (!running && phase === 'longBreak') setSeconds(v * 60); } },
          ].map(({ label, value, set }) => (
            <div key={label} className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <input
                type="number"
                min={1} max={120}
                value={value}
                onChange={e => set(Number(e.target.value))}
                disabled={running}
                className="w-full bg-muted rounded-lg px-2 py-1.5 text-center text-sm font-mono text-foreground disabled:opacity-50 outline-none"
              />
              <div className="text-[10px] text-muted-foreground">phút</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      {pomodoroSessions.length > 0 && (
        <div className="card-rewire">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Phiên gần đây</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {[...pomodoroSessions].reverse().slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                <span className="text-foreground">{s.task}</span>
                <span className="text-muted-foreground">{s.tag}</span>
                <span className="ml-auto text-muted-foreground font-mono">{s.duration}m</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
