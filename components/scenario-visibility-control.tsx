"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ScenarioVisibilityControlProps = {
  authorName: string;
  isPublic: boolean;
  scenarioId: string;
  userId: string;
};

export function ScenarioVisibilityControl({ authorName, isPublic, scenarioId, userId }: ScenarioVisibilityControlProps) {
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

  async function makePublic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const nickname = String(new FormData(event.currentTarget).get("nickname")).trim();
    if (nickname.length < 2) {
      setMessage("공개 닉네임은 2글자 이상 입력해 주세요.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: profileError } = await supabase.from("profiles").update({ nickname }).eq("id", userId);
    if (profileError) {
      setMessage("닉네임을 저장하지 못했습니다. 새 마이그레이션을 적용했는지 확인해 주세요.");
      setLoading(false);
      return;
    }

    const { error: namesError } = await supabase.from("scenarios").update({ author_name: nickname }).eq("author_id", userId);
    if (namesError) {
      setMessage("기존 시나리오의 닉네임을 변경하지 못했습니다.");
      setLoading(false);
      return;
    }

    const { error: visibilityError } = await supabase.from("scenarios").update({ is_public: true, updated_at: new Date().toISOString() }).eq("id", scenarioId);
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
      <form className="w-full max-w-sm rounded-xl bg-emerald-50 p-4" onSubmit={makePublic}>
        <label className="block text-sm font-black text-emerald-950">
          공개 작성자 닉네임
          <input className="mt-2 min-h-11 w-full rounded-xl border-2 border-emerald-300 bg-white px-3 font-normal text-slate-900" defaultValue={authorName === "이름 미설정" ? "" : authorName} maxLength={30} minLength={2} name="nickname" placeholder="예: 햇살 선생님" required />
        </label>
        <p className="mt-2 text-xs leading-5 text-emerald-900">이 닉네임은 시나리오와 함께 모든 사용자에게 공개됩니다. 변경하면 기존 공개 시나리오의 이름도 함께 바뀝니다.</p>
        <button className="mt-3 min-h-11 w-full rounded-xl bg-emerald-700 px-4 font-black text-white disabled:opacity-60" disabled={loading} type="submit">{loading ? "공개 중..." : "닉네임 확인 후 공개"}</button>
        <p className="mt-2 min-h-5 text-sm font-bold text-red-700" aria-live="polite">{message}</p>
      </form>
    )
  );
}
