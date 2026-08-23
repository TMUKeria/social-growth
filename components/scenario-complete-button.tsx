"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ScenarioCompleteButtonProps = {
  scenarioId: string;
};

export function ScenarioCompleteButton({ scenarioId }: ScenarioCompleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function completeEditing() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase
      .from("scenarios")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", scenarioId);

    if (error) {
      setMessage("시나리오 저장을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setLoading(false);
      return;
    }

    router.push("/dashboard?saved=1");
    router.refresh();
  }

  return (
    <div className="mt-8 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-6">
      <h2 className="text-xl font-black text-emerald-950">시나리오 편집을 마쳤나요?</h2>
      <p className="mt-2 leading-7 text-emerald-900">각 상황은 수정 저장할 때마다 자동 저장됩니다. 아래 버튼은 전체 편집을 완료하고 내 시나리오 목록으로 돌아가는 버튼입니다.</p>
      <button
        className="mt-5 min-h-14 w-full rounded-xl bg-emerald-700 px-6 text-lg font-black text-white hover:bg-emerald-800 disabled:opacity-60"
        disabled={loading}
        onClick={completeEditing}
        type="button"
      >
        {loading ? "저장 완료 처리 중..." : "시나리오 저장 완료"}
      </button>
      <p className="mt-3 min-h-6 text-sm font-bold text-red-800" aria-live="polite">{message}</p>
    </div>
  );
}
