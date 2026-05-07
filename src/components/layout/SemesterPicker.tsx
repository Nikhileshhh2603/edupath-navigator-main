import { Calendar } from "lucide-react";

export function SemesterPicker() {
  return (
    <div className="flex items-center gap-2 bg-paper border border-ink/20 rounded-md px-3 py-1.5 shadow-sm">
      <Calendar className="w-4 h-4 text-ink-soft" />
      <select className="bg-transparent border-none text-sm font-medium text-ink focus:outline-none appearance-none pr-4 cursor-pointer">
        <option>Semester 3 (Active)</option>
        <option>Semester 2 (Past)</option>
        <option>Semester 1 (Past)</option>
      </select>
    </div>
  );
}
