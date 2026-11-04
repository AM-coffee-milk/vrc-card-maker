"use client";

import { useState } from "react";
import { Crop, ImagePlus, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { FRIEND_INFO, PLATFORMS, PRESET_TAGS, STATUS_INFO, STATUS_ORDER, TEMPLATES, micText, newId, type CardData, type PhotoFrame, type Status, type TemplateId } from "@/lib/card";
import { fileToDataUrl } from "@/lib/image";
import { FramedImg, initialFrame } from "@/components/card/parts";
import CropDialog from "./CropDialog";
import { Check, Field, Section, Slider, Toggle, inputClass } from "./ui";

type Update = (fn: (d: CardData) => CardData) => void;

function ImageSlot({ src, frame, onFile, onClear, onCrop, className, label }: { src: string | null; frame: PhotoFrame; onFile: (f: File) => void; onClear: () => void; onCrop: () => void; className: string; label: string }) {
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
          <FramedImg src={src} frame={frame} />
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
        <>
          <button type="button" onClick={onClear} aria-label="写真を削除" className="absolute -right-2 -top-2 rounded-full border border-neutral-700 bg-neutral-900 p-1 text-neutral-400 hover:text-white">
            <X size={12} />
          </button>
          <button
            type="button"
            onClick={onCrop}
            className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full border border-neutral-600 bg-neutral-900/90 px-2 py-[3px] text-[10px] font-bold text-neutral-200 hover:text-white"
          >
            <Crop size={11} /> トリミング
          </button>
        </>
      )}
    </div>
  );
}

export default function Editor({ data, update }: { data: CardData; update: Update }) {
  const set = (patch: Partial<CardData>) => update((d) => ({ ...d, ...patch }));
  const [newTag, setNewTag] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  /** トリミング中の写真。-1 はメイン、0〜2 はサブ */
  const [cropping, setCropping] = useState<{ slot: number; aspect: number } | null>(null);
  const template = TEMPLATES.find((t) => t.id === data.template) ?? TEMPLATES[0];

  const loadImage = async (file: File, apply: (url: string, frame: PhotoFrame) => void, max: number) => {
    setLoadingImage(true);
    try {
      const url = await fileToDataUrl(file, max);
      // decode() は非表示のタブで止まることがあるので onload で待つ
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("画像を読み込めませんでした"));
        el.src = url;
      });
      apply(url, initialFrame({ w: img.naturalWidth, h: img.naturalHeight }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "画像を読み込めませんでした");
    } finally {
      setLoadingImage(false);
    }
  };

  // ポップアップの枠はカード上の写真枠と同じ縦横比にする
  const openCrop = (slot: number) => {
    const el = document.querySelector<HTMLElement>(`[data-photo-slot="${slot < 0 ? "main" : `sub-${slot}`}"]`);
    const aspect = el && el.offsetWidth && el.offsetHeight ? el.offsetWidth / el.offsetHeight : 16 / 9;
    setCropping({ slot, aspect });
  };
  const frameOf = (slot: number) => (slot < 0 ? data.photo : data.subFrames[slot]);
  const setFrame = (slot: number, frame: PhotoFrame) =>
    update((d) => (slot < 0 ? { ...d, photo: frame } : { ...d, subFrames: d.subFrames.map((f, j) => (j === slot ? frame : f)) }));
  const cropSrc = cropping && (cropping.slot < 0 ? data.mainImage : data.subImages[cropping.slot]);

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
          frame={data.photo}
          label="Main Photo +"
          className="h-28"
          onFile={(f) => loadImage(f, (url, photo) => set({ mainImage: url, photo }), 1800)}
          onClear={() => set({ mainImage: null })}
          onCrop={() => openCrop(-1)}
        />
        {data.mainImage && <p className="text-[10px] text-neutral-600">「トリミング」で写る範囲を調整できます。プレビューの写真をドラッグしても動かせます</p>}
        {data.photoMode && (
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <ImageSlot
                key={i}
                src={data.subImages[i]}
                frame={data.subFrames[i]}
                label={`Sub ${i + 1}`}
                className="h-16"
                onFile={(f) =>
                  loadImage(f, (url, frame) => update((d) => ({ ...d, subImages: d.subImages.map((s, j) => (j === i ? url : s)), subFrames: d.subFrames.map((fr, j) => (j === i ? frame : fr)) })), 900)
                }
                onClear={() => update((d) => ({ ...d, subImages: d.subImages.map((s, j) => (j === i ? null : s)) }))}
                onCrop={() => openCrop(i)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section no="04" title="プロフィール">
        <Field label="名前 (VRChat での名前)" hint={`${data.name.length}/24`}>
          <input className={inputClass} value={data.name} maxLength={24} onChange={(e) => set({ name: e.target.value })} placeholder="VRChat での名前" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <Field label="X (Twitter) ID">
              <input className={inputClass} value={data.xId} maxLength={32} onChange={(e) => set({ xId: e.target.value })} placeholder="@your_id" />
            </Field>
          </div>
          <Field label="いる時間 (平日)">
            <input className={inputClass} value={data.activeTime} maxLength={24} onChange={(e) => set({ activeTime: e.target.value })} placeholder="22時〜25時" />
          </Field>
          <Field label="いる時間 (休日)">
            <input className={inputClass} value={data.activeHoliday} maxLength={24} onChange={(e) => set({ activeHoliday: e.target.value })} placeholder="昼からずっと" />
          </Field>
          <div className="col-span-2">
            <Field label="好きなもの">
              <input className={inputClass} value={data.favorites} maxLength={32} onChange={(e) => set({ favorites: e.target.value })} placeholder="ワールド巡り" />
            </Field>
          </div>
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
        <Field label="性別" hint="空欄なら表示しません">
          <input className={inputClass} value={data.gender} maxLength={10} onChange={(e) => set({ gender: e.target.value })} placeholder="オス / メス / どっちでも など" />
        </Field>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-neutral-500">フレンド申請 (名前の横にスタンプで表示)</span>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(FRIEND_INFO) as (keyof typeof FRIEND_INFO)[]).map((k) => (
              <Toggle key={k} active={data.friend === k} onClick={() => set({ friend: k })}>
                {FRIEND_INFO[k].label}
              </Toggle>
            ))}
            <Toggle active={data.friend === "none"} onClick={() => set({ friend: "none" })}>
              表示しない
            </Toggle>
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-black p-3">
          <Slider label="マイクON率" value={data.mic} min={0} max={100} step={10} format={micText} onChange={(mic) => set({ mic })} />
          <p className="text-[10px] leading-relaxed text-neutral-600">普段どれくらいマイクを ON にしているか。0% にすると「無言勢」と表示されます</p>
          <Check checked={data.showMic} onChange={(showMic) => set({ showMic })}>
            カードにマイクON率を表示する
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
      {cropping && cropSrc && (
        <CropDialog
          title={cropping.slot < 0 ? "メイン写真" : `サブ写真 ${cropping.slot + 1}`}
          src={cropSrc}
          frame={frameOf(cropping.slot)}
          aspect={cropping.aspect}
          onChange={(frame) => setFrame(cropping.slot, frame)}
          onClose={() => setCropping(null)}
        />
      )}
    </div>
  );
}
