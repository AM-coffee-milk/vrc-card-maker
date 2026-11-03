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

/** トリミング位置・ズームを反映した写真。カードとトリミング画面で同じ見え方にするため共通化している */
export function FramedImg({ src, frame, className = "" }: { src: string; frame: PhotoFrame; className?: string }) {
  const { x, y, zoom } = frame;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      className={`pointer-events-none h-full w-full select-none object-cover ${className}`}
      style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` }}
    />
  );
}

/** ドラッグ量 (枠の幅・高さに対する px) をトリミング位置に換算する。ズーム時は細かく動く */
export function panFrame(frame: PhotoFrame, dx: number, dy: number, w: number, h: number): PhotoFrame {
  const k = (100 / frame.zoom) * 1.5;
  const clamp = (v: number) => Math.round(Math.min(100, Math.max(0, v)) * 10) / 10;
  return { ...frame, x: clamp(frame.x - (dx / w) * k), y: clamp(frame.y - (dy / h) * k) };
}

/** メイン写真。位置・ズームを反映し、プレビューではドラッグで動かせる */
export function MainPhoto({ className = "", placeholderColor }: { className?: string; placeholderColor?: string }) {
  const { data, onPhotoChange } = useCard();
  const drag = useRef<{ px: number; py: number; frame: PhotoFrame; w: number; h: number } | null>(null);

  if (!data.mainImage) {
    return (
      <div data-photo-slot="main" className={`flex flex-col items-center justify-center gap-2 ${className}`} style={{ color: placeholderColor ?? "rgba(255,255,255,0.35)" }}>
        <ImageIcon size={40} strokeWidth={1.5} />
        <span className="font-mono text-[12px] tracking-[0.2em]">NO PHOTO</span>
      </div>
    );
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onPhotoChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = { px: e.clientX, py: e.clientY, frame: data.photo, w: rect.width, h: rect.height };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !onPhotoChange) return;
    onPhotoChange(panFrame(d.frame, e.clientX - d.px, e.clientY - d.py, d.w, d.h));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div
      data-photo-slot="main"
      className={`overflow-hidden ${onPhotoChange ? "cursor-grab touch-none active:cursor-grabbing" : ""} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <FramedImg src={data.mainImage} frame={data.photo} />
    </div>
  );
}

/** サブ写真 (PHOTO MODE)。トリミング位置は編集画面のポップアップで調整する */
export function SubPhoto({ index, className = "", style }: { index: number; className?: string; style?: CSSProperties }) {
  const { data } = useCard();
  const src = data.subImages[index];
  return (
    <div data-photo-slot={`sub-${index}`} className={`overflow-hidden ${className}`} style={style}>
      {src && <FramedImg src={src} frame={data.subFrames[index]} />}
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

/**
 * マイク ON 率。何の数字か分かるよう日本語のラベルと大きな数値で出す (バーは飾り)。
 * fill を付けると空いている幅いっぱいに広がり、バーも伸びる。
 */
export function MicMeter({ value, color, track, fill = false, className = "", style }: { value: number; color: string; track: string; fill?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <div className={`flex flex-col gap-1.5 ${fill ? "min-w-0 flex-1" : "shrink-0"} ${className}`} style={style}>
      <span className="text-[15px] font-bold leading-none">マイクON率</span>
      <div className="flex items-center gap-2.5">
        <span className={`relative h-[10px] overflow-hidden rounded-full ${fill ? "min-w-[40px] flex-1" : "w-[80px]"}`} style={{ background: track }}>
          <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${value}%`, background: color }} />
        </span>
        <span className="shrink-0 text-[24px] font-black leading-none">{micText(value)}</span>
      </div>
    </div>
  );
}

/** 入力済みのプロフィール項目。wide は横幅いっぱいに使う (好きなものは長くなりやすい) */
export function infoRows(d: CardData) {
  return [
    { key: "x", label: "X", ja: "X", value: d.xId ? (d.xId.startsWith("@") ? d.xId : `@${d.xId}`) : "", wide: true },
    { key: "weekday", label: "Weekday", ja: "平日", value: d.activeTime, wide: false },
    { key: "holiday", label: "Holiday", ja: "休日", value: d.activeHoliday, wide: false },
    { key: "fav", label: "Favorite", ja: "すきなもの", value: d.favorites, wide: true },
  ].filter((r) => r.value.trim());
}

/**
 * 名前の横に押す、フレンド申請の判子。
 * 色の見分けに頼らないよう、文字と枠はカードの背景色と文字色だけで描く (配色で一番コントラストが取れる組み合わせ)。
 * アクセント色は影の飾りにだけ使う。アクセント色の上に置くときは onAccent を付けて影を消す。
 * 横に余裕がある場所では oneLine で改行せず、高さを抑える。
 */
export function FriendStamp({ onAccent = false, oneLine = false, className = "" }: { onAccent?: boolean; oneLine?: boolean; className?: string }) {
  const { data } = useCard();
  if (data.friend === "none") return null;
  const { bg, accent, text } = data.colors;
  return (
    <div
      className={`pointer-events-none flex shrink-0 rotate-[-6deg] flex-col overflow-hidden rounded-lg text-center ${className}`}
      style={{ background: bg, color: text, border: `2.5px solid ${text}`, boxShadow: onAccent ? undefined : `3px 3px 0 ${accent}` }}
    >
      <span className="px-2.5 py-[1px] text-[12px] font-black leading-tight tracking-wider" style={{ background: text, color: bg }}>
        フレンド申請
      </span>
      <span className="flex flex-col px-2.5 pb-1 pt-[3px]">
        {(oneLine ? [FRIEND_INFO[data.friend].label] : FRIEND_INFO[data.friend].stamp).map((line) => (
          <span key={line} className="whitespace-nowrap text-[18px] font-black leading-tight">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}
