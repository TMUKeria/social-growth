"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CallbackStatus = "checking" | "verification-failed" | "session-failed";

export function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>("checking");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function finishConfirmation() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;

        if (error) {
          setStatus("session-failed");
          setErrorMessage("이메일 인증은 처리되었지만 자동 로그인 정보를 만들지 못했습니다.");
          return;
        }

        router.replace("/auth/confirmed");
        router.refresh();
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const hashError = hashParams.get("error_description");
      if (hashError) {
        setStatus("verification-failed");
        setErrorMessage("인증 링크가 만료되었거나 올바르지 않습니다.");
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error || !data.session) {
        setStatus("session-failed");
        setErrorMessage("이메일 인증은 처리되었지만 자동 로그인 정보를 확인하지 못했습니다.");
        return;
      }

      router.replace("/auth/confirmed");
      router.refresh();
    }

    finishConfirmation();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
      {status === "verification-failed" ? (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl font-black text-amber-800" aria-hidden="true">!</div>
          <p className="mt-6 font-bold text-amber-800">이메일 인증 실패</p>
          <h1 className="mt-2 text-3xl font-black">인증 링크를 확인해 주세요</h1>
          <p className="mt-4 leading-7 text-slate-600" aria-live="assertive">{errorMessage}</p>
          <Link className="mt-7 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#3157d5] px-7 text-lg font-black text-white hover:bg-[#2543a9]" href="/login">
            로그인 화면으로 이동
          </Link>
        </>
      ) : status === "session-failed" ? (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-black text-emerald-700" aria-hidden="true">✓</div>
          <p className="mt-6 font-bold text-emerald-700">이메일 인증 완료</p>
          <h1 className="mt-2 text-3xl font-black">로그인만 다시 진행해 주세요</h1>
          <p className="mt-4 leading-7 text-slate-600" aria-live="polite">{errorMessage}</p>
          <p className="mt-3 leading-7 text-slate-600">메일 링크를 회원가입과 다른 브라우저에서 열면 자동 로그인이 완료되지 않을 수 있습니다. 가입한 이메일과 비밀번호로 로그인하면 됩니다.</p>
          <Link className="mt-7 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#3157d5] px-7 text-lg font-black text-white hover:bg-[#2543a9]" href="/login">
            교사 로그인하기
          </Link>
        </>
      ) : (
        <>
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-[#3157d5]" aria-hidden="true" />
          <h1 className="mt-6 text-3xl font-black">이메일 인증 확인 중</h1>
          <p className="mt-4 leading-7 text-slate-600" aria-live="polite">잠시만 기다려 주세요. 인증이 끝나면 결과 화면으로 자동 이동합니다.</p>
        </>
      )}
    </section>
  );
}
