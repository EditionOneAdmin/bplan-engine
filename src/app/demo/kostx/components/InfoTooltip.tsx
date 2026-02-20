'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface InfoTooltipProps {
  text: string;
}

export default function InfoTooltip({ text }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; arrowDir: 'down' | 'up' }>({ top: 0, left: 0, arrowDir: 'down' });

  const calcPosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const tipW = 240; // w-60 = 240px
    const tipH = 80;  // estimate
    const margin = 8;

    // Prefer above
    let top = rect.top - tipH - margin;
    let arrowDir: 'down' | 'up' = 'down';
    if (top < margin) {
      // Not enough space above → show below
      top = rect.bottom + margin;
      arrowDir = 'up';
    }

    // Center horizontally, clamp to viewport
    let left = rect.left + rect.width / 2 - tipW / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - tipW - margin));

    setPos({ top, left, arrowDir });
  }, []);

  useEffect(() => {
    if (!open) return;
    calcPosition();
    const handleScroll = () => calcPosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [open, calcPosition]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (tipRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="ml-1 w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white/70 text-[10px] leading-none inline-flex items-center justify-center transition-colors flex-shrink-0"
        type="button"
        aria-label="Info"
      >
        ⓘ
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={tipRef}
          className="fixed z-[9999] w-60 p-3 rounded-lg bg-[#1E293B] border border-white/20 shadow-2xl text-xs text-white/80 leading-relaxed"
          style={{ top: pos.top, left: pos.left }}
        >
          {text}
          {/* Arrow */}
          <div
            className="absolute w-2.5 h-2.5 bg-[#1E293B] border-white/20 rotate-45"
            style={pos.arrowDir === 'down'
              ? { bottom: -5, left: '50%', marginLeft: -5, borderRight: '1px solid', borderBottom: '1px solid' }
              : { top: -5, left: '50%', marginLeft: -5, borderLeft: '1px solid', borderTop: '1px solid' }
            }
          />
        </div>,
        document.body
      )}
    </>
  );
}
