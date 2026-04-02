"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className="inline-block h-10 w-[8.75rem] shrink-0 rounded-full bg-slate-100 dark:bg-slate-800"
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  function handlePointer(e) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setTheme(x < rect.width / 2 ? "dark" : "light");
  }

  return (
    <button
      type="button"
      ref={trackRef}
      onClick={handlePointer}
      className="relative flex h-10 w-[8.75rem] shrink-0 cursor-pointer items-center rounded-full border border-slate-200/90 bg-slate-100/90 p-1 shadow-inner transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900/95 dark:focus-visible:ring-offset-slate-900"
      aria-label="Theme: night or day"
      aria-pressed={isDark}
    >
      {/* Sliding knob */}
      <span
        className={`absolute top-1 h-8 w-[calc(50%-0.375rem)] rounded-full shadow-md transition-all duration-300 ease-out ${
          isDark
            ? "left-1 bg-white"
            : "left-[calc(50%+0.125rem)] bg-slate-800 dark:bg-slate-600"
        }`}
        aria-hidden
      />
      <span className="relative z-10 grid w-full grid-cols-2 text-[0.625rem] font-bold uppercase leading-none tracking-wide">
        <span
          className={`py-2 text-center ${
            isDark ? "text-white" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          NIGHT
        </span>
        <span
          className={`py-2 text-center ${
            isDark ? "text-slate-500" : "text-slate-900 dark:text-slate-200"
          }`}
        >
          DAY
        </span>
      </span>
    </button>
  );
}
