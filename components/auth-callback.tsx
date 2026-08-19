"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthCallback() {
  const router = useRouter();
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
          setErrorMessage("인증 링크가 만료되었거나 이미 사용되었습니다.");
          return;
        }

        router.replace("/auth/confirmed");
        router.refresh();
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const hashError = hashParams.get("error_description");
      if (hashError) {
        setErrorMessage("인증 링크가 만료되었거나 올바르지 않습니다.");
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error || !data.session) {
        setErrorMessage("인증 정보를 확인하지 못했습니다. 새 인증 메일로 다시 시도해 주세요.");
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
      {errorMessage ? (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl font-black text-amber-800" aria-hidden="true">!</div>
          <p className="mt-6 font-bold text-amber-800">이메일 인증 실패</p>
          <h1 className="mt-2 text-3xl font-black">인증 링크를 확인해 주세요</h1>
          <p className="mt-4 leading-7 text-slate-600" aria-live="assertive">{errorMessage}</p>
          <Link className="mt-7 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#3157d5] px-7 text-lg font-black text-white hover:bg-[#2543a9]" href="/login">
            로그인 화면으로 이동
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
