export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-6 w-32 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        <div className="mt-1.5 h-4 w-48 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
      </div>

      {/* Separador */}
      <div className="mb-8 h-px bg-[#E4E4E7] dark:bg-[#27272A]" />

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-md border border-[#E4E4E7] bg-white p-5 dark:border-[#27272A] dark:bg-[#18181B]">
            <div className="h-3 w-20 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
            <div className="mt-3 h-8 w-28 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="mb-8 rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <div className="h-4 w-48 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        </div>
        <div className="p-5">
          <div className="h-48 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        </div>
      </div>

      {/* Seções */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] px-5 py-3.5 dark:border-[#27272A]">
              <div className="h-4 w-24 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
              <div className="h-4 w-20 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
            </div>
            <div className="divide-y divide-[#F4F4F5] dark:divide-[#27272A]">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-40 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
                    <div className="h-3 w-32 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
                  </div>
                  <div className="h-7 w-20 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
