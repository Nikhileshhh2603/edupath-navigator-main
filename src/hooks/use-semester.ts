import { create } from "zustand";

interface SemesterState {
  selectedSemester: string;
  isTimeMachineMode: boolean;
  setSemester: (semester: string) => void;
  toggleTimeMachine: () => void;
}

export const useSemester = create<SemesterState>((set) => ({
  selectedSemester: "Spring 2026",
  isTimeMachineMode: false,
  setSemester: (semester) => set({ selectedSemester: semester }),
  toggleTimeMachine: () => set((state) => ({ isTimeMachineMode: !state.isTimeMachineMode })),
}));
