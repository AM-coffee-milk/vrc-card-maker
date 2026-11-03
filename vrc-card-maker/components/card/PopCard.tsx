"use client";

// POP: まるっとかわいいパステル系

import { Mic } from "lucide-react";
import { STATUS_INFO, alpha, contrastOn, micText } from "@/lib/card";
import { FitText, FriendStamp, MainPhoto, SubPhoto, activeTags, infoRows, useCard, usedStatuses } from "./parts";

function Sparkle({ size, color, className = "" }: { size: number; color: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`pointer-events-none absolute ${className}`}>
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill={color} />
    </svg>
  );
}

function Heading({ children, accent, color }: { children: string; accent: string; color: string }) {
  return (
    <div className="flex items-center gap-2 font-maru text-[14px] font-black" style={{ color }}>
      <span className="h-3 w-3 rounded-full" style={{ background: accent }} />
      {children}
    </div>
  );
}

export default function PopCard() {
  const { data } = useCard();
  const { bg, accent, text } = data.colors;
  const portrait = data.orientation === "portrait";
  const rows = infoRows(data);
  const tags = activeTags(data.tags);
  const legend = usedStatuses(data.tags);
  // 文字色が暗ければ白いパネル、明るければ暗いパネル
  const panel = contrastOn(text) === "#ffffff" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.35)";

  const nameBlock = (
    <div className="pointer-events-none flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-3">
        <h2 className="min-w-0 truncate font-maru text-[36px] font-black leading-[1.15]" style={{ color: text }}>
          {data.name || "なまえ"}
        </h2>
        {/* 行の高さを増やさないよう上下にはみ出させる */}
        <FriendStamp color={accent} size={68} className="-my-3" style={{ background: "#fff" }} />
      </div>
      <div className="flex items-center gap-2">
        {data.platforms.map((p) => (
          <span key={p} className="rounded-full px-3 py-[2px] font-maru text-[12px] font-bold" style={{ background: accent, color: contrastOn(accent) }}>
            {p}
          </span>
        ))}
        {data.showMic && (
          <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-[3px]" style={{ background: panel, color: text }}>
            <Mic size={13} strokeWidth={2.5} color={accent} />
            <span className="font-maru text-[11px] font-bold">ON</span>
            <span className="relative h-[6px] w-[54px] overflow-hidden rounded-full" style={{ background: alpha(accent, 0.2) }}>
              <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${data.mic}%`, background: accent }} />
            </span>
            <span className="font-maru text-[11px] font-bold">{micText(data.mic)}</span>
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`relative flex h-full w-full overflow-hidden ${portrait ? "flex-col gap-5 rounded-[48px] p-8" : "flex-row gap-7 rounded-[40px] p-7"}`}
      style={{
        backgroundColor: bg,
        backgroundImage: `radial-gradient(${alpha(accent, 0.22)} 2px, transparent 2.6px)`,
        backgroundSize: "22px 22px",
        color: text,
      }}
    >
      <Sparkle size={30} color={accent} className={portrait ? "right-8 top-6" : "left-[350px] top-4"} />
      <Sparkle size={16} color={alpha(accent, 0.6)} className={portrait ? "right-16 top-14" : "left-[330px] top-12"} />
      <Sparkle size={22} color={alpha(accent, 0.7)} className="bottom-5 right-6" />

      {/* 写真と名前 */}
      <div className={`flex shrink-0 flex-col gap-4 ${portrait ? "w-full" : "w-[350px]"}`}>
        <div className={`relative shrink-0 ${portrait ? (data.photoMode ? "h-[290px]" : "h-[360px]") : "h-[340px]"}`}>
          <div className="absolute inset-0 rotate-[-2deg] rounded-[30px] bg-white p-2.5" style={{ boxShadow: `0 10px 0 ${alpha(accent, 0.35)}` }}>
            <MainPhoto className="h-full w-full rounded-[22px]" placeholderColor={alpha(text, 0.35)} />
          </div>
          <div className="pointer-events-none absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 rotate-[-4deg] rounded-sm" style={{ background: alpha(accent, 0.55) }} />
        </div>
        {nameBlock}
      </div>

      {/* プロフィール */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 rounded-[32px] p-6" style={{ background: panel, boxShadow: `6px 6px 0 ${accent}` }}>
        {rows.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {rows.map((r) => (
              <div key={r.key} className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 rounded-full px-2.5 py-[2px] font-maru text-[11px] font-bold" style={{ background: alpha(accent, 0.18), color: accent }}>
                  {r.ja}
                </span>
                <span className="truncate font-maru text-[15px] font-bold">{r.value}</span>
              </div>
            ))}
          </div>
        )}

        {data.photoMode && (
          <div className={`grid shrink-0 grid-cols-3 gap-3 ${portrait ? "h-[92px]" : "h-[84px]"}`}>
            {data.subImages.map((src, i) => (
              <SubPhoto key={i} src={src} className="rounded-2xl border-[3px] border-white" style={{ background: alpha(accent, 0.15), transform: `rotate(${[-2, 1.5, -1][i]}deg)` }} />
            ))}
          </div>
        )}

        <div className="flex min-h-[60px] flex-1 flex-col gap-2">
          <Heading accent={accent} color={text}>
            じこしょうかい
          </Heading>
          <FitText max={17} min={11} className="flex-1 font-maru font-bold leading-[1.7]">
            {data.bio || "よろしくね！"}
          </FitText>
        </div>

        {tags.length > 0 && (
          <div className="flex shrink-0 flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <Heading accent={accent} color={text}>
                あそびかた
              </Heading>
              {data.showLegend && (
                <div className="flex gap-2 font-maru text-[11px] font-bold" style={{ color: alpha(text, 0.7) }}>
                  {legend.map((s) => (
                    <span key={s}>
                      <span style={{ color: STATUS_INFO[s].color }}>{STATUS_INFO[s].mark}</span>
                      {STATUS_INFO[s].label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div data-fit className="flex max-h-[124px] flex-wrap gap-1.5 overflow-hidden">
              {tags.map((t) => {
                const c = STATUS_INFO[t.status].color;
                return (
                  <span key={t.id} className="flex items-center gap-1 rounded-full px-2.5 py-[2px] font-maru text-[13px] font-bold" style={{ background: alpha(c, 0.13), border: `2px solid ${alpha(c, 0.45)}` }}>
                    <span style={{ color: c }}>{STATUS_INFO[t.status].mark}</span>
                    {t.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
