"use client";

// 編集パネル用の小さな UI 部品

import type { ReactNode } from "react";

export function Section({ no, title, children, aside }: { no: string; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="border-l-2 border-neutral-500 pl-2 text-[11px] font-black uppercase italic tracking-wider text-neutral-400">
          {no}. {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Toggle({ active, onClick, children, className = "" }: { active: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border py-2 text-[11px] font-black italic transition active:scale-95 ${active ? "border-white bg-white text-black" : "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300"} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className="flex justify-between text-[10px] font-bold text-neutral-500">
        {label}
        {hint && <span className="font-normal text-neutral-600">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-neutral-800 bg-black px-3 py-2.5 text-sm font-bold text-white outline-none placeholder:text-neutral-700 focus:border-neutral-500";

export function Slider({ label, value, min, max, step = 1, onChange, format }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-[10px] font-black italic text-neutral-400">
        <span>{label}</span>
        <span className="font-mono not-italic">{format ? format(value) : value}</span>
      </span>
      <input type="range" className="range w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[11px] font-bold text-neutral-400">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-white" />
      {children}
    </label>
  );
}
