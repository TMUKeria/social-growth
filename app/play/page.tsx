import Link from "next/link";
import Image from "next/image";

import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/server";

const targetGroupLabels: Record<string, string> = { ADULT: "성인", ALL: "모두", CHILD: "아동", TEEN: "청소년" };
const tagLabels: Record<string, string> = { COMMUNITY: "지역사회", COMMUNICATION: "의사소통", EMOTION: "감정조절", SAFETY: "안전", SCHOOL: "학교", TRANSPORTATION: "교통", WORKPLACE: "직장" };

type PlayIndexPageProps = { searchParams: Promise<{ q?: string; tag?: string }> };

export default async function PlayIndexPage({ searchParams }: PlayIndexPageProps) {
  const { q = "", tag = "ALL" } = await searchParams;
  const normalizedQuery = q.trim().toLocaleLowerCase("ko-KR");
  const supabase = await createClient();
  const { data: scenarios, error } = await supabase.from("scenarios").select("id, title, target_group, tags, author_name, steps(id, image_url, step_order)").eq("is_public", true).order("updated_at", { ascending: false });
  const filteredScenarios = (scenarios ?? []).filter((scenario) => {
    const matchesTitle = !normalizedQuery || scenario.title.toLocaleLowerCase("ko-KR").includes(normalizedQuery);
    const matchesTag = tag === "ALL" || scenario.tags.includes(tag);
    return matchesTitle && matchesTag;
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="brand-gradient px-6 py-5"><div className="mx-auto flex max-w-5xl items-center justify-between gap-5"><BrandLogo inverse /><Link className="font-bold text-white underline" href="/">처음 화면</Link></div></header>
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <p className="text-lg font-bold text-[#0754c9]">로그인 없이 바로 연습해요</p>
        <h1 className="mt-3 text-4xl font-black text-[#14213d]">어떤 상황을 연습할까요?</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">연습할 상황을 고르면 로그인 없이 바로 시작할 수 있어요.</p>
        <form action="/play" className="app-surface mt-8 grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_220px_auto]" method="get" role="search">
          <label className="font-bold text-slate-700">제목 검색<input className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 font-normal" defaultValue={q} name="q" placeholder="예: 버스, 편의점" type="search" /></label>
          <label className="font-bold text-slate-700">태그 선택<select className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-4 font-normal" defaultValue={tag} name="tag"><option value="ALL">모든 태그</option>{Object.entries(tagLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <button className="min-h-12 self-end rounded-xl bg-[#0754c9] px-6 font-black text-white hover:bg-[#07378f]" type="submit">검색</button>
        </form>
        {(q || tag !== "ALL") && <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="font-bold text-slate-600">검색 결과 {filteredScenarios.length}개</p><Link className="font-bold text-[#0754c9] underline" href="/play">검색 초기화</Link></div>}
        {error ? (
          <div className="mt-10 rounded-2xl border-2 border-red-200 bg-red-50 p-6" role="alert"><p className="font-black text-red-800">상황 목록을 불러오지 못했어요.</p><p className="mt-2 text-red-700">잠시 후 다시 시도해 주세요.</p></div>
        ) : filteredScenarios.length > 0 ? (
          <ul className="mt-10 grid gap-4">
            {filteredScenarios.map((scenario) => {
              const orderedSteps = [...(scenario.steps ?? [])].sort((a, b) => a.step_order - b.step_order);
              const stepCount = orderedSteps.length;
              const thumbnail = orderedSteps.find((step) => step.image_url)?.image_url;
              return (
                <li key={scenario.id}>
                  <Link className="app-surface grid items-center gap-5 rounded-2xl p-4 transition hover:-translate-y-1 hover:border-[#0754c9] md:grid-cols-[128px_1fr_auto]" href={`/play/${scenario.id}`}>
                    <div className="relative h-28 overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-sky-50">{thumbnail ? <Image alt="" className="object-cover" fill sizes="128px" src={thumbnail} /> : <div className="flex h-full items-center justify-center text-5xl" aria-hidden="true">💬</div>}</div>
                    <div><div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-black text-blue-800">{targetGroupLabels[scenario.target_group] ?? "모두"}</span>
                      {scenario.tags.map((tag: string) => <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700" key={tag}>{tagLabels[tag] ?? tag}</span>)}
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-[#14213d]">{scenario.title}</h2>
                    <p className="mt-2 text-sm font-bold text-slate-500">만든 사람: {scenario.author_name}</p>
                    </div><p className="rounded-xl bg-[#0754c9] px-5 py-3 text-center font-black text-white">{stepCount > 0 ? `${stepCount}개 상황 연습 →` : "준비 중"}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-xl font-black">{scenarios && scenarios.length > 0 ? "검색 조건에 맞는 연습이 없어요." : "아직 공개된 연습이 없어요."}</p><p className="mt-3 text-slate-600">{scenarios && scenarios.length > 0 ? "다른 제목이나 태그로 다시 검색해 보세요." : "교사가 시나리오를 공개하면 이곳에 나타납니다."}</p></div>
        )}
        <Link className="mt-10 inline-block font-bold text-[#3157d5] underline" href="/">처음으로 돌아가기</Link>
      </div>
    </main>
  );
}
