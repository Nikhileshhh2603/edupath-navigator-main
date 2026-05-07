import { CalendarDays, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useSemester } from "@/hooks/use-semester";

// Generate mock calendar data
const generateCalendar = () => {
  const days: { date: string; status: "present" | "absent" | "late" | "holiday" | "future" }[] = [];
  const now = new Date(2026, 4, 7); // May 7, 2026
  const start = new Date(2026, 0, 6); // Jan 6, 2026
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 0) { days.push({ date: d.toISOString().split("T")[0], status: "holiday" }); continue; }
    const rand = Math.random();
    days.push({
      date: d.toISOString().split("T")[0],
      status: rand > 0.88 ? "absent" : rand > 0.82 ? "late" : "present"
    });
  }
  return days;
};

const calendar = generateCalendar();

const subjectAttendance = [
  { name: "Data Structures", total: 42, present: 38 },
  { name: "Operating Systems", total: 40, present: 28 },
  { name: "Database Systems", total: 38, present: 35 },
  { name: "Computer Networks", total: 36, present: 33 },
  { name: "Compiler Design", total: 34, present: 30 },
];

const statusColors: Record<string, string> = {
  present: "bg-sage",
  absent: "bg-terracotta",
  late: "bg-amber-400",
  holiday: "bg-ink/10",
  future: "bg-ink/5",
};

export default function Attendance() {
  const { selectedSemester } = useSemester();
  const total = calendar.filter(d => d.status !== "holiday" && d.status !== "future").length;
  const present = calendar.filter(d => d.status === "present").length;
  const late = calendar.filter(d => d.status === "late").length;
  const absent = calendar.filter(d => d.status === "absent").length;
  const overallPct = Math.round(((present + late) / total) * 100);

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-ink">Attendance Dashboard</h1>
        <p className="text-ink-soft text-sm mt-1">Semester: {selectedSemester}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sage/10 border border-sage/20 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-sage">{overallPct}%</p>
          <p className="text-xs text-sage font-medium mt-1">Overall</p>
        </div>
        <div className="bg-paper border border-ink/10 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-ink">{present}</p>
          <p className="text-xs text-ink-soft font-medium mt-1">Present</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{late}</p>
          <p className="text-xs text-amber-700 font-medium mt-1">Late</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-terracotta">{absent}</p>
          <p className="text-xs text-red-700 font-medium mt-1">Absent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar heatmap */}
        <div className="lg:col-span-2 bg-paper border border-ink/10 rounded-lg p-5">
          <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-ink-soft" />
            Attendance Heatmap
          </h2>
          <div className="flex flex-wrap gap-1">
            {calendar.map((day, i) => (
              <div
                key={i}
                title={`${day.date}: ${day.status}`}
                className={`w-3.5 h-3.5 rounded-sm ${statusColors[day.status]} transition-transform hover:scale-150 cursor-pointer`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-ink-soft">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-sage inline-block" /> Present</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Late</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-terracotta inline-block" /> Absent</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-ink/10 inline-block" /> Holiday</span>
          </div>
        </div>

        {/* Subject-wise */}
        <div className="bg-paper border border-ink/10 rounded-lg p-5">
          <h2 className="font-semibold text-ink mb-4">Subject-wise Attendance</h2>
          <div className="space-y-4">
            {subjectAttendance.map(s => {
              const pct = Math.round((s.present / s.total) * 100);
              const isLow = pct < 75;
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-ink">{s.name}</span>
                    <span className={`font-bold ${isLow ? 'text-terracotta' : 'text-sage'}`}>
                      {pct}%
                      {isLow && <AlertTriangle className="inline w-3 h-3 ml-1" />}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-ink/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isLow ? 'bg-terracotta' : 'bg-sage'}`} style={{ width: `${pct}%` }} />
                  </div>
                  {isLow && <p className="text-[10px] text-terracotta mt-0.5">⚠ Below 75% threshold</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
