"use client";

import { FormEvent, useState } from "react";
import { createRecoveryClient } from "@/lib/supabase/recovery-client";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const supabase = createRecoveryClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setMessage(
        error.message === "Email rate limit exceeded"
          ? "이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해 주세요."
          : "재설정 메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } else {
      setSent(true);
      setMessage("계정이 존재하면 비밀번호 재설정 메일이 발송됩니다. 받은편지함과 스팸함을 확인해 주세요.");
    }

    setLoading(false);
  }

  return (
    <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
      <label className="block font-bold">
        가입 이메일
        <input
          className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 font-normal"
          name="email"
          type="email"
          autoComplete="email"
          disabled={sent}
          required
        />
      </label>
      <button
        className="min-h-14 w-full rounded-xl bg-[#3157d5] px-5 text-lg font-black text-white hover:bg-[#2543a9] disabled:opacity-60"
        disabled={loading || sent}
        type="submit"
      >
        {loading ? "발송 중..." : sent ? "메일 발송 완료" : "비밀번호 재설정 메일 받기"}
      </button>
      <p className="min-h-6 text-sm leading-6 text-slate-700" aria-live="polite">{message}</p>
    </form>
  );
}
