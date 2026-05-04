import { useState } from "react";
import { Topic, logAssessment } from "@/lib/edugraph";
import { toast } from "sonner";

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
  const [score, setScore] = useState(currentMastery || 50);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  if (!topic) return null;
  const prereqs = topic.prerequisite_ids
    .map((id) => topics.find((t) => t.id === id))
    .filter(Boolean) as Topic[];

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg h-full bg-paper border-l border-rule overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-rule/60 flex items-start justify-between">
          <div>
            <p className="eyebrow">Topic · Difficulty {topic.difficulty}/5</p>
            <h2 className="serif text-3xl text-ink mt-2">{topic.name}</h2>
          </div>
          <button onClick={onClose} className="text-ink-soft hover:text-ink text-xl leading-none">×</button>
        </div>

        <div className="px-8 py-6 space-y-6">
          <p className="text-sm text-ink-soft leading-relaxed">{topic.description}</p>

          {prereqs.length > 0 && (
            <div>
              <p className="text-[0.65rem] tracking-[0.3em] uppercase text-ink-soft mb-2">Prerequisites</p>
              <div className="flex flex-wrap gap-2">
                {prereqs.map((p) => (
                  <span key={p.id} className="text-xs border border-rule px-3 py-1 text-ink">{p.name}</span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-rule/60 pt-6">
            <p className="eyebrow mb-4">Quick check-in</p>
            <label className="block text-[0.7rem] tracking-[0.28em] uppercase text-ink-soft mb-2">
              Self-rated mastery: <span className="text-ink">{score}%</span>
            </label>
            <input
              type="range" min={0} max={100} value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-[hsl(15_65%_50%)]"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              placeholder="Optional notes — what's tricky?"
              rows={3}
              className="mt-4 w-full bg-transparent border border-rule p-3 text-sm text-ink outline-none focus:border-ink"
            />
            <div className="mt-5 flex gap-3">
              <button onClick={save} disabled={busy} className="oval-btn flex-1 justify-center disabled:opacity-50">
                {busy ? "Saving…" : "Save check-in"}
              </button>
              <button
                onClick={() => { onAskAI(topic); onClose(); }}
                className="oval-btn flex-1 justify-center bg-ink text-paper border-ink hover:bg-ink/90"
              >
                Ask AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
