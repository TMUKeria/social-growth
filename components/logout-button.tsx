"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ inverse = false }: { inverse?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      className={`min-h-10 rounded-xl border px-4 text-sm font-bold disabled:opacity-60 ${inverse ? "border-white/50 bg-white/10 text-white hover:bg-white/20" : "border-slate-900 bg-slate-900 text-white hover:bg-slate-700"}`}
      disabled={loading}
      onClick={handleLogout}
      type="button"
    >
      {loading ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
