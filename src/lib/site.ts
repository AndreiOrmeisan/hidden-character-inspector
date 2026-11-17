import type { Metadata } from "next";
export const siteName = "Hidden Character Inspector";
export const PRODUCTION_SITE_URL = "https://hidden-character-inspector.pages.dev";
export function resolveSiteUrl(
  value: string | undefined,
  production: boolean,
): string {
  const url = new URL(
    value || (production ? PRODUCTION_SITE_URL : "http://localhost:3000"),
  );
  if (
    production &&
    (url.protocol !== "https:" ||
      url.hostname === "localhost" ||
      url.hostname.endsWith(".localhost") ||
      url.hostname.startsWith("127.") ||
      url.hostname === "[::1]")
  )
    throw new Error(
      "Production SITE_URL must be a public HTTPS origin, never localhost.",
    );
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error(
      "SITE_URL must be an HTTP(S) origin without credentials, path, query, or fragment.",
    );
  return url.origin;
}
export const siteUrl = resolveSiteUrl(
  process.env.SITE_URL,
  process.env.NODE_ENV === "production",
);
export const sitePaths = [
  "/",
  "/zero-width-space-remover/",
  "/non-breaking-space-remover/",
  "/invisible-characters-excel/",
  "/about/",
  "/privacy/",
];
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: `${siteUrl}${path}`,
    },
  };
}
