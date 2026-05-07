import { HeartPulse, Search } from "lucide-react";

export default function Mentees() {
  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-ink">My Mentees</h1>
        <p className="text-ink-soft text-sm">Monitor your assigned students' academic pulse and risk levels.</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
          <input 
            type="text" 
            placeholder="Search mentees by name or ID..." 
            className="w-full pl-9 pr-4 py-2 bg-paper border border-ink/20 rounded-md text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder Mentee Card */}
        <div className="bg-paper-light border border-ink/10 rounded-lg p-5 hover:border-sage/50 transition-colors cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ink/10 flex items-center justify-center font-bold text-ink-soft">
                JD
              </div>
              <div>
                <h3 className="font-semibold text-ink group-hover:text-sage transition-colors">John Doe</h3>
                <p className="text-xs text-ink-soft">CS · Sem 3</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">
                Risk: 75
              </span>
              <span className="text-[10px] text-ink-soft mt-1">Pulse: 🔴</span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm border-t border-ink/5 pt-3">
            <div className="flex justify-between">
              <span className="text-ink-soft">Last Session</span>
              <span className="font-medium">2 days ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Missing Tasks</span>
              <span className="font-medium text-amber-600">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
