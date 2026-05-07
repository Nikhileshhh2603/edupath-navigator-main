import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Network, 
  ShieldAlert, 
  Bot, 
  ListTodo, 
  CalendarDays, 
  HeartPulse, 
  Users, 
  Briefcase, 
  Megaphone,
  GraduationCap
} from "lucide-react";

export function Sidebar() {
  const { pathname } = useLocation();
  const { role } = useAuth();

  const navItems = [
    { section: "Student", items: [
      { name: "Dashboard", path: "/student", icon: LayoutDashboard },
      { name: "Knowledge Graph", path: "/student/graph", icon: Network },
      { name: "Risk Analyzer", path: "/student/risk", icon: ShieldAlert },
      { name: "AI Assistant", path: "/student/ai", icon: Bot },
      { name: "Assignments", path: "/student/tasks", icon: ListTodo },
      { name: "Attendance", path: "/student/attendance", icon: CalendarDays },
      { name: "Pulse Check", path: "/student/pulse", icon: HeartPulse },
    ]},
    { section: "Teacher", items: [
      { name: "Dashboard", path: "/teacher", icon: LayoutDashboard },
      { name: "Roster", path: "/teacher/roster", icon: Users },
      { name: "My Mentees", path: "/teacher/mentees", icon: HeartPulse },
      { name: "Assignments", path: "/teacher/assignments", icon: ListTodo },
      { name: "Class Graph", path: "/teacher/graph", icon: Network },
    ]},
    { section: "Admin", items: [
      { name: "Users", path: "/admin/users", icon: Users },
      { name: "Departments", path: "/admin/departments", icon: Briefcase },
      { name: "Semesters", path: "/admin/semesters", icon: CalendarDays },
      { name: "Announcements", path: "/admin/announcements", icon: Megaphone },
    ]}
  ];

  const visibleItems = navItems.filter((group) => group.section.toLowerCase() === role);

  return (
    <aside className="w-64 border-r border-ink/10 bg-paper-light flex flex-col min-h-screen">
      <div className="p-6 border-b border-ink/10 flex items-center gap-3">
        <div className="bg-sage text-paper p-2 rounded-lg">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-ink">EduPath</h1>
          <p className="text-xs text-ink-soft">Mentoring Platform</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {visibleItems.map((group) => (
          <div key={group.section}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3 px-3">
              {group.section}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? "bg-sage/10 text-sage font-medium" 
                        : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
