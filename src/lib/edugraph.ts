import { supabase } from "@/integrations/supabase/client";

export type Topic = {
  id: string;
  subject_id: string;
  slug: string;
  name: string;
  description: string | null;
  difficulty: number;
  prerequisite_ids: string[];
};

export type Subject = { id: string; slug: string; name: string; description: string | null };
export type Mastery = { topic_id: string; mastery: number; last_practiced_at: string | null };
export type Assessment = { id: string; topic_id: string; score: number; notes: string | null; created_at: string };

export const fetchSubjects = async (): Promise<Subject[]> => {
  const { data, error } = await supabase.from("subjects").select("*").order("name");
  if (error) throw error;
  return data ?? [];
};

export const fetchTopics = async (): Promise<Topic[]> => {
  const { data, error } = await supabase.from("topics").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Topic[];
};

export const fetchMastery = async (userId: string): Promise<Mastery[]> => {
  const { data, error } = await supabase
    .from("student_topic_mastery")
    .select("topic_id, mastery, last_practiced_at")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
};

export const fetchAssessments = async (userId: string): Promise<Assessment[]> => {
  const { data, error } = await supabase
    .from("assessments")
    .select("id, topic_id, score, notes, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
};

export const upsertMastery = async (userId: string, topicId: string, mastery: number) => {
  const { error } = await supabase
    .from("student_topic_mastery")
    .upsert(
      { user_id: userId, topic_id: topicId, mastery, last_practiced_at: new Date().toISOString() },
      { onConflict: "user_id,topic_id" }
    );
  if (error) throw error;
};

export const logAssessment = async (userId: string, topicId: string, score: number, notes?: string) => {
  const { error } = await supabase.from("assessments").insert({ user_id: userId, topic_id: topicId, score, notes });
  if (error) throw error;
  await upsertMastery(userId, topicId, score);
};

/** Risk score 0–100 (higher = more at risk). Considers mastery gaps weighted by topic difficulty
 *  and penalty for prerequisite topics with low mastery. */
export const computeRisk = (topics: Topic[], mastery: Mastery[]) => {
  const m = new Map(mastery.map((x) => [x.topic_id, x.mastery]));
  if (topics.length === 0) return { score: 0, weakest: [] as Topic[], blockers: [] as Topic[] };

  let weighted = 0;
  let weightSum = 0;
  for (const t of topics) {
    const mast = m.get(t.id) ?? 0;
    const gap = 100 - mast;
    const w = t.difficulty;
    weighted += gap * w;
    weightSum += 100 * w;
  }
  const baseRisk = weighted / weightSum; // 0..1

  // Prerequisite blockers: topics whose prereqs are low
  const blockers: Topic[] = [];
  for (const t of topics) {
    if (t.prerequisite_ids.length === 0) continue;
    const prereqAvg =
      t.prerequisite_ids.reduce((s, p) => s + (m.get(p) ?? 0), 0) / t.prerequisite_ids.length;
    if (prereqAvg < 50) blockers.push(t);
  }
  const blockerPenalty = Math.min(0.2, blockers.length * 0.01);

  const score = Math.round(Math.min(100, (baseRisk + blockerPenalty) * 100));

  const weakest = [...topics]
    .sort((a, b) => (m.get(a.id) ?? 0) - (m.get(b.id) ?? 0))
    .slice(0, 5);

  return { score, weakest, blockers: blockers.slice(0, 5) };
};

export const masteryColor = (m: number) => {
  if (m >= 75) return "hsl(150 35% 45%)";
  if (m >= 50) return "hsl(40 75% 55%)";
  if (m >= 25) return "hsl(20 70% 55%)";
  return "hsl(0 60% 55%)";
};
