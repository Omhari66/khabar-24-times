import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm px-5 py-4 text-sm font-semibold text-slate-700">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
        Loading content...
      </div>
    </div>
  );
}
