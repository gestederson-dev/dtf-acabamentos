export default function NovaVendaLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8 lg:py-10 animate-pulse">
      <div className="mb-8">
        <div className="h-6 w-36 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        <div className="mt-1.5 h-4 w-52 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
      </div>
      <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <div className="h-4 w-40 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
        </div>
        <div className="space-y-4 px-5 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-[#F4F4F5] dark:bg-[#27272A]" />
              <div className="h-10 w-full rounded-md bg-[#F4F4F5] dark:bg-[#27272A]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
