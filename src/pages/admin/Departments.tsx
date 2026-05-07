import { useEffect, useState } from "react";
import { Briefcase, Plus, Users, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Departments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepts = async () => {
    const { data, error } = await supabase.from("departments").select("*").order("name");
    if (error) toast.error(error.message);
    else setDepartments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Department Management</h1>
          <p className="text-ink-soft text-sm mt-1">Manage academic departments and their resources.</p>
        </div>
        <button className="flex items-center gap-2 bg-sage text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-sage/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-40 w-full rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map(dept => (
            <div key={dept.id} className="bg-paper border border-ink/10 rounded-lg p-5 hover:border-sage/40 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-sage/10 p-2 rounded-lg group-hover:bg-sage/20 transition-colors">
                  <Briefcase className="w-5 h-5 text-sage" />
                </div>
                <span className="text-xs font-bold text-ink-soft bg-ink/5 px-2 py-0.5 rounded">{dept.code}</span>
              </div>
              <h3 className="font-semibold text-ink text-sm mb-3">{dept.name}</h3>
              <div className="grid grid-cols-3 gap-2 text-center border-t border-ink/5 pt-3">
                <div>
                  <Users className="w-3.5 h-3.5 text-ink-soft mx-auto mb-0.5" />
                  <p className="text-sm font-bold text-ink">--</p>
                  <p className="text-[10px] text-ink-soft">Students</p>
                </div>
                <div>
                  <Users className="w-3.5 h-3.5 text-ink-soft mx-auto mb-0.5" />
                  <p className="text-sm font-bold text-ink">--</p>
                  <p className="text-[10px] text-ink-soft">Teachers</p>
                </div>
                <div>
                  <BookOpen className="w-3.5 h-3.5 text-ink-soft mx-auto mb-0.5" />
                  <p className="text-sm font-bold text-ink">--</p>
                  <p className="text-[10px] text-ink-soft">Courses</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
