import { useState, useEffect } from "react";
import { Topic, logAssessment, masteryColor } from "@/lib/edugraph";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import MDEditor from '@uiw/react-md-editor';

interface Props {
  topic: Topic | null;
  topics: Topic[];
  userId: string;
  currentMastery: number;
  onClose: () => void;
  onSaved: () => void;
  onAskAI: (t: Topic) => void;
}

export const TopicDrawer = ({ topic, topics, userId, currentMastery, onClose, onSaved, onAskAI }: Props) => {
  const { role } = useAuth();
  const [score, setScore] = useState(currentMastery || 50);
  const [notes, setNotes] = useState("");
  const [topicNotes, setTopicNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"info" | "notes" | "edit">("info");

  useEffect(() => {
    setScore(currentMastery || 50);
    setNotes("");
    if (topic) fetchTopicNotes(topic.id);
  }, [topic?.id, currentMastery]);

  const fetchTopicNotes = async (id: string) => {
    const { data, error } = await supabase.from("topic_notes").select("content").eq("topic_id", id).maybeSingle();
    if (data) setTopicNotes(data.content);
    else setTopicNotes("");
  };

  const saveTeacherNotes = async () => {
    if (!topic) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("topic_notes").upsert({
        topic_id: topic.id,
        content: topicNotes,
        title: topic.name,
        created_by: userId
      }, { onConflict: "topic_id" });
      if (error) throw error;
      toast.success("Notes saved for the class!");
      setTab("notes");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!topic) return null;
  const prereqs = topic.prerequisite_ids
    .map((id) => topics.find((t) => t.id === id))
    .filter(Boolean) as Topic[];

  const dependents = topics.filter(t =>
    t.prerequisite_ids.includes(topic.id)
  );

  const save = async () => {
    setBusy(true);
    try {
      await logAssessment(userId, topic.id, score, notes || undefined);
      toast.success("Check-in saved.");
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const difficultyLabel = ["Beginner", "Easy", "Medium", "Hard", "Expert"][topic.difficulty - 1] ?? "Unknown";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm fade-in" />
      <div
        className="relative w-full max-w-xl h-full bg-paper border-l border-rule overflow-y-auto slide-in-right custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-rule/60 flex items-start justify-between sticky top-0 bg-paper/95 backdrop-blur-sm z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${topic.difficulty >= 4 ? "badge-terracotta" : topic.difficulty >= 2 ? "badge-amber" : "badge-sage"}`}>
                {difficultyLabel}
              </span>
              <span className="text-[0.6rem] tracking-[0.2em] uppercase text-ink-soft">
                Difficulty {topic.difficulty}/5
              </span>
            </div>
            <h2 className="serif text-3xl text-ink">{topic.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-ink-soft hover:text-ink text-xl leading-none p-2 hover:bg-ink/5 rounded-full transition-colors"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 mt-4 flex gap-6 border-b border-rule/30">
          <button onClick={() => setTab("info")} className={`pb-2 text-sm font-medium transition-colors ${tab === "info" ? "text-terracotta border-b-2 border-terracotta" : "text-ink-soft hover:text-ink"}`}>Info</button>
          <button onClick={() => setTab("notes")} className={`pb-2 text-sm font-medium transition-colors ${tab === "notes" ? "text-terracotta border-b-2 border-terracotta" : "text-ink-soft hover:text-ink"}`}>Study Notes</button>
          {(role === "teacher" || role === "admin") && (
            <button onClick={() => setTab("edit")} className={`pb-2 text-sm font-medium transition-colors ${tab === "edit" ? "text-terracotta border-b-2 border-terracotta" : "text-ink-soft hover:text-ink"}`}>Edit Notes</button>
          )}
        </div>

        <div className="px-8 py-6 space-y-6">
          {tab === "info" && (
            <>
              <p className="text-sm text-ink-soft leading-relaxed">{topic.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ink-soft mb-1.5">Current Mastery</p>
                  <div className="h-2 bg-rule/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full progress-animate transition-all duration-500"
                      style={{ width: `${currentMastery}%`, background: masteryColor(currentMastery) }}
                    />
                  </div>
                </div>
                <span className="serif text-2xl font-medium" style={{ color: masteryColor(currentMastery) }}>
                  {currentMastery}%
                </span>
              </div>

              {prereqs.length > 0 && (
                <div>
                  <p className="text-[0.65rem] tracking-[0.3em] uppercase text-ink-soft mb-2">Prerequisites</p>
                  <div className="flex flex-wrap gap-2">
                    {prereqs.map((p) => (
                      <span key={p.id} className="text-xs border border-rule rounded-lg px-3 py-1.5 text-ink">
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-rule/60 pt-6">
                <p className="eyebrow mb-4">Quick check-in</p>
                <label className="block text-[0.7rem] tracking-[0.28em] uppercase text-ink-soft mb-3">
                  Self-rated mastery: <span className="serif text-lg font-medium" style={{ color: masteryColor(score) }}>{score}%</span>
                </label>
                <div className="relative">
                  <input
                    type="range" min={0} max={100} value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full accent-[hsl(15_65%_50%)] h-2"
                  />
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  placeholder="Optional notes — what's tricky?"
                  rows={3}
                  className="mt-4 w-full bg-transparent border border-rule rounded-lg p-3 text-sm text-ink outline-none focus:border-terracotta transition-colors resize-none"
                />
                <div className="mt-4 flex gap-3">
                  <button onClick={save} disabled={busy} className="oval-btn flex-1 justify-center disabled:opacity-50">
                    {busy ? "Saving…" : "Save check-in"}
                  </button>
                  <button onClick={() => { onAskAI(topic); onClose(); }} className="oval-btn oval-btn-solid flex-1 justify-center">🤖 Ask AI</button>
                </div>
              </div>
            </>
          )}

          {tab === "notes" && (
            <div className="prose prose-sm max-w-none">
              {topicNotes ? (
                <MDEditor.Markdown source={topicNotes} style={{ background: 'transparent', color: 'inherit' }} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-ink-soft italic">No study notes available for this topic yet.</p>
                  {(role === "teacher" || role === "admin") && (
                    <button onClick={() => setTab("edit")} className="mt-4 text-terracotta hover:underline text-sm font-medium">Write some notes?</button>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "edit" && (
            <div className="space-y-4">
              <MDEditor
                value={topicNotes}
                onChange={(v) => setTopicNotes(v || "")}
                preview="edit"
                height={400}
                className="rounded-lg overflow-hidden border border-rule"
              />
              <button 
                onClick={saveTeacherNotes} 
                disabled={busy} 
                className="oval-btn w-full justify-center disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save Notes for Class"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
