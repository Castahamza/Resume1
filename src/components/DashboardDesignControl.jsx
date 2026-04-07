"use client";

import { useState } from "react";
import { ChevronDown, Palette } from "lucide-react";
import { DASHBOARD_ACCENTS } from "@/lib/dashboardAccent";

/**
 * @param {{
 *   accentId: string;
 *   onAccentChange: (id: string) => void;
 *   onMenuToggle?: (open: boolean) => void;
 * }} props
 */
export function DashboardDesignControl({
  accentId,
  onAccentChange,
  onMenuToggle,
}) {
  const [open, setOpen] = useState(true);

  function toggle() {
    const next = !open;
    setOpen(next);
    onMenuToggle?.(next);
  }

  return (
    <div className="border-t border-[#30363d] px-3 py-3">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#21262d] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-200 transition hover:border-white/15 hover:bg-white/5"
      >
        <span className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-slate-400" aria-hidden />
          Design
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          className="mt-3 grid grid-cols-6 gap-2"
          role="listbox"
          aria-label="Accent color"
        >
          {DASHBOARD_ACCENTS.map((a) => {
            const selected = a.id === accentId;
            return (
              <button
                key={a.id}
                type="button"
                role="option"
                aria-selected={selected}
                title={a.name}
                onClick={() => onAccentChange(a.id)}
                className={`relative aspect-square rounded-full border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  selected
                    ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.25)] scale-105"
                    : "border-transparent hover:border-white/30"
                }`}
                style={{ backgroundColor: a.swatch }}
              >
                <span className="sr-only">{a.name}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {open ? (
        <p className="mt-2 text-[10px] leading-snug text-slate-500">
          Accent updates the sidebar, buttons, and highlights — saved on this
          device.
        </p>
      ) : null}
    </div>
  );
}
