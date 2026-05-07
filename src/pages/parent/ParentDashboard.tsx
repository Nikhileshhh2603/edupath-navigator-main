import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, ShieldAlert, CalendarDays, TrendingUp, Megaphone, BookOpen, Sparkles, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [story, setStory] = useState("");

  const generateStory = async () => {
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const context = "CGPA: 8.2, Attendance: 87%, Risk: 32 (Low). Recent topics: Hash Tables, Graph Theory. Midterms upcoming.";
      
      const res = await fetch(`https://obsrszntqrucnqaflula.supabase.co/functions/v1/ai-tutor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ mode: "story", context }),
      });

      if (!res.ok) throw new Error("Could not generate story");
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      
      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.slice(5));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                setStory(fullText);
              }
            } catch (e) {}
          }
        }
      }
      toast.success("Learning story generated!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 page-enter" id="parent-report-area">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Parent Dashboard</h1>
          <p className="text-ink-soft text-sm mt-1">Monitor your child's academic progress and well-being.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={generateStory} 
            disabled={busy}
            className="flex items-center gap-2 bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {busy ? "Generating..." : "AI Learning Story"}
          </button>
        </div>
      </div>

      {story && (
        <div className="bg-paper border-2 border-sage/30 rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-sage/10 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-sage" />
            </div>
            <h2 className="serif text-2xl text-ink">Weekly Learning Story</h2>
          </div>
          <div className="prose prose-sm max-w-none prose-p:text-ink-soft prose-p:leading-relaxed">
            <ReactMarkdown>{story}</ReactMarkdown>
          </div>
          <div className="mt-6 pt-6 border-t border-ink/5 flex justify-end">
            <button className="text-xs text-ink-soft hover:text-terracotta transition-colors">
              📧 Email this to me
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "CGPA", value: "8.2", color: "text-sage", icon: TrendingUp },
          { label: "Attendance", value: "87%", color: "text-ink", icon: CalendarDays },
          { label: "Risk Score", value: "32", color: "text-sage", icon: ShieldAlert },
          { label: "Assignments", value: "12/14", color: "text-ink", icon: BookOpen },
        ].map((s, i) => (
          <div key={i} className="bg-paper border border-ink/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-ink-soft" />
              <p className="text-xs text-ink-soft font-medium uppercase tracking-wider">{s.label}</p>
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-paper border border-ink/10 rounded-lg p-6">
          <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-ink-soft" />
            Recent Attendance
          </h2>
          <div className="space-y-3">
            {["May 7 - Present", "May 6 - Present", "May 5 - Late", "May 4 - Present", "May 3 - Absent"].map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-ink/5 pb-2">
                <span className="text-ink">{d.split(" - ")[0]}</span>
                <span className={`font-medium ${d.includes("Absent") ? "text-terracotta" : d.includes("Late") ? "text-amber-600" : "text-sage"}`}>
                  {d.split(" - ")[1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-paper border border-ink/10 rounded-lg p-6">
          <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-ink-soft" />
            Announcements
          </h2>
          <div className="space-y-3">
            <div className="border-l-2 border-sage pl-3 py-1">
              <h4 className="text-sm font-medium text-ink">Midterm Schedule Released</h4>
              <p className="text-xs text-ink-soft">Exams begin May 12</p>
            </div>
            <div className="border-l-2 border-ink/20 pl-3 py-1">
              <h4 className="text-sm font-medium text-ink">Parent-Teacher Meeting</h4>
              <p className="text-xs text-ink-soft">Scheduled for May 15 at 3 PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-sage/10 border border-sage/20 rounded-lg p-6">
        <h2 className="font-semibold text-sage mb-3">Mentor Contact</h2>
        <p className="text-sm text-ink-soft">Your child's mentor is <span className="font-medium text-ink">Prof. Sharma</span>. Last session: May 3, 2026.</p>
        <button className="mt-3 bg-sage text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-sage/90 transition-colors">
          Request Meeting
        </button>
      </div>
    </div>
  );
}
