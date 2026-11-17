import Link from "next/link";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "About",
  "Learn how Hidden Character Inspector identifies invisible Unicode, uses conservative cleanup, and keeps text processing local in your browser.",
  "/about/",
);
export default function About() {
  return (
    <main className="wrap prose-page">
      <span className="eyebrow">A SMALL TOOL FOR THE DETAILS</span>
      <h1>
        Clarity between
        <br />
        the characters.
      </h1>
      <p className="article-intro">
        Hidden Character Inspector helps explain why text can look right and
        behave differently.
      </p>
      <h2>Inspect before changing</h2>
      <p>
        The tool reveals a curated set of Unicode separators, special spaces,
        joining and directional controls, variation selectors, script-specific
        fillers, and non-layout control characters. Each finding includes a
        name, count, explanation, and locations. It treats language and emoji
        formatting as context to understand.
      </p>
      <h2>Conservative by default</h2>
      <p>
        Safe mode removes only a leading U+FEFF and U+0000 NUL characters.
        Advanced mode makes category-level changes explicit. It preserves
        ordinary spacing, tabs, and line separators. It does not normalize
        Unicode, rewrite spelling, or collapse whitespace.
      </p>
      <h2>Practical limits</h2>
      <p>
        Inspection supports up to 1,000,000 UTF-16 units. The full text is
        analyzed in a browser worker. Highlighted preview is limited to 2,500
        code points and location lists to 12 occurrences per character type. The
        catalog is focused and does not cover every Unicode format character,
        confusable letter, encoding problem, or security issue.
      </p>
      <p>
        All processing is local. There are no accounts or subscriptions. This
        project does not represent the Unicode Consortium or Microsoft.
      </p>
      <Link className="button primary" href="/#inspector">
        Inspect some text →
      </Link>
    </main>
  );
}
