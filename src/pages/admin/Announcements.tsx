import { Megaphone, Plus, Pin, Trash2 } from "lucide-react";

const items = [
  { id: 1, title: "Midterm Examinations Schedule", body: "Midterms begin May 12. Check your department notice board.", pinned: true, dept: "All", date: "2026-05-05" },
  { id: 2, title: "Library Extended Hours", body: "Open until 11 PM during exam week (May 12-20).", pinned: true, dept: "All", date: "2026-05-04" },
  { id: 3, title: "CS Study Group", body: "Hash Tables session at CS Lab 3, tomorrow 4 PM.", pinned: false, dept: "CS", date: "2026-05-03" },
  { id: 4, title: "ECE Lab Maintenance", body: "Signal Processing Lab closed May 9.", pinned: false, dept: "ECE", date: "2026-05-02" },
  { id: 5, title: "Internship Apps Open", body: "Apply via the placement portal.", pinned: false, dept: "All", date: "2026-04-28" },
];

export default function Announcements() {
  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Announcements</h1>
          <p className="text-ink-soft text-sm mt-1">Broadcast messages to students and faculty.</p>
        </div>
        <button className="flex items-center gap-2 bg-terracotta text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-terracotta/90 transition-colors">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>
      <div className="space-y-4">
        {items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(a => (
          <div key={a.id} className={`bg-paper border rounded-lg p-5 hover:shadow-sm ${a.pinned ? 'border-sage/40 bg-sage/5' : 'border-ink/10'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {a.pinned && <Pin className="w-3.5 h-3.5 text-sage" />}
                  <span className="text-xs font-medium text-ink-soft bg-ink/5 px-2 py-0.5 rounded">{a.dept}</span>
                  <span className="text-xs text-ink-soft">{a.date}</span>
                </div>
                <h3 className="font-semibold text-ink flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-ink-soft" /> {a.title}
                </h3>
                <p className="text-sm text-ink-soft mt-2">{a.body}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="text-xs text-ink-soft hover:text-sage">Edit</button>
                <button className="text-xs text-ink-soft hover:text-terracotta"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
