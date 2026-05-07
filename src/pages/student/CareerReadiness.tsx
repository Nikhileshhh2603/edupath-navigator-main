import { CheckCircle, XCircle, TrendingUp } from "lucide-react";

const tracks = [
  {
    name: "Data Scientist",
    icon: "📊",
    minCGPA: 7.5,
    currentCGPA: 8.2,
    topics: [
      { name: "Statistics & Probability", done: true },
      { name: "Linear Algebra", done: true },
      { name: "Python Programming", done: true },
      { name: "Machine Learning Basics", done: false },
      { name: "Data Visualization", done: true },
      { name: "SQL & Databases", done: true },
      { name: "Deep Learning", done: false },
    ],
    skills: ["Python", "TensorFlow", "SQL", "Tableau", "R"],
  },
  {
    name: "Full-Stack Developer",
    icon: "💻",
    minCGPA: 7.0,
    currentCGPA: 8.2,
    topics: [
      { name: "HTML/CSS/JavaScript", done: true },
      { name: "React.js", done: true },
      { name: "Node.js / Express", done: false },
      { name: "Database Design", done: true },
      { name: "REST APIs", done: false },
      { name: "Version Control (Git)", done: true },
    ],
    skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "Docker"],
  },
  {
    name: "Cybersecurity Analyst",
    icon: "🔐",
    minCGPA: 7.0,
    currentCGPA: 8.2,
    topics: [
      { name: "Computer Networks", done: true },
      { name: "Operating Systems", done: true },
      { name: "Cryptography", done: false },
      { name: "Ethical Hacking", done: false },
      { name: "Network Security", done: false },
    ],
    skills: ["Wireshark", "Kali Linux", "Nmap", "Burp Suite"],
  },
];

export default function CareerReadiness() {
  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-ink">Career Readiness</h1>
        <p className="text-ink-soft text-sm mt-1">Track your progress toward career goals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tracks.map(track => {
          const done = track.topics.filter(t => t.done).length;
          const pct = Math.round((done / track.topics.length) * 100);
          const cgpaOk = track.currentCGPA >= track.minCGPA;

          return (
            <div key={track.name} className="bg-paper border border-ink/10 rounded-lg overflow-hidden hover:shadow-sm transition-all">
              <div className="p-5 border-b border-ink/10 bg-ink/5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{track.icon}</span>
                  <h2 className="font-bold text-ink">{track.name}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-ink/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 80 ? 'bg-sage' : pct >= 50 ? 'bg-amber-400' : 'bg-terracotta'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-ink">{pct}%</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {/* CGPA check */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">Min CGPA: {track.minCGPA}</span>
                  <span className={`flex items-center gap-1 font-medium ${cgpaOk ? 'text-sage' : 'text-terracotta'}`}>
                    {cgpaOk ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {track.currentCGPA}
                  </span>
                </div>

                {/* Topics */}
                <div className="space-y-2">
                  {track.topics.map(t => (
                    <div key={t.name} className="flex items-center gap-2 text-sm">
                      {t.done ? (
                        <CheckCircle className="w-4 h-4 text-sage shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-ink/20 shrink-0" />
                      )}
                      <span className={t.done ? "text-ink" : "text-ink-soft"}>{t.name}</span>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div className="pt-3 border-t border-ink/5">
                  <p className="text-xs text-ink-soft uppercase tracking-wider mb-2">Skills Needed</p>
                  <div className="flex flex-wrap gap-1.5">
                    {track.skills.map(s => (
                      <span key={s} className="text-xs bg-ink/5 border border-ink/10 px-2 py-0.5 rounded text-ink-soft">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
