import Link from "next/link";

export default function PlayIndexPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12 text-center">
      <p className="text-lg font-bold text-[#3157d5]">상황 연습</p>
      <h1 className="mt-3 text-4xl font-black">어떤 상황을 연습할까요?</h1>
      <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">학생과 성인으로 나누지 않고, 필요한 생활 상황을 직접 선택하거나 교사가 공유한 링크로 바로 시작합니다.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="상황 분류 예시">
        {["학교", "교통", "지역사회", "직장", "안전", "의사소통"].map((tag) => (
          <div className="flex min-h-24 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-5 text-xl font-black" key={tag}>{tag}</div>
        ))}
      </div>
      <p className="mt-8 text-slate-600">공개 시나리오 탐색과 공유 링크 플레이는 다음 개발 단계에서 연결됩니다.</p>
      <Link className="mt-8 font-bold text-[#3157d5] underline" href="/">처음으로 돌아가기</Link>
    </main>
  );
}
