"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
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
      className="min-h-11 rounded-xl border-2 border-slate-950 bg-slate-950 px-5 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
      disabled={loading}
      onClick={handleLogout}
      type="button"
    >
      {loading ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
