import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { storage } from '@/lib/storage';
import { Users, Copy, LogOut, RefreshCw, Flame, AlertTriangle, Plus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface SquadMember {
  id: string;
  device_id: string;
  name: string;
  current_streak: number;
  is_relapsed: boolean;
  last_check_in: string | null;
  updated_at: string;
}

interface Squad {
  id: string;
  code: string;
  name: string;
}

function getDeviceId(): string {
  let id = storage.get<string>('device_id', '');
  if (!id) {
    id = crypto.randomUUID();
    storage.set('device_id', id);
  }
  return id;
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function SquadMode() {
  const { profile, currentStreak, dayLogs } = useApp();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [squadName, setSquadName] = useState('');
  const [tab, setTab] = useState<'join' | 'create'>('join');

  const deviceId = getDeviceId();

  const isRelapsed = dayLogs.length > 0 && (() => {
    const sorted = [...dayLogs].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0] && !sorted[0].success;
  })();

  const loadSquad = useCallback(async () => {
    setLoading(true);
    try {
      // Find squad by device_id
      const { data: membership } = await supabase
        .from('squad_members')
        .select('squad_id')
        .eq('device_id', deviceId)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        setSquad(null);
        setMembers([]);
        setLoading(false);
        return;
      }

      const { data: squadData } = await supabase
        .from('squads')
        .select('*')
        .eq('id', membership.squad_id)
        .single();

      if (squadData) {
        setSquad(squadData);
        const { data: membersData } = await supabase
          .from('squad_members')
          .select('*')
          .eq('squad_id', squadData.id)
          .order('current_streak', { ascending: false });
        setMembers(membersData || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [deviceId]);

  useEffect(() => {
    loadSquad();
  }, [loadSquad]);

  // Sync streak to squad
  useEffect(() => {
    if (!squad) return;
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('squad_members')
      .update({
        current_streak: currentStreak,
        is_relapsed: !!isRelapsed,
        last_check_in: today,
        updated_at: new Date().toISOString(),
      })
      .eq('device_id', deviceId)
      .eq('squad_id', squad.id)
      .then(() => loadSquad());
  }, [currentStreak, isRelapsed, squad?.id]);

  const createSquad = async () => {
    if (!squadName.trim()) return;
    const code = generateCode();
    try {
      const { data: newSquad, error } = await supabase
        .from('squads')
        .insert({ code, name: squadName.trim() })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('squad_members').insert({
        squad_id: newSquad.id,
        device_id: deviceId,
        name: profile.name || 'Người dùng',
        current_streak: currentStreak,
        is_relapsed: !!isRelapsed,
        last_check_in: new Date().toISOString().split('T')[0],
      });

      toast.success(`Đã tạo nhóm! Mã: ${code}`);
      setSquadName('');
      loadSquad();
    } catch (e: any) {
      toast.error('Không thể tạo nhóm');
    }
  };

  const joinSquad = async () => {
    if (!joinCode.trim()) return;
    try {
      const { data: foundSquad, error } = await supabase
        .from('squads')
        .select('*')
        .eq('code', joinCode.trim().toUpperCase())
        .single();
      if (error || !foundSquad) {
        toast.error('Mã nhóm không tồn tại');
        return;
      }

      const { error: joinError } = await supabase.from('squad_members').insert({
        squad_id: foundSquad.id,
        device_id: deviceId,
        name: profile.name || 'Người dùng',
        current_streak: currentStreak,
        is_relapsed: !!isRelapsed,
        last_check_in: new Date().toISOString().split('T')[0],
      });

      if (joinError) {
        if (joinError.code === '23505') toast.error('Bạn đã ở trong nhóm này rồi');
        else throw joinError;
        return;
      }

      toast.success('Đã tham gia nhóm!');
      setJoinCode('');
      loadSquad();
    } catch (e) {
      toast.error('Không thể tham gia nhóm');
    }
  };

  const leaveSquad = async () => {
    if (!squad) return;
    await supabase
      .from('squad_members')
      .delete()
      .eq('device_id', deviceId)
      .eq('squad_id', squad.id);
    toast.success('Đã rời nhóm');
    setSquad(null);
    setMembers([]);
  };

  const copyCode = () => {
    if (!squad) return;
    navigator.clipboard.writeText(squad.code);
    toast.success('Đã copy mã nhóm!');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Đồng hành sinh tử</h1>
        <div className="card-rewire text-center py-12">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Đồng hành sinh tử
        </h1>

        <div className="card-rewire">
          <p className="text-sm text-muted-foreground mb-4">
            Kết nối với bạn bè để cùng nhau vượt qua. Nếu một người vấp ngã, cả nhóm sẽ thấy — tạo ra trách nhiệm cộng đồng.
          </p>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setTab('join')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'join' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <UserPlus className="w-4 h-4 inline mr-1" /> Tham gia
            </button>
            <button onClick={() => setTab('create')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'create' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <Plus className="w-4 h-4 inline mr-1" /> Tạo nhóm
            </button>
          </div>

          {tab === 'join' ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nhập mã nhóm (VD: ABC123)"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none font-mono text-center text-lg tracking-widest"
                maxLength={6}
              />
              <button onClick={joinSquad} disabled={joinCode.length < 4}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50">
                Tham gia nhóm
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tên nhóm (VD: Anh em chiến đấu)"
                value={squadName}
                onChange={e => setSquadName(e.target.value)}
                className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button onClick={createSquad} disabled={!squadName.trim()}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50">
                Tạo nhóm mới
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Squad dashboard
  const totalStreak = members.reduce((a, m) => a + m.current_streak, 0);
  const anyRelapsed = members.some(m => m.is_relapsed);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" /> Đồng hành sinh tử
      </h1>

      {/* Squad Info */}
      <div className="card-rewire">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-lg text-foreground">{squad.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{squad.code}</span>
              <button onClick={copyCode} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-primary">{totalStreak}</div>
            <div className="text-[10px] text-muted-foreground">Tổng streak</div>
          </div>
        </div>

        {anyRelapsed && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Có thành viên đã vấp ngã... Cả nhóm cần vững vàng hơn!</span>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="space-y-2">
        {members.map((m, i) => (
          <div key={m.id} className={`card-rewire flex items-center gap-3 ${m.is_relapsed ? 'border-destructive/20' : ''} ${m.device_id === deviceId ? 'ring-1 ring-primary/30' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
              m.is_relapsed ? 'bg-destructive/20 text-destructive' : i === 0 ? 'bg-streak-gold/20 text-streak-gold' : 'bg-primary/20 text-primary'
            }`}>
              {m.is_relapsed ? '💀' : i === 0 ? '👑' : `#${i + 1}`}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">{m.name}</span>
                {m.device_id === deviceId && <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">Bạn</span>}
              </div>
              <div className="text-xs text-muted-foreground">
                {m.is_relapsed ? (
                  <span className="text-destructive">Đã vấp ngã</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-primary" /> {m.current_streak} ngày
                  </span>
                )}
              </div>
            </div>
            {!m.is_relapsed && m.current_streak >= 7 && (
              <div className="text-lg">{m.current_streak >= 90 ? '🐉' : m.current_streak >= 30 ? '🔮' : '⚔️'}</div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={loadSquad}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-sm text-foreground transition-all">
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
        <button onClick={leaveSquad}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-sm text-destructive transition-all">
          <LogOut className="w-4 h-4" /> Rời nhóm
        </button>
      </div>
    </div>
  );
}
