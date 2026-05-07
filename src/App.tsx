import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import StudentWorkspace from "./pages/StudentWorkspace.tsx";
import Predictor from "./pages/Predictor.tsx";
import { AuthProvider } from "@/hooks/use-auth";
import { RoleGuard } from "@/components/RoleGuard";
import Mentors from "./pages/admin/Mentors.tsx";
import Mentees from "./pages/teacher/Mentees.tsx";
import Roster from "./pages/teacher/Roster.tsx";

const queryClient = new QueryClient();

import { AppShell } from "@/components/layout/AppShell";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Dashboard routes wrapped in AppShell */}
            <Route element={<AppShell />}>
              {/* Student Routes */}
              <Route path="/student" element={<RoleGuard allow={["student"]}><StudentWorkspace /></RoleGuard>} />
              <Route path="/student/graph" element={<RoleGuard allow={["student"]}><StudentWorkspace /></RoleGuard>} />
              <Route path="/student/risk" element={<RoleGuard allow={["student"]}><StudentWorkspace /></RoleGuard>} />
              <Route path="/student/ai" element={<RoleGuard allow={["student"]}><StudentWorkspace /></RoleGuard>} />
              <Route path="/student/tasks" element={<RoleGuard allow={["student"]}><div>Assignments</div></RoleGuard>} />
              <Route path="/student/attendance" element={<RoleGuard allow={["student"]}><div>Attendance</div></RoleGuard>} />
              <Route path="/student/pulse" element={<RoleGuard allow={["student"]}><div>Pulse Check</div></RoleGuard>} />
              
              {/* Teacher Routes */}
              <Route path="/teacher" element={<RoleGuard allow={["teacher"]}><Dashboard role="teacher" /></RoleGuard>} />
              <Route path="/teacher/roster" element={<RoleGuard allow={["teacher"]}><Roster /></RoleGuard>} />
              <Route path="/teacher/mentees" element={<RoleGuard allow={["teacher"]}><Mentees /></RoleGuard>} />
              <Route path="/teacher/assignments" element={<RoleGuard allow={["teacher"]}><div>Assignment Manager</div></RoleGuard>} />
              <Route path="/teacher/graph" element={<RoleGuard allow={["teacher"]}><Predictor /></RoleGuard>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<RoleGuard allow={["admin"]}><Dashboard role="admin" /></RoleGuard>} />
              <Route path="/admin/users" element={<RoleGuard allow={["admin"]}><Mentors /></RoleGuard>} />
              <Route path="/admin/mentors" element={<RoleGuard allow={["admin"]}><Mentors /></RoleGuard>} />
              <Route path="/admin/departments" element={<RoleGuard allow={["admin"]}><div>Department Manager</div></RoleGuard>} />
              <Route path="/admin/semesters" element={<RoleGuard allow={["admin"]}><div>Semester Manager</div></RoleGuard>} />
              <Route path="/admin/announcements" element={<RoleGuard allow={["admin"]}><div>Announcements</div></RoleGuard>} />

              {/* Parent Routes */}
              <Route path="/parent" element={<RoleGuard allow={["parent"]}><div>Parent Dashboard</div></RoleGuard>} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
