import type { Metadata } from "next";
import Link from "next/link";
import { siteName, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hidden Character Inspector — Find Invisible Unicode Characters",
    template: "%s | Hidden Character Inspector",
  },
  description:
    "Find invisible Unicode characters, understand their purpose, and clean text carefully. Inspect zero-width spaces, non-breaking spaces, emoji controls, and more in your browser.",
  alternates: { canonical: "/" },
  other: {
    "google-adsense-account": "ca-pub-8517954432428097",
  },
  openGraph: {
    type: "website",
    siteName,
    title: "Hidden Character Inspector",
    description:
      "Make invisible characters visible. Inspect and carefully clean text locally in your browser.",
    url: siteUrl,
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="site-header">
          <nav className="wrap nav" aria-label="Main navigation">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                [<i>·</i>]
              </span>
              <span>
                Hidden Character
                <br />
                <strong>Inspector</strong>
              </span>
            </Link>
            <div className="nav-links">
              <Link href="/#how-it-works">How it works</Link>
              <Link href="/#guides">Character guides</Link>
              <Link href="/about/">About</Link>
              <span className="nav-privacy">◈ Browser-only processing</span>
            </div>
          </nav>
        </header>
        <div id="main">{children}</div>
        <footer className="wrap footer">
          <div>
            <Link href="/" className="footer-brand">
              [·] Hidden Character Inspector
            </Link>
            <p>A little clarity between the letters.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/about/">About</Link>
            <Link href="/privacy/">Privacy</Link>
            <Link href="/#guides">Guides</Link>
          </nav>
          <span>Free to use. Thoughtfully simple.</span>
        </footer>
      </body>
    </html>
  );
}
