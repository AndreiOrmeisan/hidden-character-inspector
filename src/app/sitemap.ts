import type { MetadataRoute } from "next";
import { siteUrl, sitePaths } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return sitePaths.map((path) => ({ url: `${siteUrl}${path}` }));
}
