import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";

export default function Dashboard({ role }: { role: "student" | "teacher" | "admin" }) {
  const { user, signOut } = useAuth();
  const titles: Record<string, string> = {
    student: "Student Workspace",
    teacher: "Teacher Console",
    admin: "Admin Control Room",
  };
  const blurbs: Record<string, string> = {
    student: "Your knowledge graph, risk score, and AI study assistant — coming online.",
    teacher: "Curate curricula, monitor cohort risk, and respond to AI insights.",
    admin: "Manage users, roles, and platform health.",
  };

  return (
    <main className="min-h-screen paper-bg px-6 md:px-12 py-10">
      <header className="flex items-center justify-between max-w-[1300px] mx-auto">
        <Link to="/" className="serif text-2xl text-ink">
          EduGraph<span className="text-terracotta">.</span>
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-sm text-ink-soft hidden md:inline">{user?.email}</span>
          <span className="text-[0.65rem] tracking-[0.3em] uppercase border border-rule px-3 py-1 text-ink-soft">
            {role}
          </span>
          <button onClick={signOut} className="oval-btn">Sign Out</button>
        </div>
      </header>

      <section className="max-w-[1100px] mx-auto mt-24 text-center">
        <p className="eyebrow mb-6">Plate № 0{role === "admin" ? 3 : role === "teacher" ? 2 : 1}</p>
        <h1 className="serif text-6xl md:text-7xl text-ink leading-[0.95]">
          {titles[role].split(" ").map((w, i) => (
            <span key={i} className={i === 1 ? "italic text-terracotta" : ""}>{w} </span>
          ))}
        </h1>
        <p className="mt-8 text-ink-soft max-w-xl mx-auto leading-relaxed">{blurbs[role]}</p>
      </section>
    </main>
  );
}
