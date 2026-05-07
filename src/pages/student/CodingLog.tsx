import { useState } from "react";
import { Code, Plus, Flame, CalendarDays, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const platforms = ["LeetCode", "HackerRank", "CodeForces", "GeeksForGeeks", "Other"];

// Mock recent logs for display
const mockLogs = [
  { date: "2026-05-07", platform: "LeetCode", count: 3, notes: "Two Pointers, Binary Search" },
  { date: "2026-05-06", platform: "LeetCode", count: 2, notes: "Dynamic Programming" },
  { date: "2026-05-05", platform: "HackerRank", count: 4, notes: "SQL challenges" },
  { date: "2026-05-04", platform: "LeetCode", count: 1, notes: "" },
  { date: "2026-05-03", platform: "CodeForces", count: 2, notes: "Contest Div 2" },
  { date: "2026-05-01", platform: "LeetCode", count: 3, notes: "Graph problems" },
  { date: "2026-04-30", platform: "LeetCode", count: 2, notes: "" },
];

export default function CodingLog() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState("LeetCode");
  const [count, setCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const streak = 5; // calculated from consecutive days
  const totalThisWeek = mockLogs.filter(l => l.date >= "2026-05-01").reduce((s, l) => s + l.count, 0);

  const handleSubmit = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("coding_log" as any).upsert({
        user_id: user.id,
        log_date: new Date().toISOString().split("T")[0],
        platform, problem_count: count, notes
      }, { onConflict: "user_id,log_date" });
      if (error) throw error;
      toast.success("Coding log saved! 🔥");
      setNotes("");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-ink">Coding Log</h1>
        <p className="text-ink-soft text-sm mt-1">Track your daily problem-solving progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-terracotta/10 border border-terracotta/20 rounded-lg p-4 text-center">
          <Flame className="w-6 h-6 text-terracotta mx-auto mb-1" />
          <p className="text-3xl font-bold text-terracotta">{streak}</p>
          <p className="text-xs text-terracotta/80 font-medium">Day Streak 🔥</p>
        </div>
        <div className="bg-paper border border-ink/10 rounded-lg p-4 text-center">
          <Code className="w-6 h-6 text-ink-soft mx-auto mb-1" />
          <p className="text-3xl font-bold text-ink">{totalThisWeek}</p>
          <p className="text-xs text-ink-soft font-medium">This Week</p>
        </div>
        <div className="bg-sage/10 border border-sage/20 rounded-lg p-4 text-center">
          <TrendingUp className="w-6 h-6 text-sage mx-auto mb-1" />
          <p className="text-3xl font-bold text-sage">47</p>
          <p className="text-xs text-sage font-medium">All Time</p>
        </div>
      </div>

      {/* Quick Log */}
      <div className="bg-paper border border-ink/10 rounded-lg p-6">
        <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log Today's Practice
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-ink-soft uppercase tracking-wider mb-1">Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper focus:outline-none focus:ring-1 focus:ring-sage">
              {platforms.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-soft uppercase tracking-wider mb-1">Problems Solved</label>
            <input type="number" min={0} max={50} value={count} onChange={e => setCount(Number(e.target.value))}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper focus:outline-none focus:ring-1 focus:ring-sage" />
          </div>
          <div>
            <label className="block text-xs text-ink-soft uppercase tracking-wider mb-1">Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Topics covered..."
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper focus:outline-none focus:ring-1 focus:ring-sage" />
          </div>
        </div>
        <button onClick={handleSubmit} disabled={busy}
          className="bg-sage text-paper px-6 py-2 rounded-md text-sm font-medium hover:bg-sage/90 transition-colors disabled:opacity-50">
          {busy ? "Saving..." : "Save Log"}
        </button>
      </div>

      {/* History */}
      <div className="bg-paper border border-ink/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-ink/10 bg-ink/5">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-ink-soft" /> Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-ink/5">
          {mockLogs.map((log, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-ink/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-xs font-medium text-ink-soft bg-ink/5 px-2 py-1 rounded">{log.date}</div>
                <div>
                  <p className="text-sm font-medium text-ink">{log.platform}</p>
                  {log.notes && <p className="text-xs text-ink-soft">{log.notes}</p>}
                </div>
              </div>
              <span className="text-lg font-bold text-sage">{log.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
