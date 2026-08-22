import Link from "next/link";
import { redirect } from "next/navigation";
import { ScenarioForm } from "@/components/scenario-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewScenarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <section className="mx-auto max-w-2xl">
        <Link className="font-bold text-[#3157d5] underline" href="/dashboard">← 내 시나리오로 돌아가기</Link>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="font-bold text-[#3157d5]">시나리오 기본 정보</p>
          <h1 className="mt-2 text-3xl font-black">새 시나리오 만들기</h1>
          <p className="mt-3 leading-7 text-slate-600">제목을 입력하고 필요한 경우 활용 대상과 상황 태그를 선택합니다. 상황과 선택지는 다음 화면에서 추가합니다.</p>
          <ScenarioForm userId={user.id} />
        </div>
      </section>
    </main>
  );
}
