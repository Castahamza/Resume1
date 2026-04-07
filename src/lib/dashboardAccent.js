/** @typedef {{ id: string; name: string; swatch: string; ctaBg: string; ctaBgHover: string; ctaShadow: string; navActiveBg: string; navActiveText: string; navActiveRing: string; resumeBar: string; upgradeBorder: string; upgradeBg: string; upgradeText: string; sidebarGlow: string }} DashboardAccentPreset */

export const DASHBOARD_ACCENT_STORAGE_KEY = "zoru-dashboard-accent";

/** @type {DashboardAccentPreset[]} */
export const DASHBOARD_ACCENTS = [
  {
    id: "sky",
    name: "Sky",
    swatch: "#0ea5e9",
    ctaBg: "#0ea5e9",
    ctaBgHover: "#38bdf8",
    ctaShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.4)",
    navActiveBg: "rgba(14, 165, 233, 0.15)",
    navActiveText: "#7dd3fc",
    navActiveRing: "rgba(14, 165, 233, 0.35)",
    resumeBar: "#0ea5e9",
    upgradeBorder: "rgba(14, 165, 233, 0.5)",
    upgradeBg: "rgba(14, 165, 233, 0.1)",
    upgradeText: "#7dd3fc",
    sidebarGlow: "rgba(14, 165, 233, 0.14)",
  },
  {
    id: "violet",
    name: "Violet",
    swatch: "#8b5cf6",
    ctaBg: "#8b5cf6",
    ctaBgHover: "#a78bfa",
    ctaShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.4)",
    navActiveBg: "rgba(139, 92, 246, 0.15)",
    navActiveText: "#c4b5fd",
    navActiveRing: "rgba(139, 92, 246, 0.35)",
    resumeBar: "#8b5cf6",
    upgradeBorder: "rgba(139, 92, 246, 0.5)",
    upgradeBg: "rgba(139, 92, 246, 0.1)",
    upgradeText: "#c4b5fd",
    sidebarGlow: "rgba(192, 132, 252, 0.12)",
  },
  {
    id: "emerald",
    name: "Emerald",
    swatch: "#10b981",
    ctaBg: "#10b981",
    ctaBgHover: "#34d399",
    ctaShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)",
    navActiveBg: "rgba(16, 185, 129, 0.15)",
    navActiveText: "#6ee7b7",
    navActiveRing: "rgba(16, 185, 129, 0.35)",
    resumeBar: "#10b981",
    upgradeBorder: "rgba(16, 185, 129, 0.5)",
    upgradeBg: "rgba(16, 185, 129, 0.1)",
    upgradeText: "#6ee7b7",
    sidebarGlow: "rgba(16, 185, 129, 0.12)",
  },
  {
    id: "rose",
    name: "Rose",
    swatch: "#f43f5e",
    ctaBg: "#e11d48",
    ctaBgHover: "#fb7185",
    ctaShadow: "0 10px 25px -5px rgba(244, 63, 94, 0.35)",
    navActiveBg: "rgba(244, 63, 94, 0.15)",
    navActiveText: "#fda4af",
    navActiveRing: "rgba(244, 63, 94, 0.35)",
    resumeBar: "#f43f5e",
    upgradeBorder: "rgba(244, 63, 94, 0.5)",
    upgradeBg: "rgba(244, 63, 94, 0.1)",
    upgradeText: "#fda4af",
    sidebarGlow: "rgba(251, 113, 133, 0.1)",
  },
  {
    id: "amber",
    name: "Amber",
    swatch: "#f59e0b",
    ctaBg: "#d97706",
    ctaBgHover: "#fbbf24",
    ctaShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.35)",
    navActiveBg: "rgba(245, 158, 11, 0.15)",
    navActiveText: "#fcd34d",
    navActiveRing: "rgba(245, 158, 11, 0.35)",
    resumeBar: "#f59e0b",
    upgradeBorder: "rgba(245, 158, 11, 0.5)",
    upgradeBg: "rgba(245, 158, 11, 0.1)",
    upgradeText: "#fcd34d",
    sidebarGlow: "rgba(252, 211, 77, 0.1)",
  },
  {
    id: "cyan",
    name: "Cyan",
    swatch: "#06b6d4",
    ctaBg: "#06b6d4",
    ctaBgHover: "#22d3ee",
    ctaShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.4)",
    navActiveBg: "rgba(6, 182, 212, 0.15)",
    navActiveText: "#67e8f9",
    navActiveRing: "rgba(6, 182, 212, 0.35)",
    resumeBar: "#06b6d4",
    upgradeBorder: "rgba(6, 182, 212, 0.5)",
    upgradeBg: "rgba(6, 182, 212, 0.1)",
    upgradeText: "#67e8f9",
    sidebarGlow: "rgba(34, 211, 238, 0.12)",
  },
];

const DEFAULT_ID = "sky";

export function getDashboardAccentById(id) {
  return (
    DASHBOARD_ACCENTS.find((a) => a.id === id) ??
    DASHBOARD_ACCENTS.find((a) => a.id === DEFAULT_ID)
  );
}

export function readStoredDashboardAccentId() {
  if (typeof window === "undefined") return DEFAULT_ID;
  try {
    const raw = window.localStorage.getItem(DASHBOARD_ACCENT_STORAGE_KEY);
    if (raw && DASHBOARD_ACCENTS.some((a) => a.id === raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_ID;
}

export function writeStoredDashboardAccentId(id) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DASHBOARD_ACCENT_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}
