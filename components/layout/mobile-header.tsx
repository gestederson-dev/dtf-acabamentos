"use client";

import Image from "next/image";

export function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[#E4E4E7] bg-white/95 px-5 backdrop-blur dark:border-[#27272A] dark:bg-[#0A0A0B]/95">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#232021]">
        <Image
          src="/brand/logo.png"
          alt="DTF Acabamentos"
          width={28}
          height={28}
          className="h-7 w-7 object-contain brightness-0 invert"
          priority
          unoptimized
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight text-[#232021] dark:text-white">DTF</span>
        <span className="text-[10px] text-[#71717A]">Acabamentos</span>
      </div>
    </header>
  );
}
