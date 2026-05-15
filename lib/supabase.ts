import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveClaimSession(sessionId: string, data: object) {
  const { error } = await supabase
    .from("claim_sessions")
    .upsert({ id: sessionId, data, updated_at: new Date().toISOString() });
  if (error) console.error("Supabase save error:", error);
}

export async function getClaimSession(sessionId: string) {
  const { data, error } = await supabase
    .from("claim_sessions")
    .select("data")
    .eq("id", sessionId)
    .single();
  if (error) return null;
  return data?.data;
}
