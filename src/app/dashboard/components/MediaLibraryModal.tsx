import React, { useEffect } from "react";
import MediaLibrary from "./MediaLibrary";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="relative flex flex-col w-full max-w-6xl max-h-full bg-white dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select Media</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden p-4">
          <MediaLibrary 
            selectionMode="single" 
            onSelect={(asset) => {
              onSelect(asset);
              onClose();
            }}
            className="border-none shadow-none h-full min-h-[500px]"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
