/**
 * @param {{ className?: string; label?: string }} props
 */
export function LoadingDots({ className = "text-blue-600", label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      role="status"
      aria-label={label || "Loading"}
    >
      <span className="loading-dot-animate inline-block h-1.5 w-1.5 rounded-full bg-current [animation-delay:0ms]" />
      <span className="loading-dot-animate inline-block h-1.5 w-1.5 rounded-full bg-current [animation-delay:150ms]" />
      <span className="loading-dot-animate inline-block h-1.5 w-1.5 rounded-full bg-current [animation-delay:300ms]" />
    </span>
  );
}
