import Link from "next/link";

type ConfirmedPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function ConfirmedPage({ searchParams }: ConfirmedPageProps) {
  const { status } = await searchParams;
  const isSuccess = !status;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl font-black ${
            isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
          }`}
          aria-hidden="true"
        >
          {isSuccess ? "✓" : "!"}
        </div>

        {isSuccess ? (
          <>
            <p className="mt-6 font-bold text-emerald-700">이메일 인증 성공</p>
            <h1 className="mt-2 text-3xl font-black">교사 계정이 만들어졌습니다</h1>
            <p className="mt-4 leading-7 text-slate-600">인증이 완료되었고 자동으로 로그인되었습니다. 이제 시나리오를 만들 수 있습니다.</p>
            <Link className="mt-7 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#3157d5] px-7 text-lg font-black text-white hover:bg-[#2543a9]" href="/dashboard">
              교사 대시보드로 이동
            </Link>
          </>
        ) : (
          <>
            <p className="mt-6 font-bold text-amber-800">이메일 인증 실패</p>
            <h1 className="mt-2 text-3xl font-black">인증 링크를 확인해 주세요</h1>
            <p className="mt-4 leading-7 text-slate-600">링크가 잘못되었거나 이미 사용되었을 수 있습니다. 다시 로그인하거나 새 인증 메일을 받아 주세요.</p>
            <Link className="mt-7 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#3157d5] px-7 text-lg font-black text-white hover:bg-[#2543a9]" href="/login">
              로그인 화면으로 이동
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
