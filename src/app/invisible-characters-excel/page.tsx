import { Guide } from "@/components/guide";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Find Invisible Characters in Excel Text",
  "Diagnose non-breaking spaces and zero-width characters behind Excel text mismatches. Learn targeted SUBSTITUTE formulas and the limits of TRIM and CLEAN.",
  "/invisible-characters-excel/",
);
export default function Page() {
  return (
    <Guide
      eyebrow="SPREADSHEET TEXT · A PRACTICAL CHECK"
      title="When Excel cells look equal but won’t match."
      intro="Text pasted from websites, PDFs, and exports can carry characters that an ordinary space cleanup misses. Inspect one problematic cell before changing an entire column."
    >
      <h2>Start with a small, representative sample</h2>
      <p>
        Copy the cell’s text into the inspector. Look for NO-BREAK SPACE, NARROW
        NO-BREAK SPACE, ZERO WIDTH SPACE, or a BOM inside the value. Two product
        names can look identical while one contains U+00A0 and the other
        contains an ordinary U+0020 space.
      </p>
      <p>
        Detection does not prove the hidden character is the only cause.
        Number-versus-text differences, case, punctuation, and formula behavior
        can also explain a mismatch.
      </p>
      <h2>Why TRIM and CLEAN may leave characters behind</h2>
      <p>
        Excel’s TRIM function targets ordinary ASCII spaces. A non-breaking
        space with decimal value 160 needs a separate substitution. CLEAN
        targets a set of nonprinting ASCII characters and does not remove every
        invisible Unicode character.
      </p>
      <p>
        For a cell in A1, these formulas illustrate two targeted changes.
        Function names and separators can differ in localized Excel
        installations.
      </p>
      <div className="code-example">
        <code>{'=SUBSTITUTE(A1,UNICHAR(160)," ")'}</code>
        <small>Replace U+00A0 with an ordinary space.</small>
        <code>{'=SUBSTITUTE(A1,UNICHAR(8203),"")'}</code>
        <small>Remove U+200B when its word-break function is unwanted.</small>
      </div>
      <h2>Keep cleanup separate from the original values</h2>
      <p>
        Use a helper column first. Compare a few outputs and review any
        characters that matter for language or formatting. If you add TRIM
        around a substitution, remember that TRIM also changes repeated ordinary
        spaces. That extra change may be inappropriate for identifiers or
        intentionally aligned text.
      </p>
      <p>
        The browser inspector works on pasted text, rather than reading or
        modifying a workbook. Its Advanced Non-breaking spaces category replaces
        U+00A0 and U+202F with ordinary spaces. Zero-width separators is a
        separate category. Copy the reviewed result back only after checking
        that it suits the column’s meaning.
      </p>
      <p className="article-source">
        Microsoft documents these limits and recommends targeted substitution.{" "}
        <a href="https://support.microsoft.com/en-us/excel/functions/trim-function">
          TRIM reference ↗
        </a>{" "}
        <a href="https://support.microsoft.com/en-us/excel/top-ten-ways-to-clean-your-data">
          Excel data cleanup guidance ↗
        </a>
      </p>
    </Guide>
  );
}
