import { Users, UserPlus } from "lucide-react";

export default function Mentors() {
  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Mentor Assignments</h1>
          <p className="text-ink-soft text-sm">Assign teachers to students as mentors.</p>
        </div>
        <button className="flex items-center gap-2 bg-terracotta text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-terracotta/90 transition-colors">
          <UserPlus className="w-4 h-4" />
          Assign Mentor
        </button>
      </div>

      <div className="bg-paper-light border border-ink/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-ink/10 bg-ink/5">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <Users className="w-4 h-4 text-ink-soft" />
            Current Assignments
          </h2>
        </div>
        <div className="p-8 text-center text-ink-soft">
          <p>Assignment data will populate here.</p>
          <p className="text-sm mt-1">Connect to Supabase `mentor_assignments` table.</p>
        </div>
      </div>
    </div>
  );
}
