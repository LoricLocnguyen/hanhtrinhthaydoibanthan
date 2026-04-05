import { useState } from 'react';
import { useApp, JournalEntry } from '@/lib/AppContext';
import { getDailyPrompt, MOOD_EMOJIS, MOOD_LABELS } from '@/lib/constants';
import { BookOpen, Search, Lightbulb } from 'lucide-react';

export default function Journal() {
  const { journalEntries, addJournalEntry, privacyMode } = useApp();
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);
  const [triggers, setTriggers] = useState('');
  const [search, setSearch] = useState('');

  const prompt = getDailyPrompt();

  const save = () => {
    if (!content.trim()) return;
    addJournalEntry({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      content,
      mood,
      triggers: triggers ? triggers.split(',').map(t => t.trim()) : [],
      timestamp: Date.now(),
    });
    setContent('');
    setTriggers('');
  };

  const filtered = journalEntries.filter(e =>
    !search || e.content.toLowerCase().includes(search.toLowerCase()) || e.date.includes(search)
  ).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nhật ký</h1>

      {/* Prompt */}
      <div className="card-rewire border-secondary/20 animate-fade-in">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-muted-foreground mb-1">Gợi ý hôm nay</div>
            <p className="text-sm text-foreground/90 italic">{prompt}</p>
          </div>
        </div>
      </div>

      {/* New Entry */}
      <div className="card-rewire space-y-3">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Viết gì đó..."
          className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[120px] focus:ring-1 focus:ring-primary"
        />
        <div>
          <div className="text-xs text-muted-foreground mb-2">Tâm trạng</div>
          <div className="flex gap-2">
            {MOOD_EMOJIS.map((emoji, i) => (
              <button key={i} onClick={() => setMood(i + 1)}
                className={`text-xl p-1 rounded transition-all ${mood === i + 1 ? 'bg-primary/20 scale-110' : 'hover:bg-muted'}`}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <input
          type="text" placeholder="Triggers (phân tách bằng dấu phẩy)"
          value={triggers} onChange={e => setTriggers(e.target.value)}
          className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button onClick={save} disabled={!content.trim()}
          className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
          Lưu nhật ký
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text" placeholder="Tìm kiếm..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {filtered.map(entry => (
          <div key={entry.id} className="card-rewire animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{entry.date}</span>
              <span className="text-lg">{MOOD_EMOJIS[entry.mood - 1]}</span>
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
              {privacyMode ? '••••••••' : entry.content}
            </p>
            {entry.triggers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entry.triggers.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Chưa có nhật ký nào
          </div>
        )}
      </div>
    </div>
  );
}
