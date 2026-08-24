import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { ScenarioDeleteButton } from "@/components/scenario-delete-button";
import { ScenarioVisibilityControl } from "@/components/scenario-visibility-control";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams: Promise<{ created?: string; saved?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { created, saved } = await searchParams;
  const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", user.id).maybeSingle();
  const { data: scenarios, error: scenariosError } = await supabase
    .from("scenarios")
    .select("id, title, target_group, tags, is_public, created_at, updated_at, steps(count)")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link className="text-xl font-black text-[#3157d5]" href="/">하루의 선택</Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:inline">{user.email}</span>
            <Link className="font-bold text-[#3157d5] underline" href="/dashboard/profile">설정</Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-bold text-[#3157d5]">교사 대시보드</p>
            <h1 className="mt-2 text-4xl font-black">내 시나리오</h1>
            <p className="mt-3 text-slate-600">학생에게 필요한 일상 훈련을 만들고 공유하세요.</p>
          </div>
          <Link className="inline-flex min-h-14 items-center rounded-xl bg-[#3157d5] px-6 text-lg font-black text-white hover:bg-[#2543a9]" href="/dashboard/scenarios/new">
            + 새 시나리오 만들기
          </Link>
        </div>

        {created === "1" && (
          <p className="mt-8 rounded-2xl bg-emerald-50 px-5 py-4 font-bold text-emerald-800" role="status">
            새 시나리오를 저장했습니다.
          </p>
        )}

        {saved === "1" && (
          <p className="mt-8 rounded-2xl bg-emerald-50 px-5 py-4 font-bold text-emerald-800" role="status">
            시나리오 편집을 완료하고 저장했습니다.
          </p>
        )}

        {scenariosError ? (
          <div className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-10">
            <h2 className="text-2xl font-black">시나리오 테이블을 확인해 주세요</h2>
            <p className="mt-3 leading-7 text-slate-700">Supabase 초기 SQL을 실행하지 않았거나 데이터 조회 권한이 올바르지 않습니다.</p>
          </div>
        ) : scenarios && scenarios.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2" aria-label="내 시나리오 목록">
            {scenarios.map((scenario) => {
              const stepCount = scenario.steps?.[0]?.count ?? 0;

              return <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" key={scenario.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-800">
                    {targetGroupLabel(scenario.target_group)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${scenario.is_public ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                    {scenario.is_public ? "공개" : "비공개"}
                  </span>
                </div>
                <h2 className="mt-5 text-2xl font-black">{scenario.title}</h2>
                {scenario.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2" aria-label="상황 태그">
                    {scenario.tags.map((tag: string) => (
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700" key={tag}>#{tagLabel(tag)}</span>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-sm text-slate-600">
                  최근 수정 {new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(scenario.updated_at))}
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700">등록된 상황 {stepCount}개</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link className="inline-flex min-h-12 items-center rounded-xl border-2 border-[#3157d5] px-5 font-black text-[#3157d5] hover:bg-blue-50" href={`/dashboard/scenarios/${scenario.id}`}>
                    상황·선택지 편집
                  </Link>
                  {stepCount > 0 ? (
                    <Link className="inline-flex min-h-12 items-center rounded-xl bg-[#3157d5] px-5 font-black text-white hover:bg-[#2543a9]" href={`/play/${scenario.id}?from=dashboard`}>문제풀기</Link>
                  ) : (
                    <span className="inline-flex min-h-12 cursor-not-allowed items-center rounded-xl bg-slate-200 px-5 font-black text-slate-500">상황 추가 후 문제풀기</span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-slate-200 pt-4">
                  <ScenarioVisibilityControl canPublish={stepCount > 0} isPublic={scenario.is_public} nickname={profile?.nickname ?? null} scenarioId={scenario.id} />
                  <ScenarioDeleteButton scenarioId={scenario.id} scenarioTitle={scenario.title} />
                </div>
              </article>;
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-2xl font-black">아직 만든 시나리오가 없습니다</h2>
            <p className="mt-3 text-slate-600">첫 시나리오를 만들고 학생에게 필요한 일상 훈련을 준비해 보세요.</p>
            <Link className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-[#3157d5] px-6 font-black text-white" href="/dashboard/scenarios/new">
              첫 시나리오 만들기
            </Link>
          </div>
        )}
        <Link className="mt-10 inline-block font-bold text-[#3157d5] underline" href="/">처음으로 돌아가기</Link>
      </section>
    </main>
  );
}

function targetGroupLabel(targetGroup: string) {
  const labels: Record<string, string> = {
    ALL: "전체 대상",
    CHILD: "어린이",
    TEEN: "청소년",
    ADULT: "성인",
  };

  return labels[targetGroup] ?? "대상 미지정";
}

function tagLabel(tag: string) {
  const labels: Record<string, string> = {
    SCHOOL: "학교",
    TRANSPORTATION: "교통",
    COMMUNITY: "지역사회",
    WORKPLACE: "직장",
    SAFETY: "안전",
    COMMUNICATION: "의사소통",
    EMOTION: "감정조절",
  };

  return labels[tag] ?? tag;
}

function SupabaseSetupNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
        <p className="font-bold text-amber-800">연결 준비 필요</p>
        <h1 className="mt-2 text-3xl font-black">Supabase 환경변수를 설정해 주세요</h1>
        <p className="mt-4 leading-7 text-slate-700">
          교사 계정과 대시보드를 사용하려면 프로젝트 URL과 anon key가 필요합니다.
          설정 방법은 README의 Supabase 설정 항목에서 확인할 수 있습니다.
        </p>
        <Link className="mt-6 inline-block font-bold text-[#3157d5] underline" href="/login">로그인 화면으로 돌아가기</Link>
      </section>
    </main>
  );
}
