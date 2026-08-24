import Link from "next/link";
import { redirect } from "next/navigation";

import { TeacherNicknameForm } from "@/components/teacher-nickname-form";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", user.id).maybeSingle();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="brand-gradient px-6 py-5"><div className="mx-auto max-w-5xl"><BrandLogo inverse /></div></header>
      <section className="mx-auto max-w-2xl px-6 py-10">
        <Link className="font-bold text-[#3157d5] underline" href="/dashboard">← 교사 대시보드로 돌아가기</Link>
        <div className="app-surface mt-6 rounded-3xl p-8">
          <p className="font-bold text-[#3157d5]">교사 프로필</p>
          <h1 className="mt-2 text-3xl font-black">공개 닉네임 변경</h1>
          <p className="mt-4 leading-7 text-slate-700">닉네임은 공개 시나리오에서 만든 사람을 알 수 있도록 모든 사용자에게 표시됩니다. 실명이나 이메일 대신 공개해도 괜찮은 이름을 사용하세요.</p>
          <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">닉네임을 변경하면 이미 공유한 시나리오에 표시되는 작성자 이름도 모두 함께 변경됩니다.</p>
          <TeacherNicknameForm initialNickname={profile?.nickname ?? ""} userId={user.id} />
        </div>
      </section>
    </main>
  );
}
