"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type ScenarioChoice = {
  choice_order: number;
  feedback_text: string;
  id: string;
  is_correct: boolean;
  text: string;
};

export type ScenarioStep = {
  choices: ScenarioChoice[];
  description: string;
  id: string;
  is_obstacle: boolean;
  step_order: number;
  title: string;
};

type ScenarioStepListProps = {
  steps: ScenarioStep[];
};

export function ScenarioStepList({ steps }: ScenarioStepListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function deleteStep(step: ScenarioStep) {
    if (!window.confirm(`상황 ${step.step_order + 1} '${step.title}'을 삭제할까요? 삭제한 내용은 복구할 수 없습니다.`)) {
      return;
    }

    setSavingId(step.id);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("steps").delete().eq("id", step.id);

    setSavingId(null);
    if (error) {
      setMessage("상황을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setMessage("상황을 삭제했습니다.");
    if (editingId === step.id) setEditingId(null);
    router.refresh();
  }

  async function updateStep(step: ScenarioStep, formData: FormData) {
    setSavingId(step.id);
    setMessage("");

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const isObstacle = formData.get("isObstacle") === "on";
    const correctChoiceId = String(formData.get("correctChoice") ?? "");
    const choices = step.choices.map((choice) => ({
      ...choice,
      feedback_text: String(formData.get(`feedback-${choice.id}`) ?? "").trim(),
      is_correct: choice.id === correctChoiceId,
      text: String(formData.get(`choice-${choice.id}`) ?? "").trim(),
    }));

    if (!title || !description || choices.some((choice) => !choice.text || !choice.feedback_text)) {
      setMessage("수정할 내용과 모든 선택지·피드백을 입력해 주세요.");
      setSavingId(null);
      return;
    }

    const supabase = createClient();
    const choiceResults = await Promise.all(choices.map((choice) => (
      supabase
        .from("choices")
        .update({
          feedback_text: choice.feedback_text,
          is_correct: choice.is_correct,
          text: choice.text,
        })
        .eq("id", choice.id)
    )));

    if (choiceResults.some(({ error }) => error)) {
      setMessage("선택지를 수정하지 못했습니다. 새로고침 후 다시 시도해 주세요.");
      setSavingId(null);
      return;
    }

    const { error: stepError } = await supabase
      .from("steps")
      .update({ description, is_obstacle: isObstacle, title })
      .eq("id", step.id);

    setSavingId(null);
    if (stepError) {
      setMessage("상황 설명을 수정하지 못했습니다. 다시 시도해 주세요.");
      return;
    }

    setEditingId(null);
    setMessage("수정 내용을 저장했습니다.");
    router.refresh();
  }

  return (
    <>
      <ol className="mt-8 space-y-4" aria-label="저장된 상황 목록">
        {steps.map((step) => {
          const orderedChoices = [...step.choices].sort((a, b) => a.choice_order - b.choice_order);
          const isEditing = editingId === step.id;

          return (
            <li className="rounded-2xl border-2 border-slate-200 p-5" key={step.id}>
              {isEditing ? (
                <form action={(formData) => updateStep({ ...step, choices: orderedChoices }, formData)} className="space-y-4">
                  <label className="block font-bold">
                    상황 제목
                    <input className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 font-normal" defaultValue={step.title} maxLength={100} name="title" required />
                  </label>
                  <label className="block font-bold">
                    학생에게 들려줄 설명
                    <textarea className="mt-2 min-h-28 w-full rounded-xl border-2 border-slate-300 px-4 py-3 font-normal" defaultValue={step.description} maxLength={500} name="description" required />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 font-bold">
                    <input defaultChecked={step.is_obstacle} className="h-5 w-5" name="isObstacle" type="checkbox" />
                    예상 밖의 상황으로 표시
                  </label>
                  {orderedChoices.map((choice, index) => (
                    <fieldset className="rounded-xl bg-slate-50 p-4" key={choice.id}>
                      <legend className="font-black">선택지 {index + 1}</legend>
                      <label className="mt-2 flex items-center gap-2 font-bold text-emerald-800">
                        <input defaultChecked={choice.is_correct} name="correctChoice" type="radio" value={choice.id} /> 정답으로 설정
                      </label>
                      <input className="mt-3 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4" defaultValue={choice.text} maxLength={150} name={`choice-${choice.id}`} required />
                      <textarea className="mt-3 min-h-24 w-full rounded-xl border-2 border-slate-300 px-4 py-3" defaultValue={choice.feedback_text} maxLength={300} name={`feedback-${choice.id}`} required />
                    </fieldset>
                  ))}
                  <div className="flex flex-wrap gap-3">
                    <button className="min-h-12 rounded-xl bg-[#3157d5] px-5 font-black text-white disabled:opacity-60" disabled={savingId === step.id} type="submit">{savingId === step.id ? "저장 중..." : "수정 저장"}</button>
                    <button className="min-h-12 rounded-xl px-5 font-bold text-slate-600 underline" onClick={() => setEditingId(null)} type="button">취소</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-800">상황 {step.step_order + 1}</span>
                      {step.is_obstacle && <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-900">예상 밖의 상황</span>}
                    </div>
                    <div className="flex gap-3">
                      <button className="font-bold text-[#3157d5] underline" onClick={() => setEditingId(step.id)} type="button">수정</button>
                      <button className="font-bold text-red-700 underline disabled:opacity-50" disabled={savingId === step.id} onClick={() => deleteStep(step)} type="button">삭제</button>
                    </div>
                  </div>
                  <h2 className="mt-3 text-xl font-black">{step.title}</h2>
                  <p className="mt-2 leading-7 text-slate-600">{step.description}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {orderedChoices.map((choice) => (
                      <li className={`rounded-xl px-4 py-3 text-sm font-bold ${choice.is_correct ? "bg-emerald-50 text-emerald-900" : "bg-slate-100 text-slate-700"}`} key={choice.id}>
                        {choice.is_correct ? "정답 · " : ""}{choice.text}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-4 min-h-6 text-sm font-bold text-slate-700" aria-live="polite">{message}</p>
    </>
  );
}
