import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — only created at runtime, not at build time
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase env vars missing");
    _client = createClient(url, key);
  }
  return _client;
}

export async function saveClaimSession(sessionId: string, data: object) {
  try {
    const { error } = await getClient()
      .from("claim_sessions")
      .upsert({ id: sessionId, data, updated_at: new Date().toISOString() });
    if (error) console.error("Supabase save error:", error);
  } catch (err) {
    console.error("Supabase save failed:", err);
  }
}

export async function getClaimSession(sessionId: string) {
  try {
    const { data, error } = await getClient()
      .from("claim_sessions")
      .select("data")
      .eq("id", sessionId)
      .single();
    if (error) return null;
    return data?.data;
  } catch {
    return null;
  }
}

export async function saveEmailLead(email: string, sessionId: string, planType?: string) {
  try {
    const { error } = await getClient()
      .from("email_leads")
      .insert({ email, session_id: sessionId, plan_type: planType ?? null });
    if (error) console.error("Email lead save error:", error);
    return !error;
  } catch (err) {
    console.error("Email lead save failed:", err);
    return false;
  }
}
