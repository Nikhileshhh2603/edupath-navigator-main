import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useSemester } from "@/hooks/use-semester";
import { LogOut, Calendar, History } from "lucide-react";

export function AppShell() {
  const { user, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { selectedSemester, isTimeMachineMode, setSemester, toggleTimeMachine } = useSemester();

  return (
    <div className="flex min-h-screen w-full bg-paper text-ink selection:bg-sage/20 font-sans antialiased">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-ink/10 bg-paper/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            {/* Semester Picker Widget */}
            <div className="flex items-center bg-ink/5 rounded-md p-1 border border-ink/10">
              <Calendar className="w-4 h-4 text-ink-soft ml-2" />
              <select 
                value={selectedSemester}
                onChange={(e) => setSemester(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-ink focus:outline-none focus:ring-0 cursor-pointer pl-2 pr-4 py-1 appearance-none"
              >
                <option>Spring 2026</option>
                <option>Fall 2025</option>
                <option>Spring 2025</option>
                <option>Fall 2024</option>
              </select>
              <button 
                onClick={toggleTimeMachine}
                title="Time Machine Mode"
                className={`p-1.5 rounded-sm transition-colors ${isTimeMachineMode ? 'bg-terracotta text-paper' : 'text-ink-soft hover:bg-ink/10 hover:text-ink'}`}
              >
                <History className="w-3.5 h-3.5" />
              </button>
            </div>
            {isTimeMachineMode && (
              <span className="text-xs font-semibold text-terracotta uppercase tracking-widest bg-terracotta/10 px-2 py-1 rounded-sm">
                Viewing Past Data
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="text-lg hover:scale-110 transition-transform" aria-label="Toggle theme">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <span className="text-xs font-medium text-ink bg-ink/5 px-3 py-1.5 rounded-full border border-ink/10">
              {user?.email || 'Demo User'}
            </span>
            <button onClick={signOut} className="text-ink-soft hover:text-terracotta transition-colors p-1.5 rounded-full hover:bg-terracotta/10" aria-label="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto page-enter">
          <div className="mx-auto max-w-[1500px] p-6 lg:p-10 min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
