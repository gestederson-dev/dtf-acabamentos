"use client";

import { useState } from "react";

export function LinkPublico({ shareToken }: { shareToken: string }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(`${window.location.origin}/o/${shareToken}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 dark:border-[#27272A] dark:bg-[#18181B]">
      <span className="flex-1 truncate font-mono text-xs text-[#71717A]">/o/{shareToken}</span>
      <button
        type="button"
        onClick={copiar}
        className="h-8 shrink-0 rounded-md bg-[#232021] px-3 text-xs font-medium text-white transition-colors hover:bg-[#3F3F46] active:scale-[0.98] dark:bg-white dark:text-[#232021] dark:hover:bg-[#F4F4F5]"
      >
        {copiado ? "Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
