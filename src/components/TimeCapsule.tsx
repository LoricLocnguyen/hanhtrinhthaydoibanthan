import { useApp } from '@/lib/AppContext';
import { useState } from 'react';
import { Mail, Lock, Unlock, Send, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const CAPSULE_MILESTONES = [30, 60, 90];

export default function TimeCapsule() {
  const { currentStreak, timeCapsules, addTimeCapsule } = useApp();
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const handleSend = (milestone: number) => {
    const content = drafts[milestone]?.trim();
    if (!content) {
      toast({ title: 'Hãy viết gì đó cho tương lai!', variant: 'destructive' });
      return;
    }
    addTimeCapsule({ milestone, content, createdAt: Date.now() });
    setDrafts(prev => ({ ...prev, [milestone]: '' }));
    toast({ title: `📬 Thư đã được niêm phong!`, description: `Sẽ mở khi bạn đạt ${milestone} ngày.` });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Mail className="w-6 h-6 text-primary" /> Hộp thư gửi tương lai
      </h1>
      <p className="text-sm text-muted-foreground">
        Viết thư cho chính mình tại các cột mốc quan trọng. Thư sẽ được khóa và chỉ mở ra khi bạn đạt đến mốc đó.
      </p>

      <div className="space-y-4">
        {CAPSULE_MILESTONES.map(milestone => {
          const capsule = timeCapsules.find(c => c.milestone === milestone);
          const isUnlocked = currentStreak >= milestone;
          const isWritten = !!capsule;

          return (
            <div key={milestone} className="card-rewire animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                {isWritten && isUnlocked ? (
                  <Unlock className="w-5 h-5 text-primary" />
                ) : isWritten ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground" />
                )}
                <h3 className="font-semibold">
                  Ngày thứ {milestone}
                </h3>
                {isWritten && !isUnlocked && (
                  <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    🔒 Còn {milestone - currentStreak} ngày nữa
                  </span>
                )}
                {isWritten && isUnlocked && (
                  <span className="ml-auto text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                    ✨ Đã mở khóa!
                  </span>
                )}
              </div>

              {/* Already written & unlocked -> show content */}
              {isWritten && isUnlocked && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-2">
                    Bạn đã viết vào ngày {new Date(capsule.createdAt).toLocaleDateString('vi-VN')}:
                  </div>
                  <p className="text-sm text-foreground/90 italic whitespace-pre-wrap leading-relaxed">
                    "{capsule.content}"
                  </p>
                </div>
              )}

              {/* Already written & locked -> show locked state */}
              {isWritten && !isUnlocked && (
                <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Thư đã được niêm phong. Hãy kiên trì đến ngày thứ {milestone}!
                  </span>
                </div>
              )}

              {/* Not written yet -> show editor */}
              {!isWritten && (
                <div className="space-y-3">
                  <Textarea
                    placeholder={`Viết thư cho chính mình khi đạt ${milestone} ngày... Bạn muốn nhắn nhủ điều gì?`}
                    value={drafts[milestone] || ''}
                    onChange={e => setDrafts(prev => ({ ...prev, [milestone]: e.target.value }))}
                    className="min-h-[100px] resize-none"
                  />
                  <Button
                    onClick={() => handleSend(milestone)}
                    disabled={!drafts[milestone]?.trim()}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Niêm phong thư
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
