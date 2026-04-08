import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Brain, AlertTriangle, Shield, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface MindsetAnalysis {
  topTriggers: { name: string; frequency: number; advice: string }[];
  weakPeriods: { period: string; riskLevel: 'high' | 'medium' | 'low'; description: string }[];
  moodPattern: string;
  strengths: string[];
  personalAdvice: string;
  weeklyWarning: string;
}

export default function MindsetMap() {
  const { journalEntries, dayLogs, urgeLogs, privacyMode } = useApp();
  const [analysis, setAnalysis] = useState<MindsetAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const hasData = journalEntries.length > 0 || dayLogs.length > 0 || urgeLogs.length > 0;

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-mindset', {
        body: {
          journalEntries: journalEntries.slice(-30).map(e => ({
            date: e.date, content: privacyMode ? '[hidden]' : e.content,
            mood: e.mood, triggers: e.triggers,
          })),
          dayLogs: dayLogs.slice(-30).map(d => ({
            date: d.date, success: d.success, mood: d.mood,
            relapseReason: d.relapseReason,
          })),
          urgeLogs: urgeLogs.slice(-30).map(u => ({
            date: u.date, intensity: u.intensity, duration: u.duration,
          })),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalysis(data);
    } catch (e: any) {
      toast.error(e.message || 'Không thể phân tích. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (level: string) => {
    if (level === 'high') return 'text-destructive bg-destructive/10 border-destructive/20';
    if (level === 'medium') return 'text-warning bg-warning/10 border-warning/20';
    return 'text-primary bg-primary/10 border-primary/20';
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Brain className="w-6 h-6 text-secondary" /> Bản đồ tâm trí
      </h1>

      {!hasData ? (
        <div className="card-rewire text-center py-12">
          <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Cần có dữ liệu nhật ký, check-in hoặc urge log để phân tích.</p>
          <p className="text-xs text-muted-foreground mt-1">Hãy sử dụng app vài ngày rồi quay lại!</p>
        </div>
      ) : !analysis ? (
        <div className="card-rewire text-center py-8">
          <Brain className="w-16 h-16 mx-auto mb-4 text-secondary/50" />
          <p className="text-sm text-muted-foreground mb-4">
            AI sẽ phân tích dữ liệu của bạn để tìm ra patterns, triggers và đưa ra cảnh báo sớm.
          </p>
          <button
            onClick={analyze}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-secondary/20 hover:bg-secondary/30 text-secondary text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Đang phân tích...' : 'Phân tích tâm trí'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Weekly Warning */}
          <div className="card-rewire border-warning/30 bg-warning/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-warning mb-1">⚠️ Cảnh báo tuần này</div>
                <p className="text-sm text-foreground/90">{analysis.weeklyWarning}</p>
              </div>
            </div>
          </div>

          {/* Top Triggers */}
          <div className="card-rewire">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Triggers thường gặp
            </h3>
            <div className="space-y-3">
              {analysis.topTriggers.map((t, i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{t.frequency}x</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-destructive/60 rounded-full"
                      style={{ width: `${Math.min(100, (t.frequency / (analysis.topTriggers[0]?.frequency || 1)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground italic">💡 {t.advice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Periods */}
          <div className="card-rewire">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Khung giờ nguy hiểm
            </h3>
            <div className="space-y-2">
              {analysis.weakPeriods.map((p, i) => (
                <div key={i} className={`rounded-lg p-3 border ${riskColor(p.riskLevel)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{p.period}</span>
                    <span className="text-[10px] uppercase font-bold">
                      {p.riskLevel === 'high' ? '🔴 Cao' : p.riskLevel === 'medium' ? '🟡 TB' : '🟢 Thấp'}
                    </span>
                  </div>
                  <p className="text-xs opacity-80">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Pattern */}
          <div className="card-rewire">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">🧠 Xu hướng tâm trạng</h3>
            <p className="text-sm text-foreground/90">{analysis.moodPattern}</p>
          </div>

          {/* Strengths */}
          <div className="card-rewire border-primary/20">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Điểm mạnh của bạn
            </h3>
            <div className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-primary">✦</span>
                  <span className="text-sm text-foreground/90">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Advice */}
          <div className="card-rewire border-secondary/20 bg-secondary/5">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">💜 Lời khuyên dành riêng cho bạn</h3>
            <p className="text-sm text-foreground/90 italic leading-relaxed">{analysis.personalAdvice}</p>
          </div>

          {/* Re-analyze */}
          <button
            onClick={analyze}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-sm text-muted-foreground transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Phân tích lại
          </button>
        </div>
      )}
    </div>
  );
}
