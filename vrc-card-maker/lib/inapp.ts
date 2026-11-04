// X や LINE などのアプリ内ブラウザの判定。
// Android のアプリ内ブラウザ (WebView) は blob の画像を保存できず、長押し保存も出ないことが多いので、
// 普通のブラウザで開き直してもらう案内を出すために使う。

export interface InAppInfo {
  /** アプリ内ブラウザで開かれている */
  inApp: boolean;
  android: boolean;
  /** わかればアプリ名 (案内文に使う) */
  app: string | null;
}

const APPS: [RegExp, string][] = [
  [/Twitter|TwitterAndroid/i, "X"],
  [/\bLine\//i, "LINE"],
  [/Instagram/i, "Instagram"],
  [/FBAN|FBAV|FB_IAB/i, "Facebook"],
  [/Discord/i, "Discord"],
  [/TikTok|musical_ly|BytedanceWebview/i, "TikTok"],
];

export function detectInApp(ua: string): InAppInfo {
  const android = /Android/i.test(ua);
  const ios = /iPhone|iPad|iPod/i.test(ua);
  const app = APPS.find(([re]) => re.test(ua))?.[1] ?? null;
  // Android の WebView は UA に "; wv)" が入る。iOS のアプリ内ブラウザは "Safari/" が入らない
  const webview = (android && /; wv\)/.test(ua)) || (ios && !/Safari\//.test(ua));
  return { inApp: !!app || webview, android, app };
}

/**
 * Android で Chrome に開き直すための URL。
 * 宛先を指定しない intent は X で「実行できるアプリがありません」になったので、Chrome を名指しする
 */
export function externalUrl(href: string) {
  const u = new URL(href);
  // LINE はこのパラメータで外部ブラウザを開く
  u.searchParams.set("openExternalBrowser", "1");
  return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(u.toString())};end`;
}
