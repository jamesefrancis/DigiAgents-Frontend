// src/components/common/catalog-loading-skeleton.jsx
function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse rounded bg-white/10 ${className}`} />;
}

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4">
      <SkeletonLine className="h-3 w-20" />
      <SkeletonLine className="mt-5 h-8 w-12 bg-white/15" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="min-h-[230px] rounded-2xl border border-card-border bg-card-bg p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <SkeletonLine className="h-6 w-2/3 bg-white/15" />
          <SkeletonLine className="mt-4 h-4 w-full" />
          <SkeletonLine className="mt-2 h-4 w-5/6" />
          <SkeletonLine className="mt-2 h-4 w-3/5" />
        </div>
        <SkeletonLine className="h-7 w-14 rounded-lg bg-mint/10" />
      </div>

      <div className="mt-6 flex gap-2">
        <SkeletonLine className="h-8 w-24" />
        <SkeletonLine className="h-8 w-20" />
        <SkeletonLine className="h-8 w-16" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <SkeletonLine className="h-6 w-24 rounded-md" />
        <SkeletonLine className="h-6 w-16 rounded-md" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-2">
        <SkeletonLine className="h-11 rounded-lg bg-white/10" />
        <SkeletonLine className="h-11 rounded-lg bg-white/5" />
      </div>
    </div>
  );
}

export default function CatalogLoadingSkeleton({
  title = 'Loading catalog',
  subtitle = 'Preparing your workspace...',
  statCount = 0,
  cardCount = 6,
  columnsClassName = 'lg:grid-cols-2 xl:grid-cols-3'
}) {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="rounded-2xl border border-yellow/15 bg-yellow/[0.04] p-4">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-yellow/80 border-t-transparent" />
          <div>
            <p className="font-display text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-xs text-text-dim">{subtitle}</p>
          </div>
        </div>
      </div>

      {statCount ? (
        <div className={`grid gap-3 ${statCount === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
          {Array.from({ length: statCount }).map((_, index) => (
            <StatSkeleton key={index} />
          ))}
        </div>
      ) : null}

      <div className={`grid grid-cols-1 gap-4 ${columnsClassName}`}>
        {Array.from({ length: cardCount }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
