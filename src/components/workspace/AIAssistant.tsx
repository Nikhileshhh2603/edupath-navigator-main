import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Topic, Mastery } from "@/lib/edugraph";

type Msg = { role: "user" | "assistant"; content: string };

interface Props {
  topics: Topic[];
  mastery: Mastery[];
  selectedTopic?: Topic | null;
}

export const AIAssistant = ({ topics, mastery, selectedTopic }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const buildContext = () => {
    const masteryMap = new Map(mastery.map((m) => [m.topic_id, m.mastery]));
    const weakest = [...topics].sort((a, b) => (masteryMap.get(a.id) ?? 0) - (masteryMap.get(b.id) ?? 0)).slice(0, 5);
    const lines = [
      `Top weak topics: ${weakest.map((t) => `${t.name} (${masteryMap.get(t.id) ?? 0}%)`).join(", ")}`,
    ];
    if (selectedTopic) lines.push(`Currently focused topic: ${selectedTopic.name} — ${selectedTopic.description ?? ""}`);
    return lines.join("\n");
  };

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `https://obsrszntqrucnqaflula.supabase.co/functions/v1/ai-tutor`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ messages: next, context: buildContext() }),
      });

      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error || "Assistant unavailable.");
        setBusy(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistant = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const payload = t.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages((m) => {
                const copy = m.slice();
                copy[copy.length - 1] = { role: "assistant", content: assistant };
                return copy;
              });
            }
          } catch { /* ignore partial */ }
        }
      }
    } catch (err: any) {
      toast.error(err.message ?? "Network error");
    } finally {
      setBusy(false);
    }
  };

  const suggestions = selectedTopic
    ? [
        `Explain ${selectedTopic.name} in 60 seconds`,
        `Give me a 5-minute exercise on ${selectedTopic.name}`,
        `What should I learn before ${selectedTopic.name}?`,
      ]
    : [
        "What should I study next?",
        "Quiz me on my weakest topic",
        "Give me a 30-min study plan for tonight",
      ];

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6 h-[640px]">
      <div className="border border-rule/60 bg-paper/70 flex flex-col">
        <div className="px-6 py-4 border-b border-rule/60 flex items-center justify-between">
          <p className="eyebrow">AI Study Assistant</p>
          {selectedTopic && (
            <span className="text-xs text-ink-soft">
              Focus: <span className="text-terracotta italic">{selectedTopic.name}</span>
            </span>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center mt-10">
              <p className="serif italic text-3xl text-ink">How can I help you study?</p>
              <p className="text-sm text-ink-soft mt-3 max-w-md mx-auto">
                I have context about your knowledge graph, weak topics, and current focus.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-ink text-paper"
                    : "bg-paper border border-rule/60 text-ink prose prose-sm max-w-none prose-headings:serif prose-p:my-2 prose-pre:bg-ink prose-pre:text-paper prose-code:text-terracotta"
                }`}
              >
                {m.role === "assistant" ? <ReactMarkdown>{m.content || "…"}</ReactMarkdown> : m.content}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="border-t border-rule/60 px-6 py-4 flex items-center gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your studies…"
            className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-soft/50"
          />
          <button type="submit" disabled={busy || !input.trim()} className="oval-btn disabled:opacity-50">
            {busy ? "…" : "Send"}
          </button>
        </form>
      </div>

      <aside className="border border-rule/60 bg-paper/70 p-6 overflow-y-auto">
        <p className="eyebrow mb-4">Try asking</p>
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                onClick={() => send(s)}
                className="text-left text-sm text-ink hover:text-terracotta transition-colors"
              >
                ✦ {s}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};
