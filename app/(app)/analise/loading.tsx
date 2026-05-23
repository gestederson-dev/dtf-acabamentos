export default function AnaliseLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-10 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-6 w-40 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        <div className="mt-1.5 h-4 w-56 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-[#E4E4E7] pb-0 dark:border-[#27272A]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-t bg-[#F4F4F5] dark:bg-[#27272A]" />
        ))}
      </div>

      {/* Sliders */}
      <div className="mb-8 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3.5 w-32 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
            <div className="h-2 w-full rounded-full bg-[#F4F4F5] dark:bg-[#27272A]" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <div className="h-4 w-40 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        </div>
        <div className="p-5">
          <div className="h-64 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        </div>
      </div>
    </div>
  );
}
