export function Skeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-list p-4 space-y-3" role="status" aria-label="Loading records">
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton-row py-3 flex items-center justify-between gap-4 border-b border-gray-50 last:border-0" key={i}>
          <div className="grow space-y-2">
            <div
              className="skeleton skeleton-line h-3 rounded-full bg-gray-200"
              style={{ width: `${55 + (i % 3) * 15}%` }}
            />
            <div
              className="skeleton skeleton-line short h-2 rounded-full bg-gray-100"
              style={{ width: `${25 + (i % 2) * 15}%` }}
            />
          </div>
          <span className="skeleton skeleton-pill w-16 h-6 rounded-full bg-gray-100 shrink-0" />
        </div>
      ))}
      <span className="sr-only">Loading records…</span>
    </div>
  );
}

