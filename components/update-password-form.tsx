"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createRecoveryClient } from "@/lib/supabase/recovery-client";

type ResetStatus = "checking" | "ready" | "saving" | "success" | "error";

export function UpdatePasswordForm() {
  const [status, setStatus] = useState<ResetStatus>("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createRecoveryClient();

    async function prepareReset() {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      if (hashParams.get("error")) {
        setStatus("error");
        setMessage("재설정 링크가 만료되었거나 이미 사용되었습니다.");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;

      if (!data.session) {
        setStatus("error");
        setMessage("비밀번호를 변경할 수 있는 인증 정보를 찾지 못했습니다. 재설정 메일을 다시 요청해 주세요.");
        return;
      }

      setStatus("ready");
    }

    prepareReset();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmation = String(form.get("passwordConfirmation"));

    if (password !== confirmation) {
      setMessage("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setStatus("saving");
    const supabase = createRecoveryClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("ready");
      setMessage("비밀번호를 변경하지 못했습니다. 6자 이상의 다른 비밀번호로 시도해 주세요.");
      return;
    }

    await supabase.auth.signOut();
    setStatus("success");
  }

  return (
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      {status === "checking" ? (
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-[#3157d5]" aria-hidden="true" />
          <h1 className="mt-6 text-3xl font-black">재설정 링크 확인 중</h1>
          <p className="mt-3 text-slate-600">잠시만 기다려 주세요.</p>
        </div>
      ) : status === "success" ? (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-black text-emerald-700" aria-hidden="true">✓</div>
          <p className="mt-6 font-bold text-emerald-700">비밀번호 변경 성공</p>
          <h1 className="mt-2 text-3xl font-black">새 비밀번호로 로그인하세요</h1>
          <Link className="mt-7 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#3157d5] px-7 text-lg font-black text-white" href="/login">
            로그인 화면으로 이동
          </Link>
        </div>
      ) : status === "error" ? (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl font-black text-amber-800" aria-hidden="true">!</div>
          <p className="mt-6 font-bold text-amber-800">재설정 링크 확인 실패</p>
          <h1 className="mt-2 text-3xl font-black">새 링크를 요청해 주세요</h1>
          <p className="mt-4 leading-7 text-slate-600">{message}</p>
          <Link className="mt-7 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#3157d5] px-7 text-lg font-black text-white" href="/forgot-password">
            재설정 메일 다시 받기
          </Link>
        </div>
      ) : (
        <>
          <p className="font-bold text-[#3157d5]">교사 계정 보안</p>
          <h1 className="mt-2 text-3xl font-black">새 비밀번호 설정</h1>
          <p className="mt-3 leading-7 text-slate-600">새 비밀번호를 두 번 입력해 주세요.</p>
          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <label className="block font-bold">
              새 비밀번호
              <input className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 font-normal" name="password" type="password" autoComplete="new-password" minLength={6} required />
            </label>
            <label className="block font-bold">
              새 비밀번호 확인
              <input className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 font-normal" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={6} required />
            </label>
            <button className="min-h-14 w-full rounded-xl bg-[#3157d5] px-5 text-lg font-black text-white disabled:opacity-60" disabled={status === "saving"} type="submit">
              {status === "saving" ? "변경 중..." : "비밀번호 변경"}
            </button>
            <p className="min-h-6 text-sm text-slate-700" aria-live="polite">{message}</p>
          </form>
        </>
      )}
    </section>
  );
}
