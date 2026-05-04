import { useMemo, useEffect, useState } from "react";
import { Topic, Mastery, Subject, computeRisk, masteryColor } from "@/lib/edugraph";

interface Props {
  topics: Topic[];
  subjects: Subject[];
  mastery: Mastery[];
  onPickTopic: (t: Topic) => void;
}

const AnimatedNumber = ({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <>{display}</>;
};

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
    score >= 70 ? { label: "High Risk",  tone: "hsl(0 60% 50%)", badge: "badge-terracotta" } :
    score >= 40 ? { label: "Watchlist",  tone: "hsl(20 70% 50%)", badge: "badge-amber" } :
    score >= 20 ? { label: "On Track",   tone: "hsl(40 75% 50%)", badge: "badge-sage" } :
                  { label: "Excellent",  tone: "hsl(150 35% 40%)", badge: "badge-sage" };

  const R = 70, C = 2 * Math.PI * R;
  const dash = (score / 100) * C;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Risk score */}
      <div className="glass-card rounded-xl p-8 flex flex-col items-center text-center count-up">
        <p className="eyebrow mb-4">Academic Risk</p>
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={R} fill="none" stroke="hsl(var(--rule) / 0.3)" strokeWidth="14" />
          <circle
            cx="90" cy="90" r={R} fill="none" stroke={band.tone} strokeWidth="14"
            strokeDasharray={`${dash} ${C}`}
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
          <text x="90" y="86" textAnchor="middle" className="serif" fontSize="42" fill="hsl(var(--ink))">
            <AnimatedNumber value={score} />
          </text>
          <text x="90" y="108" textAnchor="middle" fontSize="11" fill="hsl(var(--ink-soft))" letterSpacing="3">/ 100</text>
        </svg>
        <span className={`badge ${band.badge} mt-4`}>{band.label}</span>
        <p className="text-xs text-ink-soft mt-3 max-w-[220px] leading-relaxed">
          Weighted by topic difficulty and prerequisite gaps. Lower is better.
        </p>
      </div>

      {/* Weakest topics */}
      <div className="glass-card rounded-xl p-8 count-up" style={{ animationDelay: "0.1s" }}>
        <p className="eyebrow mb-4">Weakest Topics</p>
        <ul className="space-y-3">
          {weakest.length === 0 && <li className="text-sm text-ink-soft italic">No data yet — log a quick check-in.</li>}
          {weakest.map((t, i) => {
            const m = masteryMap.get(t.id) ?? 0;
            return (
              <li key={t.id} className="count-up" style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
                <button onClick={() => onPickTopic(t)} className="w-full text-left group">
                  <div className="flex items-center justify-between text-sm text-ink">
                    <span className="group-hover:text-terracotta transition-colors flex items-center gap-2">
                      <span className="text-terracotta text-xs">✦</span>
                      {t.name}
                    </span>
                    <span className="text-xs font-medium" style={{ color: masteryColor(m) }}>{m}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-rule/30 rounded-full overflow-hidden">
                    <div className="h-full rounded-full progress-animate" style={{ width: `${m}%`, background: masteryColor(m), animationDelay: `${0.3 + i * 0.1}s` }} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Blockers */}
      <div className="glass-card rounded-xl p-8 count-up" style={{ animationDelay: "0.2s" }}>
        <p className="eyebrow mb-4">Prerequisite Blockers</p>
        {blockers.length === 0 ? (
          <div className="text-center py-6">
            <span className="text-3xl block mb-2">✅</span>
            <p className="text-sm text-ink-soft">No prerequisite gaps detected.</p>
          </div>
        ) : (
          <ul className="space-y-3 text-sm">
            {blockers.map((t, i) => (
              <li key={t.id} className="count-up" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
                <button onClick={() => onPickTopic(t)} className="w-full text-left group flex items-start gap-3 p-2 rounded-lg hover:bg-terracotta/5 transition-colors">
                  <span className="text-terracotta mt-0.5 flex-shrink-0">⚠️</span>
                  <div>
                    <span className="text-ink group-hover:text-terracotta transition-colors font-medium">{t.name}</span>
                    <p className="text-xs text-ink-soft mt-0.5">Build prerequisites before tackling this.</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Subject breakdown */}
      <div className="lg:col-span-3 glass-card rounded-xl p-8 count-up" style={{ animationDelay: "0.3s" }}>
        <p className="eyebrow mb-6">Subject Mastery</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
          {bySubject.map(({ subject, avg }, i) => (
            <div key={subject.id} className="count-up" style={{ animationDelay: `${0.4 + i * 0.05}s` }}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-ink font-medium">{subject.name}</span>
                <span className="text-xs font-medium" style={{ color: masteryColor(avg) }}>{avg}%</span>
              </div>
              <div className="h-2 bg-rule/30 rounded-full overflow-hidden">
                <div className="h-full rounded-full progress-animate transition-all" style={{ width: `${avg}%`, background: masteryColor(avg), animationDelay: `${0.5 + i * 0.08}s` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
