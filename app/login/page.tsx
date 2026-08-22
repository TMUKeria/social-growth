import { AuthForm } from "@/components/auth-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <p className="font-bold text-[#3157d5]">교사 전용</p>
        <h1 className="mt-2 text-3xl font-black">교사 계정</h1>
        <p className="mt-3 leading-7 text-slate-600">로그인하거나 새 계정을 만들어 시나리오를 관리하세요.</p>
        <AuthForm />
        <Link className="mt-2 block text-center font-bold text-slate-700 underline" href="/forgot-password">
          아이디·비밀번호 찾기
        </Link>
        <Link className="mt-3 block text-center font-bold text-[#3157d5] underline" href="/">
          처음으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
