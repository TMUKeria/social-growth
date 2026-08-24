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
    <div>
      <div className="flex justify-end gap-1">
        <button aria-label={`${scenarioTitle} 위로 이동`} className="flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-black disabled:cursor-not-allowed disabled:opacity-25" disabled={isFirst || loading} onClick={() => move(-1)} title="위로 이동" type="button">↑</button>
        <button aria-label={`${scenarioTitle} 아래로 이동`} className="flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-black disabled:cursor-not-allowed disabled:opacity-25" disabled={isLast || loading} onClick={() => move(1)} title="아래로 이동" type="button">↓</button>
      </div>
      {message && <p className="mt-2 text-xs font-bold text-red-700" role="alert">{message}</p>}
    </div>
  );
}
