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
    <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm">
      <span className="text-zinc-500 flex-1 truncate">/o/{shareToken}</span>
      <button
        type="button"
        onClick={copiar}
        className="h-7 text-xs px-3 rounded-md bg-zinc-900 text-white font-medium hover:bg-zinc-700 transition-colors shrink-0"
      >
        {copiado ? "✅ Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
