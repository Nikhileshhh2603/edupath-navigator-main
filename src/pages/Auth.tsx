import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(128),
});

const signUpSchema = signInSchema.extend({
  displayName: z.string().trim().min(1, "Required").max(80),
  role: z.enum(["student", "teacher"]),
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [signupRole, setSignupRole] = useState<"student" | "teacher">("student");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && role) {
      const dest = role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student";
      navigate(dest, { replace: true });
    }
  }, [user, role, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ email, password, displayName, role: signupRole });
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: parsed.data.displayName, role: parsed.data.role },
          },
        });
        if (error) { toast.error(error.message); return; }
        toast.success("Account created — signing you in.");
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email, password: parsed.data.password,
        });
        if (error) { toast.error(error.message); return; }
        toast.success("Welcome back.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen paper-bg flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="serif text-2xl text-ink block text-center mb-10">
          EduGraph<span className="text-terracotta">.</span>
        </Link>

        <div className="border border-rule/60 bg-paper/80 backdrop-blur p-8 md:p-10 shadow-[0_30px_80px_-40px_hsl(var(--paper-shadow))]">
          <p className="eyebrow mb-3 text-center">{mode === "signin" ? "Members Entrance" : "Join the Club"}</p>
          <h1 className="serif text-4xl text-ink text-center mb-8">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>

          <form onSubmit={submit} className="space-y-5">
            {mode === "signup" && (
              <>
                <Field label="Display name" value={displayName} onChange={setDisplayName} placeholder="Ada Lovelace" />
                <div>
                  <label className="block text-[0.7rem] tracking-[0.28em] uppercase text-ink-soft mb-2">I am a</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["student", "teacher"] as const).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setSignupRole(r)}
                        className={`border px-4 py-3 text-sm capitalize transition-colors ${
                          signupRole === r
                            ? "border-ink bg-ink text-paper"
                            : "border-rule text-ink hover:border-ink/60"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@university.edu" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

            <button
              type="submit"
              disabled={busy}
              className="oval-btn w-full justify-center disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-soft">
            {mode === "signin" ? "New here? " : "Already a member? "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-terracotta underline-offset-4 hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <p className="mt-4 text-center text-[0.7rem] text-ink-soft/70 italic">
            Admin access is granted manually by existing admins.
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[0.7rem] tracking-[0.28em] uppercase text-ink-soft mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-ink/40 focus:border-ink outline-none py-2 text-ink placeholder:text-ink-soft/40"
      />
    </div>
  );
}
