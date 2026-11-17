import { Guide } from "@/components/guide";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Zero-Width Space Remover and Guide",
  "Find U+200B zero-width spaces, understand their word-breaking role, and remove them deliberately without stripping emoji joiners or other Unicode formatting.",
  "/zero-width-space-remover/",
);
export default function Page() {
  return (
    <Guide
      eyebrow="U+200B · ZERO WIDTH SPACE"
      title="An invisible break can split an exact match."
      intro="A zero-width space takes up no visible width, but it is still a character. That makes it easy to overlook when a copied word refuses to match the version you typed."
    >
      <h2>What a zero-width space actually does</h2>
      <p>
        U+200B marks a place where a line may break. It can be useful when
        visible spaces are inappropriate, including text in writing systems that
        do not put a space between every word. It also appears in copied web
        content and intentionally separated identifiers.
      </p>
      <p>
        The strings below can look alike in an ordinary editor. The second
        contains one extra code point between “copy” and “paste”. Exact string
        comparisons treat them as different.
      </p>
      <div className="code-example">
        <code>copypaste</code>
        <code>
          copy<span>[U+200B]</span>paste
        </code>
        <small>
          Brackets show the hidden character. They are explanatory labels.
        </small>
      </div>
      <h2>Remove it deliberately</h2>
      <ol>
        <li>Paste the original text into the inspector.</li>
        <li>
          Expand the ZERO WIDTH SPACE finding to inspect its count and
          locations.
        </li>
        <li>Switch to Advanced mode and select Zero-width separators.</li>
        <li>Review the cleaned text, then copy it or download a text file.</li>
      </ol>
      <p>
        This category removes U+200B, U+2060 word joiners, and U+FEFF
        characters. It does not remove ZWJ or ZWNJ. If your text contains
        several separator types, review the findings before applying the
        category.
      </p>
      <h2>When keeping it is the better choice</h2>
      <p>
        Removing a zero-width space can join words or remove an intended
        wrapping opportunity. Safe mode therefore preserves it. A zero-width
        joiner, U+200D, is a different character with a different job. Deleting
        joiners can break an emoji sequence or alter script shaping, so this
        tool offers them as a separate, explicit category.
      </p>
      <p>
        The inspector identifies character types. It cannot infer the author’s
        intent, prove a pasted identifier is trustworthy, or validate every
        language’s typography.
      </p>
      <p className="article-source">
        Character properties and word-break context are documented by the
        Unicode Consortium.{" "}
        <a href="https://www.unicode.org/reports/tr14/">
          Unicode Line Breaking Algorithm ↗
        </a>
      </p>
    </Guide>
  );
}
