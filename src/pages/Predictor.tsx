import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { SUBJECTS, SubjectKey } from "@/lib/curriculum-data";
import { KnowledgeGraph } from "@/components/predictor/KnowledgeGraph";
import { RiskDashboard, RiskInputs } from "@/components/predictor/RiskDashboard";
import { useTheme } from "@/hooks/use-theme";
import paperTexture from "@/assets/paper-texture.jpg";

const paperStyle = { ["--paper-img" as string]: `url(${paperTexture})` } as React.CSSProperties;

type Tab = "graph" | "risk";

const SUBJECT_OPTIONS: { key: SubjectKey; label: string; icon: string }[] = [
  { key: "ml", label: "Machine Learning", icon: "🧠" },
  { key: "ds", label: "Data Structures", icon: "🌳" },
  { key: "electronics", label: "Electronics", icon: "⚡" },
];

export default function Predictor() {
  const { theme, toggle: toggleTheme } = useTheme();
  // ── Form state ──────────────────────────────────────────────────
  const [studentName, setStudentName] = useState("");
  const [subjectKey, setSubjectKey] = useState<SubjectKey>("ml");
  const [knownTopicIds, setKnownTopicIds] = useState<Set<string>>(new Set());
  const [attendance, setAttendance] = useState(75);
  const [avgGrade, setAvgGrade] = useState(65);
  const [missedAssignments, setMissedAssignments] = useState(3);
  const [engagementScore, setEngagementScore] = useState(6);

  const [activeTab, setActiveTab] = useState<Tab>("graph");
  const [analyzed, setAnalyzed] = useState(false);
  const [analysisName, setAnalysisName] = useState("");

  const curriculum = SUBJECTS[subjectKey];

  const riskInputs: RiskInputs = useMemo(
    () => ({ attendance, avgGrade, missedAssignments, engagementScore, knownTopics: knownTopicIds, subjectKey }),
    [attendance, avgGrade, missedAssignments, engagementScore, knownTopicIds, subjectKey]
  );

  const toggleTopic = (id: string) => {
    setKnownTopicIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAnalyze = () => {
    setAnalysisName(studentName || "Student");
    setAnalyzed(true);
  };

  const handleReset = () => {
    setAnalyzed(false);
    setStudentName("");
    setKnownTopicIds(new Set());
    setAttendance(75);
    setAvgGrade(65);
    setMissedAssignments(3);
    setEngagementScore(6);
  };

  return (
    <div className="min-h-screen paper-bg text-ink" style={paperStyle}>
      {/* Header */}
      <div className="border-b border-rule/40 bg-paper/85 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-ink-soft hover:text-ink transition-colors text-sm editorial-link pb-0">← EduGraph</Link>
            <span className="text-ink-soft/40">/</span>
            <span className="text-sm font-semibold text-ink">Student Risk Predictor</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            {analyzed && (
              <button
                onClick={handleReset}
                className="oval-btn py-1.5 px-4 text-xs tracking-widest"
              >
                ← New Analysis
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {!analyzed ? (
          /* ═══════════════════════ INPUT PANEL ═══════════════════════ */
          <div className="space-y-8 animate-fade-in">
            <div>
              <p className="eyebrow mb-2">— Predictor</p>
              <h1 className="serif text-4xl md:text-5xl text-ink leading-tight">
                Student <em className="italic text-terracotta">Risk Profile</em>
              </h1>
              <p className="text-ink-soft text-sm mt-2 max-w-xl leading-relaxed italic">
                Enter a student's performance metrics to map their knowledge and calculate their dropout risk trajectory.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* ── Left: Identity & Performance ── */}
              <div className="space-y-6">
                <Section title="Student Identity">
                  <div>
                    <Label>Student Name</Label>
                    <input
                      id="student-name-input"
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full bg-paper border border-ink/20 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-soft/40 focus:outline-none focus:border-terracotta/60 transition-colors"
                    />
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {SUBJECT_OPTIONS.map((s) => (
                        <button
                          key={s.key}
                          id={`subject-btn-${s.key}`}
                          onClick={() => { setSubjectKey(s.key); setKnownTopicIds(new Set()); }}
                          className={`rounded-xl border p-3 text-center text-sm transition-all ${
                            subjectKey === s.key
                              ? "border-terracotta bg-terracotta/10 text-terracotta"
                              : "border-ink/20 bg-paper text-ink-soft hover:border-ink/40"
                          }`}
                        >
                          <div className="text-2xl mb-1">{s.icon}</div>
                          <div className="text-xs font-medium leading-tight">{s.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Section>

                <Section title="Performance Metrics">
                  <SliderField
                    id="attendance-slider"
                    label="Attendance"
                    value={attendance}
                    onChange={setAttendance}
                    min={0} max={100}
                    unit="%"
                    color={attendance >= 75 ? "hsl(var(--sage))" : attendance >= 50 ? "#fb923c" : "hsl(var(--terracotta))"}
                  />
                  <SliderField
                    id="grade-slider"
                    label="Average Grade"
                    value={avgGrade}
                    onChange={setAvgGrade}
                    min={0} max={100}
                    unit="%"
                    color={avgGrade >= 70 ? "hsl(var(--sage))" : avgGrade >= 50 ? "#fb923c" : "hsl(var(--terracotta))"}
                  />
                  <SliderField
                    id="missed-slider"
                    label="Assignments Missed"
                    value={missedAssignments}
                    onChange={setMissedAssignments}
                    min={0} max={20}
                    unit=" missed"
                    color={missedAssignments <= 2 ? "hsl(var(--sage))" : missedAssignments <= 6 ? "#fb923c" : "hsl(var(--terracotta))"}
                  />
                  <SliderField
                    id="engagement-slider"
                    label="Engagement Score"
                    value={engagementScore}
                    onChange={setEngagementScore}
                    min={1} max={10}
                    unit=" / 10"
                    color={engagementScore >= 7 ? "hsl(var(--sage))" : engagementScore >= 4 ? "#fb923c" : "hsl(var(--terracotta))"}
                  />
                </Section>
              </div>

              {/* ── Right: Known Topics Checklist ── */}
              <Section title={`Curriculum — ${curriculum.name}`} subtitle={`${knownTopicIds.size} / ${curriculum.topics.length} topics mastered`}>
                <div className="flex gap-3 mb-4 border-b border-ink/10 pb-3">
                  <button
                    onClick={() => setKnownTopicIds(new Set(curriculum.topics.map((t) => t.id)))}
                    className="text-xs tracking-widest uppercase font-medium text-sage hover:text-ink transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-ink-soft/30">|</span>
                  <button
                    onClick={() => setKnownTopicIds(new Set())}
                    className="text-xs tracking-widest uppercase font-medium text-ink-soft hover:text-ink transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                  {curriculum.topics.map((topic) => {
                    const isKnown = knownTopicIds.has(topic.id);
                    return (
                      <label
                        key={topic.id}
                        className={`flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 transition-colors ${
                          isKnown ? "bg-sage/10" : "hover:bg-ink/5"
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`topic-${topic.id}`}
                          checked={isKnown}
                          onChange={() => toggleTopic(topic.id)}
                          className="sr-only"
                        />
                        <span className={`w-3.5 h-3.5 rounded-sm flex-shrink-0 border flex items-center justify-center transition-all ${
                          isKnown ? "bg-sage border-sage" : "border-ink/30 bg-paper"
                        }`}>
                          {isKnown && <svg className="w-2.5 h-2.5 text-paper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </span>
                        <span className={`text-[0.75rem] leading-tight ${isKnown ? "text-ink font-medium" : "text-ink-soft"}`}>
                          {topic.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </Section>
            </div>

            {/* Analyze button */}
            <div className="flex justify-center pt-8 border-t border-rule/30">
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                className="oval-btn oval-btn-solid text-[0.8rem] px-12 py-4 shadow-[0_10px_20px_-10px_hsl(var(--ink)/0.3)] hover:shadow-[0_10px_20px_-10px_hsl(var(--terracotta)/0.4)]"
              >
                Analyze Student →
              </button>
            </div>
          </div>
        ) : (
          /* ═══════════════════════ RESULTS PANEL ═══════════════════════ */
          <div className="space-y-6 animate-fade-in">
            {/* Sub-header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-rule/30 pb-6">
              <div>
                <p className="eyebrow mb-2">— Results / {SUBJECTS[subjectKey].name}</p>
                <h1 className="serif text-4xl md:text-[3.5rem] text-ink leading-none">
                  {analysisName}
                </h1>
                <p className="text-ink-soft text-sm mt-3 italic">
                  {knownTopicIds.size} of {SUBJECTS[subjectKey].topics.length} topics mastered.
                </p>
              </div>
              <div className="flex gap-3">
                <TabButton id="tab-graph" active={activeTab === "graph"} onClick={() => setActiveTab("graph")} icon="Map" label="Graph" />
                <TabButton id="tab-risk" active={activeTab === "risk"} onClick={() => setActiveTab("risk")} icon="Risk" label="Dashboard" />
              </div>
            </div>

            {/* Tab content */}
            {activeTab === "graph" ? (
              <div className="bg-paper-deep/30 border border-ink/20 rounded-xl p-3 shadow-[0_30px_60px_-30px_hsl(var(--paper-shadow))] relative overflow-hidden" style={{ height: "calc(100vh - 280px)", minHeight: 600 }}>
                <KnowledgeGraph subjectKey={subjectKey} knownTopics={knownTopicIds} />
                <div className="absolute inset-0 pointer-events-none border border-ink/5 rounded-xl mix-blend-overlay"></div>
              </div>
            ) : (
              <RiskDashboard inputs={riskInputs} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-paper-deep/30 border border-ink/20 rounded-xl p-6 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 grain"></div>
      <div className="relative z-10 space-y-5">
        <div>
          <h2 className="serif text-2xl text-ink leading-none mb-1">{title}</h2>
          {subtitle && <p className="text-[0.7rem] uppercase tracking-widest text-ink-soft/70">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.65rem] tracking-[0.2em] uppercase text-ink-soft mb-2 font-medium">{children}</p>;
}

function SliderField({ id, label, value, onChange, min, max, unit, color }: {
  id: string; label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; unit: string; color: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <Label>{label}</Label>
        <span className="serif text-xl font-medium leading-none" style={{ color }}>{value}<span className="text-sm">{unit}</span></span>
      </div>
      <div className="relative h-1.5 rounded-full bg-ink/10 overflow-hidden">
        <div className="absolute h-full transition-all duration-300 ease-out" style={{ width: `${pct}%`, background: color }} />
        <input
          id={id}
          type="range"
          min={min} max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

function TabButton({ id, active, onClick, icon, label }: {
  id: string; active: boolean; onClick: () => void; icon: string; label: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`oval-btn px-6 py-2 border ${
        active
          ? "bg-ink text-paper border-ink"
          : "bg-transparent text-ink border-ink/30 hover:border-ink hover:bg-paper-deep"
      }`}
    >
      <span className="italic text-terracotta mr-1">{icon}</span> {label}
    </button>
  );
}
