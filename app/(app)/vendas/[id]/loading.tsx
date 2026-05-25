export default function VendaDetalheLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 py-6 lg:px-8 lg:py-10">
      {/* Back + header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-4 w-16 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
      </div>
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-6 w-36 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
          <div className="h-4 w-24 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        </div>
        <div className="h-7 w-20 rounded-full bg-[#F4F4F5] dark:bg-[#27272A]" />
      </div>

      {/* Card principal */}
      <div className="mb-4 rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <div className="h-4 w-24 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        </div>
        <div className="divide-y divide-[#F4F4F5] px-5 dark:divide-[#27272A]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="h-3.5 w-28 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
              <div className="h-3.5 w-20 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
            </div>
          ))}
        </div>
      </div>

      {/* Card financeiro */}
      <div className="mb-4 rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <div className="h-4 w-32 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        </div>
        <div className="divide-y divide-[#F4F4F5] px-5 dark:divide-[#27272A]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="h-3.5 w-24 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
              <div className="h-3.5 w-24 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
            </div>
          ))}
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2">
        <div className="h-9 flex-1 rounded-md bg-[#F4F4F5] dark:bg-[#27272A]" />
        <div className="h-9 w-28 rounded-md bg-[#F4F4F5] dark:bg-[#27272A]" />
      </div>
    </div>
  );
}
