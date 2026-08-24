"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ScenarioVisibilityControlProps = {
  canPublish: boolean;
  isPublic: boolean;
  nickname: string | null;
  scenarioId: string;
};

export function ScenarioVisibilityControl({ canPublish, isPublic, nickname, scenarioId }: ScenarioVisibilityControlProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function makePrivate() {
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("scenarios")
      .update({ is_public: false, updated_at: new Date().toISOString() })
      .eq("id", scenarioId);

    if (error) {
      setMessage("공개 설정을 변경하지 못했습니다.");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  async function makePublic() {
    setLoading(true);
    setMessage("");

    if (!canPublish) {
      setMessage("상황과 선택지를 하나 이상 만든 뒤 공개할 수 있습니다.");
      setLoading(false);
      return;
    }

    if (!nickname) {
      setMessage("설정 페이지에서 공개 닉네임을 먼저 만들어 주세요.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: visibilityError } = await supabase
      .from("scenarios")
      .update({ author_name: nickname, is_public: true, updated_at: new Date().toISOString() })
      .eq("id", scenarioId);
    if (visibilityError) {
      setMessage("시나리오를 공개하지 못했습니다.");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    isPublic ? (
      <div>
        <button className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-4 font-black text-slate-700 disabled:opacity-60" disabled={loading} onClick={makePrivate} type="button">{loading ? "변경 중..." : "비공개로 변경"}</button>
        <p className="mt-2 min-h-5 text-sm font-bold text-red-700" aria-live="polite">{message}</p>
      </div>
    ) : (
      <div className="w-full max-w-sm rounded-xl bg-emerald-50 p-4">
        <p className="text-sm font-black text-emerald-950">{canPublish ? "학생이 풀 수 있도록 공개할 수 있습니다." : "상황과 선택지를 만든 뒤 공개할 수 있습니다."}</p>
        {!nickname && <Link className="mt-3 inline-block font-bold text-[#3157d5] underline" href="/dashboard/profile">닉네임 설정하기</Link>}
        <button className="mt-3 min-h-11 w-full rounded-xl bg-emerald-700 px-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={loading || !canPublish || !nickname} onClick={makePublic} type="button">{loading ? "공개 중..." : "시나리오 공개"}</button>
        <p className="mt-2 min-h-5 text-sm font-bold text-red-700" aria-live="polite">{message}</p>
      </div>
    )
  );
}
