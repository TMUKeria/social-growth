import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createRecoveryClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  return createSupabaseClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "implicit",
      persistSession: true,
    },
  });
}
