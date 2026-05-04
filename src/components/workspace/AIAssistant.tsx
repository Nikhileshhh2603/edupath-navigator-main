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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const buildContext = () => {
    const masteryMap = new Map(mastery.map((m) => [m.topic_id, m.mastery]));
    const weakest = [...topics].sort((a, b) => (masteryMap.get(a.id) ?? 0) - (masteryMap.get(b.id) ?? 0)).slice(0, 5);
    const lines = [
      `Top weak topics: ${weakest.map((t) => `${t.name} (${masteryMap.get(t.id) ?? 0}%)`).join(", ")}`,
    ];
    if (selectedTopic) lines.push(`Currently focused topic: ${selectedTopic.name} — ${selectedTopic.description ?? ""}`);
    return lines.join("\n");
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
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
        "Explain my biggest knowledge gaps",
      ];

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6 h-[640px]">
      <div className="glass-card rounded-xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-rule/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <p className="eyebrow">AI Study Assistant</p>
          </div>
          {selectedTopic && (
            <span className="badge badge-terracotta">
              Focus: {selectedTopic.name}
            </span>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center mt-16">
              <span className="text-5xl block mb-4">📚</span>
              <p className="serif italic text-3xl text-ink">How can I help you study?</p>
              <p className="text-sm text-ink-soft mt-3 max-w-md mx-auto leading-relaxed">
                I have context about your knowledge graph, weak topics, and current focus. Ask me anything!
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {suggestions.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs border border-rule/60 rounded-full px-4 py-2 text-ink-soft hover:border-terracotta hover:text-terracotta transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`group relative max-w-[78%] px-4 py-3 text-sm leading-relaxed rounded-xl ${
                  m.role === "user"
                    ? "bg-ink text-paper rounded-br-sm"
                    : "bg-paper border border-rule/60 text-ink rounded-bl-sm prose prose-sm max-w-none prose-headings:serif prose-p:my-2 prose-pre:bg-ink prose-pre:text-paper prose-code:text-terracotta"
                }`}
              >
                {m.role === "assistant" ? <ReactMarkdown>{m.content || "…"}</ReactMarkdown> : m.content}
                {/* Copy button */}
                {m.content && (
                  <button
                    onClick={() => copyMessage(m.content)}
                    className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 text-[0.6rem] text-ink-soft hover:text-ink transition-all"
                  >
                    📋 Copy
                  </button>
                )}
              </div>
            </div>
          ))}
          {busy && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-paper border border-rule/60 rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="border-t border-rule/40 px-6 py-4 flex items-center gap-3"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your studies…"
            className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-soft/50"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="oval-btn disabled:opacity-30 text-xs px-5 py-2"
          >
            {busy ? "…" : "Send →"}
          </button>
        </form>
      </div>

      <aside className="glass-card rounded-xl p-6 overflow-y-auto custom-scrollbar hidden lg:block">
        <p className="eyebrow mb-4">Try asking</p>
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                onClick={() => send(s)}
                className="text-left text-sm text-ink hover:text-terracotta transition-colors leading-snug"
              >
                <span className="text-terracotta mr-1.5">✦</span>{s}
              </button>
            </li>
          ))}
        </ul>

        {messages.length > 0 && (
          <div className="mt-6 pt-4 border-t border-rule/40">
            <button
              onClick={() => setMessages([])}
              className="text-xs text-ink-soft hover:text-terracotta transition-colors"
            >
              🗑️ Clear conversation
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
