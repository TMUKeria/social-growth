"use client";

import Link from "next/link";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Props = { isPublic: boolean; scenarioId: string; scenarioTitle: string };

export function ScenarioShareButton({ isPublic, scenarioId, scenarioTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }

  return (
    <>
      <button className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#0754c9] bg-white px-3 text-sm font-bold text-[#0754c9] hover:bg-blue-50" onClick={() => { setShareUrl(`${window.location.origin}/play/${scenarioId}`); setCopied(false); setOpen(true); }} type="button">↗ 공유</button>
      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-5" onMouseDown={() => setOpen(false)} role="presentation"><section aria-label={`${scenarioTitle} 공유`} aria-modal="true" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()} role="dialog"><div className="flex items-start justify-between gap-4"><div><p className="font-bold text-[#0754c9]">공유하기</p><h2 className="mt-1 text-2xl font-black">{scenarioTitle}</h2></div><button aria-label="공유 창 닫기" className="text-2xl text-slate-500" onClick={() => setOpen(false)} type="button">×</button></div>{isPublic ? <><div className="mx-auto mt-6 w-fit rounded-2xl border border-slate-200 bg-white p-4"><QRCodeSVG aria-label="시나리오 공유 QR 코드" size={180} value={shareUrl} /></div><p className="mt-5 break-all rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{shareUrl}</p><div className="mt-4 grid grid-cols-2 gap-3"><button className="min-h-12 rounded-xl bg-[#0754c9] px-4 font-black text-white" onClick={copyLink} type="button">{copied ? "복사 완료" : "링크 복사"}</button><Link className="flex min-h-12 items-center justify-center rounded-xl border border-slate-300 font-black" href={`/play/${scenarioId}`} target="_blank">플레이 열기</Link></div></> : <div className="mt-6 rounded-2xl bg-amber-50 p-5"><p className="font-black text-amber-950">현재 비공개 시나리오입니다.</p><p className="mt-2 leading-6 text-amber-900">오른쪽 `⋯` 메뉴에서 공개로 전환한 뒤 링크와 QR 코드를 공유할 수 있습니다.</p></div>}</section></div>}
    </>
  );
}
