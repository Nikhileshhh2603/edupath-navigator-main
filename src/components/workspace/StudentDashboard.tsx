import { Topic, Mastery } from "@/lib/edugraph";
import { ArrowRight, Sparkles, Megaphone, Smile, Frown, Meh } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function StudentDashboard({ topics, mastery }: { topics: Topic[], mastery: Mastery[] }) {
  const [pulse, setPulse] = useState<number | null>(null);

  // Proactive Study Path: Find the weakest prerequisite chain
  // 1. Find topics with lowest mastery
  // 2. Identify prerequisites for that topic

  const getWeakestTopic = () => {
    if (!topics.length) return null;
    const masteryMap = new Map(mastery.map(m => [m.topic_id, m.mastery]));
    let weakest = topics[0];
    let minMastery = 100;

    for (const t of topics) {
      const m = masteryMap.get(t.id) || 0;
      if (m < minMastery) {
        minMastery = m;
        weakest = t;
      }
    }
    return weakest;
  };

  const weakestTopic = getWeakestTopic();

  const handlePulseSubmit = (score: number) => {
    setPulse(score);
    toast.success("Pulse check recorded. Thanks!");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Proactive Study Path Card */}
        <div className="col-span-1 lg:col-span-2 bg-sage/10 border border-sage/20 rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sage" />
            What to Study Next
          </h2>
          <p className="text-ink-soft mb-6 max-w-lg">
            Based on your knowledge graph topology, we found a critical weakness in your prerequisite chain.
          </p>

          {weakestTopic ? (
            <div className="bg-paper p-4 rounded-md border border-ink/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-terracotta uppercase tracking-wider mb-1">Recommended Focus</p>
                <h3 className="text-2xl font-bold text-ink">{weakestTopic.name}</h3>
                <p className="text-sm text-ink-soft mt-1">Mastering this unlocks 3 downstream topics.</p>
              </div>
              <Link to="/student/graph" className="bg-sage text-paper px-6 py-3 rounded-md font-medium hover:bg-sage/90 transition-colors flex items-center gap-2 shrink-0">
                Start Studying <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-paper p-4 rounded-md border border-ink/10 text-center">
              <p className="text-sage font-medium">You're all caught up! 🌟</p>
            </div>
          )}
        </div>

        {/* Weekly Pulse Check */}
        <div className="col-span-1 bg-paper border border-ink/10 rounded-lg p-6">
          <h2 className="font-bold text-ink mb-1">Weekly Pulse Check</h2>
          <p className="text-xs text-ink-soft mb-4">How's studying going this week?</p>

          <div className="flex justify-between items-center mb-4">
            {[
              { icon: <Frown className="w-8 h-8 text-terracotta" />, val: 1 },
              { icon: <Meh className="w-8 h-8 text-amber-500" />, val: 3 },
              { icon: <Smile className="w-8 h-8 text-sage" />, val: 5 }
            ].map(emoji => (
              <button
                key={emoji.val}
                onClick={() => handlePulseSubmit(emoji.val)}
                className={`p-2 rounded-full transition-transform hover:scale-110 ${pulse === emoji.val ? 'bg-ink/10 ring-2 ring-ink/20' : ''}`}
              >
                {emoji.icon}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Optional notes (e.g. struggling with OS)" className="w-full text-sm p-2 rounded border border-ink/10 bg-ink/5 focus:outline-none focus:ring-1 focus:ring-sage" />
          <button className="w-full mt-3 bg-ink text-paper text-sm py-2 rounded-md hover:bg-ink/90 transition-colors">
            Submit Pulse
          </button>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-paper border border-ink/10 rounded-lg p-6">
        <h2 className="font-bold text-ink flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-ink-soft" />
          Department Announcements
        </h2>
        <div className="space-y-4">
          <div className="border-l-2 border-sage pl-4 py-1">
            <h4 className="font-semibold text-sm text-ink">Midterm Scheduling Released</h4>
            <p className="text-xs text-ink-soft mt-1">Check your calendar. Midterms for core subjects begin next week.</p>
          </div>
          <div className="border-l-2 border-ink/20 pl-4 py-1">
            <h4 className="font-semibold text-sm text-ink">New Study Group for Hash Tables</h4>
            <p className="text-xs text-ink-soft mt-1">Join the CS lab tomorrow at 4 PM for a collaborative session.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
