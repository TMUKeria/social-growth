"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const passwordConfirmation = String(form.get("passwordConfirmation") ?? "");

    if (mode === "signup" && password !== passwordConfirmation) {
      setMessage("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setMessage(toKoreanError(error.message));
        } else if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setMessage("가입 확인 메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료해 주세요.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setMessage(toKoreanError(error.message));
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch {
      setMessage("Supabase 환경변수를 먼저 설정해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-7">
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1" aria-label="인증 방법">
        <button
          className={`min-h-11 rounded-lg font-bold ${mode === "login" ? "bg-white text-[#3157d5] shadow-sm" : "text-slate-600"}`}
          onClick={() => { setMode("login"); setMessage(""); }}
          type="button"
          aria-pressed={mode === "login"}
        >
          로그인
        </button>
        <button
          className={`min-h-11 rounded-lg font-bold ${mode === "signup" ? "bg-white text-[#3157d5] shadow-sm" : "text-slate-600"}`}
          onClick={() => { setMode("signup"); setMessage(""); }}
          type="button"
          aria-pressed={mode === "signup"}
        >
          회원가입
        </button>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      <label className="block font-bold">
        이메일
        <input className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 font-normal" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="block font-bold">
        비밀번호
        <input
          className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 font-normal"
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          aria-describedby={mode === "signup" ? "password-help" : undefined}
          minLength={6}
          required
        />
      </label>
      {mode === "signup" && (
        <>
          <p className="-mt-3 text-sm text-slate-600" id="password-help">비밀번호는 6자 이상 입력해 주세요.</p>
          <label className="block font-bold">
            비밀번호 확인
            <input
              className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 font-normal"
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
        </>
      )}
      <button className="min-h-14 w-full rounded-xl bg-[#3157d5] px-5 text-lg font-black text-white hover:bg-[#2543a9] disabled:opacity-60" disabled={loading} type="submit">
        {loading ? "처리 중..." : mode === "login" ? "로그인" : "교사 계정 만들기"}
      </button>
      <p className="min-h-6 text-sm text-slate-700" aria-live="polite">{message}</p>
      </form>
    </div>
  );
}

function toKoreanError(message: string) {
  const errors: Record<string, string> = {
    "Invalid login credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "Email not confirmed": "이메일 인증을 먼저 완료해 주세요.",
    "User already registered": "이미 가입된 이메일입니다.",
    "Password should be at least 6 characters": "비밀번호는 6자 이상이어야 합니다.",
  };

  return errors[message] ?? message;
}
