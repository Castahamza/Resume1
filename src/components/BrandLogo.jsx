/**
 * @param {{ className?: string; size?: number }} props
 */
export function BrandLogo({ className = "", size = 36 }) {
  return (
    <img
      src="/logo.svg"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-lg shadow-sm ${className}`}
    />
  );
}
