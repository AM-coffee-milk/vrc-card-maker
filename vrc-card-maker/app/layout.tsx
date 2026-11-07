import type { Metadata, Viewport } from "next";
import { DM_Mono, Noto_Sans_JP, Oswald, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import { inAppBootScript } from "@/lib/inapp";
import { FAQ, MOBILE_POINTS, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

const noto = Noto_Sans_JP({ variable: "--font-noto", subsets: ["latin"], weight: ["400", "500", "700", "900"], display: "swap" });
const maru = Zen_Maru_Gothic({ variable: "--font-maru", subsets: ["latin"], weight: ["500", "700", "900"], display: "swap" });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "700"], display: "swap" });
const mono = DM_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

const OG_IMAGE = { url: `${SITE_URL}og.png`, width: 1200, height: 630, alt: "VRChatの自己紹介カード、ブラウザで作れる。VRC IDENTITY GEN" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_TITLE} - ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  keywords: ["VRChat", "自己紹介カード", "プロフィールカード", "自己紹介", "メーカー", "作成", "無料", "VRC", "テンプレート"],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION, images: [OG_IMAGE.url] },
};

// 検索エンジンや AI に「何のサイトか」を伝える構造化データ。FAQ はページ下に表示している内容と同じ
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: SITE_NAME,
      alternateName: "VRChat自己紹介カードメーカー",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "DesignApplication",
      operatingSystem: "Web, iOS, Android",
      browserRequirements: "スマホ・PC の最新ブラウザ（アプリのインストール不要）",
      featureList: MOBILE_POINTS.map((p) => p.title),
      inLanguage: "ja",
      image: OG_IMAGE.url,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // 起動スクリプトが <html> に属性を付けるので、その差は React に無視させる
    <html lang="ja" suppressHydrationWarning>
      <body className={`${noto.variable} ${maru.variable} ${oswald.variable} ${mono.variable} font-sans antialiased`}>
        {/* 画面を描く前にアプリ内ブラウザ判定と前回のカードの向きを <html> に付ける (後から差し込むとページがずれるため) */}
        <script dangerouslySetInnerHTML={{ __html: inAppBootScript(process.env.NODE_ENV !== "production") }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        {children}
        {/* 閲覧数の集計 (Cloudflare Web Analytics、Cookie なし)。開発中は数えない */}
        {process.env.NODE_ENV === "production" && (
          <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "d7ce53cf763f47e5bdb995a66176cd22"}' />
        )}
      </body>
    </html>
  );
}
