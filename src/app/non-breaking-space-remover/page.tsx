import { Guide } from "@/components/guide";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Non-Breaking Space Remover and Guide",
  "Identify U+00A0 and U+202F non-breaking spaces and replace them with ordinary spaces when appropriate. Preserve words, line breaks, and intentional typography.",
  "/non-breaking-space-remover/",
);
export default function Page() {
  return (
    <Guide
      eyebrow="U+00A0 & U+202F · SPACES WITH A PURPOSE"
      title="The same-looking space can behave differently."
      intro="A non-breaking space keeps neighboring text on the same line. It can also explain why a search, comparison, or spreadsheet cleanup behaves unexpectedly."
    >
      <h2>A space that prevents wrapping</h2>
      <p>
        U+00A0 NO-BREAK SPACE occupies visible width and discourages a line
        break between neighboring text. It is often used between a number and
        its unit or in names and short phrases. HTML content can introduce it
        through the entity <code>&amp;nbsp;</code>.
      </p>
      <p>
        U+202F NARROW NO-BREAK SPACE is narrower. It appears in number grouping
        and in typography such as French punctuation. Both differ from U+0020
        SPACE even when the visual difference is hard to see.
      </p>
      <div className="code-example">
        <code>
          10<span>[NBSP]</span>kg
        </code>
        <code>
          1<span>[NNBSP]</span>250
        </code>
        <small>
          The labels expose the spacing characters without hiding their
          position.
        </small>
      </div>
      <h2>Replace the space without joining the words</h2>
      <p>
        Paste your text, inspect the NBSP or NNBSP finding, and choose Advanced
        mode. Select Non-breaking spaces. This replaces each U+00A0 and U+202F
        with one ordinary space. It does not collapse repeated spaces, trim
        text, or remove line breaks.
      </p>
      <p>
        Replacement is usually preferable to deletion for these characters.
        Deleting the character in “10 kg” would produce “10kg”, changing the
        original word boundary. The inspector’s before and after code point
        counts can stay equal even when replacements occurred, so also check the
        replacement statistic.
      </p>
      <h2>Keep intentional typography intact</h2>
      <p>
        Allowing a line break can make a unit fall onto a separate line or
        change the appearance of a formatted number. Safe mode preserves both
        kinds of non-breaking space. The choice to replace them belongs to the
        person who understands the target document.
      </p>
      <p>
        Other spaces, such as thin space and figure space, have their own names
        and belong to a separate Advanced category. Selecting Non-breaking
        spaces affects only U+00A0 and U+202F.
      </p>
      <p className="article-source">
        The Unicode Character Database lists the whitespace code points.{" "}
        <a href="https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt">
          Unicode character properties ↗
        </a>
      </p>
    </Guide>
  );
}
