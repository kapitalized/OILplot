export function OilplotBrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center border-2 border-oilplot-cream bg-oilplot-yellow ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-[62%] w-[62%] text-oilplot-ink" fill="currentColor">
        <path d="M12 2.69l5.66 8.93c.58.92.88 1.98.88 3.08 0 3.31-2.69 6-6 6s-6-2.69-6-6c0-1.1.3-2.16.88-3.08L12 2.69z" />
      </svg>
    </div>
  );
}
