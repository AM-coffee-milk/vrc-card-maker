"use client";

// テンプレート間で共有するカードの部品

import { createContext, useContext, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { ImageIcon } from "lucide-react";
import { FRIEND_INFO, STATUS_INFO, STATUS_ORDER, micText, type CardData, type PhotoFrame, type Status, type Tag } from "@/lib/card";

interface CardCtx {
  data: CardData;
  /** プレビュー上で写真をドラッグして位置調整するときに使う */
  onPhotoChange?: (photo: PhotoFrame) => void;
}

export const CardContext = createContext<CardCtx | null>(null);

export function useCard() {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error("CardContext がありません");
  return ctx;
}

/** メイン写真。位置・ズームを反映し、プレビューではドラッグで動かせる */
export function MainPhoto({ className = "", placeholderColor }: { className?: string; placeholderColor?: string }) {
  const { data, onPhotoChange } = useCard();
  const { x, y, zoom } = data.photo;
  const drag = useRef<{ px: number; py: number; x: number; y: number; w: number; h: number } | null>(null);

  if (!data.mainImage) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 ${className}`} style={{ color: placeholderColor ?? "rgba(255,255,255,0.35)" }}>
        <ImageIcon size={40} strokeWidth={1.5} />
        <span className="font-mono text-[12px] tracking-[0.2em]">NO PHOTO</span>
      </div>
    );
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onPhotoChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = { px: e.clientX, py: e.clientY, x, y, w: rect.width, h: rect.height };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !onPhotoChange) return;
    // 指の移動量を object-position の % に換算 (ズーム時は細かく動く)
    const k = 100 / zoom;
    const nx = Math.min(100, Math.max(0, d.x - ((e.clientX - d.px) / d.w) * k * 1.5));
    const ny = Math.min(100, Math.max(0, d.y - ((e.clientY - d.py) / d.h) * k * 1.5));
    onPhotoChange({ ...data.photo, x: Math.round(nx * 10) / 10, y: Math.round(ny * 10) / 10 });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div
      className={`overflow-hidden ${onPhotoChange ? "cursor-grab touch-none active:cursor-grabbing" : ""} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={data.mainImage}
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full select-none object-cover"
        style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` }}
      />
    </div>
  );
}

/** サブ写真 (PHOTO MODE) */
export function SubPhoto({ src, className = "", style }: { src: string | null; className?: string; style?: CSSProperties }) {
  return (
    <div className={`overflow-hidden ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt="" className="h-full w-full object-cover" />}
    </div>
  );
}

/**
 * 長い文章を枠に収まるまで縮小する。最小サイズでも溢れるときは data-overflow を付ける
 * (編集画面の警告表示に使う)。
 */
export function FitText({ children, max, min, className = "", style }: { children: ReactNode; max: number; min: number; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let size = max;
    el.style.fontSize = `${size}px`;
    while (el.scrollHeight > el.clientHeight + 1 && size > min) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
    el.dataset.overflow = String(el.scrollHeight > el.clientHeight + 1);
  });
  return (
    <div ref={ref} data-fit className={`min-h-0 overflow-hidden whitespace-pre-wrap break-words ${className}`} style={style}>
      {children}
    </div>
  );
}

export type ActiveTag = Tag & { status: Exclude<Status, "none"> };

/** 使用中のタグ (ステータス順) */
export function activeTags(tags: Tag[]): ActiveTag[] {
  return STATUS_ORDER.flatMap((s) => tags.filter((t): t is ActiveTag => t.status === s && !!t.label.trim()));
}

/** 凡例に出すステータス (使われているものだけ) */
export function usedStatuses(tags: Tag[]) {
  return STATUS_ORDER.filter((s) => tags.some((t) => t.status === s && t.label.trim()));
}

/** 円形のマイク ON 率メーター */
export function MicRing({ value, size, stroke, color, track, textColor, label = true }: { value: number; size: number; stroke: number; color: string; track: string; textColor: string; label?: boolean }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none" style={{ color: textColor }}>
        {label && <span className="font-mono text-[8px] tracking-wider opacity-70">MIC ON</span>}
        <span className={`font-oswald font-bold ${value === 0 ? "text-[12px]" : "text-[15px]"}`}>{micText(value)}</span>
      </div>
    </div>
  );
}

/** 入力済みのプロフィール項目 */
export function infoRows(d: CardData) {
  return [
    { key: "x", label: "X", ja: "X", value: d.xId ? (d.xId.startsWith("@") ? d.xId : `@${d.xId}`) : "" },
    { key: "weekday", label: "Weekday", ja: "平日", value: d.activeTime },
    { key: "holiday", label: "Holiday", ja: "休日", value: d.activeHoliday },
    { key: "fav", label: "Favorite", ja: "すきなもの", value: d.favorites },
  ].filter((r) => r.value.trim());
}

/** 名前の横に押す、フレンド申請の判子 */
export function FriendStamp({ color, size = 72, className = "", style }: { color: string; size?: number; className?: string; style?: CSSProperties }) {
  const { data } = useCard();
  if (data.friend === "none") return null;
  const info = FRIEND_INFO[data.friend];
  return (
    <div
      className={`pointer-events-none flex shrink-0 rotate-[-10deg] flex-col items-center justify-center rounded-full text-center ${className}`}
      style={{ width: size, height: size, border: `3px double ${color}`, color, ...style }}
    >
      <span className="font-oswald text-[9px] font-bold leading-none tracking-[0.2em]">FRIEND</span>
      <span className="my-[3px] h-px w-[64%]" style={{ background: color }} />
      {info.stamp.map((line) => (
        <span key={line} className={`font-black leading-[1.2] ${line === "◯" ? "text-[15px]" : "text-[12px]"}`}>
          {line}
        </span>
      ))}
    </div>
  );
}
