import Link from "next/link";
import { notFound } from "next/navigation";

import { ScenarioPlayer } from "@/components/scenario-player";
import { createClient } from "@/lib/supabase/server";

type ScenarioPlayPageProps = PageProps<"/play/[id]"> & {
  searchParams: Promise<{ from?: string }>;
};

export default async function ScenarioPlayPage({ params, searchParams }: ScenarioPlayPageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const supabase = await createClient();
  const [{ data: scenario }, { data: { user } }] = await Promise.all([
    supabase.from("scenarios").select("id, author_id, title, is_public, steps(id, step_order, title, description, image_url, choices(id, choice_order, text, is_correct, feedback_text))").eq("id", id).single(),
    supabase.auth.getUser(),
  ]);
  if (!scenario) notFound();

  const steps = scenario.steps.sort((a, b) => a.step_order - b.step_order).map((step) => ({ ...step, choices: step.choices.sort((a, b) => a.choice_order - b.choice_order) }));
  if (steps.length === 0) {
    return <main className="flex min-h-screen items-center justify-center px-6 py-12 text-center"><div><h1 className="text-3xl font-black">아직 준비 중인 연습이에요.</h1><p className="mt-4 text-slate-600">교사가 상황을 추가한 뒤 다시 시작해 주세요.</p><Link className="mt-8 inline-block font-bold text-[#3157d5] underline" href="/play">다른 상황 고르기</Link></div></main>;
  }
  const enteredFromTeacherDashboard = from === "dashboard" && user?.id === scenario.author_id;
  return <ScenarioPlayer returnHref={enteredFromTeacherDashboard ? "/dashboard" : "/play"} returnLabel={enteredFromTeacherDashboard ? "교사 대시보드로 돌아가기" : "다른 상황 고르기"} scenarioTitle={scenario.title} steps={steps} />;
}
