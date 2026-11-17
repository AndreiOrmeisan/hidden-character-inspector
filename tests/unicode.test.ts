import test from "node:test";
import assert from "node:assert/strict";
import {
  inspectText,
  characterInfo,
  codePointLabel,
  categories,
  MAX_INPUT_LENGTH,
  PREVIEW_LIMIT,
  SAMPLE_TEXT,
} from "../src/lib/unicode";

test("detects required characters with names, categories, and counts", () => {
  const text =
    "\u200b\u200b\u200c\u200d\u2060\ufeff\u00a0\u202f\u00ad\u202e\u2067";
  const result = inspectText(text);
  assert.equal(result.detected, 11);
  assert.equal(result.findings.length, 10);
  assert.equal(result.findings[0].count, 2);
  for (const finding of result.findings) {
    assert.ok(finding.name);
    assert.ok(finding.explanation);
    assert.match(finding.code, /^U\+[0-9A-F]{4,6}$/);
  }
});
test("safe mode removes only leading BOM and NUL", () => {
  const text = "\ufeffA\u0000B\ufeff C\u200bD\u00a0E\u202fF\u00adG";
  const result = inspectText(text);
  assert.equal(result.cleaned, "AB\ufeff C\u200bD\u00a0E\u202fF\u00adG");
  assert.equal(result.removed, 2);
  assert.equal(result.replaced, 0);
  assert.equal(inspectText("x\ufeff").cleaned, "x\ufeff");
});
test("emoji ZWJ sequences, variation selectors, modifiers, and flags survive safe cleanup", () => {
  const text =
    "👨‍👩‍👧‍👦 👩🏽‍💻 ❤️ ✈️ 🇷🇴 🏴" +
    String.fromCodePoint(0xe0067, 0xe0062, 0xe0073, 0xe0063, 0xe0074, 0xe007f);
  const result = inspectText(text);
  assert.equal(result.cleaned, text);
  assert.ok(result.findings.some((finding) => finding.value === 0x200d));
  assert.ok(result.findings.some((finding) => finding.value === 0xfe0f));
  assert.ok(result.findings.some((finding) => finding.value === 0xe007f));
});
test("multilingual text, combining marks, ZWNJ, and directional controls survive safe mode", () => {
  const text =
    "می\u200cروم فارسی \u2067مرحبا\u2069 עברית \u200eไทย\u200bภาษา हिंदी नमस्ते e\u0301 \u034f ᠠ\u180b";
  assert.equal(inspectText(text).cleaned, text);
});
test("surrogate pairs have code point positions and UTF-16 offsets", () => {
  const result = inspectText("😀A\u200b𠮷\u00a0");
  assert.equal(result.before.codePoints, 5);
  assert.equal(result.before.utf16, 7);
  assert.deepEqual(result.findings[0].positions[0], {
    codePoint: 3,
    utf16: 3,
    line: 1,
    column: 3,
  });
  assert.deepEqual(result.findings[1].positions[0], {
    codePoint: 5,
    utf16: 6,
    line: 1,
    column: 5,
  });
});
test("supplementary variation selectors stay intact and are named correctly", () => {
  const text = "漢" + String.fromCodePoint(0xe0100, 0xe01ef);
  const result = inspectText(text);
  assert.equal(result.cleaned, text);
  assert.deepEqual(
    result.findings.map((finding) => finding.name),
    ["VARIATION SELECTOR-17", "VARIATION SELECTOR-256"],
  );
  assert.equal(codePointLabel(0xe0100), "U+E0100");
});
test("advanced non-breaking space cleanup replaces instead of joining words", () => {
  const result = inspectText("10\u00a0kg\n1\u202f250  EUR", "advanced", [
    "spaces",
  ]);
  assert.equal(result.cleaned, "10 kg\n1 250  EUR");
  assert.equal(result.before.codePoints, result.after.codePoints);
  assert.equal(result.replaced, 2);
  assert.equal(result.removed, 0);
});
test("advanced mode has no implicitly selected categories", () => {
  assert.equal(inspectText(SAMPLE_TEXT, "advanced", []).cleaned, SAMPLE_TEXT);
});
test("directional and joining controls change only when explicitly selected", () => {
  const text = "\u2067abc\u2069👩‍💻می\u200cروم❤️";
  assert.equal(
    inspectText(text, "advanced", ["directional"]).cleaned,
    "abc👩‍💻می\u200cروم❤️",
  );
  assert.equal(
    inspectText(text, "advanced", ["joining"]).cleaned,
    "\u2067abc\u2069👩💻میروم❤️",
  );
});
test("all modes preserve ordinary spaces, tabs, CRLF, and line separators", () => {
  const text = "  a\tb\r\nc\rd\ne\u0085f\u2028g\u2029h\vnext\fpage  ";
  assert.equal(inspectText(text).cleaned, text);
  assert.equal(
    inspectText(
      text,
      "advanced",
      categories.map((category) => category.id),
    ).cleaned,
    text,
  );
});
test("CRLF counts as one line break and locations use code points", () => {
  const result = inspectText("😀\r\n\u200b\r\u00a0");
  assert.deepEqual(result.findings[0].positions[0], {
    codePoint: 4,
    utf16: 4,
    line: 2,
    column: 1,
  });
  assert.deepEqual(result.findings[1].positions[0], {
    codePoint: 6,
    utf16: 6,
    line: 3,
    column: 1,
  });
  assert.equal(result.before.lines, 3);
});
test("highlight limits do not truncate detection or cleaned output", () => {
  const text = "a".repeat(PREVIEW_LIMIT) + "\u200b".repeat(30);
  const result = inspectText(text, "advanced", ["zero-width"]);
  assert.equal(result.previewTruncated, true);
  assert.equal(result.findings[0].count, 30);
  assert.equal(result.findings[0].positions.length, 12);
  assert.equal(result.cleaned, "a".repeat(PREVIEW_LIMIT));
});
test("zero-width and soft-hyphen categories are targeted", () => {
  assert.equal(
    inspectText("a\u200bb\u2060c\ufeffd\u00ade", "advanced", ["zero-width"])
      .cleaned,
    "abcd\u00ade",
  );
  assert.equal(
    inspectText("a-b\u00adc", "advanced", ["hyphen"]).cleaned,
    "a-bc",
  );
});
test("empty output and input limits are explicit", () => {
  assert.equal(inspectText("").before.lines, 0);
  assert.equal(inspectText("\ufeff\0").after.lines, 0);
  assert.throws(
    () => inspectText("a".repeat(MAX_INPUT_LENGTH + 1)),
    /1,000,000/,
  );
});
test("formatting and fillers are detected but retained by default", () => {
  for (const cp of [0x2061, 0x034f, 0x3164, 0x17b4, 0x180e, 0x2007, 0x2800]) {
    const text = String.fromCodePoint(cp);
    assert.ok(characterInfo(cp));
    assert.equal(inspectText(text).cleaned, text);
  }
});
