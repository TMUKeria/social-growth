"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = { isFirst: boolean; isLast: boolean; scenarioId: string; scenarioTitle: string };

export function ScenarioOrderControls({ isFirst, isLast, scenarioId, scenarioTitle }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function move(direction: -1 | 1) {
    setLoading(true); setMessage("");
    const supabase = createClient();
    const { error } = await supabase.rpc("move_scenario", { direction, scenario_id: scenarioId });
    setLoading(false);
    if (error) { setMessage("순서 변경 SQL을 먼저 실행해 주세요."); return; }
    router.refresh();
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">
        <button aria-label={`${scenarioTitle} 위로 이동`} className="min-h-9 rounded-lg border border-slate-300 px-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-35" disabled={isFirst || loading} onClick={() => move(-1)} type="button">↑ 위로</button>
        <button aria-label={`${scenarioTitle} 아래로 이동`} className="min-h-9 rounded-lg border border-slate-300 px-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-35" disabled={isLast || loading} onClick={() => move(1)} type="button">↓ 아래로</button>
      </div>
      {message && <p className="mt-2 text-xs font-bold text-red-700" role="alert">{message}</p>}
    </div>
  );
}
