import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { storage } from '@/lib/storage';
import { Download, Upload, User, Target, MessageSquare, Shield } from 'lucide-react';

const AVATARS = ['🧠', '🦁', '🐺', '🦅', '🔥', '💎', '🌿', '⚡', '🎯', '🏔️', '🌊', '🦋'];

export default function SettingsPage() {
  const { profile, setProfile } = useApp();
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [reason, setReason] = useState(profile.reason);
  const [target, setTarget] = useState(profile.targetDays);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setProfile({ ...profile, name, avatar, reason, targetDays: target });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = () => {
    const data = storage.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rewire-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (storage.importAll(ev.target?.result as string)) {
          window.location.reload();
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cài đặt</h1>

      {/* Profile */}
      <div className="card-rewire space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <User className="w-4 h-4" /> Hồ sơ
        </h3>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Tên</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Avatar</label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)}
                className={`text-2xl p-1.5 rounded-lg transition-all ${avatar === a ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-muted'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goal */}
      <div className="card-rewire space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Target className="w-4 h-4" /> Mục tiêu
        </h3>
        <div className="flex gap-2">
          {[30, 60, 90, 180, 365].map(d => (
            <button key={d} onClick={() => setTarget(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                target === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>{d} ngày</button>
          ))}
        </div>
      </div>

      {/* Reason */}
      <div className="card-rewire space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Lý do cai
        </h3>
        <textarea value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Tại sao bạn bắt đầu hành trình này?"
          className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-24" />
      </div>

      <button onClick={save}
        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all">
        {saved ? '✅ Đã lưu!' : 'Lưu cài đặt'}
      </button>

      {/* Data */}
      <div className="card-rewire space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Shield className="w-4 h-4" /> Dữ liệu
        </h3>
        <div className="flex gap-3">
          <button onClick={exportData} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-sm text-foreground transition-all">
            <Download className="w-4 h-4" /> Xuất JSON
          </button>
          <button onClick={importData} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-sm text-foreground transition-all">
            <Upload className="w-4 h-4" /> Nhập JSON
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground">Nhấn phím <kbd className="px-1 py-0.5 bg-muted rounded text-xs">P</kbd> để bật/tắt chế độ riêng tư</p>
      </div>
    </div>
  );
}
