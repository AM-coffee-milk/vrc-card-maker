"use client";

// STREET: 写真を大きく見せるゲーミング系 (元デザインを踏襲)

import { STATUS_INFO, alpha } from "@/lib/card";
import { FitText, FriendStamp, MainPhoto, MicMeter, SubPhoto, activeTags, infoRows, useCard, usedStatuses } from "./parts";

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
      {/* 写真エリア。写真には何も重ねない */}
      <div className={`flex shrink-0 flex-col bg-neutral-900 ${portrait ? (data.photoMode ? "h-[370px] w-full" : "h-[450px] w-full") : "h-full w-[440px]"}`}>
        <div className="relative min-h-0 flex-1">
          <MainPhoto className="absolute inset-0" />
        </div>
        {/* 横向きの写真モードは、サブ写真をメイン写真の下に並べる */}
        {data.photoMode && !portrait && (
          <div className="grid h-[104px] shrink-0 grid-cols-3 gap-2.5 p-3">
            {data.subImages.map((src, i) => (
              <SubPhoto key={i} src={src} className="rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
        )}
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* 名前の帯 */}
        <div className="flex shrink-0 items-center gap-4 bg-neutral-950 px-9 py-3" style={{ borderLeft: `6px solid ${accent}` }}>
          <div className="pointer-events-none min-w-0 flex-1">
            <h2 className="truncate font-oswald text-[36px] font-bold uppercase italic leading-[1.1] text-white">{data.name || "NAME"}</h2>
            {data.platforms.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {data.platforms.map((p) => (
                  <span key={p} className="rounded-md px-2.5 py-[1px] text-[14px] font-bold text-white" style={{ border: `2px solid ${accent}` }}>
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
          {data.showMic && <MicMeter value={data.mic} color={accent} track="rgba(255,255,255,0.2)" className="text-white" />}
        </div>

        {/* 内容エリア */}
        <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${portrait ? "gap-4 px-9 py-6" : "gap-[18px] px-9 py-6"}`}>
          {(rows.length > 0 || data.friend !== "none") && (
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-5">
                {rows
                  .filter((r) => r.key !== "fav")
                  .map((r) => (
                    <div key={r.key} className="min-w-0">
                      <div className="font-oswald text-[11px] font-bold uppercase italic tracking-[0.2em]" style={{ color: alpha(text, 0.55) }}>
                        {r.label}
                      </div>
                      <div className="truncate text-[15px] font-bold leading-snug">{r.value}</div>
                    </div>
                  ))}
              </div>
              {(data.favorites.trim() || data.friend !== "none") && (
                <div className="flex items-center gap-5">
                  {/* 好きなものは長くなりやすいので 2 行まで折り返す */}
                  <div className="min-w-0 flex-1">
                    {data.favorites.trim() && (
                      <>
                        <div className="font-oswald text-[11px] font-bold uppercase italic tracking-[0.2em]" style={{ color: alpha(text, 0.55) }}>
                          Favorite
                        </div>
                        <div className="line-clamp-2 text-[15px] font-bold leading-snug">{data.favorites}</div>
                      </>
                    )}
                  </div>
                  {/* 写真にかぶせないよう、プロフィール欄の右に押す */}
                  <FriendStamp oneLine />
                </div>
              )}
            </div>
          )}

          {data.photoMode && portrait && (
            <div className="grid h-[84px] shrink-0 grid-cols-3 gap-2.5">
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
    </div>
  );
}
