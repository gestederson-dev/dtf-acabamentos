export default function VendasLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-10 animate-pulse">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-6 w-20 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
          <div className="mt-1.5 h-4 w-32 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        </div>
        <div className="h-9 w-28 rounded-md bg-[#F4F4F5] dark:bg-[#27272A]" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-[#E4E4E7] dark:border-[#27272A]">
        <div className="border-b border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 dark:border-[#27272A] dark:bg-[#18181B]">
          <div className="h-3 w-48 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        </div>
        <div className="divide-y divide-[#F4F4F5] dark:divide-[#27272A]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <div className="h-3 w-10 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
              <div className="h-3 w-36 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
              <div className="hidden h-3 w-24 rounded bg-[#F4F4F5] dark:bg-[#27272A] sm:block" />
              <div className="ml-auto h-3 w-20 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
              <div className="h-5 w-16 rounded-sm bg-[#F4F4F5] dark:bg-[#27272A]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
