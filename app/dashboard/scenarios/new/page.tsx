import Link from "next/link";
import { redirect } from "next/navigation";
import { ScenarioForm } from "@/components/scenario-form";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/server";

export default async function NewScenarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", user.id).maybeSingle();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="brand-gradient px-6 py-5"><div className="mx-auto max-w-5xl"><BrandLogo inverse /></div></header>
      <section className="mx-auto max-w-2xl px-6 py-10">
        <Link className="font-bold text-[#3157d5] underline" href="/dashboard">← 내 시나리오로 돌아가기</Link>
        <div className="app-surface mt-6 rounded-3xl p-8">
          <p className="font-bold text-[#0754c9]">시나리오 기본 정보</p>
          <h1 className="mt-2 text-3xl font-black">새 시나리오 만들기</h1>
          <p className="mt-3 leading-7 text-slate-600">제목을 입력하고 필요한 경우 활용 대상과 상황 태그를 선택합니다. 상황과 선택지는 다음 화면에서 추가합니다.</p>
          <ScenarioForm authorName={profile?.nickname ?? "이름 미설정"} userId={user.id} />
        </div>
      </section>
    </main>
  );
}
