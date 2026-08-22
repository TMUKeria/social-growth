"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ScenarioStepFormProps = {
  nextStepOrder: number;
  scenarioId: string;
  startOpen: boolean;
};

type ChoiceDraft = {
  feedback: string;
  text: string;
};

const emptyChoice = (): ChoiceDraft => ({ feedback: "", text: "" });

export function ScenarioStepForm({ nextStepOrder, scenarioId, startOpen }: ScenarioStepFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(startOpen);
  const [choices, setChoices] = useState<ChoiceDraft[]>([emptyChoice(), emptyChoice()]);
  const [correctChoice, setCorrectChoice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateChoice(index: number, field: keyof ChoiceDraft, value: string) {
    setChoices((current) => current.map((choice, choiceIndex) => (
      choiceIndex === index ? { ...choice, [field]: value } : choice
    )));
  }

  function addChoice() {
    if (choices.length < 3) {
      setChoices((current) => [...current, emptyChoice()]);
    }
  }

  function removeChoice(index: number) {
    if (choices.length === 2) return;

    setChoices((current) => current.filter((_, choiceIndex) => choiceIndex !== index));
    setCorrectChoice((current) => {
      if (current === index) return 0;
      return current > index ? current - 1 : current;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setLoading(true);
    setMessage("");

    const form = new FormData(formElement);
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const isObstacle = form.get("isObstacle") === "on";
    const normalizedChoices = choices.map((choice) => ({
      feedback: choice.feedback.trim(),
      text: choice.text.trim(),
    }));

    if (!title || !description) {
      setMessage("상황 제목과 설명을 모두 입력해 주세요.");
      setLoading(false);
      return;
    }

    if (normalizedChoices.some((choice) => !choice.text || !choice.feedback)) {
      setMessage("모든 선택지와 피드백을 입력해 주세요.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: step, error: stepError } = await supabase
      .from("steps")
      .insert({
        description,
        is_obstacle: isObstacle,
        scenario_id: scenarioId,
        step_order: nextStepOrder,
        title,
      })
      .select("id")
      .single();

    if (stepError) {
      setMessage("상황을 저장하지 못했습니다. 새로고침 후 다시 시도해 주세요.");
      setLoading(false);
      return;
    }

    const { error: choicesError } = await supabase.from("choices").insert(
      normalizedChoices.map((choice, index) => ({
        choice_order: index,
        feedback_text: choice.feedback,
        is_correct: index === correctChoice,
        step_id: step.id,
        text: choice.text,
      })),
    );

    if (choicesError) {
      await supabase.from("steps").delete().eq("id", step.id);
      setMessage("선택지를 저장하지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.");
      setLoading(false);
      return;
    }

    formElement.reset();
    setChoices([emptyChoice(), emptyChoice()]);
    setCorrectChoice(0);
    setMessage("상황과 선택지를 저장했습니다.");
    setLoading(false);
    setIsOpen(false);
    router.refresh();
  }

  if (!isOpen) {
    return (
      <button
        className="mt-6 min-h-14 w-full rounded-xl border-2 border-dashed border-[#3157d5] px-5 text-lg font-black text-[#3157d5] hover:bg-blue-50"
        onClick={() => {
          setMessage("");
          setIsOpen(true);
        }}
        type="button"
      >
        + 새 상황 추가
      </button>
    );
  }

  return (
    <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-2xl bg-blue-50 px-5 py-4 font-bold text-blue-900">
        상황 {nextStepOrder + 1} 추가
      </div>

      <label className="block font-bold">
        상황 제목
        <input
          className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 font-normal"
          maxLength={100}
          name="title"
          placeholder="예: 버스 정류장에서"
          required
        />
      </label>

      <label className="block font-bold">
        학생에게 들려줄 설명
        <textarea
          className="mt-2 min-h-28 w-full rounded-xl border-2 border-slate-300 px-4 py-3 font-normal leading-7"
          maxLength={500}
          name="description"
          placeholder="예: 버스가 도착했습니다. 어떻게 해야 할까요?"
          required
        />
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-amber-50 p-5">
        <input className="mt-1 h-5 w-5" name="isObstacle" type="checkbox" />
        <span>
          <span className="block font-bold">예상 밖의 상황으로 표시</span>
          <span className="mt-1 block text-sm font-normal leading-6 text-slate-600">평소 순서와 다르게 갑자기 생긴 변화라면 선택하세요. 예: 엘리베이터 고장, 큰 소리, 버스 노선 변경</span>
        </span>
      </label>

      <fieldset className="space-y-4">
        <legend className="text-xl font-black">선택지와 피드백</legend>
        <p className="text-sm leading-6 text-slate-600">정답 하나를 선택하고, 각 선택 후 학생에게 보여줄 설명을 입력하세요.</p>

        {choices.map((choice, index) => (
          <div className="rounded-2xl border-2 border-slate-200 p-5" key={index}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 font-black text-emerald-800">
                <input
                  checked={correctChoice === index}
                  className="h-5 w-5"
                  name="correctChoice"
                  onChange={() => setCorrectChoice(index)}
                  type="radio"
                />
                선택지 {index + 1}을 정답으로 설정
              </label>
              {choices.length === 3 && (
                <button className="font-bold text-red-700 underline" onClick={() => removeChoice(index)} type="button">
                  이 선택지 삭제
                </button>
              )}
            </div>
            <label className="mt-4 block font-bold">
              선택지 문구
              <input
                className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 font-normal"
                maxLength={150}
                onChange={(event) => updateChoice(index, "text", event.target.value)}
                placeholder="예: 차례대로 줄을 서서 탄다."
                required
                value={choice.text}
              />
            </label>
            <label className="mt-4 block font-bold">
              선택 후 피드백
              <textarea
                className="mt-2 min-h-24 w-full rounded-xl border-2 border-slate-300 px-4 py-3 font-normal"
                maxLength={300}
                onChange={(event) => updateChoice(index, "feedback", event.target.value)}
                placeholder={correctChoice === index ? "예: 참 잘했어요! 안전하게 탑승했습니다." : "예: 먼저 내리는 사람을 기다린 뒤 타야 안전해요."}
                required
                value={choice.feedback}
              />
            </label>
          </div>
        ))}
      </fieldset>

      {choices.length < 3 && (
        <button className="min-h-12 w-full rounded-xl border-2 border-dashed border-[#3157d5] font-black text-[#3157d5] hover:bg-blue-50" onClick={addChoice} type="button">
          + 세 번째 선택지 추가
        </button>
      )}

      <button className="min-h-14 w-full rounded-xl bg-[#3157d5] px-5 text-lg font-black text-white hover:bg-[#2543a9] disabled:opacity-60" disabled={loading} type="submit">
        {loading ? "저장 중..." : `상황 ${nextStepOrder + 1} 저장`}
      </button>
      {nextStepOrder > 0 && (
        <button className="min-h-12 w-full rounded-xl font-bold text-slate-600 underline" onClick={() => setIsOpen(false)} type="button">
          추가하지 않고 닫기
        </button>
      )}
      <p className="min-h-6 text-sm font-bold text-slate-700" aria-live="polite">{message}</p>
    </form>
  );
}
