import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <p className="font-bold text-[#3157d5]">교사 계정 도움</p>
        <h1 className="mt-2 text-3xl font-black">아이디·비밀번호 찾기</h1>

        <div className="mt-7 rounded-2xl bg-blue-50 p-5">
          <h2 className="text-lg font-black">아이디를 잊으셨나요?</h2>
          <p className="mt-2 leading-7 text-slate-700">
            하루의 선택에서는 가입한 이메일 주소가 아이디입니다. 가입 확인 메일을 받은 이메일함을 확인해 주세요.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            개인정보 보호를 위해 이름만으로 이메일 주소를 조회하거나 화면에 표시하지 않습니다.
          </p>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-7">
          <h2 className="text-2xl font-black">비밀번호 재설정</h2>
          <p className="mt-2 leading-7 text-slate-600">가입한 이메일을 입력하면 새 비밀번호를 설정할 수 있는 링크를 보내드립니다.</p>
          <ForgotPasswordForm />
        </div>

        <Link className="mt-6 block text-center font-bold text-[#3157d5] underline" href="/login">
          로그인 화면으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
