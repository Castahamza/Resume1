"use client";

import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster
        position="top-center"
        gutter={12}
        containerClassName="!top-[env(safe-area-inset-top,0px)] sm:!top-4"
        toastOptions={{
          duration: 4000,
          className:
            "!rounded-lg !border !border-slate-200 !bg-white !text-slate-900 !shadow-lg !px-4 !py-3 !text-sm dark:!border-slate-600 dark:!bg-slate-800 dark:!text-slate-100",
          success: {
            iconTheme: { primary: "#2563eb", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
          },
        }}
      />
    </ThemeProvider>
  );
}
