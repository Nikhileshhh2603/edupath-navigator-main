import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  Topic, Subject, Mastery,
  fetchSubjects, fetchTopics, fetchMastery, computeRisk,
} from "@/lib/edugraph";
import { KnowledgeGraph } from "@/components/workspace/KnowledgeGraph";
import { RiskAnalyzer } from "@/components/workspace/RiskAnalyzer";
import { AIAssistant } from "@/components/workspace/AIAssistant";
import { TopicDrawer } from "@/components/workspace/TopicDrawer";

type Tab = "graph" | "risk" | "assistant";

export default function StudentWorkspace() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("graph");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [mastery, setMastery] = useState<Mastery[]>([]);
  const [selected, setSelected] = useState<Topic | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    try {
      const [s, t, m] = await Promise.all([fetchSubjects(), fetchTopics(), fetchMastery(user.id)]);
      setSubjects(s); setTopics(t); setMastery(m);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const risk = computeRisk(topics, mastery);
  const masteryFor = (id?: string) =>
    (id && mastery.find((m) => m.topic_id === id)?.mastery) || 0;

  const tabs: { id: Tab; label: string; hint: string }[] = [
    { id: "graph", label: "Knowledge Graph", hint: "What am I missing?" },
    { id: "risk", label: "Risk Analyzer", hint: "Am I at risk?" },
    { id: "assistant", label: "AI Assistant", hint: "How do I fix it?" },
  ];

  return (
    <main className="min-h-screen paper-bg">
      {/* Top bar */}
      <header className="border-b border-rule/60 bg-paper/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link to="/" className="serif text-xl text-ink">
            EduGraph<span className="text-terracotta">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[0.7rem] tracking-[0.3em] uppercase text-ink-soft">
            <span>Plate № 01 · Student Workspace</span>
            <span className="text-rule">|</span>
            <span>Risk <span className="text-ink">{risk.score}</span>/100</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-ink-soft hidden md:inline">{user?.email}</span>
            <button onClick={signOut} className="oval-btn">Sign Out</button>
          </div>
        </div>
      </header>

      {/* Hero strip */}
      <section className="max-w-[1500px] mx-auto px-6 md:px-12 pt-12 pb-8">
        <p className="eyebrow mb-4">Computer Science · Volume I</p>
        <h1 className="serif text-5xl md:text-6xl text-ink leading-[1]">
          Your <span className="italic text-terracotta">syllabus</span>, mapped.
        </h1>
        <p className="mt-4 text-ink-soft max-w-xl">
          Explore your knowledge graph, see where you're at risk, and let the assistant patch the gaps.
        </p>
      </section>

      {/* Tab bar */}
      <nav className="max-w-[1500px] mx-auto px-6 md:px-12 border-b border-rule/60">
        <div className="flex flex-wrap gap-x-10 gap-y-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`group py-4 -mb-px border-b-2 transition-colors ${
                tab === t.id ? "border-terracotta text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              <span className="serif text-xl">{t.label}</span>
              <span className="block text-[0.65rem] tracking-[0.3em] uppercase mt-1 italic text-ink-soft/80">
                {t.hint}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Body */}
      <section className="max-w-[1500px] mx-auto px-6 md:px-12 py-10">
        {loading ? (
          <p className="text-ink-soft">Loading your workspace…</p>
        ) : tab === "graph" ? (
          <KnowledgeGraph
            topics={topics}
            subjects={subjects}
            mastery={mastery}
            selectedId={selected?.id}
            onSelect={(t) => { setSelected(t); setDrawerOpen(true); }}
          />
        ) : tab === "risk" ? (
          <RiskAnalyzer
            topics={topics}
            subjects={subjects}
            mastery={mastery}
            onPickTopic={(t) => { setSelected(t); setDrawerOpen(true); }}
          />
        ) : (
          <AIAssistant topics={topics} mastery={mastery} selectedTopic={selected} />
        )}
      </section>

      {drawerOpen && user && (
        <TopicDrawer
          topic={selected}
          topics={topics}
          userId={user.id}
          currentMastery={masteryFor(selected?.id)}
          onClose={() => setDrawerOpen(false)}
          onSaved={load}
          onAskAI={(t) => { setSelected(t); setTab("assistant"); }}
        />
      )}
    </main>
  );
}
