import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 静的書き出し (output: "export") でも sitemap.xml を出力する
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "monthly", priority: 1 }];
}
