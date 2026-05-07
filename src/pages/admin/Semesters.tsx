import { useEffect, useState } from "react";
import { CalendarDays, Plus, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Semesters() {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSemesters = async () => {
    const { data, error } = await supabase.from("semesters").select("*").order("semester_number");
    if (error) toast.error(error.message);
    else setSemesters(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Semester Management</h1>
          <p className="text-ink-soft text-sm mt-1">Configure academic periods and their timelines.</p>
        </div>
        <button className="flex items-center gap-2 bg-sage text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-sage/90 transition-colors">
          <Plus className="w-4 h-4" />
          Create Semester
        </button>
      </div>

      <div className="bg-paper border border-ink/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-ink/5 text-ink-soft uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">Semester</th>
                <th className="px-6 py-3 font-semibold">Start Date</th>
                <th className="px-6 py-3 font-semibold">End Date</th>
                <th className="px-6 py-3 font-semibold text-center">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {semesters.map(s => (
                <tr key={s.id} className="hover:bg-ink/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-ink flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-ink-soft" />
                    {s.name}
                  </td>
                  <td className="px-6 py-4 text-ink-soft">{s.start_date || "Not set"}</td>
                  <td className="px-6 py-4 text-ink-soft">{s.end_date || "Not set"}</td>
                  <td className="px-6 py-4 text-center">
                    {s.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-sage bg-sage/10 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft bg-ink/5 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs text-sage hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
