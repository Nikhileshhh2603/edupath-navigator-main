import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function BreadcrumbBar() {
  const { pathname } = useLocation();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-2 text-sm text-ink-soft mb-6">
      <span className="capitalize font-medium">{paths[0] || "Home"}</span>
      {paths.length > 1 && (
        <>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <span className="capitalize text-ink">{paths[1]}</span>
        </>
      )}
    </div>
  );
}
