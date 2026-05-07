import { useState } from "react";
import { Award, Plus, Trash2 } from "lucide-react";

const typeLabels: Record<string, string> = {
  hackathon: "🏆 Hackathon",
  club: "🎭 Club Activity",
  certificate: "📜 Certification",
  workshop: "🔧 Workshop",
  other: "📌 Other",
};

const mockItems = [
  { id: "1", event_name: "Smart India Hackathon 2025", event_date: "2025-12-15", event_type: "hackathon", description: "Finalist - Built AI-powered attendance system" },
  { id: "2", event_name: "AWS Cloud Practitioner", event_date: "2026-01-20", event_type: "certificate", description: "Passed with 850/1000" },
  { id: "3", event_name: "Google Developer Club - ML Workshop", event_date: "2026-02-10", event_type: "workshop", description: "3-day intensive on TensorFlow" },
  { id: "4", event_name: "CodeChef Starters 120", event_date: "2026-03-05", event_type: "hackathon", description: "Rank 342 / 12,000" },
  { id: "5", event_name: "NSS Community Service", event_date: "2026-04-01", event_type: "club", description: "Led tree plantation drive" },
];

export default function Extracurriculars() {
  const [items] = useState(mockItems);

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Extracurricular Profile</h1>
          <p className="text-ink-soft text-sm mt-1">Your achievements, certifications, and activities.</p>
        </div>
        <button className="flex items-center gap-2 bg-sage text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-sage/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Activity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-paper border border-ink/10 rounded-lg p-5 hover:border-sage/40 hover:shadow-sm transition-all group">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-ink-soft bg-ink/5 px-2 py-0.5 rounded">
                {typeLabels[item.event_type]}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-soft">{item.event_date}</span>
                <button className="opacity-0 group-hover:opacity-100 text-ink-soft hover:text-terracotta transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-ink flex items-center gap-2">
              <Award className="w-4 h-4 text-sage" />
              {item.event_name}
            </h3>
            {item.description && (
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
