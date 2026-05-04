import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "react-router-dom";

export default function Dashboard({ role }: { role: "student" | "teacher" | "admin" }) {
  const { user, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  const config: Record<string, { title: string; subtitle: string; features: { icon: string; label: string; desc: string }[] }> = {
    teacher: {
      title: "Teacher Console",
      subtitle: "Curate curricula, monitor cohort risk, and respond to AI insights.",
      features: [
        { icon: "📊", label: "Cohort Analytics", desc: "View aggregate mastery and risk across all your students in real-time." },
        { icon: "🗺️", label: "Curriculum Builder", desc: "Design and modify knowledge graphs for your courses." },
        { icon: "⚡", label: "Risk Alerts", desc: "Get notified when students cross risk thresholds." },
        { icon: "💬", label: "AI Insights", desc: "Review AI-generated learning stories and recommendations." },
        { icon: "📝", label: "Assignment Tracker", desc: "Monitor submission rates and identify struggling students." },
        { icon: "📈", label: "Progress Reports", desc: "Generate detailed progress reports for parent meetings." },
      ],
    },
    admin: {
      title: "Admin Control Room",
      subtitle: "Manage users, roles, and platform health.",
      features: [
        { icon: "👥", label: "User Management", desc: "Add, remove, and manage user accounts and roles." },
        { icon: "🔒", label: "Access Control", desc: "Configure permissions and role-based access." },
        { icon: "📊", label: "Platform Analytics", desc: "Monitor usage metrics and system performance." },
        { icon: "🏫", label: "School Settings", desc: "Configure institutional settings and branding." },
        { icon: "📋", label: "Audit Logs", desc: "Review all system activities and changes." },
        { icon: "⚙️", label: "System Config", desc: "Manage integrations, API keys, and system settings." },
      ],
    },
    student: {
      title: "Student Workspace",
      subtitle: "Your knowledge graph, risk score, and AI study assistant.",
      features: [],
    },
  };

  const { title, subtitle, features } = config[role];

  return (
    <main className="min-h-screen paper-bg page-enter">
      <header className="border-b border-rule/60 bg-paper/80 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-[1300px] mx-auto px-6 md:px-12 py-4">
          <Link to="/" className="serif text-2xl text-ink">
            EduGraph<span className="text-terracotta">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <span className="text-sm text-ink-soft hidden md:inline">{user?.email}</span>
            <span className="badge badge-terracotta">{role}</span>
            <button onClick={signOut} className="oval-btn text-xs px-4 py-2">Sign Out</button>
          </div>
        </div>
      </header>

      <section className="max-w-[1300px] mx-auto px-6 md:px-12 mt-16 text-center">
        <p className="eyebrow mb-4">Plate № 0{role === "admin" ? 3 : role === "teacher" ? 2 : 1}</p>
        <h1 className="serif text-5xl md:text-7xl text-ink leading-[0.95]">
          {title.split(" ").map((w, i) => (
            <span key={i} className={i === 1 ? "italic text-terracotta" : ""}>{w} </span>
          ))}
        </h1>
        <p className="mt-6 text-ink-soft max-w-xl mx-auto leading-relaxed">{subtitle}</p>
      </section>

      {features.length > 0 && (
        <section className="max-w-[1300px] mx-auto px-6 md:px-12 mt-16 mb-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 count-up cursor-default"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="serif text-xl text-ink mb-2">{f.label}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{f.desc}</p>
                <div className="mt-4 h-1.5 bg-rule/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-terracotta/40 rounded-full progress-animate"
                    style={{ width: `${30 + Math.random() * 50}%`, animationDelay: `${0.3 + i * 0.1}s` }}
                  />
                </div>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ink-soft/60 mt-2">Coming Soon</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/predictor" className="oval-btn">
              Try Student Predictor →
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
