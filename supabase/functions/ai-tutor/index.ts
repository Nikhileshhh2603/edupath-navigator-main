// EduPath AI Multi-Mode Handler
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context, mode = "tutor", emailData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Mode-specific system prompts
    let systemPrompt = `You are EduPath's AI Assistant. Mode: ${mode}.`;
    
    if (mode === "tutor") {
      systemPrompt = `You are EduPath's AI Study Assistant. Be concise and concrete.
      Use markdown. When helpful, give a one-line intuition and a tiny next step.
      ${context ? `\nStudent context:\n${context}` : ""}`;
    } else if (mode === "story") {
      systemPrompt = `You are generating a "Weekly Learning Story" for a parent about their child's progress.
      Tone: Professional, supportive, and data-driven. 
      Summarize the child's strengths, weaknesses, and upcoming milestones based on the context.
      Format as a warm letter.
      ${context ? `\nProgress Data:\n${context}` : ""}`;
    } else if (mode === "summary") {
      systemPrompt = `You are summarizing a mentoring session between a teacher and a student.
      Extract: 1. Main topics discussed 2. Student's emotional state 3. Concrete action items for the student.
      Use bullet points.`;
    }

    // If it's an email request, we don't stream, we send and return status
    if (mode === "email" && emailData) {
      if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "EduPath <notifications@edupath.edu>",
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
        }),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash",
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...(messages || [])],
      }),
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      throw new Error(`AI gateway: ${upstream.status} ${txt}`);
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    console.error("ai-tutor error", err);
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
