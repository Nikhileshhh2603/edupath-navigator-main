import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useSemester } from "@/hooks/use-semester";
import { LogOut, Calendar, History, FileDown, Bell } from "lucide-react";
import { exportToPDF } from "@/lib/pdf";

export function AppShell() {
  const { user, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { semesters, selectedSemester, isTimeMachineMode, setSemester, toggleTimeMachine, fetchSemesters } = useSemester();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleExport = () => {
    const mainContent = document.querySelector(".overflow-y-auto.page-enter");
    if (mainContent) {
      exportToPDF("main-dashboard-content", `EduPath_Report_${selectedSemester}`);
    }
  };

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
                {semesters.length > 0 ? (
                  semesters.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                ) : (
                  <option>Spring 2026</option>
                )}
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
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 text-xs font-medium text-ink-soft hover:text-ink transition-colors px-3 py-1.5 rounded-md hover:bg-ink/5"
              title="Download Report as PDF"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-ink-soft hover:text-ink transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terracotta rounded-full border border-paper" />
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-paper border border-ink/10 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-ink/5 flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button className="text-[10px] text-terracotta uppercase tracking-wider font-bold">Mark all read</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {[
                      { title: "New Assignment", desc: "Data Structures - Assignment 4 posted.", time: "2h ago" },
                      { title: "Attendance Warning", desc: "Your attendance in OS is 72%. Threshold is 75%.", time: "1d ago" },
                      { title: "Mentor Message", desc: "Prof. Sharma sent a summary of your last session.", time: "2d ago" }
                    ].map((n, i) => (
                      <div key={i} className="p-4 border-b border-ink/5 hover:bg-ink/5 transition-colors cursor-pointer">
                        <p className="text-sm font-medium text-ink">{n.title}</p>
                        <p className="text-xs text-ink-soft mt-0.5">{n.desc}</p>
                        <p className="text-[10px] text-ink-soft/60 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

        <div className="flex-1 overflow-y-auto page-enter" id="main-dashboard-content">
          <div className="mx-auto max-w-[1500px] p-6 lg:p-10 min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
