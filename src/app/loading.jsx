import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 bg-slate-50/80 px-4 py-20 text-slate-600">
      <Loader2
        className="h-10 w-10 animate-spin text-blue-600"
        aria-hidden
      />
      <p className="text-sm font-medium">Loading…</p>
    </div>
  );
}
