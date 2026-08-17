export default function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-4 w-full rounded-full bg-slate-200 animate-pulse" />
      ))}
    </div>
  );
}
