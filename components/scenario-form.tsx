"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ScenarioFormProps = {
  authorName: string;
  userId: string;
};

const tags = [
  ["SCHOOL", "학교"],
  ["TRANSPORTATION", "교통"],
  ["COMMUNITY", "지역사회"],
  ["WORKPLACE", "직장"],
  ["SAFETY", "안전"],
  ["COMMUNICATION", "의사소통"],
  ["EMOTION", "감정조절"],
] as const;

export function ScenarioForm({ authorName, userId }: ScenarioFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title")).trim();
    const targetGroup = String(form.get("targetGroup"));
    const selectedTags = form.getAll("tags").map(String);

    if (!title) {
      setMessage("시나리오 제목을 입력해 주세요.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: scenario, error } = await supabase
      .from("scenarios")
      .insert({
        author_name: authorName || "이름 미설정",
        author_id: userId,
        is_public: false,
        tags: selectedTags,
        target_group: targetGroup,
        title,
      })
      .select("id")
      .single();

    if (error) {
      setMessage(
        error.code === "42P01"
          ? "Supabase에 scenarios 테이블이 없습니다. 초기 SQL을 먼저 실행해 주세요."
          : "시나리오를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      setLoading(false);
      return;
    }

    router.push(`/dashboard/scenarios/${scenario.id}?created=1`);
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

      <label className="block font-bold">
        활용 대상 <span className="font-normal text-slate-500">(선택)</span>
        <select className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-4 font-normal" defaultValue="ALL" name="targetGroup">
          <option value="ALL">전체</option>
          <option value="CHILD">어린이</option>
          <option value="TEEN">청소년</option>
          <option value="ADULT">성인</option>
        </select>
        <span className="mt-2 block text-sm font-normal text-slate-600">특정 연령에 제한되지 않으면 전체를 선택하세요.</span>
      </label>

      <fieldset>
        <legend className="font-bold">상황 태그 <span className="font-normal text-slate-500">(여러 개 선택 가능)</span></legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {tags.map(([value, label]) => (
            <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 font-bold has-checked:border-[#3157d5] has-checked:bg-blue-50" key={value}>
              <input name="tags" type="checkbox" value={value} />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-600">태그는 시나리오를 찾고 분류할 때 사용합니다. 선택하지 않아도 저장할 수 있습니다.</p>
      </fieldset>

      <p className="rounded-2xl bg-blue-50 p-5 text-sm font-bold leading-6 text-blue-900">새 시나리오는 비공개 초안으로 저장됩니다. 상황과 선택지를 하나 이상 만든 뒤 공개하거나 문제를 풀 수 있습니다.</p>

      <button className="min-h-14 w-full rounded-xl bg-[#3157d5] px-5 text-lg font-black text-white hover:bg-[#2543a9] disabled:opacity-60" disabled={loading} type="submit">
        {loading ? "저장 중..." : "기본 정보 저장"}
      </button>
      <p className="min-h-6 text-sm text-slate-700" aria-live="polite">{message}</p>
    </form>
  );
}
