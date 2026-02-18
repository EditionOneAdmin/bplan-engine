"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function InfoTooltip({ term, definition, formula }: { term: string; definition: string; formula?: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const tooltipW = 224; // w-56 = 14rem = 224px
    let left = rect.left + rect.width / 2 - tooltipW / 2;
    // Keep within viewport
    if (left < 8) left = 8;
    if (left + tooltipW > window.innerWidth - 8) left = window.innerWidth - 8 - tooltipW;
    // Position above button by default, below if not enough space
    const spaceAbove = rect.top;
    const top = spaceAbove > 100 ? rect.top - 8 : rect.bottom + 8;
    const anchor = spaceAbove > 100 ? "above" : "below";
    setPos({ top: anchor === "above" ? top : top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        tooltipRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="ml-1 text-[10px] text-white/30 hover:text-white/60 transition-colors inline-block"
        aria-label={`Info: ${term}`}
      >
        ⓘ
      </button>
      {open && pos && typeof document !== "undefined" && createPortal(
        <div
          ref={tooltipRef}
          className="fixed w-56 p-2 rounded-lg bg-gray-900 border border-white/10 shadow-2xl text-[10px] text-white/80"
          style={{ top: pos.top, left: pos.left, zIndex: 9999, transform: pos.top < (btnRef.current?.getBoundingClientRect().top ?? 0) ? "translateY(-100%)" : undefined }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-bold text-white mb-1">{term}</div>
          <div className="leading-relaxed">{definition}</div>
          {formula && <div className="mt-1 text-white/50 font-mono text-[9px]">📐 {formula}</div>}
        </div>,
        document.body
      )}
    </>
  );
}
