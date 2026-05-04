import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { SUBJECTS, SubjectKey } from "@/lib/curriculum-data";

export interface RiskInputs {
  attendance: number;     // 0–100 %
  avgGrade: number;       // 0–100
  missedAssignments: number; // count (0–20 max for full risk)
  engagementScore: number;  // 1–10
  knownTopics: Set<string>;
  subjectKey: SubjectKey;
}

interface RiskBreakdown {
  attendanceRisk: number;    // /25
  gradeRisk: number;         // /25
  assignmentRisk: number;    // /25
  engagementRisk: number;    // /15
  knowledgeGapRisk: number;  // /10
  totalRisk: number;         // /100
  level: "LOW" | "MODERATE" | "CRITICAL";
  interventions: string[];
}

function computeRisk(inputs: RiskInputs): RiskBreakdown {
  // Attendance /25: 100% = 0 risk, 0% = 25 risk
  const attendanceRisk = Math.round(((100 - inputs.attendance) / 100) * 25);

  // Grade /25: 100 = 0 risk, 0 = 25 risk
  const gradeRisk = Math.round(((100 - inputs.avgGrade) / 100) * 25);

  // Assignments /25: 0 missed = 0, 10+ missed = full 25
  const assignmentRisk = Math.min(25, Math.round((inputs.missedAssignments / 10) * 25));

  // Engagement /15: 10 = 0 risk, 1 = 15 risk
  const engagementRisk = Math.round(((10 - inputs.engagementScore) / 9) * 15);

  // Knowledge gap /10: % of topics NOT known
  const curriculum = SUBJECTS[inputs.subjectKey];
  const totalTopics = curriculum.topics.length;
  const knownCount = [...inputs.knownTopics].filter((id) =>
    curriculum.topics.some((t) => t.id === id)
  ).length;
  const gapRatio = totalTopics > 0 ? 1 - knownCount / totalTopics : 1;
  const knowledgeGapRisk = Math.round(gapRatio * 10);

  const totalRisk = attendanceRisk + gradeRisk + assignmentRisk + engagementRisk + knowledgeGapRisk;
  const level: RiskBreakdown["level"] = totalRisk >= 65 ? "CRITICAL" : totalRisk >= 35 ? "MODERATE" : "LOW";

  // Build targeted interventions
  const interventions: string[] = [];
  if (attendanceRisk >= 15)
    interventions.push("Schedule weekly check-ins — student is missing >40% of classes. Set up a buddy-system with a peer.");
  else if (attendanceRisk >= 8)
    interventions.push("Send an attendance alert email with a resource on study-from-home strategies.");

  if (gradeRisk >= 18)
    interventions.push("Immediate tutoring sessions required. Assign a mentor for the 3 lowest-scoring topics.");
  else if (gradeRisk >= 10)
    interventions.push("Recommend additional practice problem sets for topics below 70%.");

  if (assignmentRisk >= 18)
    interventions.push("Schedule a 1-on-1 workload management session. Break down pending assignments into daily micro-tasks.");
  else if (assignmentRisk >= 10)
    interventions.push("Send weekly assignment reminder emails with a personalised checklist.");

  if (engagementRisk >= 10)
    interventions.push("Introduce project-based learning or a study group — student is disengaged. Offer an optional enrichment module.");
  else if (engagementRisk >= 5)
    interventions.push("Check in personally to identify motivation barriers. Highlight real-world applications of the subject.");

  // Knowledge gap — find critical blocking topics
  const blockingCount = new Map<string, number>();
  curriculum.topics.forEach((t) => {
    if (!inputs.knownTopics.has(t.id)) {
      t.prerequisites.forEach((prereqId) => {
        if (!inputs.knownTopics.has(prereqId)) {
          blockingCount.set(prereqId, (blockingCount.get(prereqId) ?? 0) + 1);
        }
      });
    }
  });
  const criticalTopics = [...blockingCount.entries()]
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => curriculum.topics.find((t) => t.id === id)?.label ?? id);

  if (criticalTopics.length > 0)
    interventions.push(
      `Focus remediation on these critical prerequisite gaps: ${criticalTopics.join(", ")}. These are blocking the most future learning.`
    );
  else if (knowledgeGapRisk >= 5)
    interventions.push(`Student has covered only ${knownCount}/${totalTopics} topics. Assign a structured catch-up plan for the curriculum.`);

  if (interventions.length === 0)
    interventions.push("Student is performing well. Encourage advanced projects and peer mentoring roles.");

  return { attendanceRisk, gradeRisk, assignmentRisk, engagementRisk, knowledgeGapRisk, totalRisk, level, interventions };
}

function getColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio < 0.35) return "hsl(var(--sage))";
  if (ratio < 0.65) return "#d97706";
  return "hsl(var(--terracotta))";
}

