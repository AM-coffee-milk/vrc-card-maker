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

// [UA に含まれる文字 (正規表現・大文字小文字は区別しない), アプリ名]
const APPS: [string, string][] = [
  ["Twitter|TwitterAndroid", "X"],
  ["\\bLine/", "LINE"],
  ["Instagram", "Instagram"],
  ["FBAN|FBAV|FB_IAB", "Facebook"],
  ["Discord", "Discord"],
  ["TikTok|musical_ly|BytedanceWebview", "TikTok"],
];

export function detectInApp(ua: string): InAppInfo {
  const android = /Android/i.test(ua);
  const ios = /iPhone|iPad|iPod/i.test(ua);
  const app = APPS.find(([re]) => new RegExp(re, "i").test(ua))?.[1] ?? null;
  // Android の WebView は UA に "; wv)" が入る。iOS のアプリ内ブラウザは "Safari/" が入らない
  const webview = (android && /; wv\)/.test(ua)) || (ios && !/Safari\//.test(ua));
  return { inApp: !!app || webview, android, app };
}

/** 最後に作っていたカードの向き (localStorage)。読み込み中の枠の大きさに使う */
export const ORIENT_KEY = "vrc-card-orientation";

/**
 * 画面が描かれる前に <html> へ判定結果を付けるスクリプト。
 * 案内を React の読み込み後に差し込むとページ全体が下にずれる (CLS が悪化する) ので、
 * 案内は最初から HTML に入れておき、表示・非表示と文言を CSS で切り替える (globals.css の .inapp-*)。
 * 判定は detectInApp と同じ。前回のカードの向きも <html data-orient> に付ける。
 */
export function inAppBootScript(debug: boolean): string {
  return `(function(){try{
if(localStorage.getItem(${JSON.stringify(ORIENT_KEY)})==="portrait")document.documentElement.setAttribute("data-orient","portrait");
}catch(e){}try{
var ua=navigator.userAgent,apps=${JSON.stringify(APPS)},app=null,i;
for(i=0;i<apps.length;i++){if(new RegExp(apps[i][0],"i").test(ua)){app=apps[i][1];break;}}
var android=/Android/i.test(ua),ios=/iPhone|iPad|iPod/i.test(ua);
var inApp=!!app||(android&&/; wv\\)/.test(ua))||(ios&&!/Safari\\//.test(ua));
${debug ? `var q=new URLSearchParams(location.search).get("inapp");if(q){inApp=true;android=q==="android";app="X";}` : ""}
if(!inApp)return;
var d=document.documentElement;d.setAttribute("data-inapp",android?"android":"ios");
d.style.setProperty("--inapp-where",JSON.stringify(app?app+"のアプリ内":"アプリ内のブラウザ"));
}catch(e){}})();`;
}
