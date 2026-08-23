import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const targetGroupLabels: Record<string, string> = { ADULT: "성인", ALL: "모두", CHILD: "아동", TEEN: "청소년" };
const tagLabels: Record<string, string> = { COMMUNITY: "지역사회", COMMUNICATION: "의사소통", EMOTION: "감정조절", SAFETY: "안전", SCHOOL: "학교", TRANSPORTATION: "교통", WORKPLACE: "직장" };

export default async function PlayIndexPage() {
  const supabase = await createClient();
  const { data: scenarios, error } = await supabase.from("scenarios").select("id, title, target_group, tags, author_name, steps(count)").eq("is_public", true).order("updated_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-lg font-bold text-[#3157d5]">상황 연습</p>
        <h1 className="mt-3 text-4xl font-black">어떤 상황을 연습할까요?</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">연습할 상황을 고르면 로그인 없이 바로 시작할 수 있어요.</p>
        {error ? (
          <div className="mt-10 rounded-2xl border-2 border-red-200 bg-red-50 p-6" role="alert"><p className="font-black text-red-800">상황 목록을 불러오지 못했어요.</p><p className="mt-2 text-red-700">잠시 후 다시 시도해 주세요.</p></div>
        ) : scenarios && scenarios.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {scenarios.map((scenario) => {
              const stepCount = scenario.steps?.[0]?.count ?? 0;
              return (
                <li key={scenario.id}>
                  <Link className="block min-h-52 rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#3157d5] hover:shadow-md" href={`/play/${scenario.id}`}>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-black text-blue-800">{targetGroupLabels[scenario.target_group] ?? "모두"}</span>
                      {scenario.tags.map((tag: string) => <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700" key={tag}>{tagLabels[tag] ?? tag}</span>)}
                    </div>
                    <h2 className="mt-5 text-2xl font-black">{scenario.title}</h2>
                    <p className="mt-2 text-sm font-bold text-slate-500">만든 사람: {scenario.author_name}</p>
                    <p className="mt-5 font-bold text-[#3157d5]">{stepCount > 0 ? `${stepCount}개 상황 연습하기 →` : "준비 중인 연습이에요"}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-xl font-black">아직 공개된 연습이 없어요.</p><p className="mt-3 text-slate-600">교사가 시나리오를 공개하면 이곳에 나타납니다.</p></div>
        )}
        <Link className="mt-10 inline-block font-bold text-[#3157d5] underline" href="/">처음으로 돌아가기</Link>
      </div>
    </main>
  );
}