const LEVEL_CONFIG = {
  LOW:      { bg: "bg-sage/10", border: "border-sage/20", text: "text-sage", badge: "bg-sage text-paper border-sage" },
  MODERATE: { bg: "bg-amber-600/10", border: "border-amber-600/20", text: "text-amber-700", badge: "bg-amber-600 text-paper border-amber-600" },
  CRITICAL: { bg: "bg-terracotta/10", border: "border-terracotta/20", text: "text-terracotta", badge: "bg-terracotta text-paper border-terracotta" },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-paper border border-ink/20 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="font-semibold text-ink mb-0.5">{label}</p>
        <p className="text-ink-soft">Risk Score: <span className="text-ink font-bold">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

export function RiskDashboard({ inputs }: { inputs: RiskInputs }) {
  const risk = useMemo(() => computeRisk(inputs), [inputs]);
  const cfg = LEVEL_CONFIG[risk.level];

  const chartData = [
    { name: "Attendance", value: risk.attendanceRisk, max: 25 },
    { name: "Grade",      value: risk.gradeRisk,      max: 25 },
    { name: "Assignments",value: risk.assignmentRisk, max: 25 },
    { name: "Engagement", value: risk.engagementRisk, max: 15 },
    { name: "Knowledge",  value: risk.knowledgeGapRisk, max: 10 },
  ];

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - risk.totalRisk / 100);

  return (
    <div className="space-y-6">
      {/* Score + Badge */}
      <div className={`rounded-2xl border p-6 ${cfg.bg} ${cfg.border} flex flex-col md:flex-row items-center gap-6 relative overflow-hidden`}>
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 grain"></div>
        {/* Circular gauge */}
        <div className="relative flex-shrink-0 z-10">
          <svg width={140} height={140} viewBox="0 0 140 140">
            <circle cx={70} cy={70} r={54} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={10} />
            <circle
              cx={70} cy={70} r={54} fill="none"
              stroke={risk.level === "LOW" ? "hsl(var(--sage))" : risk.level === "MODERATE" ? "#d97706" : "hsl(var(--terracotta))"}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s" }}
            />
            <text x={70} y={68} textAnchor="middle" dominantBaseline="middle" fontSize={28} fontWeight={600} fill="hsl(var(--ink))" fontFamily="Cormorant Garamond">
              {risk.totalRisk}
            </text>
            <text x={70} y={92} textAnchor="middle" fontSize={10} fill="hsl(var(--ink-soft))" fontFamily="Inter" letterSpacing={1}>
              / 100
            </text>
          </svg>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <p className="eyebrow mb-3">Overall Dropout Risk</p>
          <div className={`inline-block px-4 py-1.5 rounded-full text-[0.65rem] font-bold border tracking-[0.2em] uppercase ${cfg.badge} mb-4`}>
            {risk.level}
          </div>
          <p className="text-ink text-sm leading-relaxed max-w-lg italic">
            {risk.level === "LOW" && "This student is on a strong trajectory. Keep monitoring for early warning signs."}
            {risk.level === "MODERATE" && "There are identifiable risk factors that need targeted intervention soon."}
            {risk.level === "CRITICAL" && "Immediate action required. Multiple compounding risk factors detected."}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-paper-deep/30 border border-ink/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 grain"></div>
        <div className="relative z-10">
          <h3 className="serif text-xl text-ink mb-6">Risk Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--ink-soft))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--ink-soft))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={getColor(entry.value, entry.max)} />
                ))}
                <LabelList dataKey="value" position="top" style={{ fill: "hsl(var(--ink))", fontSize: 11, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Score table */}
          <div className="mt-6 grid grid-cols-5 gap-3">
            {chartData.map((d) => (
              <div key={d.name} className="text-center p-2 rounded-lg bg-paper border border-ink/10 shadow-sm">
                <div className="text-[0.65rem] tracking-widest uppercase text-ink-soft mb-1">{d.name}</div>
                <div className="font-medium text-sm" style={{ color: getColor(d.value, d.max) }}>
                  {d.value}
                  <span className="text-ink-soft/60 font-normal text-[10px]">/{d.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interventions */}
      <div className="bg-paper-deep/30 border border-ink/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 grain"></div>
        <div className="relative z-10">
          <h3 className="serif text-xl text-ink mb-5 flex items-center gap-2">
            <span className="text-terracotta italic font-serif">✦</span> Recommended Interventions
          </h3>
          <ol className="space-y-4">
            {risk.interventions.map((intervention, i) => (
              <li key={i} className="flex gap-4 text-sm text-ink leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-paper border border-ink/20 text-ink text-xs flex items-center justify-center font-medium shadow-sm">
                  {i + 1}
                </span>
                <span className="pt-0.5">{intervention}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
