"use client";

// STREET: 写真を大きく見せるゲーミング系 (元デザインを踏襲)

import { STATUS_INFO, alpha, contrastOn } from "@/lib/card";
import { FitText, FriendStamp, MainPhoto, MicRing, SubPhoto, activeTags, infoRows, useCard, usedStatuses } from "./parts";

function SectionLabel({ children, color, accent, right }: { children: string; color: string; accent: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-3 w-1.5 -skew-x-12" style={{ background: accent }} />
      <span className="font-oswald text-[12px] font-bold uppercase italic tracking-[0.25em]" style={{ color }}>
        {children}
      </span>
      <span className="h-px flex-1" style={{ background: alpha(color, 0.18) }} />
      {right}
    </div>
  );
}

export default function StreetCard() {
  const { data } = useCard();
  const { bg, accent, text } = data.colors;
  const portrait = data.orientation === "portrait";
  const rows = infoRows(data);
  const tags = activeTags(data.tags);
  const legend = usedStatuses(data.tags);

  return (
    <div className={`flex h-full w-full overflow-hidden ${portrait ? "flex-col rounded-[44px]" : "flex-row rounded-[32px]"}`} style={{ background: bg, color: text }}>
      {/* 写真エリア */}
      <div className={`relative shrink-0 bg-neutral-900 ${portrait ? (data.photoMode ? "h-[400px] w-full" : "h-[450px] w-full") : "h-full w-[440px]"}`}>
        <MainPhoto className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0) 48%, rgba(0,0,0,0.25))" }} />

        <div className="pointer-events-none absolute left-6 top-6 -skew-x-12 px-3 py-1 font-oswald text-[12px] font-bold italic tracking-[0.25em]" style={{ background: accent, color: contrastOn(accent) }}>
          VRC IDENTITY
        </div>

        <div className={`pointer-events-none absolute bottom-7 left-6 rounded-r-2xl bg-black/60 px-4 py-3 ${data.showMic ? "right-[104px]" : "right-6"}`} style={{ borderLeft: `6px solid ${accent}` }}>
          <h2 className="truncate font-oswald text-[38px] font-bold uppercase italic leading-[1.1] text-white">{data.name || "NAME"}</h2>
          {data.platforms.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {data.platforms.map((p) => (
                <span key={p} className="rounded border border-white/30 px-2 py-[1px] font-mono text-[11px] uppercase tracking-wider text-white/90">
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        {data.showMic && (
          <div className="pointer-events-none absolute bottom-7 right-6 rounded-full border border-white/10 bg-black/60 p-1.5">
            <MicRing value={data.mic} size={62} stroke={5} color={accent} track="rgba(255,255,255,0.12)" textColor="#fff" />
          </div>
        )}
      </div>

      {/* 内容エリア */}
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${portrait ? "gap-5 px-9 py-8" : "gap-[18px] px-9 py-8"}`}>
        {(rows.length > 0 || data.friend !== "none") && (
          <div className="flex items-center gap-5">
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-2.5">
              {rows.map((r) => (
                <div key={r.key} className="min-w-0">
                  <div className="font-oswald text-[11px] font-bold uppercase italic tracking-[0.2em]" style={{ color: alpha(text, 0.55) }}>
                    {r.label}
                  </div>
                  <div className="truncate text-[15px] font-bold leading-snug">{r.value}</div>
                </div>
              ))}
            </div>
            {/* 写真にかぶせないよう、プロフィール欄の右に押す */}
            <FriendStamp />
          </div>
        )}

        {data.photoMode && (
          <div className={`grid shrink-0 grid-cols-3 gap-2.5 ${portrait ? "h-[110px]" : "h-[92px]"}`}>
            {data.subImages.map((src, i) => (
              <SubPhoto key={i} src={src} className="rounded-xl" style={{ background: alpha(text, 0.08) }} />
            ))}
          </div>
        )}

        <div className="flex min-h-[60px] flex-1 flex-col gap-2">
          <SectionLabel color={text} accent={accent}>
            Biography
          </SectionLabel>
          <FitText max={17} min={11} className="flex-1 font-bold italic leading-[1.6]">
            {data.bio || "Hello VRChat!"}
          </FitText>
        </div>

        {tags.length > 0 && (
          <div className="flex shrink-0 flex-col gap-2.5">
            <SectionLabel
              color={text}
              accent={accent}
              right={
                data.showLegend && (
                  <div className="flex gap-2.5 text-[11px] font-bold">
                    {legend.map((s) => (
                      <span key={s} style={{ color: alpha(text, 0.7) }}>
                        <span style={{ color: STATUS_INFO[s].color }}>{STATUS_INFO[s].mark}</span> {STATUS_INFO[s].label}
                      </span>
                    ))}
                  </div>
                )
              }
            >
              Play Style
            </SectionLabel>
            <div data-fit className="flex max-h-[132px] flex-wrap gap-1.5 overflow-hidden">
              {tags.map((t) => (
                <span key={t.id} className="flex items-center gap-1 rounded-md px-2 py-[3px] text-[13px] font-bold" style={{ background: alpha(text, 0.07) }}>
                  <span style={{ color: STATUS_INFO[t.status].color }}>{STATUS_INFO[t.status].mark}</span>
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
