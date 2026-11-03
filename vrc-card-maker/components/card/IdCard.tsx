"use client";

// ID CARD: カード型のきっちり系

import { STATUS_INFO, STATUS_ORDER, alpha, contrastOn, micText } from "@/lib/card";
import { FitText, FriendStamp, MainPhoto, SubPhoto, activeTags, useCard } from "./parts";

function hash(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619);
  return h >>> 0;
}

/** 名前から決まる飾りのバーコード */
function Barcode({ seed, color, width, height }: { seed: string; color: string; width: number; height: number }) {
  let h = hash(seed || "vrc");
  const bars: number[] = [];
  for (let i = 0; i < 46; i++) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
    bars.push((h % 3) + 1);
  }
  return (
    <div className="flex items-stretch gap-[2px]" style={{ width, height }}>
      {bars.map((w, i) => (
        <span key={i} style={{ width: w, background: i % 2 ? "transparent" : color }} />
      ))}
    </div>
  );
}

function Field({ label, ja, value, color, big }: { label: string; ja: string; value: string; color: string; big?: boolean }) {
  return (
    <div className="min-w-0 pb-1" style={{ borderBottom: `1px solid ${alpha(color, 0.18)}` }}>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: alpha(color, 0.5) }}>
        {label} <span className="tracking-normal">/ {ja}</span>
      </div>
      <div className={`truncate font-bold ${big ? "text-[30px] leading-[1.25]" : "text-[15px] leading-snug"}`}>{value || "—"}</div>
    </div>
  );
}

