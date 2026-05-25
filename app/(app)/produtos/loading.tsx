export default function ProdutosLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 py-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="h-6 w-24 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        <div className="mt-1.5 h-4 w-48 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
      </div>

      {/* Lista */}
      <div className="overflow-hidden rounded-md border border-[#E4E4E7] dark:border-[#27272A]">
        <div className="border-b border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 dark:border-[#27272A] dark:bg-[#111318]">
          <div className="h-3 w-32 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        </div>
        <div className="divide-y divide-[#F4F4F5] dark:divide-[#27272A]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4">
              <div className="space-y-1.5">
                <div className="h-4 w-40 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
                <div className="h-3 w-28 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-16 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
                <div className="h-7 w-16 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
