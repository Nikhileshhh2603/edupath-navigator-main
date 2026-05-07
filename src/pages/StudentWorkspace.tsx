import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import {
  Topic, Subject, Mastery,
  fetchSubjects, fetchTopics, fetchMastery, computeRisk,
} from "@/lib/edugraph";
import { KnowledgeGraph } from "@/components/workspace/KnowledgeGraph";
import { RiskAnalyzer } from "@/components/workspace/RiskAnalyzer";
import { AIAssistant } from "@/components/workspace/AIAssistant";
import { TopicDrawer } from "@/components/workspace/TopicDrawer";

import { StudentDashboard } from "@/components/workspace/StudentDashboard";

type Tab = "dashboard" | "graph" | "risk" | "assistant";

export default function StudentWorkspace() {
  const { user, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const currentPath = pathname.split("/").pop();
  const tab: Tab = currentPath === "risk" ? "risk" : currentPath === "ai" ? "assistant" : currentPath === "graph" ? "graph" : "dashboard";

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

  const masteryMap = new Map(mastery.map((m) => [m.topic_id, m.mastery]));
  const avgMastery = topics.length > 0
    ? Math.round(topics.reduce((s, t) => s + (masteryMap.get(t.id) ?? 0), 0) / topics.length)
    : 0;
  const topicsStudied = mastery.filter(m => m.mastery > 0).length;

  const tabs: { id: Tab; label: string; hint: string; icon: string }[] = [
    { id: "graph", label: "Knowledge Graph", hint: "What am I missing?", icon: "🗺️" },
    { id: "risk", label: "Risk Analyzer", hint: "Am I at risk?", icon: "📊" },
    { id: "assistant", label: "AI Assistant", hint: "How do I fix it?", icon: "🤖" },
  ];

  return (
    <main className="min-h-screen paper-bg page-enter">
      {/* Top bar removed in favor of AppShell/Sidebar */}

      {/* Quick Stats Bar */}
      {!loading && (
        <section className="max-w-[1500px] mx-auto px-6 md:px-12 pt-8 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Topics Studied", value: `${topicsStudied}/${topics.length}`, color: "text-ink" },
              { label: "Avg Mastery", value: `${avgMastery}%`, color: avgMastery >= 60 ? "text-sage" : "text-terracotta" },
              { label: "Risk Score", value: `${risk.score}`, color: risk.score >= 70 ? "text-terracotta" : risk.score >= 40 ? "text-amber-600" : "text-sage" },
              { label: "Weak Spots", value: `${risk.weakest.length}`, color: risk.weakest.length > 3 ? "text-terracotta" : "text-ink" },
            ].map((s, i) => (
              <div key={i} className="glass-card rounded-lg px-4 py-3 count-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ink-soft">{s.label}</p>
                <p className={`serif text-2xl font-medium ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hero strip */}
      <section className="max-w-[1500px] mx-auto px-6 md:px-12 pt-6 pb-6">
        <p className="eyebrow mb-3">Computer Science · Volume I</p>
        <h1 className="serif text-4xl md:text-5xl text-ink leading-[1]">
          Your <span className="italic text-terracotta">syllabus</span>, mapped.
        </h1>
        <p className="mt-3 text-ink-soft max-w-xl text-sm">
          Explore your knowledge graph, see where you're at risk, and let the assistant patch the gaps.
        </p>
      </section>

      {/* Tab bar removed, controlled by Sidebar links now */}

      {/* Body */}
      <section className="max-w-[1500px] mx-auto px-6 md:px-12 py-8">
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-8 w-48" />
            <div className="skeleton h-[400px] w-full" />
            <div className="grid grid-cols-3 gap-4">
              <div className="skeleton h-32" />
              <div className="skeleton h-32" />
              <div className="skeleton h-32" />
            </div>
          </div>
        ) : tab === "dashboard" ? (
          <StudentDashboard topics={topics} mastery={mastery} />
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
          onAskAI={(t) => { setSelected(t); window.location.href = "/student/ai"; }}
        />
      )}
    </main>
  );
}
