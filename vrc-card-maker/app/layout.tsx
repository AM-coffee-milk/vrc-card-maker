import type { Metadata, Viewport } from "next";
import { DM_Mono, Noto_Sans_JP, Oswald, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_JP({ variable: "--font-noto", subsets: ["latin"], weight: ["400", "500", "700", "900"], display: "swap" });
const maru = Zen_Maru_Gothic({ variable: "--font-maru", subsets: ["latin"], weight: ["500", "700", "900"], display: "swap" });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "700"], display: "swap" });
const mono = DM_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: "VRC IDENTITY GEN | VRChat自己紹介カードメーカー",
  description: "写真とプロフィールを入れるだけで、VRChat用の自己紹介カード画像を作れるツール。",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${noto.variable} ${maru.variable} ${oswald.variable} ${mono.variable} font-sans antialiased`}>
        {children}
        {/* 閲覧数の集計 (Cloudflare Web Analytics、Cookie なし)。開発中は数えない */}
        {process.env.NODE_ENV === "production" && (
          <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "d7ce53cf763f47e5bdb995a66176cd22"}' />
        )}
      </body>
    </html>
  );
}
