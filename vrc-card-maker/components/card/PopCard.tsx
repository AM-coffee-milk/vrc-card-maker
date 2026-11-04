"use client";

// POP: まるっとかわいいパステル系

import { STATUS_INFO, genderLabel, alpha, contrastOn, micText } from "@/lib/card";
import { FitText, FriendStamp, MainPhoto, MicMeter, NameText, SubPhoto, activeTags, infoRows, useCard, usedStatuses } from "./parts";

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

  const platforms = data.platforms.length > 0 && (
    <div className={`flex gap-2 ${portrait ? "shrink-0" : "flex-wrap"}`}>
      {data.platforms.map((p) => (
        <span key={p} className="rounded-full px-3 py-[2px] font-maru text-[14px] font-bold" style={{ background: accent, color: contrastOn(accent) }}>
          {p}
        </span>
      ))}
    </div>
  );
  const mic = data.showMic && <MicMeter fill value={data.mic} color={accent} track={alpha(accent, 0.2)} className="min-w-[170px] rounded-2xl px-3 py-1.5 font-maru" style={{ background: panel, color: text }} />;

  // マイクとスタンプは重ならないよう同じ行に並べる (横向きは幅が狭いのでプラットフォームを別の行にする)
  const nameBlock = (
    <div className="pointer-events-none flex min-w-0 flex-col gap-2">
      <h2 className="flex min-w-0 items-baseline font-maru text-[36px] font-black leading-[1.15]" style={{ color: text }}>
        <NameText name={data.name || "なまえ"} gender={genderLabel(data)} />
      </h2>
      {portrait ? (
        // プラットフォームが多いときはマイクを次の行に送る (潰さない)
        <div className="flex flex-wrap items-center gap-3">
          {platforms}
          {mic || <div className="flex-1" />}
          <FriendStamp oneLine />
        </div>
      ) : (
        <>
          {platforms}
          {(mic || data.friend !== "none") && (
            <div className="flex items-center gap-3">
              {mic || <div className="flex-1" />}
              <FriendStamp oneLine />
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div
      className={`relative flex h-full w-full overflow-hidden ${portrait ? "flex-col gap-3 rounded-[48px] p-6" : "flex-row gap-7 rounded-[40px] p-7"}`}
      style={{
        backgroundColor: bg,
        backgroundImage: `radial-gradient(${alpha(accent, 0.22)} 2px, transparent 2.6px)`,
        backgroundSize: "22px 22px",
        color: text,
      }}
    >
      {/* キラキラは写真にかからない隅に置く */}
      <Sparkle size={30} color={accent} className={portrait ? "bottom-2 left-3" : "right-11 top-1"} />
      <Sparkle size={16} color={alpha(accent, 0.6)} className={portrait ? "bottom-10 left-1" : "right-20 top-2.5"} />
      <Sparkle size={22} color={alpha(accent, 0.7)} className="bottom-5 right-6" />

      {/* 写真と名前 */}
      <div className={`flex shrink-0 flex-col gap-4 ${portrait ? "w-full" : "w-[350px]"}`}>
        <div className={`relative shrink-0 ${portrait ? (data.photoMode ? "h-[310px]" : "h-[400px]") : "h-[322px]"}`}>
          <div className="absolute inset-0 rotate-[-2deg] rounded-[30px] bg-white p-2.5" style={{ boxShadow: `0 10px 0 ${alpha(accent, 0.35)}` }}>
            <MainPhoto className="h-full w-full rounded-[22px]" placeholderColor={alpha(text, 0.35)} />
          </div>
          <div className="pointer-events-none absolute -top-5 left-1/2 h-6 w-28 -translate-x-1/2 rotate-[-4deg] rounded-sm" style={{ background: alpha(accent, 0.55) }} />
        </div>
        {nameBlock}
      </div>

      {/* プロフィール */}
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col rounded-[32px] ${portrait ? "gap-3 px-5 py-4" : "gap-4 p-6"}`} style={{ background: panel, boxShadow: `6px 6px 0 ${accent}` }}>
        {rows.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {rows.map((r) => (
              <div key={r.key} className={`flex min-w-0 items-start gap-2 ${r.wide ? "col-span-2" : ""}`}>
                <span className="mt-[1px] shrink-0 rounded-full px-2.5 py-[2px] font-maru text-[11px] font-bold" style={{ background: alpha(accent, 0.18), color: accent }}>
                  {r.ja}
                </span>
                <span className={`font-maru text-[15px] font-bold ${r.key === "fav" ? "line-clamp-2" : "truncate"}`}>{r.value}</span>
              </div>
            ))}
          </div>
        )}

        {data.photoMode && (
          <div className={`grid shrink-0 grid-cols-3 gap-3 ${portrait ? "h-[80px]" : "h-[84px]"}`}>
            {[0, 1, 2].map((i) => (
              <SubPhoto key={i} index={i} className="rounded-2xl border-[3px] border-white" style={{ background: alpha(accent, 0.15), transform: `rotate(${[-2, 1.5, -1][i]}deg)` }} />
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
