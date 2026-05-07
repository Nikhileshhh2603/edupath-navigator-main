import { ListTodo, Plus, Users, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const mockAssignments = [
  { id: 1, title: "Binary Search Implementation", subject: "Data Structures", due: "2026-05-10", total: 65, submitted: 48 },
  { id: 2, title: "OS Process Scheduling Report", subject: "Operating Systems", due: "2026-05-08", total: 60, submitted: 32 },
  { id: 3, title: "ER Diagram - Library System", subject: "Database Systems", due: "2026-05-12", total: 58, submitted: 12 },
  { id: 4, title: "TCP/IP Protocol Analysis", subject: "Computer Networks", due: "2026-05-05", total: 55, submitted: 55 },
];

export default function TeacherAssignments() {
  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Assignment Manager</h1>
          <p className="text-ink-soft text-sm mt-1">Track and grade student submissions.</p>
        </div>
        <button className="flex items-center gap-2 bg-sage text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-sage/90 transition-colors">
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>
      <div className="space-y-4">
        {mockAssignments.map(a => {
          const pct = Math.round((a.submitted / a.total) * 100);
          const isPastDue = new Date(a.due) < new Date();
          return (
            <div key={a.id} className="bg-paper border border-ink/10 rounded-lg p-5 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-ink-soft bg-ink/5 px-2 py-0.5 rounded">{a.subject}</span>
                    <span className="text-xs text-ink-soft">Due: {a.due}</span>
                    {isPastDue && pct < 100 && <AlertTriangle className="w-3.5 h-3.5 text-terracotta" />}
                  </div>
                  <h3 className="font-semibold text-ink flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-ink-soft" /> {a.title}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-ink">{a.submitted}/{a.total}</p>
                  <p className="text-xs text-ink-soft">submitted</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-ink/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct === 100 ? 'bg-sage' : pct > 50 ? 'bg-amber-400' : 'bg-terracotta'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-medium text-ink-soft">{pct}%</span>
                <button className="text-xs bg-ink/5 hover:bg-ink/10 px-3 py-1 rounded-md text-ink transition-colors">View Submissions</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
