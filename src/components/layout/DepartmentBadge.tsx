import { Building2 } from "lucide-react";

export function DepartmentBadge({ code = "CS" }: { code?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink/5 border border-ink/10 text-xs font-semibold text-ink-soft">
      <Building2 className="w-3.5 h-3.5" />
      {code}
    </div>
  );
}
