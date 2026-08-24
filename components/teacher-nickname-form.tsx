"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type TeacherNicknameFormProps = { initialNickname: string; userId: string };

export function TeacherNicknameForm({ initialNickname, userId }: TeacherNicknameFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function saveNickname(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const nickname = String(formData.get("nickname")).trim();
    if (nickname.length < 2) {
      setMessage("닉네임은 2글자 이상 입력해 주세요.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: profileError } = await supabase.from("profiles").update({ nickname }).eq("id", userId);
    if (profileError) {
      setMessage(
        profileError.code === "23505"
          ? "이미 다른 교사가 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요."
          : "닉네임을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      setLoading(false);
      return;
    }

    const { error: scenarioError } = await supabase.from("scenarios").update({ author_name: nickname }).eq("author_id", userId);
    if (scenarioError) {
      setMessage("닉네임은 저장했지만 기존 시나리오의 작성자명을 바꾸지 못했습니다.");
      setLoading(false);
      return;
    }

    setMessage("닉네임을 저장했습니다. 공개 시나리오에 표시됩니다.");
    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5" onSubmit={saveNickname}>
      <label className="min-w-60 flex-1 font-black">
        공개 작성자 닉네임
        <input className="mt-2 min-h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-4 font-normal" defaultValue={initialNickname} maxLength={30} minLength={2} name="nickname" placeholder="예: 햇살 선생님" required />
      </label>
      <button className="min-h-11 rounded-xl bg-[#3157d5] px-5 font-black text-white disabled:opacity-60" disabled={loading} type="submit">{loading ? "저장 중..." : "닉네임 저장"}</button>
      <p className="w-full text-sm font-bold text-slate-700" aria-live="polite">{message}</p>
    </form>
  );
}
