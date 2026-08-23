"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Choice = { id: string; text: string; is_correct: boolean; feedback_text: string };
type Step = { id: string; title: string; description: string; image_url: string | null; choices: Choice[] };
type ScenarioPlayerProps = { returnHref: string; returnLabel: string; scenarioTitle: string; steps: Step[] };

export function ScenarioPlayer({ returnHref, returnLabel, scenarioTitle, steps }: ScenarioPlayerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [retriedCurrentStep, setRetriedCurrentStep] = useState(false);
  const [finished, setFinished] = useState(false);
  const step = steps[stepIndex];

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function readText() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(`${step.title}. ${step.description}`);
    speech.lang = "ko-KR";
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
  }

  function choose(choice: Choice) {
    if (selectedChoice) return;
    setSelectedChoice(choice);
    if (choice.is_correct && !retriedCurrentStep) setCorrectCount((count) => count + 1);
  }

  function retryStep() {
    setSelectedChoice(null);
    setRetriedCurrentStep(true);
  }

  function moveNext() {
    window.speechSynthesis?.cancel();
    if (stepIndex === steps.length - 1) return setFinished(true);
    setStepIndex((index) => index + 1);
    setSelectedChoice(null);
    setRetriedCurrentStep(false);
  }

  function restart() {
    setStepIndex(0);
    setSelectedChoice(null);
    setCorrectCount(0);
    setRetriedCurrentStep(false);
    setFinished(false);
  }

  if (finished) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-50 px-6 py-12 text-center">
        <div className="w-full max-w-xl rounded-3xl border-2 border-blue-200 bg-white p-8 shadow-lg">
          <p className="text-6xl" aria-hidden="true">🎉</p>
          <h1 className="mt-5 text-4xl font-black">연습을 마쳤어요!</h1>
          <p className="mt-4 text-xl font-bold text-slate-700">{steps.length}개 상황 중 {correctCount}개를 바로 선택했어요.</p>
          <p className="mt-3 text-slate-600">틀려도 괜찮아요. 다시 연습하면 더 익숙해져요.</p>
          <div className="mt-8 grid gap-3">
            <button className="min-h-14 rounded-2xl bg-[#3157d5] px-6 text-lg font-black text-white" onClick={restart} type="button">다시 연습하기</button>
            <Link className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-slate-300 px-6 text-lg font-black" href={returnHref}>{returnLabel}</Link>
            <Link className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-slate-800 bg-slate-800 px-6 text-lg font-black text-white" href="/">처음 화면으로 나가기</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4"><Link className="font-bold text-[#3157d5] underline" href={returnHref}>← 나가기</Link><p className="font-black" aria-live="polite">{stepIndex + 1} / {steps.length}</p></div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200" aria-label={`전체 ${steps.length}단계 중 ${stepIndex + 1}단계`} role="progressbar" aria-valuemax={steps.length} aria-valuemin={1} aria-valuenow={stepIndex + 1}>
          <div className="h-full rounded-full bg-[#3157d5] transition-all" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
        </div>
        <section className="mt-6 rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="font-bold text-slate-500">{scenarioTitle}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-black sm:text-4xl">{step.title}</h1>
            <button className="min-h-12 rounded-2xl border-2 border-blue-300 bg-blue-50 px-4 font-black text-blue-800" onClick={readText} type="button" aria-label="상황 설명 소리 내어 읽기">🔊 읽어주기</button>
          </div>
          {step.image_url && <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl bg-slate-100"><Image alt={`${step.title} 상황 그림`} className="object-contain" fill priority sizes="(max-width: 768px) 100vw, 768px" src={step.image_url} /></div>}
          <p className="mt-6 text-xl font-bold leading-9 sm:text-2xl">{step.description}</p>
          <div className="mt-8 grid gap-4" aria-label="선택지">
            {step.choices.map((choice, index) => {
              const isSelected = selectedChoice?.id === choice.id;
              const resultStyle = !isSelected ? "border-slate-300 bg-white hover:border-[#3157d5]" : choice.is_correct ? "border-green-600 bg-green-50 text-green-900" : "border-amber-500 bg-amber-50 text-amber-950";
              return <button className={`min-h-16 rounded-2xl border-2 p-4 text-left text-lg font-black transition ${resultStyle}`} disabled={Boolean(selectedChoice)} key={choice.id} onClick={() => choose(choice)} type="button"><span className="mr-3 text-[#3157d5]">{index + 1}</span>{choice.text}</button>;
            })}
          </div>
          {selectedChoice && (
            <div className={`mt-6 rounded-2xl border-2 p-5 ${selectedChoice.is_correct ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`} role="status" aria-live="polite">
              <p className={`text-center text-7xl font-black leading-none ${selectedChoice.is_correct ? "text-green-700" : "text-red-700"}`} aria-label={selectedChoice.is_correct ? "정답" : "오답"}>
                {selectedChoice.is_correct ? "○" : "×"}
              </p>
              <p className="mt-2 text-lg font-bold leading-8">{selectedChoice.feedback_text}</p>
              {selectedChoice.is_correct ? (
                <button className="mt-5 min-h-14 w-full rounded-2xl bg-[#3157d5] px-6 text-lg font-black text-white" onClick={moveNext} type="button">{stepIndex === steps.length - 1 ? "연습 결과 보기" : "다음 상황으로"}</button>
              ) : (
                <button className="mt-5 min-h-14 w-full rounded-2xl bg-amber-700 px-6 text-lg font-black text-white" onClick={retryStep} type="button">다시 선택하기</button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
