"use client";

import { Toaster } from "react-hot-toast";

export function AppProviders({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        gutter={12}
        containerClassName="!top-[env(safe-area-inset-top,0px)] sm:!top-4"
        toastOptions={{
          duration: 4000,
          className:
            "!rounded-lg !border !border-slate-200 !bg-white !text-slate-900 !shadow-lg !px-4 !py-3 !text-sm",
          success: {
            iconTheme: { primary: "#2563eb", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
          },
        }}
      />
    </>
  );
}
