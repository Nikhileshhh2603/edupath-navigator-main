import { useState } from "react";
import { Bot, FileText, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function SessionManager({ studentId, mentorId }: { studentId: string, mentorId: string }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ ai_summary: string, action_items: string[] } | null>(null);

  const handleGenerateSummary = async () => {
    if (!notes.trim()) {
      toast.error("Please enter session notes first");
      return;
    }
    setLoading(true);
    try {
      // Create session first
      const { data: sessionData, error: sessionError } = await supabase
        .from('mentoring_sessions')
        .insert({
          mentor_id: mentorId,
          student_id: studentId,
          transcript: notes,
          status: 'completed'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Invoke Edge Function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-session-summary', {
        body: { notes }
      });

      if (functionError) throw functionError;
      
      setSummary(functionData);

      // Save summary back to session
      if (functionData) {
        await supabase
          .from('mentoring_sessions')
          .update({
            ai_summary: functionData.ai_summary,
            action_items: functionData.action_items
          })
          .eq('id', sessionData.id);
          
        await supabase
          .from('mentoring_notes')
          .insert({
            session_id: sessionData.id,
            note_text: notes,
            created_by: mentorId
          });
      }

      toast.success("Session summarized and saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to process session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pre-Session Briefing Card */}
      <div className="bg-sage/10 border border-sage/20 rounded-lg p-5">
        <h3 className="font-semibold text-sage flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" />
          Pre-Session Briefing
        </h3>
        <ul className="space-y-2 text-sm text-ink-soft">
          <li>• Risk score has increased by 5 points since last week.</li>
          <li>• Missed 2 consecutive assignments in Data Structures.</li>
          <li>• Pulse check trend is downward (🔴). Needs motivation.</li>
        </ul>
      </div>

      {/* Session Notes Entry */}
      <div className="bg-paper border border-ink/20 rounded-lg overflow-hidden flex flex-col">
        <div className="p-3 border-b border-ink/10 bg-ink/5 flex items-center gap-2">
          <FileText className="w-4 h-4 text-ink-soft" />
          <span className="font-medium text-sm text-ink">Session Transcript & Notes</span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste transcript or type session notes here..."
          className="w-full h-40 p-4 resize-none focus:outline-none bg-transparent text-sm"
        />
        <div className="p-3 border-t border-ink/10 bg-ink/5 flex justify-end">
          <button 
            onClick={handleGenerateSummary}
            disabled={loading}
            className="flex items-center gap-2 bg-sage text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-sage/90 transition-colors disabled:opacity-50"
          >
            {loading ? <span className="animate-pulse">Analyzing...</span> : <><Bot className="w-4 h-4" /> Generate Summary</>}
          </button>
        </div>
      </div>

      {/* Post-Session AI Summary */}
      {summary && (
        <div className="bg-paper-light border border-ink/10 rounded-lg p-5 space-y-4">
          <h3 className="font-semibold text-ink flex items-center gap-2">
            <Bot className="w-5 h-5 text-terracotta" />
            AI Summary
          </h3>
          <p className="text-sm text-ink-soft leading-relaxed">{summary.ai_summary}</p>
          
          <div className="mt-4">
            <h4 className="font-medium text-ink text-sm mb-2">Action Items</h4>
            <ul className="space-y-2">
              {summary.action_items?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-ink-soft">
                  <span className="text-sage mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
