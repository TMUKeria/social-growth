"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

type Choice = { id: string; text: string; is_correct: boolean; feedback_text: string };
type Step = { id: string; title: string; description: string; image_url: string | null; choices: Choice[] };
type Props = { returnHref: string; returnLabel: string; scenarioTitle: string; steps: Step[] };
const choiceStyles = ["border-[#0754c9] bg-blue-50/40 text-[#123878]", "border-[#65b83e] bg-green-50/40 text-green-950", "border-[#efb400] bg-amber-50/50 text-amber-950"];
const choiceIcons = ["👥", "●", "?"];

export function ScenarioPlayer({ returnHref, returnLabel, scenarioTitle, steps }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [retriedCurrentStep, setRetriedCurrentStep] = useState(false);
  const [finished, setFinished] = useState(false);
  const step = steps[stepIndex];
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function readText() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(`${step.title}. ${step.description}`);
    speech.lang = "ko-KR"; speech.rate = 0.9; window.speechSynthesis.speak(speech);
  }
  function choose(choice: Choice) {
    if (selectedChoice?.is_correct) return;
    setSelectedChoice(choice);
    if (choice.is_correct && !retriedCurrentStep) setCorrectCount((count) => count + 1);
    if (!choice.is_correct) setRetriedCurrentStep(true);
  }
  function moveNext() {
    window.speechSynthesis?.cancel();
    if (stepIndex === steps.length - 1) return setFinished(true);
    setStepIndex((index) => index + 1); setSelectedChoice(null); setRetriedCurrentStep(false);
  }
  function restart() { setStepIndex(0); setSelectedChoice(null); setCorrectCount(0); setRetriedCurrentStep(false); setFinished(false); }

  if (finished) return (
    <main className="brand-gradient flex min-h-screen items-center justify-center px-5 py-12 text-center">
      <section className="app-surface w-full max-w-xl rounded-[2rem] p-8 sm:p-12">
        <div className="mx-auto flex size-28 items-center justify-center rounded-full bg-[#ffc72c] text-6xl text-white shadow-lg" aria-hidden="true">★</div>
        <h1 className="mt-7 text-4xl font-black text-[#123878]">연습을 마쳤어요!</h1>
        <p className="mt-4 text-xl font-bold text-slate-700">{steps.length}개 상황 중 {correctCount}개를 바로 선택했어요.</p>
        <p className="mt-3 text-slate-600">틀려도 괜찮아요. 다시 연습하면 더 익숙해져요.</p>
        <div className="mt-8 grid gap-3"><button className="min-h-14 rounded-2xl bg-[#0754c9] px-6 text-lg font-black text-white" onClick={restart} type="button">다시 연습하기</button><Link className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-slate-300 px-6 text-lg font-black" href={returnHref}>{returnLabel}</Link></div>
      </section>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#eef3fa] p-2 sm:p-5">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[1.8rem] bg-white shadow-2xl">
        <header className="brand-gradient px-5 py-5 sm:px-8"><div className="flex flex-wrap items-center justify-between gap-5"><BrandLogo inverse /><div className="flex min-w-64 flex-1 items-center justify-end gap-4"><span className="rounded-2xl bg-white px-5 py-2 text-xl font-black text-[#123878]">{stepIndex + 1} / {steps.length}</span><div className="hidden h-3 max-w-md flex-1 overflow-hidden rounded-full bg-white/45 sm:block" role="progressbar" aria-valuemax={steps.length} aria-valuemin={1} aria-valuenow={stepIndex + 1}><div className="h-full rounded-full bg-[#79c940] transition-all" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></div><Link className="text-sm font-bold text-white underline" href={returnHref}>나가기</Link></div></div></header>
        <section className="p-5 sm:p-8 lg:p-10">
          <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-72 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-blue-50 lg:min-h-[440px]">
              {step.image_url ? <Image alt={`${step.title} 상황 그림`} className="object-contain" fill preload sizes="(max-width: 1024px) 100vw, 45vw" src={step.image_url} /> : <div className="flex h-full min-h-72 flex-col items-center justify-center p-8 text-center text-[#123878] lg:min-h-[440px]"><span className="flex size-28 items-center justify-center rounded-full bg-white text-6xl shadow-md" aria-hidden="true">💬</span><p className="mt-6 text-xl font-black">상황을 천천히 읽어 보세요</p><p className="mt-2 text-slate-600">그림이 없어도 소리로 들을 수 있어요.</p></div>}
            </div>
            <div className="flex flex-col justify-center"><p className="font-bold text-slate-500">{scenarioTitle}</p><span className="mt-5 w-fit rounded-xl bg-[#0754c9] px-4 py-2 font-black text-white">상황</span><h1 className="mt-4 text-4xl font-black leading-tight text-[#123878] sm:text-5xl">{step.title}</h1><div className="mt-7 flex items-start gap-4 rounded-2xl bg-[#f3f6fb] p-5"><span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#0754c9] text-2xl text-white" aria-hidden="true">🔊</span><p className="text-xl font-bold leading-8 sm:text-2xl">{step.description}</p></div><button className="mt-5 min-h-16 rounded-2xl border-2 border-[#0754c9] text-xl font-black text-[#0754c9] hover:bg-blue-50" onClick={readText} type="button">🔊 다시 듣기</button></div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3" aria-label="선택지">{step.choices.map((choice, index) => { const isSelected = selectedChoice?.id === choice.id; const stateStyle = isSelected ? (choice.is_correct ? "ring-4 ring-green-500" : "ring-4 ring-red-500") : "hover:-translate-y-1 hover:shadow-lg"; const choiceIcon = choice.is_correct ? choiceIcons[0] : choiceIcons[(index % 2) + 1]; return <button className={`min-h-36 rounded-3xl border-[3px] p-5 text-center text-lg font-black transition sm:text-xl ${choiceStyles[index % 3]} ${stateStyle}`} disabled={Boolean(selectedChoice?.is_correct)} key={choice.id} onClick={() => choose(choice)} type="button"><span className="mr-3 text-4xl" aria-hidden="true">{choiceIcon}</span>{choice.text}</button>; })}</div>
          {selectedChoice && <div className={`mt-8 grid items-center gap-5 rounded-3xl border-2 p-6 ${selectedChoice.is_correct ? "sm:grid-cols-[auto_1fr_auto] border-amber-200 bg-amber-50" : "sm:grid-cols-[auto_1fr] border-red-200 bg-red-50"}`} role="status" aria-live="polite"><span className={`flex size-20 items-center justify-center rounded-full text-5xl font-black text-white ${selectedChoice.is_correct ? "bg-[#ffc72c]" : "bg-red-500"}`} aria-hidden="true">{selectedChoice.is_correct ? "★" : "×"}</span><div><p className="text-xl font-black">{selectedChoice.is_correct ? "잘했어요!" : "다른 답을 다시 골라 보세요"}</p><p className="mt-1 text-lg leading-7">{selectedChoice.feedback_text}</p></div>{selectedChoice.is_correct && <button className="min-h-14 rounded-2xl bg-[#0754c9] px-6 font-black text-white" onClick={moveNext} type="button">{stepIndex === steps.length - 1 ? "결과 보기" : "다음 상황"}</button>}</div>}
        </section>
      </div>
    </main>
  );
}
