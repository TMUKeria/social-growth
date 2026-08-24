import Link from "next/link";

type BrandLogoProps = { compact?: boolean; inverse?: boolean };

export function BrandLogo({ compact = false, inverse = false }: BrandLogoProps) {
  return (
    <Link className={`inline-flex items-center gap-2.5 font-black ${compact ? "text-lg" : "text-xl"} ${inverse ? "text-white" : "text-[#123878]"}`} href="/">
      <span className="flex size-8 rotate-45 items-center justify-center rounded-[10px] bg-[#ffc72c] shadow-sm" aria-hidden="true">
        <span className="-rotate-45 text-lg font-black text-white">✓</span>
      </span>
      하루의 선택
    </Link>
  );
}
