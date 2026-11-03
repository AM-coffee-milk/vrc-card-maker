// カードの状態・定数・テンプレート定義

export type Status = "none" | "love" | "ok" | "ask" | "ng";
export type TemplateId = "street" | "pop" | "idcard";
export type Orientation = "landscape" | "portrait";

export interface Tag {
  id: string;
  label: string;
  status: Status;
}

export interface Palette {
  name: string;
  bg: string;
  accent: string;
  text: string;
}

export interface PhotoFrame {
  x: number; // 0-100 (object-position)
  y: number; // 0-100
  zoom: number; // 1-3
}

export interface CardData {
  version: 1;
  template: TemplateId;
  orientation: Orientation;
  photoMode: boolean;
  name: string;
  xId: string;
  activeTime: string;
  favorites: string;
  bio: string;
  platforms: string[];
  mic: number; // マイクを ON にしている割合 (0-100)
  showMic: boolean;
  showLegend: boolean;
  tags: Tag[];
  colors: Omit<Palette, "name">;
  mainImage: string | null;
  photo: PhotoFrame;
  subImages: (string | null)[];
}

// 書き出しサイズ (CSS px)。pixelRatio 2 で 1920x1080 / 1080x1920 になる
export const CARD_SIZE: Record<Orientation, { w: number; h: number }> = {
  landscape: { w: 960, h: 540 },
  portrait: { w: 540, h: 960 },
};

export const PLATFORMS = ["Desktop", "PCVR", "Quest", "Mobile"];

export type ActiveStatus = Exclude<Status, "none">;

export const STATUS_ORDER: ActiveStatus[] = ["love", "ok", "ask", "ng"];

export const STATUS_INFO: Record<ActiveStatus, { mark: string; label: string; color: string }> = {
  love: { mark: "◎", label: "大歓迎", color: "#ff5c9a" },
  ok: { mark: "○", label: "OK", color: "#2fb67c" },
  ask: { mark: "△", label: "要相談", color: "#e9a019" },
  ng: { mark: "×", label: "NG", color: "#8a8f98" },
};

export const PRESET_TAGS = ["撫で", "近距離", "お砂糖", "武器", "暴言・暴力", "下ネタ", "V睡", "大人数", "撫で音"];

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  palettes: Palette[];
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: "street",
    name: "STREET",
    description: "写真を大きく見せるゲーミング系",
    palettes: [
      { name: "Milk Tea", bg: "#fce3c3", accent: "#ff8fc8", text: "#4a3728" },
      { name: "Midnight", bg: "#14161f", accent: "#4de1ff", text: "#e8ecf5" },
      { name: "Toxic", bg: "#0e0e0e", accent: "#c6ff3d", text: "#f2f2f2" },
      { name: "Snow", bg: "#f4f6fb", accent: "#5b6cff", text: "#1d2233" },
      { name: "Blood", bg: "#1a0b10", accent: "#ff3b5c", text: "#ffe7ec" },
    ],
  },
  {
    id: "pop",
    name: "POP",
    description: "まるっとかわいいパステル系",
    palettes: [
      { name: "Strawberry", bg: "#ffe1ec", accent: "#ff6fa5", text: "#5a3344" },
      { name: "Soda", bg: "#dff4ff", accent: "#3fa9f5", text: "#23435c" },
      { name: "Melon", bg: "#e6f8dc", accent: "#5cc26b", text: "#2f4a2a" },
      { name: "Lavender", bg: "#ece4ff", accent: "#9b7bff", text: "#3d3260" },
      { name: "Lemon", bg: "#fff6cc", accent: "#ffb020", text: "#5a4515" },
    ],
  },
  {
    id: "idcard",
    name: "ID CARD",
    description: "カード型のきっちり系",
    palettes: [
      { name: "Classic", bg: "#f3f1ea", accent: "#1f3a5f", text: "#1b1f27" },
      { name: "Cyber", bg: "#0d1117", accent: "#00e0b0", text: "#d7e2ee" },
      { name: "Mint", bg: "#eef7f4", accent: "#178f75", text: "#16302a" },
      { name: "Sakura", bg: "#fff3f6", accent: "#d9467a", text: "#3a1f29" },
      { name: "Gold", bg: "#16130c", accent: "#d8b45a", text: "#f3ead2" },
    ],
  },
];

export const newId = () => `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function defaultCard(): CardData {
  const p = TEMPLATES[0].palettes[0];
  return {
    version: 1,
    template: "street",
    orientation: "landscape",
    photoMode: false,
    name: "",
    xId: "",
    activeTime: "",
    favorites: "",
    bio: "",
    platforms: ["PCVR"],
    mic: 100,
    showMic: true,
    showLegend: true,
    tags: PRESET_TAGS.map((label) => ({ id: newId(), label, status: "none" })),
    colors: { bg: p.bg, accent: p.accent, text: p.text },
    mainImage: null,
    photo: { x: 50, y: 50, zoom: 1 },
    subImages: [null, null, null],
  };
}

// 保存データが古い・壊れていても動くように既定値で埋める
export function normalizeCard(raw: unknown): CardData {
  const base = defaultCard();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<CardData>;
  return {
    ...base,
    ...r,
    version: 1,
    colors: { ...base.colors, ...(r.colors ?? {}) },
    photo: { ...base.photo, ...(r.photo ?? {}) },
    tags: Array.isArray(r.tags) ? r.tags : base.tags,
    platforms: Array.isArray(r.platforms) ? r.platforms : base.platforms,
    subImages: [0, 1, 2].map((i) => r.subImages?.[i] ?? null),
  };
}

/** マイク ON 率の表示 (0% は無言勢) */
export function micText(v: number) {
  return v === 0 ? "無言勢" : `${v}%`;
}

/** #rrggbb に透明度を付ける */
export function alpha(hex: string, a: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return hex;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** 背景色に対して読みやすい文字色 (白 or 黒) */
export function contrastOn(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#14161f" : "#ffffff";
}
