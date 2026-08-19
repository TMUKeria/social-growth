import Link from "next/link";

const features = [
  ["학생 모드", "로그인 없이 큰 버튼과 음성 안내로 일상 상황을 연습해요."],
  ["교사 도구", "학생에게 필요한 상황과 선택지, 피드백을 직접 만들어요."],
  ["간편 공유", "완성한 시나리오를 링크나 QR 코드로 바로 공유해요."],
];

export default function Home() {
  return (
    <main>
      <section className="bg-[#3157d5] px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-lg font-bold text-[#ffd166]">특수교육 일상 시뮬레이션</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">오늘도 좋은 선택을 연습해요</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-50">
            「하루의 선택」은 안전한 화면 안에서 일상과 돌발 상황을 경험하고,
            나에게 맞는 행동을 차근차근 익히는 웹게임입니다.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link className="rounded-2xl bg-[#ffd166] px-7 py-4 text-center text-lg font-black text-[#172033] hover:bg-yellow-300" href="/play">
              학생 모드 시작
            </Link>
            <Link className="rounded-2xl border-2 border-white bg-white/10 px-7 py-4 text-center text-lg font-black hover:bg-white/20" href="/login">
              교사 로그인
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-14 md:grid-cols-3" aria-label="주요 기능">
        {features.map(([title, description], index) => (
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm" key={title}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-black text-[#3157d5]" aria-hidden="true">
              {index + 1}
            </span>
            <h2 className="mt-5 text-2xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
