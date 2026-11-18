export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="h-44 w-full rounded-lg bg-slate-200" />
          <div className="mt-4 h-5 w-2/3 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-full rounded bg-slate-200" />
          <div className="mt-4 flex items-center justify-between">
            <div className="h-6 w-20 rounded bg-slate-200" />
            <div className="h-9 w-28 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}