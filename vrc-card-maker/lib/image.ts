// 画像の読み込み (縮小して data URL 化) と、カードの PNG 書き出し

import { toSvg } from "html-to-image";

/** 選択された画像を長辺 maxSize に縮小して data URL にする */
export async function fileToDataUrl(file: File, maxSize: number): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("画像を読み込めませんでした"));
      el.src = url;
    });
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas を初期化できませんでした");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ---- Web フォントの埋め込み ----
// 日本語フォントは unicode-range ごとに 100 以上のファイルに分かれているため、
// カード内で実際に使っている文字を含むファイルだけを埋め込む。

const fontCache = new Map<string, Promise<string>>();

function fetchAsDataUrl(url: string) {
  let p = fontCache.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result as string);
            fr.onerror = () => reject(fr.error);
            fr.readAsDataURL(blob);
          }),
      );
    fontCache.set(url, p);
  }
  return p;
}

function parseUnicodeRange(range: string): [number, number][] {
  return range.split(",").map((part) => {
    const s = part.trim().replace(/^U\+/i, "");
    if (s.includes("?")) {
      return [parseInt(s.replace(/\?/g, "0"), 16), parseInt(s.replace(/\?/g, "F"), 16)];
    }
    const [a, b] = s.split("-");
    return [parseInt(a, 16), parseInt(b ?? a, 16)];
  });
}

const unquote = (s: string) => s.trim().replace(/^["']|["']$/g, "");

async function buildFontEmbedCss(node: HTMLElement): Promise<string> {
  // フォント名 → 使われている太さ
  const used = new Map<string, Set<number>>();
  const codepoints = new Set<number>();
  for (const el of [node, ...Array.from(node.querySelectorAll<HTMLElement>("*"))]) {
    const cs = getComputedStyle(el);
    const weight = Number(cs.fontWeight) || 400;
    cs.fontFamily.split(",").forEach((f) => {
      const name = unquote(f);
      if (!used.has(name)) used.set(name, new Set());
      used.get(name)!.add(weight);
    });
  }
  for (const ch of node.textContent ?? "") codepoints.add(ch.codePointAt(0)!);

  // 対象フォントのうち、使っている文字を含む @font-face を集める
  type Face = { rule: CSSFontFaceRule; base: string; family: string; wMin: number; wMax: number };
  const faces: Face[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSFontFaceRule)) continue;
      const family = unquote(rule.style.getPropertyValue("font-family"));
      if (!used.has(family)) continue;
      const range = rule.style.getPropertyValue("unicode-range");
      if (range) {
        const ranges = parseUnicodeRange(range);
        if (!Array.from(codepoints).some((c) => ranges.some(([a, b]) => c >= a && c <= b))) continue;
      }
      const [wMin, wMax = wMin] = (rule.style.getPropertyValue("font-weight") || "400")
        .split(/\s+/)
        .map((w) => (w === "normal" ? 400 : w === "bold" ? 700 : Number(w)));
      faces.push({ rule, base: sheet.href ?? location.href, family, wMin, wMax });
    }
  }

  // 使われている太さの face だけ残す。ちょうどの太さが無ければ一番近い太さを使う
  const picked = new Set<Face>();
  for (const [family, weights] of Array.from(used)) {
    const list = faces.filter((f) => f.family === family);
    for (const w of Array.from(weights)) {
      const dist = (f: Face) => (w < f.wMin ? f.wMin - w : w > f.wMax ? w - f.wMax : 0);
      const best = Math.min(...list.map(dist));
      list.filter((f) => dist(f) === best).forEach((f) => picked.add(f));
    }
  }

  const css = Array.from(picked).map(({ rule, base }) => {
    const text = rule.cssText;
    const urls = Array.from(text.matchAll(/url\(["']?([^"')]+)["']?\)/g)).map((m) => m[1]);
    return Promise.all(urls.map(async (u) => [u, await fetchAsDataUrl(new URL(u, base).href)] as const)).then((pairs) =>
      pairs.reduce((t, [u, data]) => t.split(u).join(data), text),
    );
  });
  return (await Promise.all(css)).join("\n");
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => img.decode().then(() => resolve(img), () => resolve(img));
    img.onerror = () => reject(new Error("画像を生成できませんでした"));
    img.src = src;
  });
}

/** カード要素を PNG Blob にする */
export async function renderCard(node: HTMLElement, width: number, height: number): Promise<Blob> {
  const ratio = 2;
  await document.fonts.ready;
  const fontEmbedCSS = await buildFontEmbedCss(node);
  const svg = await toSvg(node, {
    width,
    height,
    fontEmbedCSS,
    // プレビュー用の縮小 transform などを打ち消す
    style: { transform: "none", margin: "0" },
  });

  const canvas = document.createElement("canvas");
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas を初期化できませんでした");

  // Safari では 1 回目の描画で写真やフォントが欠けることがあるので 2 回描く
  for (let i = 0; i < 2; i++) {
    const img = await loadImage(svg);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("画像を生成できませんでした");
  return blob;
}
