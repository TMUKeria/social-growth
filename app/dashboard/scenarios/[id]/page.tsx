import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ScenarioStepForm } from "@/components/scenario-step-form";
import { ScenarioStepList } from "@/components/scenario-step-list";
import { createClient } from "@/lib/supabase/server";

type ScenarioEditorPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function ScenarioEditorPage({ params, searchParams }: ScenarioEditorPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const { created } = await searchParams;
  const { data: scenario } = await supabase
    .from("scenarios")
    .select("id, title, is_public")
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!scenario) {
    notFound();
  }

  const { data: steps, error: stepsError } = await supabase
    .from("steps")
    .select("id, step_order, title, description, is_obstacle, choices(id, choice_order, text, is_correct, feedback_text)")
    .eq("scenario_id", scenario.id)
    .order("step_order", { ascending: true });

  const nextStepOrder = steps && steps.length > 0
    ? Math.max(...steps.map((step) => step.step_order)) + 1
    : 0;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <section className="mx-auto max-w-4xl">
        <Link className="font-bold text-[#3157d5] underline" href="/dashboard">← 내 시나리오로 돌아가기</Link>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-bold text-[#3157d5]">시나리오 편집</p>
              <h1 className="mt-2 text-3xl font-black">{scenario.title}</h1>
            </div>
            <span className={`rounded-full px-4 py-2 text-sm font-bold ${scenario.is_public ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
              {scenario.is_public ? "공개" : "비공개"}
            </span>
          </div>

          {created === "1" && (
            <p className="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 font-bold text-emerald-800" role="status">
              기본 정보를 저장했습니다. 이제 첫 상황과 선택지를 추가해 주세요.
            </p>
          )}

          {stepsError ? (
            <p className="mt-8 rounded-2xl bg-red-50 px-5 py-4 font-bold text-red-800" role="alert">
              저장된 상황을 불러오지 못했습니다. Supabase 테이블과 권한을 확인해 주세요.
            </p>
          ) : steps && steps.length > 0 ? (
            <ScenarioStepList steps={steps} />
          ) : (
            <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 px-5 py-8 text-center">
              <p className="font-black">아직 저장된 상황이 없습니다.</p>
              <p className="mt-2 text-sm text-slate-600">아래 양식에서 첫 상황을 만들어 보세요.</p>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black">새 상황 추가</h2>
          <p className="mt-2 leading-7 text-slate-600">한 상황에 2~3개의 선택지를 만들 수 있으며, 정답은 하나만 지정합니다.</p>
          <ScenarioStepForm nextStepOrder={nextStepOrder} scenarioId={scenario.id} startOpen={nextStepOrder === 0} />
        </div>
      </section>
    </main>
  );
}
