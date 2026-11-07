"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AlertTriangle, Download, Loader2, RotateCcw, Share2, X } from "lucide-react";
import Card from "@/components/card/Card";
import Editor from "@/components/editor/Editor";
import InAppNotice, { useInApp } from "@/components/InAppNotice";
import { CARD_SIZE, defaultCard, normalizeCard, type CardData } from "@/lib/card";
import { renderCard } from "@/lib/image";
import { FAQ, FEATURES, HOW_TO, MOBILE_POINTS } from "@/lib/site";
import { ORIENT_KEY } from "@/lib/inapp";
import { loadState, saveState } from "@/lib/storage";

interface Result {
  url: string;
  file: File;
}

export default function VRCCardMaker() {
  const [data, setData] = useState<CardData>(defaultCard);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(0.5);
  const [overflow, setOverflow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const inApp = useInApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const { w, h } = CARD_SIZE[data.orientation];

  const update = useCallback((fn: (d: CardData) => CardData) => setData(fn), []);

  // 前回の内容を復元
  useEffect(() => {
    loadState<CardData>().then((saved) => {
      if (saved) setData(normalizeCard(saved));
      setLoaded(true);
    });
  }, []);

  // 自動保存 (入力が落ち着いてから)
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      saveState(data);
      // 次に開いたとき、読み込み中の枠を最初から縦型 / 横型の大きさにするため (layout.tsx の起動スクリプトが読む)
      try {
        localStorage.setItem(ORIENT_KEY, data.orientation);
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [data, loaded]);

  // プレビューを枠に合わせて縮小
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () => {
      const maxH = window.innerWidth >= 1024 ? window.innerHeight - 140 : window.innerHeight * 0.62;
      setScale(Math.min(box.clientWidth / w, maxH / h, 1));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [w, h, loaded]);

  // 文章やタグがカードからはみ出していないか
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const els = cardRef.current?.querySelectorAll<HTMLElement>("[data-fit]") ?? [];
      setOverflow(Array.from(els).some((el) => el.scrollHeight > el.clientHeight + 1));
    });
    return () => cancelAnimationFrame(id);
  });

  const handleSave = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      const blob = await renderCard(cardRef.current, w, h);
      const safeName = (data.name || "card").replace(/[\\/:*?"<>|\s]+/g, "_");
      const file = new File([blob], `vrc-card-${safeName}.png`, { type: "image/png" });
      setResult({ url: URL.createObjectURL(blob), file });
    } catch (e) {
      console.error("生成エラー:", e);
      alert("画像の生成に失敗しました。写真を選び直すか、ページを再読み込みしてお試しください。");
    } finally {
      setBusy(false);
    }
  };

  const closeResult = () => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
  };

  const canShare = typeof navigator !== "undefined" && !!result && !!navigator.canShare?.({ files: [result.file] });

  const share = async () => {
    if (!result) return;
    try {
      await navigator.share({ files: [result.file], title: "VRChat 自己紹介カード" });
    } catch {
      // キャンセル時は何もしない
    }
  };

  const resetAll = () => {
    if (confirm("入力内容と写真をすべて消して最初からにしますか？")) setData(defaultCard());
  };

  return (
    <main className="min-h-screen bg-black pb-28 text-white lg:pb-10">
      <header className="mx-auto flex max-w-[1440px] items-end justify-between px-4 py-5 lg:px-8">
        <div>
          {/* 検索で「VRChat 自己紹介カード」と一緒に読まれるよう、日本語の名前も見出しに含める */}
          <h1>
            <span className="inline-block border-b-2 border-white pb-1 text-xl font-black uppercase italic tracking-tighter">VRC IDENTITY GEN</span>
            <span className="mt-1.5 block text-[11px] font-bold text-neutral-500">VRChat 自己紹介カードメーカー</span>
          </h1>
        </div>
        <button type="button" onClick={resetAll} className="flex items-center gap-1 text-[11px] font-bold text-neutral-500 hover:text-white">
          <RotateCcw size={12} /> 最初から
        </button>
      </header>

      {/* アプリ内ブラウザ向けの案内。表示はスクリプトと CSS で決める (後から差し込むとページがずれるため) */}
      <div className="inapp-only mx-auto mb-5 max-w-[1440px] px-4 lg:px-8">
        <InAppNotice />
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 lg:flex-row lg:items-start lg:gap-8 lg:px-8">
        {/* プレビュー */}
        <div className="min-w-0 flex-1 lg:sticky lg:top-6">
          <div ref={boxRef} className="flex w-full flex-col items-center">
            {loaded ? (
              <div style={{ width: w * scale, height: h * scale }} className="relative">
                <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }} className="absolute left-0 top-0 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                  <Card ref={cardRef} data={data} onPhotoChange={(photo) => setData((d) => ({ ...d, photo }))} />
                </div>
              </div>
            ) : (
              // 読み込み後のカードと同じ大きさで場所を取っておく (globals.css の .preview-ph)
              <div className="preview-ph flex items-center justify-center rounded-3xl bg-neutral-900 text-neutral-600">
                <Loader2 className="animate-spin" />
              </div>
            )}
            {overflow && (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                <AlertTriangle size={13} /> 文章やタグが多くてカードに収まりきっていません
              </p>
            )}
            <p className="mt-3 text-[10px] text-neutral-600">
              書き出しサイズ {w * 2} × {h * 2} px ・ 入力内容はこのブラウザに自動保存されます
            </p>
          </div>
        </div>

        {/* 操作パネル */}
        <aside className="w-full shrink-0 lg:w-[440px]">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy || !loaded}
              className="mb-8 hidden w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-neutral-300 bg-white py-4 font-black text-black shadow-xl transition active:scale-95 disabled:opacity-60 lg:flex"
            >
              {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {busy ? "生成中…" : "画像を保存する"}
            </button>
            {/* 読み込み前から出して場所を確保し (後から出すと下の説明がずれる)、復元が終わるまでは触れないようにする */}
            <div inert={!loaded}>
              <Editor data={data} update={update} />
            </div>
          </div>
          <p className="mt-6 text-center text-[10px] text-neutral-700">VRC IDENTITY GEN ・ 写真と入力内容はお使いの端末内だけで処理され、外部には送信されません（閲覧数のみ Cloudflare Web Analytics で集計しています。Cookie は使いません）</p>
        </aside>
      </div>

      {/* サイトの説明 (使い方・できること・よくある質問)。検索エンジンや AI にも読まれる */}
      <section className="mx-auto mt-16 max-w-3xl px-4 text-neutral-300 lg:px-8">
        <h2 className="text-lg font-black text-white">VRChatの自己紹介カードを、スマホで手軽に。無料・登録なし</h2>
        <p className="mt-3 text-[13px] leading-relaxed text-neutral-400">
          VRC IDENTITY GEN は、VRChat 用の自己紹介カード（プロフィールカード）をブラウザで作れるツールです。写真を選んでプロフィールを書くだけで、X や Discord にそのまま貼れる画像ができます。スマホでの操作を前提に作っているので、アプリを入れなくてもスマホのブラウザだけで最後まで作れます。もちろん PC でも使えます。
        </p>

        <h2 className="mt-10 text-base font-black text-white">スマホで作りやすいポイント</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {MOBILE_POINTS.map((p) => (
            <li key={p.title} className="rounded-xl border border-neutral-800 p-3 text-[13px] leading-relaxed">
              <b className="text-white">{p.title}</b>
              <br />
              <span className="text-neutral-400">{p.text}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-base font-black text-white">使い方</h2>
        <ol className="mt-3 space-y-3">
          {HOW_TO.map((s, i) => (
            <li key={s.title} className="flex gap-3 text-[13px] leading-relaxed">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-black text-black">{i + 1}</span>
              <span>
                <b className="text-white">{s.title}</b>
                <br />
                <span className="text-neutral-400">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>

        <h2 className="mt-10 text-base font-black text-white">できること</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-neutral-400">
          {FEATURES.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        <h2 className="mt-10 text-base font-black text-white">よくある質問</h2>
        <dl className="mt-3 divide-y divide-neutral-800 border-y border-neutral-800">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="py-3">
              <dt className="text-[13px] font-bold text-white">{q}</dt>
              <dd className="mt-1 text-[13px] leading-relaxed text-neutral-400">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* スマホ用の保存ボタン */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-800 bg-black/90 p-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || !loaded}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-neutral-300 bg-white py-3.5 font-black text-black active:scale-95 disabled:opacity-60"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {busy ? "生成中…" : "画像を保存する"}
        </button>
      </div>

      {/* 書き出し結果 */}
      {result && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 p-4" onClick={closeResult}>
          <div className="flex max-h-full w-full max-w-3xl flex-col gap-4 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black italic">画像ができました</h2>
              <button type="button" onClick={closeResult} aria-label="閉じる" className="text-neutral-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            {inApp?.inApp && <InAppNotice info={inApp} compact />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.url} alt="生成された自己紹介カード" className="min-h-0 w-full flex-1 rounded-xl object-contain" />
            <p className="text-center text-[10px] text-neutral-500">スマホでは画像を長押しして保存することもできます</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <a href={result.url} download={result.file.name} className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 font-black text-black active:scale-95">
                <Download size={18} /> ダウンロード
              </a>
              {canShare && (
                <button type="button" onClick={share} className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-700 py-3 font-black text-white active:scale-95">
                  <Share2 size={18} /> 共有 / 写真に保存
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
