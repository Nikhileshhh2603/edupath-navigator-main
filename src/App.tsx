import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { RoleGuard } from "@/components/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";

// Pages
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import StudentWorkspace from "./pages/StudentWorkspace.tsx";
import Predictor from "./pages/Predictor.tsx";

// Student pages
import StudentAssignments from "./pages/student/Assignments.tsx";
import StudentAttendance from "./pages/student/Attendance.tsx";
import CodingLog from "./pages/student/CodingLog.tsx";
import Extracurriculars from "./pages/student/Extracurriculars.tsx";
import CareerReadiness from "./pages/student/CareerReadiness.tsx";

// Teacher pages
import Mentees from "./pages/teacher/Mentees.tsx";
import Roster from "./pages/teacher/Roster.tsx";
import TeacherAssignments from "./pages/teacher/Assignments.tsx";

// Admin pages
import Mentors from "./pages/admin/Mentors.tsx";
import Departments from "./pages/admin/Departments.tsx";
import Semesters from "./pages/admin/Semesters.tsx";
import Announcements from "./pages/admin/Announcements.tsx";

// Parent pages
import ParentDashboard from "./pages/parent/ParentDashboard.tsx";

const queryClient = new QueryClient();

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

            {/* All dashboard routes wrapped in AppShell */}
            <Route element={<AppShell />}>
              {/* Student Routes */}
              <Route path="/student" element={<RoleGuard allow={["student"]}><StudentWorkspace /></RoleGuard>} />
              <Route path="/student/graph" element={<RoleGuard allow={["student"]}><StudentWorkspace /></RoleGuard>} />
              <Route path="/student/risk" element={<RoleGuard allow={["student"]}><StudentWorkspace /></RoleGuard>} />
              <Route path="/student/ai" element={<RoleGuard allow={["student"]}><StudentWorkspace /></RoleGuard>} />
              <Route path="/student/tasks" element={<RoleGuard allow={["student"]}><StudentAssignments /></RoleGuard>} />
              <Route path="/student/attendance" element={<RoleGuard allow={["student"]}><StudentAttendance /></RoleGuard>} />
              <Route path="/student/pulse" element={<RoleGuard allow={["student"]}><StudentWorkspace /></RoleGuard>} />
              <Route path="/student/coding" element={<RoleGuard allow={["student"]}><CodingLog /></RoleGuard>} />
              <Route path="/student/activities" element={<RoleGuard allow={["student"]}><Extracurriculars /></RoleGuard>} />
              <Route path="/student/career" element={<RoleGuard allow={["student"]}><CareerReadiness /></RoleGuard>} />

              {/* Teacher Routes */}
              <Route path="/teacher" element={<RoleGuard allow={["teacher"]}><Dashboard role="teacher" /></RoleGuard>} />
              <Route path="/teacher/roster" element={<RoleGuard allow={["teacher"]}><Roster /></RoleGuard>} />
              <Route path="/teacher/mentees" element={<RoleGuard allow={["teacher"]}><Mentees /></RoleGuard>} />
              <Route path="/teacher/assignments" element={<RoleGuard allow={["teacher"]}><TeacherAssignments /></RoleGuard>} />
              <Route path="/teacher/graph" element={<RoleGuard allow={["teacher"]}><Predictor /></RoleGuard>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<RoleGuard allow={["admin"]}><Dashboard role="admin" /></RoleGuard>} />
              <Route path="/admin/users" element={<RoleGuard allow={["admin"]}><Mentors /></RoleGuard>} />
              <Route path="/admin/mentors" element={<RoleGuard allow={["admin"]}><Mentors /></RoleGuard>} />
              <Route path="/admin/departments" element={<RoleGuard allow={["admin"]}><Departments /></RoleGuard>} />
              <Route path="/admin/semesters" element={<RoleGuard allow={["admin"]}><Semesters /></RoleGuard>} />
              <Route path="/admin/announcements" element={<RoleGuard allow={["admin"]}><Announcements /></RoleGuard>} />

              {/* Parent Routes */}
              <Route path="/parent" element={<RoleGuard allow={["parent"]}><ParentDashboard /></RoleGuard>} />
              <Route path="/parent/progress" element={<RoleGuard allow={["parent"]}><ParentDashboard /></RoleGuard>} />
              <Route path="/parent/attendance" element={<RoleGuard allow={["parent"]}><StudentAttendance /></RoleGuard>} />
              <Route path="/parent/announcements" element={<RoleGuard allow={["parent"]}><Announcements /></RoleGuard>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
