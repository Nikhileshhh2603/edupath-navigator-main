import { useMemo } from "react";
import { Topic, Mastery, Subject, computeRisk, masteryColor } from "@/lib/edugraph";

interface Props {
  topics: Topic[];
  subjects: Subject[];
  mastery: Mastery[];
  onPickTopic: (t: Topic) => void;
}

export const RiskAnalyzer = ({ topics, subjects, mastery, onPickTopic }: Props) => {
  const { score, weakest, blockers } = useMemo(() => computeRisk(topics, mastery), [topics, mastery]);

  const masteryMap = new Map(mastery.map((m) => [m.topic_id, m.mastery]));
  const bySubject = useMemo(() => {
    return subjects.map((s) => {
      const sTopics = topics.filter((t) => t.subject_id === s.id);
      if (sTopics.length === 0) return { subject: s, avg: 0 };
      const avg = Math.round(sTopics.reduce((sum, t) => sum + (masteryMap.get(t.id) ?? 0), 0) / sTopics.length);
      return { subject: s, avg };
    });
  }, [subjects, topics, mastery]);

  const band =
    score >= 70 ? { label: "High Risk",  tone: "hsl(0 60% 50%)" } :
    score >= 40 ? { label: "Watchlist",  tone: "hsl(20 70% 50%)" } :
    score >= 20 ? { label: "On Track",   tone: "hsl(40 75% 50%)" } :
                  { label: "Excellent",  tone: "hsl(150 35% 40%)" };

  // Donut math
  const R = 70, C = 2 * Math.PI * R;
  const dash = (score / 100) * C;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Risk score */}
      <div className="border border-rule/60 bg-paper/70 p-8 flex flex-col items-center text-center">
        <p className="eyebrow mb-4">Academic Risk</p>
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={R} fill="none" stroke="hsl(40 15% 85%)" strokeWidth="14" />
          <circle
            cx="90" cy="90" r={R} fill="none" stroke={band.tone} strokeWidth="14"
            strokeDasharray={`${dash} ${C}`}
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
            style={{ transition: "stroke-dasharray 600ms ease" }}
          />
          <text x="90" y="86" textAnchor="middle" className="serif" fontSize="42" fill="hsl(40 15% 18%)">{score}</text>
          <text x="90" y="108" textAnchor="middle" fontSize="11" fill="hsl(40 15% 35%)" letterSpacing="3">/ 100</text>
        </svg>
        <p className="serif text-2xl text-ink mt-4" style={{ color: band.tone }}>{band.label}</p>
        <p className="text-xs text-ink-soft mt-2 max-w-[220px]">
          Weighted by topic difficulty and prerequisite gaps. Lower is better.
        </p>
      </div>

      {/* Weakest topics */}
      <div className="border border-rule/60 bg-paper/70 p-8">
        <p className="eyebrow mb-4">Weakest Topics</p>
        <ul className="space-y-3">
          {weakest.length === 0 && <li className="text-sm text-ink-soft">No data yet — log a quick check-in.</li>}
          {weakest.map((t) => {
            const m = masteryMap.get(t.id) ?? 0;
            return (
              <li key={t.id}>
                <button onClick={() => onPickTopic(t)} className="w-full text-left group">
                  <div className="flex items-center justify-between text-sm text-ink">
                    <span className="group-hover:text-terracotta transition-colors">{t.name}</span>
                    <span className="text-ink-soft text-xs">{m}%</span>
                  </div>
                  <div className="mt-1 h-1 bg-rule/60 overflow-hidden">
                    <div className="h-full" style={{ width: `${m}%`, background: masteryColor(m) }} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Blockers */}
      <div className="border border-rule/60 bg-paper/70 p-8">
        <p className="eyebrow mb-4">Prerequisite Blockers</p>
        {blockers.length === 0 ? (
          <p className="text-sm text-ink-soft">No prerequisite gaps detected.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {blockers.map((t) => (
              <li key={t.id} className="flex items-start gap-2">
                <span className="text-terracotta mt-1">✦</span>
                <button onClick={() => onPickTopic(t)} className="text-left hover:text-terracotta transition-colors">
                  <span className="text-ink">{t.name}</span>
                  <p className="text-xs text-ink-soft">Build prerequisites before tackling this.</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Subject breakdown */}
      <div className="lg:col-span-3 border border-rule/60 bg-paper/70 p-8">
        <p className="eyebrow mb-6">Subject Mastery</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
          {bySubject.map(({ subject, avg }) => (
            <div key={subject.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink">{subject.name}</span>
                <span className="text-ink-soft text-xs">{avg}%</span>
              </div>
              <div className="mt-1 h-1 bg-rule/60 overflow-hidden">
                <div className="h-full transition-all" style={{ width: `${avg}%`, background: masteryColor(avg) }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
