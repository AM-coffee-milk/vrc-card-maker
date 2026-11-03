"use client";

// 写真のトリミング位置を調整するポップアップ。
// 枠はカード上の写真枠と同じ縦横比なので、ここで見えている範囲がそのままカードに出る。

import { useEffect, useRef } from "react";
import { RotateCcw, X } from "lucide-react";
import { DEFAULT_FRAME, type PhotoFrame } from "@/lib/card";
import { FramedImg, panFrame } from "@/components/card/parts";
import { Slider } from "./ui";

export default function CropDialog({ title, src, frame, aspect, onChange, onClose }: { title: string; src: string; frame: PhotoFrame; aspect: number; onChange: (frame: PhotoFrame) => void; onClose: () => void }) {
  const drag = useRef<{ px: number; py: number; frame: PhotoFrame; w: number; h: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = { px: e.clientX, py: e.clientY, frame, w: rect.width, h: rect.height };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d) onChange(panFrame(d.frame, e.clientX - d.px, e.clientY - d.py, d.w, d.h));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  // 縦長の枠でも画面からはみ出さないよう、高さの上限から幅を決める
  const maxH = 420;
  const width = `min(100%, ${Math.round(maxH * aspect)}px)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <div className="flex max-h-full w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-[2rem] border border-neutral-800 bg-neutral-900 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black italic">{title}のトリミング</h2>
          <button type="button" onClick={onClose} aria-label="閉じる" className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-center rounded-xl bg-black p-3">
          <div
            className="relative cursor-grab touch-none overflow-hidden rounded-lg active:cursor-grabbing"
            style={{ width, aspectRatio: String(aspect) }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <FramedImg src={src} frame={frame} />
            {/* 構図を合わせやすいよう三分割線を出す */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className="border border-white/15" />
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-neutral-500">写真をドラッグして位置を合わせてください。枠の中がそのままカードに出ます</p>

        <div className="rounded-xl border border-neutral-800 bg-black p-3">
          <Slider label="ズーム" value={frame.zoom} min={1} max={3} step={0.05} format={(v) => `${v.toFixed(2)}x`} onChange={(zoom) => onChange({ ...frame, zoom })} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onChange({ ...DEFAULT_FRAME })} className="flex items-center justify-center gap-1.5 rounded-2xl border border-neutral-700 py-3 text-sm font-black text-neutral-300 active:scale-95">
            <RotateCcw size={15} /> リセット
          </button>
          <button type="button" onClick={onClose} className="rounded-2xl bg-white py-3 text-sm font-black text-black active:scale-95">
            完了
          </button>
        </div>
      </div>
    </div>
  );
}