export default function IdCard() {
  const { data } = useCard();
  const { bg, accent, text } = data.colors;
  const portrait = data.orientation === "portrait";
  const onAccent = contrastOn(accent);
  const tags = activeTags(data.tags);
  const serial = String(hash(data.name) % 1000000).padStart(6, "0");
  const today = new Date();
  const issued = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
  const latinSrc = (data.xId.replace(/^@/, "") || data.name).toUpperCase().replace(/[^A-Z0-9]/g, "<");
  const latin = /[A-Z0-9]/.test(latinSrc) ? latinSrc : "UNKNOWN";
  const mrz = `IDVRC<${latin}<<${data.platforms.join("<").toUpperCase()}`.padEnd(44, "<").slice(0, 44);
  const xId = data.xId ? (data.xId.startsWith("@") ? data.xId : `@${data.xId}`) : "";

  const photo = (
    <div className={`relative shrink-0 overflow-hidden rounded-lg ${portrait ? "h-[270px] w-[204px]" : data.photoMode ? "h-[244px] w-[244px]" : "h-[286px] w-[220px]"}`} style={{ border: `1px solid ${alpha(text, 0.25)}`, background: alpha(text, 0.06) }}>
      <MainPhoto className="absolute inset-0" placeholderColor={alpha(text, 0.35)} />
      {/* 四隅のトンボ */}
      {["left-1.5 top-1.5 border-l-2 border-t-2", "right-1.5 top-1.5 border-r-2 border-t-2", "bottom-1.5 left-1.5 border-b-2 border-l-2", "bottom-1.5 right-1.5 border-b-2 border-r-2"].map((c) => (
        <span key={c} className={`pointer-events-none absolute h-4 w-4 ${c}`} style={{ borderColor: accent }} />
      ))}
    </div>
  );

  // 縦向きは右の列が狭く名前が切れるので、スタンプはヘッダーの右に押す
  const nameRow = portrait ? (
    <Field label="Name" ja="名前" value={data.name} color={text} big />
  ) : (
    <div className="flex items-end gap-3">
      <div className="min-w-0 flex-1">
        <Field label="Name" ja="名前" value={data.name} color={text} big />
      </div>
      <FriendStamp color={accent} className="-mt-4 mb-1.5" />
    </div>
  );

  const meta = (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {data.platforms.map((p) => (
          <span key={p} className="rounded px-1.5 py-[1px] font-mono text-[11px] uppercase" style={{ background: accent, color: onAccent }}>
            {p}
          </span>
        ))}
      </div>
      {data.showMic && (
        <div className="flex items-center gap-2 font-mono text-[11px]" style={{ color: alpha(text, 0.7) }}>
          MIC ON
          <span className="relative h-[6px] flex-1 overflow-hidden rounded-sm" style={{ background: alpha(text, 0.12) }}>
            <span className="absolute inset-y-0 left-0" style={{ width: `${data.mic}%`, background: accent }} />
          </span>
          {micText(data.mic)}
        </div>
      )}
    </div>
  );

  const subPhotos = data.photoMode && (
    <div className={`grid shrink-0 grid-cols-3 gap-2 ${portrait ? "h-[120px]" : "h-[74px]"}`}>
      {data.subImages.map((src, i) => (
        <SubPhoto key={i} src={src} className="rounded-md" style={{ background: alpha(text, 0.06), border: `1px solid ${alpha(text, 0.18)}` }} />
      ))}
    </div>
  );

  const remarks = (
    <div className="flex min-h-[56px] flex-1 flex-col rounded-md px-3 py-2" style={{ border: `1px solid ${alpha(text, 0.2)}` }}>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: alpha(text, 0.5) }}>
        Remarks / 自己紹介
      </div>
      <FitText max={14} min={10} className="w-full flex-1 font-medium leading-[1.6]">
        {data.bio || "Hello VRChat!"}
      </FitText>
    </div>
  );

  const permissions = tags.length > 0 && (
    <div data-fit className="flex max-h-[150px] shrink-0 flex-col gap-1 overflow-hidden">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: alpha(text, 0.5) }}>
        Permissions / 対応
      </div>
      {STATUS_ORDER.map((s) => {
        const list = tags.filter((t) => t.status === s);
        if (!list.length) return null;
        return (
          <div key={s} className="flex items-start gap-2 text-[13px] leading-[1.5]">
            <span className="w-[74px] shrink-0 rounded-sm px-1.5 text-center font-bold" style={{ background: alpha(STATUS_INFO[s].color, 0.16), color: STATUS_INFO[s].color }}>
              {STATUS_INFO[s].mark} {STATUS_INFO[s].label}
            </span>
            <span className="min-w-0 font-bold">{list.map((t) => t.label).join(" / ")}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`flex h-full w-full flex-col overflow-hidden ${portrait ? "rounded-[40px]" : "rounded-[28px]"}`} style={{ background: bg, color: text }}>
      {/* ヘッダー帯 */}
      <div className={`flex shrink-0 items-center justify-between ${portrait ? "h-[84px] px-8" : "h-[68px] px-8"}`} style={{ background: accent, color: onAccent }}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full font-oswald text-[15px] font-bold" style={{ border: `2px solid ${onAccent}` }}>
            V
          </span>
          <div className="leading-tight">
            <div className={`font-mono font-medium tracking-[0.22em] ${portrait ? "text-[13px]" : "text-[15px]"}`}>VRCHAT PROFILE CARD</div>
            <div className="text-[10px] font-bold tracking-[0.3em] opacity-80">プロフィールカード</div>
          </div>
        </div>
        {portrait ? <FriendStamp color={onAccent} className="scale-90" /> : <div className="font-mono text-[13px] tracking-widest opacity-90">No. {serial}</div>}
      </div>

      {portrait ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-8 pb-3 pt-6">
          <div className="flex gap-5">
            {photo}
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              {nameRow}
              <Field label="X" ja="アカウント" value={xId} color={text} />
              <Field label="Weekday" ja="平日" value={data.activeTime} color={text} />
              <Field label="Holiday" ja="休日" value={data.activeHoliday} color={text} />
              <div className="mt-auto">{meta}</div>
            </div>
          </div>
          <Field label="Favorite" ja="好きなもの" value={data.favorites} color={text} />
          {subPhotos}
          {remarks}
          {permissions}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 gap-7 px-8 pb-2 pt-5">
          <div className={`flex shrink-0 flex-col gap-3 ${data.photoMode ? "w-[244px]" : "w-[220px]"}`}>
            {photo}
            {subPhotos}
            {meta}
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
            {nameRow}
            <div className="grid grid-cols-3 gap-x-5">
              <Field label="X" ja="アカウント" value={xId} color={text} />
              <Field label="Weekday" ja="平日" value={data.activeTime} color={text} />
              <Field label="Holiday" ja="休日" value={data.activeHoliday} color={text} />
            </div>
            {/* 好きなものは長くなりやすいので横幅いっぱいに使う */}
            <Field label="Favorite" ja="好きなもの" value={data.favorites} color={text} />
            {remarks}
            {permissions}
          </div>
        </div>
      )}

      {/* フッター */}
      <div className={`flex shrink-0 items-center gap-4 px-8 ${portrait ? "h-[64px]" : "h-[50px]"}`} style={{ borderTop: `1px dashed ${alpha(text, 0.25)}` }}>
        <Barcode seed={data.name} color={text} width={portrait ? 120 : 150} height={24} />
        <div className="min-w-0 flex-1 truncate font-mono text-[12px] tracking-[0.12em]" style={{ color: alpha(text, 0.55) }}>
          {mrz}
        </div>
        <div className="shrink-0 text-right font-mono text-[10px] leading-tight" style={{ color: alpha(text, 0.55) }}>
          ISSUED
          <br />
          {issued}
        </div>
      </div>
    </div>
  );
}
