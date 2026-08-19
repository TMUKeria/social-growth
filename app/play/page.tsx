import Link from "next/link";

export default function PlayIndexPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12 text-center">
      <p className="text-lg font-bold text-[#3157d5]">학생 모드</p>
      <h1 className="mt-3 text-4xl font-black">어떤 하루를 연습할까요?</h1>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <button className="min-h-40 rounded-3xl bg-blue-600 p-8 text-2xl font-black text-white shadow-lg hover:bg-blue-700">학교에서의 하루</button>
        <button className="min-h-40 rounded-3xl bg-emerald-600 p-8 text-2xl font-black text-white shadow-lg hover:bg-emerald-700">사회생활의 하루</button>
      </div>
      <p className="mt-8 text-slate-600">기본 시나리오는 다음 개발 단계에서 연결됩니다.</p>
      <Link className="mt-8 font-bold text-[#3157d5] underline" href="/">처음으로 돌아가기</Link>
    </main>
  );
}
