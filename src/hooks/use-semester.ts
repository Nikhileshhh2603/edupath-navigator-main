import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

interface Semester {
  id: string;
  name: string;
  is_active: boolean;
}

interface SemesterState {
  semesters: Semester[];
  selectedSemester: string;
  isTimeMachineMode: boolean;
  setSemester: (semester: string) => void;
  toggleTimeMachine: () => void;
  fetchSemesters: () => Promise<void>;
}

export const useSemester = create<SemesterState>((set) => ({
  semesters: [],
  selectedSemester: "Spring 2026",
  isTimeMachineMode: false,
  setSemester: (semester) => set({ selectedSemester: semester }),
  toggleTimeMachine: () => set((state) => ({ isTimeMachineMode: !state.isTimeMachineMode })),
  fetchSemesters: async () => {
    const { data } = await supabase.from("semesters").select("*").order("semester_number");
    if (data) {
      const active = data.find(s => s.is_active);
      set({ 
        semesters: data, 
        selectedSemester: active?.name || data[0]?.name || "Spring 2026" 
      });
    }
  }
}));
