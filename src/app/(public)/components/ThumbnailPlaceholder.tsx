import { ImageIcon } from "lucide-react";

export function ThumbnailPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-slate-100 text-slate-300 ${className}`}>
      <ImageIcon className="w-1/3 h-1/3 max-w-[24px] max-h-[24px]" />
    </div>
  );
}
