import { useAuth } from "@/hooks/use-auth";
import { Users, ShieldAlert, BookOpen, Briefcase, TrendingUp, CalendarDays, HeartPulse, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard({ role }: { role: "teacher" | "admin" }) {
  const { user } = useAuth();

  if (role === "teacher") {
    return (
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-bold text-ink">Teacher Dashboard</h1>
          <p className="text-ink-soft text-sm mt-1">Welcome back, {user?.email?.split("@")[0] || "Teacher"}.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: "64", icon: Users, color: "text-ink" },
            { label: "At Risk", value: "8", icon: ShieldAlert, color: "text-terracotta" },
            { label: "Avg Mastery", value: "62%", icon: TrendingUp, color: "text-sage" },
            { label: "Pulse Critical", value: "3", icon: HeartPulse, color: "text-terracotta" },
          ].map((s, i) => (
            <div key={i} className="bg-paper border border-ink/10 rounded-lg p-4 count-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-4 h-4 text-ink-soft" />
                <p className="text-xs text-ink-soft font-medium uppercase tracking-wider">{s.label}</p>
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Link to="/teacher/roster" className="block bg-paper border border-ink/10 rounded-lg p-6 hover:border-sage/40 hover:shadow-sm transition-all group">
            <h2 className="font-semibold text-ink group-hover:text-sage transition-colors flex items-center gap-2">
              <Users className="w-5 h-5" /> Risk-Sorted Roster
            </h2>
            <p className="text-sm text-ink-soft mt-2">View all students sorted by risk score with pulse indicators.</p>
          </Link>
          <Link to="/teacher/mentees" className="block bg-paper border border-ink/10 rounded-lg p-6 hover:border-sage/40 hover:shadow-sm transition-all group">
            <h2 className="font-semibold text-ink group-hover:text-sage transition-colors flex items-center gap-2">
              <HeartPulse className="w-5 h-5" /> My Mentees
            </h2>
            <p className="text-sm text-ink-soft mt-2">Monitor assigned mentees and schedule sessions.</p>
          </Link>
          <Link to="/teacher/assignments" className="block bg-paper border border-ink/10 rounded-lg p-6 hover:border-sage/40 hover:shadow-sm transition-all group">
            <h2 className="font-semibold text-ink group-hover:text-sage transition-colors flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Assignment Tracker
            </h2>
            <p className="text-sm text-ink-soft mt-2">Track submissions, grade, and identify struggling students.</p>
          </Link>
          <Link to="/teacher/graph" className="block bg-paper border border-ink/10 rounded-lg p-6 hover:border-sage/40 hover:shadow-sm transition-all group">
            <h2 className="font-semibold text-ink group-hover:text-sage transition-colors flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Class Knowledge Graph
            </h2>
            <p className="text-sm text-ink-soft mt-2">Visualize aggregate mastery across your cohort.</p>
          </Link>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-ink">Admin Control Room</h1>
        <p className="text-ink-soft text-sm mt-1">Manage users, departments, and platform health.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "1,296", icon: Users, color: "text-ink" },
          { label: "Departments", value: "8", icon: Briefcase, color: "text-ink" },
          { label: "Active Semester", value: "Spring '26", icon: CalendarDays, color: "text-sage" },
          { label: "Announcements", value: "5", icon: Megaphone, color: "text-ink" },
        ].map((s, i) => (
          <div key={i} className="bg-paper border border-ink/10 rounded-lg p-4 count-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-ink-soft" />
              <p className="text-xs text-ink-soft font-medium uppercase tracking-wider">{s.label}</p>
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link to="/admin/users" className="block bg-paper border border-ink/10 rounded-lg p-6 hover:border-sage/40 hover:shadow-sm transition-all group">
          <h2 className="font-semibold text-ink group-hover:text-sage transition-colors flex items-center gap-2">
            <Users className="w-5 h-5" /> User & Mentor Management
          </h2>
          <p className="text-sm text-ink-soft mt-2">Add, remove, and assign mentors to students.</p>
        </Link>
        <Link to="/admin/departments" className="block bg-paper border border-ink/10 rounded-lg p-6 hover:border-sage/40 hover:shadow-sm transition-all group">
          <h2 className="font-semibold text-ink group-hover:text-sage transition-colors flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> Departments
          </h2>
          <p className="text-sm text-ink-soft mt-2">Configure departments and their resource allocations.</p>
        </Link>
        <Link to="/admin/semesters" className="block bg-paper border border-ink/10 rounded-lg p-6 hover:border-sage/40 hover:shadow-sm transition-all group">
          <h2 className="font-semibold text-ink group-hover:text-sage transition-colors flex items-center gap-2">
            <CalendarDays className="w-5 h-5" /> Semesters
          </h2>
          <p className="text-sm text-ink-soft mt-2">Manage academic periods and calendars.</p>
        </Link>
        <Link to="/admin/announcements" className="block bg-paper border border-ink/10 rounded-lg p-6 hover:border-sage/40 hover:shadow-sm transition-all group">
          <h2 className="font-semibold text-ink group-hover:text-sage transition-colors flex items-center gap-2">
            <Megaphone className="w-5 h-5" /> Announcements
          </h2>
          <p className="text-sm text-ink-soft mt-2">Broadcast messages to students and faculty.</p>
        </Link>
      </div>
    </div>
  );
}
