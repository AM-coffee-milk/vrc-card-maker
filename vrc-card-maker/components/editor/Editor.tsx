"use client";

import { useState } from "react";
import { ImagePlus, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { PLATFORMS, PRESET_TAGS, STATUS_INFO, STATUS_ORDER, TEMPLATES, newId, type CardData, type Status, type TemplateId } from "@/lib/card";
import { fileToDataUrl } from "@/lib/image";
import { Check, Field, Section, Slider, Toggle, inputClass } from "./ui";

type Update = (fn: (d: CardData) => CardData) => void;

function ImageSlot({ src, onFile, onClear, className, label }: { src: string | null; onFile: (f: File) => void; onClear: () => void; className: string; label: string }) {
  const [over, setOver] = useState(false);
  return (
    <div className={`relative ${className}`}>
      <label
        className={`flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-black transition ${over ? "border-white" : "border-neutral-700 hover:border-neutral-500"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f?.type.startsWith("image/")) onFile(f);
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-[10px] font-black uppercase italic text-neutral-600">
            <ImagePlus size={18} />
            {label}
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </label>
      {src && (
        <button type="button" onClick={onClear} aria-label="写真を削除" className="absolute -right-2 -top-2 rounded-full border border-neutral-700 bg-neutral-900 p-1 text-neutral-400 hover:text-white">
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export default function Editor({ data, update }: { data: CardData; update: Update }) {
  const set = (patch: Partial<CardData>) => update((d) => ({ ...d, ...patch }));
  const [newTag, setNewTag] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const template = TEMPLATES.find((t) => t.id === data.template) ?? TEMPLATES[0];

  const loadImage = async (file: File, apply: (url: string) => void, max: number) => {
    setLoadingImage(true);
    try {
      apply(await fileToDataUrl(file, max));
    } catch (e) {
      alert(e instanceof Error ? e.message : "画像を読み込めませんでした");
    } finally {
      setLoadingImage(false);
    }
  };

  const chooseTemplate = (id: TemplateId) => {
    const t = TEMPLATES.find((x) => x.id === id)!;
    const { bg, accent, text } = t.palettes[0];
    set({ template: id, colors: { bg, accent, text } });
  };

  const setTag = (id: string, patch: { label?: string; status?: Status }) => update((d) => ({ ...d, tags: d.tags.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  const addTag = () => {
    const label = newTag.trim();
    if (!label) return;
    update((d) => ({ ...d, tags: [...d.tags, { id: newId(), label, status: "love" }] }));
    setNewTag("");
  };

  return (
    <div className="space-y-8">
      <Section no="01" title="テンプレート & レイアウト">
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((t) => {
            const p = t.palettes[0];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => chooseTemplate(t.id)}
                aria-pressed={data.template === t.id}
                className={`overflow-hidden rounded-xl border text-left transition active:scale-95 ${data.template === t.id ? "border-white" : "border-neutral-800 hover:border-neutral-600"}`}
              >
                <div className="flex h-8" style={{ background: p.bg }}>
                  <div className="w-2/5" style={{ background: t.id === "idcard" ? p.accent : "#262626" }} />
                  <div className="m-auto h-2 w-8 rounded-full" style={{ background: p.accent }} />
                </div>
                <div className={`px-2 py-1.5 ${data.template === t.id ? "bg-white text-black" : "text-neutral-400"}`}>
                  <div className="text-[11px] font-black italic">{t.name}</div>
                  <div className={`text-[9px] leading-tight ${data.template === t.id ? "text-neutral-600" : "text-neutral-600"}`}>{t.description}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Toggle active={data.orientation === "landscape"} onClick={() => set({ orientation: "landscape" })}>
            PC (横 16:9)
          </Toggle>
          <Toggle active={data.orientation === "portrait"} onClick={() => set({ orientation: "portrait" })}>
            PHONE (縦 9:16)
          </Toggle>
          <Toggle active={!data.photoMode} onClick={() => set({ photoMode: false })}>
            TEXT MODE
          </Toggle>
          <Toggle active={data.photoMode} onClick={() => set({ photoMode: true })}>
            PHOTO MODE
          </Toggle>
        </div>
      </Section>

      <Section no="02" title="カラー">
        <div className="flex flex-wrap gap-2">
          {template.palettes.map((p) => {
            const active = data.colors.bg === p.bg && data.colors.accent === p.accent && data.colors.text === p.text;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => set({ colors: { bg: p.bg, accent: p.accent, text: p.text } })}
                className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-[10px] font-bold transition ${active ? "border-white text-white" : "border-neutral-800 text-neutral-500 hover:border-neutral-600"}`}
              >
                <span className="relative h-5 w-5 rounded-full border border-white/20" style={{ background: p.bg }}>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
                </span>
                {p.name}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["bg", "背景"],
              ["accent", "アクセント"],
              ["text", "文字"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-800 bg-black px-2.5 py-2">
              <input type="color" className="swatch h-6 w-6 shrink-0" value={data.colors[key]} onChange={(e) => set({ colors: { ...data.colors, [key]: e.target.value } })} />
              <span className="text-[10px] font-bold text-neutral-400">{label}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section no="03" title="写真" aside={loadingImage && <span className="text-[10px] text-neutral-500">読み込み中…</span>}>
        <ImageSlot
          src={data.mainImage}
          label="Main Photo +"
          className="h-28"
          onFile={(f) => loadImage(f, (url) => set({ mainImage: url, photo: { x: 50, y: 50, zoom: 1 } }), 1800)}
          onClear={() => set({ mainImage: null })}
        />
        {data.mainImage && (
          <div className="space-y-3 rounded-xl border border-neutral-800 bg-black p-3">
            <Slider label="ズーム" value={data.photo.zoom} min={1} max={3} step={0.05} format={(v) => `${v.toFixed(2)}x`} onChange={(zoom) => set({ photo: { ...data.photo, zoom } })} />
            <Slider label="横位置" value={data.photo.x} min={0} max={100} step={0.5} format={(v) => `${Math.round(v)}%`} onChange={(x) => set({ photo: { ...data.photo, x } })} />
            <Slider label="縦位置" value={data.photo.y} min={0} max={100} step={0.5} format={(v) => `${Math.round(v)}%`} onChange={(y) => set({ photo: { ...data.photo, y } })} />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-600">プレビューの写真をドラッグしても動かせます</span>
              <button type="button" onClick={() => set({ photo: { x: 50, y: 50, zoom: 1 } })} className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 hover:text-white">
                <RotateCcw size={11} /> リセット
              </button>
            </div>
          </div>
        )}
        {data.photoMode && (
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <ImageSlot
                key={i}
                src={data.subImages[i]}
                label={`Sub ${i + 1}`}
                className="h-16"
                onFile={(f) => loadImage(f, (url) => update((d) => ({ ...d, subImages: d.subImages.map((s, j) => (j === i ? url : s)) })), 900)}
                onClear={() => update((d) => ({ ...d, subImages: d.subImages.map((s, j) => (j === i ? null : s)) }))}
              />
            ))}
          </div>
        )}
      </Section>

      <Section no="04" title="プロフィール">
        <Field label="名前" hint={`${data.name.length}/24`}>
          <input className={inputClass} value={data.name} maxLength={24} onChange={(e) => set({ name: e.target.value })} placeholder="フランミルク" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="VRChat 表示名">
            <input className={inputClass} value={data.vrcName} maxLength={32} onChange={(e) => set({ vrcName: e.target.value })} placeholder="FLANMILK" />
          </Field>
          <Field label="X (Twitter) ID">
            <input className={inputClass} value={data.xId} maxLength={32} onChange={(e) => set({ xId: e.target.value })} placeholder="@flanmilk" />
          </Field>
          <Field label="よくいる時間">
            <input className={inputClass} value={data.activeTime} maxLength={32} onChange={(e) => set({ activeTime: e.target.value })} placeholder="平日22時〜" />
          </Field>
          <Field label="好きなもの">
            <input className={inputClass} value={data.favorites} maxLength={32} onChange={(e) => set({ favorites: e.target.value })} placeholder="ワールド巡り" />
          </Field>
        </div>
        <Field label="自己紹介" hint={`${data.bio.length}/300`}>
          <textarea className={`${inputClass} resize-y`} rows={4} value={data.bio} maxLength={300} onChange={(e) => set({ bio: e.target.value })} placeholder="自己紹介を書いてね。長い文章は自動で小さくなります" />
        </Field>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-neutral-500">プラットフォーム</span>
          <div className="grid grid-cols-4 gap-1.5">
            {PLATFORMS.map((p) => (
              <Toggle key={p} active={data.platforms.includes(p)} onClick={() => set({ platforms: data.platforms.includes(p) ? data.platforms.filter((x) => x !== p) : PLATFORMS.filter((x) => x === p || data.platforms.includes(x)) })}>
                {p}
              </Toggle>
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-black p-3">
          <Slider label="MIC VOLUME" value={data.mic} min={0} max={100} format={(v) => `${v}%`} onChange={(mic) => set({ mic })} />
          <Check checked={data.showMic} onChange={(showMic) => set({ showMic })}>
            カードにマイク音量を表示する
          </Check>
        </div>
      </Section>

      <Section
        no="05"
        title="プレイタグ"
        aside={
          <button
            type="button"
            onClick={() => confirm("タグを初期状態に戻しますか？") && set({ tags: PRESET_TAGS.map((label) => ({ id: newId(), label, status: "none" })) })}
            className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 hover:text-white"
          >
            <RotateCcw size={11} /> 初期化
          </button>
        }
      >
        <p className="flex flex-wrap gap-x-3 text-[10px] text-neutral-500">
          {STATUS_ORDER.map((s) => (
            <span key={s}>
              <span style={{ color: STATUS_INFO[s].color }}>{STATUS_INFO[s].mark}</span> {STATUS_INFO[s].label}
            </span>
          ))}
          <span>－ 表示しない</span>
        </p>
        <ul className="space-y-1.5">
          {data.tags.map((t) => (
            <li key={t.id} className="flex items-center gap-1.5">
              <input
                className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-black px-2.5 py-1.5 text-xs font-bold text-white outline-none focus:border-neutral-500"
                value={t.label}
                maxLength={16}
                onChange={(e) => setTag(t.id, { label: e.target.value })}
                aria-label="タグ名"
              />
              <div className="flex overflow-hidden rounded-lg border border-neutral-800">
                {(["none", ...STATUS_ORDER] as Status[]).map((s) => {
                  const active = t.status === s;
                  const info = s === "none" ? null : STATUS_INFO[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTag(t.id, { status: s })}
                      title={info?.label ?? "表示しない"}
                      className={`h-7 w-7 text-xs font-black transition ${active ? "bg-white" : "hover:bg-neutral-800"}`}
                      style={{ color: active ? (info?.color ?? "#000") : info ? `${info.color}99` : "#525252" }}
                    >
                      {info?.mark ?? "－"}
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={() => update((d) => ({ ...d, tags: d.tags.filter((x) => x.id !== t.id) }))} aria-label="タグを削除" className="p-1 text-neutral-600 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-1.5">
          <input
            className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-black px-2.5 py-2 text-xs font-bold text-white outline-none placeholder:text-neutral-700 focus:border-neutral-500"
            value={newTag}
            maxLength={16}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) addTag();
            }}
            placeholder="タグを追加 (例: フレンド申請)"
          />
          <button type="button" onClick={addTag} className="flex items-center gap-1 rounded-lg bg-white px-3 text-[11px] font-black text-black active:scale-95">
            <Plus size={13} /> 追加
          </button>
        </div>
        <Check checked={data.showLegend} onChange={(showLegend) => set({ showLegend })}>
          カードに記号の凡例を表示する
        </Check>
      </Section>
    </div>
  );
}
