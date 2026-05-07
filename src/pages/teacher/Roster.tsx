import { HeartPulse, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function Roster() {
  const students = [
    { id: 1, name: "John Doe", risk: 85, trend: "up", pulse: "🔴" },
    { id: 2, name: "Jane Smith", risk: 45, trend: "down", pulse: "🟡" },
    { id: 3, name: "Alice Johnson", risk: 12, trend: "flat", pulse: "🟢" },
  ];

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-ink">Class Roster</h1>
        <p className="text-ink-soft text-sm">Risk-sorted student roster with pulse check overview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-paper border border-ink/20 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-ink/10 bg-ink/5">
            <h2 className="font-semibold text-ink flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-ink-soft" />
              Risk-Sorted Roster
            </h2>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-ink/5 text-ink-soft uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">Student</th>
                <th className="px-6 py-3 font-semibold text-center">Pulse</th>
                <th className="px-6 py-3 font-semibold text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {students.sort((a, b) => b.risk - a.risk).map((s) => (
                <tr key={s.id} className="hover:bg-ink/5 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-medium text-ink">{s.name}</td>
                  <td className="px-6 py-4 text-center">{s.pulse}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <span className={`font-bold ${s.risk >= 70 ? 'text-terracotta' : s.risk >= 40 ? 'text-amber-600' : 'text-sage'}`}>
                      {s.risk}
                    </span>
                    {s.trend === "up" && <TrendingUp className="w-4 h-4 text-terracotta" />}
                    {s.trend === "down" && <TrendingDown className="w-4 h-4 text-sage" />}
                    {s.trend === "flat" && <Minus className="w-4 h-4 text-ink-soft" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-sage/10 border border-sage/20 rounded-lg p-5">
            <h3 className="font-semibold text-sage mb-4">Pulse Check Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>🟢 Thriving (4-5)</span>
                <span className="font-bold text-ink">15</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>🟡 Struggling (2-3)</span>
                <span className="font-bold text-ink">8</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>🔴 Critical (1)</span>
                <span className="font-bold text-ink">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
