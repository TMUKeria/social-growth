"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { removeScenarioImage } from "@/lib/supabase/scenario-images";

type ScenarioDeleteButtonProps = { scenarioId: string; scenarioTitle: string };

export function ScenarioDeleteButton({ scenarioId, scenarioTitle }: ScenarioDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function deleteScenario() {
    if (!window.confirm(`“${scenarioTitle}” 시나리오를 삭제할까요? 삭제하면 되돌릴 수 없습니다.`)) return;
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { data: steps } = await supabase.from("steps").select("image_url").eq("scenario_id", scenarioId);
    await Promise.all((steps ?? []).map((step) => removeScenarioImage(supabase, step.image_url)));
    const { error } = await supabase.from("scenarios").delete().eq("id", scenarioId);
    if (error) {
      setMessage("시나리오를 삭제하지 못했습니다.");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button className="min-h-11 rounded-xl border-2 border-red-300 bg-red-50 px-4 font-black text-red-800 hover:bg-red-100 disabled:opacity-60" disabled={loading} onClick={deleteScenario} type="button">{loading ? "삭제 중..." : "시나리오 삭제"}</button>
      <p className="mt-2 min-h-5 text-sm font-bold text-red-700" aria-live="polite">{message}</p>
    </div>
  );
}
