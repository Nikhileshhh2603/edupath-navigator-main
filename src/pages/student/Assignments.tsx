import { ListTodo, Clock, CheckCircle, AlertTriangle, Upload } from "lucide-react";
import { useSemester } from "@/hooks/use-semester";

const mockAssignments = [
  { id: 1, title: "Binary Search Implementation", subject: "Data Structures", due: "2026-05-10", status: "pending" },
  { id: 2, title: "OS Process Scheduling Report", subject: "Operating Systems", due: "2026-05-08", status: "overdue" },
  { id: 3, title: "ER Diagram - Library System", subject: "Database Systems", due: "2026-05-12", status: "pending" },
  { id: 4, title: "TCP/IP Protocol Analysis", subject: "Computer Networks", due: "2026-05-05", status: "submitted" },
  { id: 5, title: "Regex Pattern Matching Lab", subject: "Compiler Design", due: "2026-04-28", status: "graded", grade: "A" },
  { id: 6, title: "Sorting Algorithms Comparison", subject: "Data Structures", due: "2026-04-20", status: "graded", grade: "B+" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",   color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  submitted: { label: "Submitted", color: "text-blue-600",  bg: "bg-blue-50 border-blue-200",   icon: <Upload className="w-3.5 h-3.5" /> },
  overdue:   { label: "Overdue",   color: "text-terracotta", bg: "bg-red-50 border-red-200",     icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  graded:    { label: "Graded",    color: "text-sage",       bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

export default function Assignments() {
  const { selectedSemester } = useSemester();

  const grouped = mockAssignments.reduce<Record<string, typeof mockAssignments>>((acc, a) => {
    (acc[a.subject] ??= []).push(a);
    return acc;
  }, {});

  const pending = mockAssignments.filter(a => a.status === "pending").length;
  const overdue = mockAssignments.filter(a => a.status === "overdue").length;
  const submitted = mockAssignments.filter(a => a.status === "submitted" || a.status === "graded").length;

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-ink">Assignments & Tasks</h1>
        <p className="text-ink-soft text-sm mt-1">Semester: {selectedSemester}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{pending}</p>
          <p className="text-xs text-amber-700 font-medium mt-1">Pending</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-terracotta">{overdue}</p>
          <p className="text-xs text-red-700 font-medium mt-1">Overdue</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-sage">{submitted}</p>
          <p className="text-xs text-emerald-700 font-medium mt-1">Completed</p>
        </div>
      </div>

      {/* Grouped by subject */}
      {Object.entries(grouped).map(([subject, tasks]) => {
        const done = tasks.filter(t => t.status === "graded" || t.status === "submitted").length;
        const pct = Math.round((done / tasks.length) * 100);
        return (
          <div key={subject} className="bg-paper border border-ink/10 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-ink/10 bg-ink/5 flex items-center justify-between">
              <h2 className="font-semibold text-ink flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-ink-soft" />
                {subject}
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-ink/10 rounded-full overflow-hidden">
                  <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-medium text-ink-soft">{pct}%</span>
              </div>
            </div>
            <div className="divide-y divide-ink/5">
              {tasks.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()).map(task => {
                const cfg = statusConfig[task.status];
                return (
                  <div key={task.id} className="flex items-center justify-between px-4 py-3 hover:bg-ink/5 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-ink">{task.title}</p>
                      <p className="text-xs text-ink-soft">Due: {task.due}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {"grade" in task && task.grade && (
                        <span className="text-xs font-bold text-sage bg-sage/10 px-2 py-0.5 rounded">{task.grade}</span>
                      )}
                      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      {task.status === "pending" && (
                        <button className="text-xs bg-sage text-paper px-3 py-1 rounded-md hover:bg-sage/90 transition-colors">
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
