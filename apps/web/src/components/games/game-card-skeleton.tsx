export function GameCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <div className="aspect-[16/10] animate-pulse bg-zinc-800" />

      <div className="space-y-4 p-4">
        <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-800" />
        <div className="h-3 w-32 animate-pulse rounded bg-zinc-800" />

        <div className="grid grid-cols-2 gap-2">
          <div className="h-9 animate-pulse rounded-xl bg-zinc-800" />
          <div className="h-9 animate-pulse rounded-xl bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

export function GameCardSkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <GameCardSkeleton key={index} />
      ))}
    </div>
  );
}
