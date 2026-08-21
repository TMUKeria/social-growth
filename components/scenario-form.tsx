"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ScenarioFormProps = {
  userId: string;
};

export function ScenarioForm({ userId }: ScenarioFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title")).trim();
    const category = String(form.get("category"));
    const isPublic = form.get("isPublic") === "on";

    if (!title) {
      setMessage("시나리오 제목을 입력해 주세요.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("scenarios").insert({
      author_id: userId,
      category,
      is_public: isPublic,
      title,
    });

    if (error) {
      setMessage(
        error.code === "42P01"
          ? "Supabase에 scenarios 테이블이 없습니다. 초기 SQL을 먼저 실행해 주세요."
          : "시나리오를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard?created=1");
    router.refresh();
  }

  return (
    <form className="mt-8 space-y-7" onSubmit={handleSubmit}>
      <label className="block font-bold">
        시나리오 제목
        <input
          className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 font-normal"
          maxLength={100}
          name="title"
          placeholder="예: 3반 맞춤형 등교 훈련"
          required
        />
        <span className="mt-2 block text-sm font-normal text-slate-600">학생과 교사가 쉽게 알아볼 수 있는 이름을 사용하세요.</span>
      </label>

      <fieldset>
        <legend className="font-bold">대상 모드</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-300 p-4 font-bold has-checked:border-[#3157d5] has-checked:bg-blue-50">
            <input defaultChecked name="category" type="radio" value="STUDENT" />
            <span>학생 모드<br /><span className="text-sm font-normal text-slate-600">등교·교실·급식실</span></span>
          </label>
          <label className="flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-300 p-4 font-bold has-checked:border-[#3157d5] has-checked:bg-blue-50">
            <input name="category" type="radio" value="ADULT" />
            <span>사회인 모드<br /><span className="text-sm font-normal text-slate-600">출근·인사·대화</span></span>
          </label>
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-5">
        <input className="mt-1 h-5 w-5" name="isPublic" type="checkbox" />
        <span>
          <span className="block font-bold">공개 시나리오로 만들기</span>
          <span className="mt-1 block text-sm leading-6 text-slate-600">공개하면 링크를 받은 학생과 다른 교사가 로그인 없이 볼 수 있습니다. 나중에 변경할 수 있습니다.</span>
        </span>
      </label>

      <button className="min-h-14 w-full rounded-xl bg-[#3157d5] px-5 text-lg font-black text-white hover:bg-[#2543a9] disabled:opacity-60" disabled={loading} type="submit">
        {loading ? "저장 중..." : "기본 정보 저장"}
      </button>
      <p className="min-h-6 text-sm text-slate-700" aria-live="polite">{message}</p>
    </form>
  );
}
