"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, AlertTriangle } from "lucide-react";
import { detectInApp, externalUrl, type InAppInfo } from "@/lib/inapp";

/** アプリ内ブラウザかどうか (SSR 中と判定前は null) */
export function useInApp() {
  const [info, setInfo] = useState<InAppInfo | null>(null);
  useEffect(() => {
    // 開発中に見た目を確かめるための切り替え (?inapp=android / ?inapp=ios)
    const debug = process.env.NODE_ENV !== "production" ? new URLSearchParams(location.search).get("inapp") : null;
    // 開いた直後に自動で外部ブラウザへ飛ばすのは、X では「実行できるアプリがありません」のエラーになるのでしない
    setInfo(debug ? { inApp: true, android: debug === "android", app: "X" } : detectInApp(navigator.userAgent));
  }, []);
  return info;
}

/**
 * X などのアプリ内ブラウザでは画像を保存できないことが多いので、普通のブラウザで開き直してもらう。
 * アプリ内ブラウザとブラウザは保存場所が別で、入力内容は引き継げないため「作る前に」と伝える。
 */
export default function InAppNotice({ info, compact = false }: { info: InAppInfo; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = typeof location !== "undefined" ? location.origin + location.pathname : "";
  const where = info.app ? `${info.app}のアプリ内` : "アプリ内のブラウザ";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("このURLをコピーしてブラウザで開いてください", url);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-amber-400 bg-amber-400/10 p-4 text-amber-50">
      <p className="flex items-start gap-2 text-[14px] font-black leading-snug">
        <AlertTriangle size={18} className="mt-[1px] shrink-0 text-amber-400" />
        {where}では画像を保存できません
      </p>
      <p className="mt-1.5 text-[12px] font-bold leading-relaxed text-amber-100/80">
        {compact
          ? "ブラウザで開き直してください。入力内容は引き継がれないので、ブラウザでもう一度作る必要があります。"
          : "入力内容はブラウザに引き継げないので、作り始める前にブラウザで開き直してください。"}
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <p className="rounded-xl bg-black/30 px-3 py-2 text-[12px] font-bold leading-relaxed sm:col-span-2">
          {info.android ? (
            <>
              画面下の URL の横にある <b className="text-amber-300">︙</b> から「<b className="text-amber-300">ブラウザで開く</b>」を選んでください
            </>
          ) : (
            <>
              画面の <b className="text-amber-300">…</b> や共有ボタンから「<b className="text-amber-300">ブラウザで開く</b>」「Safariで開く」を選んでください
            </>
          )}
        </p>
        {info.android && (
          <a href={externalUrl(url)} className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 py-2.5 text-[14px] font-black text-black active:scale-95">
            <ExternalLink size={16} /> Chromeで開く
          </a>
        )}
        <button type="button" onClick={copy} className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/60 py-2.5 text-[13px] font-bold active:scale-95">
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "コピーしました" : "URLをコピー"}
        </button>
      </div>
    </div>
  );
}
