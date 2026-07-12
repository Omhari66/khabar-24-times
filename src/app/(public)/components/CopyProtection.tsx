"use client";

import React, { useEffect, useRef } from "react";

interface CopyProtectionProps {
  children: React.ReactNode;
  sourceUrl: string;
}

export default function CopyProtection({ children, sourceUrl }: CopyProtectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const selectedText = selection.toString();
      const truncatedText = selectedText.length > 100 
        ? selectedText.substring(0, 100) + "..."
        : selectedText;
        
      const attribution = `\n\nRead more at ${sourceUrl}`;
      const clipboardText = truncatedText + attribution;

      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", clipboardText);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("copy", handleCopy);
    }

    return () => {
      if (container) {
        container.removeEventListener("copy", handleCopy);
      }
    };
  }, [sourceUrl]);

  return <div ref={containerRef}>{children}</div>;
}
