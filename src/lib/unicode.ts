export const MAX_INPUT_LENGTH = 1_000_000;
export const PREVIEW_LIMIT = 2500;
export const categories = [
  {
    id: "zero-width",
    name: "Zero-width separators",
    action:
      "Remove ZWSP, word joiner, and BOM characters anywhere in the text. This can change word wrapping and segmentation.",
  },
  {
    id: "spaces",
    name: "Non-breaking spaces",
    action:
      "Replace U+00A0 and U+202F with ordinary spaces. This allows new line breaks.",
  },
  {
    id: "hyphen",
    name: "Soft hyphens",
    action:
      "Remove discretionary hyphenation points. Visible hyphens stay intact.",
  },
  {
    id: "joining",
    name: "Joining controls",
    action:
      "Remove ZWJ and ZWNJ. Can split emoji and alter Arabic, Persian, and Indic text.",
  },
  {
    id: "directional",
    name: "Directional controls",
    action:
      "Remove direction marks, embeddings, overrides, and isolates. Can reorder mixed-direction text.",
  },
  {
    id: "variation",
    name: "Variation selectors",
    action:
      "Remove glyph presentation selectors. Can change emoji style and multilingual glyph variants.",
  },
  {
    id: "formatting",
    name: "Other formatting characters",
    action:
      "Remove listed math controls, script-specific markers, fillers, and emoji tags. Can change meaning or presentation.",
  },
  {
    id: "typographic",
    name: "Typographic spaces and blank symbols",
    action:
      "Replace listed special-width spaces and blank symbols with ordinary spaces. Can change typography and braille content.",
  },
  {
    id: "controls",
    name: "Non-layout control characters",
    action:
      "Remove listed C0, DEL, and C1 controls. Tabs and line or paragraph separators are always preserved.",
  },
] as const;
export type Category = (typeof categories)[number]["id"];
export type CleaningMode = "safe" | "advanced";
export interface CharacterInfo {
  name: string;
  label: string;
  category: Category;
  context: "review" | "contextual";
  explanation: string;
}
export interface Position {
  codePoint: number;
  utf16: number;
  line: number;
  column: number;
}
export interface Finding extends CharacterInfo {
  value: number;
  code: string;
  count: number;
  positions: Position[];
}
export interface PreviewSegment {
  text: string;
  code?: string;
  label?: string;
  context?: "review" | "contextual";
}
export interface Inspection {
  findings: Finding[];
  preview: PreviewSegment[];
  previewTruncated: boolean;
  detected: number;
  cleaned: string;
  before: { codePoints: number; utf16: number; lines: number };
  after: { codePoints: number; utf16: number; lines: number };
  removed: number;
  replaced: number;
}

const catalog = new Map<number, CharacterInfo>();
function define(
  value: number,
  name: string,
  label: string,
  category: Category,
  context: CharacterInfo["context"],
  explanation: string,
) {
  catalog.set(value, { name, label, category, context, explanation });
}
define(
  0x200b,
  "ZERO WIDTH SPACE",
  "ZWSP",
  "zero-width",
  "review",
  "An invisible word-break opportunity. Can break exact matches or identifiers, but is also used for word segmentation in languages such as Thai.",
);
define(
  0x2060,
  "WORD JOINER",
  "WJ",
  "zero-width",
  "contextual",
  "Prevents a line break without adding visible space. Removing it changes wrapping.",
);
define(
  0xfeff,
  "ZERO WIDTH NO-BREAK SPACE",
  "BOM",
  "zero-width",
  "review",
  "At the beginning, this may be a byte order mark. Inside text it can affect line breaking and comparisons. Safe mode removes it only at the very start.",
);
define(
  0x00a0,
  "NO-BREAK SPACE",
  "NBSP",
  "spaces",
  "review",
  "Looks like a space but prevents wrapping. Exact comparisons and some spreadsheet cleanup functions treat it differently from U+0020.",
);
define(
  0x202f,
  "NARROW NO-BREAK SPACE",
  "NNBSP",
  "spaces",
  "contextual",
  "A narrow non-breaking space used in typography, including French punctuation and number formatting. Replacing it changes layout.",
);
define(
  0x00ad,
  "SOFT HYPHEN",
  "SHY",
  "hyphen",
  "contextual",
  "A discretionary hyphenation point. Often hidden until a word wraps, and can interfere with searching copied text.",
);
define(
  0x200c,
  "ZERO WIDTH NON-JOINER",
  "ZWNJ",
  "joining",
  "contextual",
  "Controls how adjacent letters join, including in Persian and Indic scripts. Removing it can damage correct spelling or shaping.",
);
define(
  0x200d,
  "ZERO WIDTH JOINER",
  "ZWJ",
  "joining",
  "contextual",
  "Connects parts of emoji sequences and influences script shaping. Removing it can split a family or profession emoji into separate symbols.",
);
const bidi: [number, string, string][] = [
  [0x061c, "ARABIC LETTER MARK", "ALM"],
  [0x200e, "LEFT-TO-RIGHT MARK", "LRM"],
  [0x200f, "RIGHT-TO-LEFT MARK", "RLM"],
  [0x202a, "LEFT-TO-RIGHT EMBEDDING", "LRE"],
  [0x202b, "RIGHT-TO-LEFT EMBEDDING", "RLE"],
  [0x202c, "POP DIRECTIONAL FORMATTING", "PDF"],
  [0x202d, "LEFT-TO-RIGHT OVERRIDE", "LRO"],
  [0x202e, "RIGHT-TO-LEFT OVERRIDE", "RLO"],
  [0x2066, "LEFT-TO-RIGHT ISOLATE", "LRI"],
  [0x2067, "RIGHT-TO-LEFT ISOLATE", "RLI"],
  [0x2068, "FIRST STRONG ISOLATE", "FSI"],
  [0x2069, "POP DIRECTIONAL ISOLATE", "PDI"],
  [0x206a, "INHIBIT SYMMETRIC SWAPPING", "ISS"],
  [0x206b, "ACTIVATE SYMMETRIC SWAPPING", "ASS"],
  [0x206c, "INHIBIT ARABIC FORM SHAPING", "IAFS"],
  [0x206d, "ACTIVATE ARABIC FORM SHAPING", "AAFS"],
  [0x206e, "NATIONAL DIGIT SHAPES", "NADS"],
  [0x206f, "NOMINAL DIGIT SHAPES", "NODS"],
];
for (const [value, name, label] of bidi)
  define(
    value,
    name,
    label,
    "directional",
    "contextual",
    "Controls bidirectional text layout. Can be legitimate in Arabic, Hebrew, and mixed-direction text. Overrides can make displayed order differ from stored order. Review context before removal.",
  );
const formatting: [number, string, string][] = [
  [0x034f, "COMBINING GRAPHEME JOINER", "CGJ"],
  [0x180e, "MONGOLIAN VOWEL SEPARATOR", "MVS"],
  [0x070f, "SYRIAC ABBREVIATION MARK", "SAM"],
  [0x115f, "HANGUL CHOSEONG FILLER", "HCF"],
  [0x1160, "HANGUL JUNGSEONG FILLER", "HJF"],
  [0x3164, "HANGUL FILLER", "HF"],
  [0xffa0, "HALFWIDTH HANGUL FILLER", "HHF"],
  [0x17b4, "KHMER VOWEL INHERENT AQ", "KVAQ"],
  [0x17b5, "KHMER VOWEL INHERENT AA", "KVAA"],
  [0x2061, "FUNCTION APPLICATION", "FA"],
  [0x2062, "INVISIBLE TIMES", "IT"],
  [0x2063, "INVISIBLE SEPARATOR", "IS"],
  [0x2064, "INVISIBLE PLUS", "IP"],
  [0xfff9, "INTERLINEAR ANNOTATION ANCHOR", "IAA"],
  [0xfffa, "INTERLINEAR ANNOTATION SEPARATOR", "IAS"],
  [0xfffb, "INTERLINEAR ANNOTATION TERMINATOR", "IAT"],
  [0xe0001, "LANGUAGE TAG", "TAG"],
];
for (const [value, name, label] of formatting)
  define(
    value,
    name,
    label,
    "formatting",
    "contextual",
    "A script, annotation, mathematical, or presentation character. It can carry meaningful information despite having little or no visible width. Safe mode preserves it.",
  );
const spaces: [number, string][] = [
  [0x1680, "OGHAM SPACE MARK"],
  [0x2000, "EN QUAD"],
  [0x2001, "EM QUAD"],
  [0x2002, "EN SPACE"],
  [0x2003, "EM SPACE"],
  [0x2004, "THREE-PER-EM SPACE"],
  [0x2005, "FOUR-PER-EM SPACE"],
  [0x2006, "SIX-PER-EM SPACE"],
  [0x2007, "FIGURE SPACE"],
  [0x2008, "PUNCTUATION SPACE"],
  [0x2009, "THIN SPACE"],
  [0x200a, "HAIR SPACE"],
  [0x205f, "MEDIUM MATHEMATICAL SPACE"],
  [0x3000, "IDEOGRAPHIC SPACE"],
  [0x2800, "BRAILLE PATTERN BLANK"],
];
for (const [value, name] of spaces)
  define(
    value,
    name,
    "SPACE",
    "typographic",
    "contextual",
    "A special-width space or blank symbol used in typography, writing systems, or braille. It differs from ordinary space. Safe mode preserves it.",
  );
const controlNames = [
  "NULL",
  "START OF HEADING",
  "START OF TEXT",
  "END OF TEXT",
  "END OF TRANSMISSION",
  "ENQUIRY",
  "ACKNOWLEDGE",
  "ALERT",
  "BACKSPACE",
  "CHARACTER TABULATION",
  "LINE FEED",
  "LINE TABULATION",
  "FORM FEED",
  "CARRIAGE RETURN",
  "SHIFT OUT",
  "SHIFT IN",
  "DATA LINK ESCAPE",
  "DEVICE CONTROL ONE",
  "DEVICE CONTROL TWO",
  "DEVICE CONTROL THREE",
  "DEVICE CONTROL FOUR",
  "NEGATIVE ACKNOWLEDGE",
  "SYNCHRONOUS IDLE",
  "END OF TRANSMISSION BLOCK",
  "CANCEL",
  "END OF MEDIUM",
  "SUBSTITUTE",
  "ESCAPE",
  "INFORMATION SEPARATOR FOUR",
  "INFORMATION SEPARATOR THREE",
  "INFORMATION SEPARATOR TWO",
  "INFORMATION SEPARATOR ONE",
];
for (let value = 0; value < 32; value++) {
  // Keep tabs and all common line-layout characters out of the removal catalog.
  if ([9, 10, 11, 12, 13].includes(value)) continue;
  define(
    value,
    controlNames[value],
    value === 0 ? "NUL" : "CTRL",
    "controls",
    "review",
    "A non-layout control character. It may be invisible in editors or interpreted by other software. Safe mode removes NUL only.",
  );
}
define(
  0x7f,
  "DELETE",
  "DEL",
  "controls",
  "review",
  "A control character that is usually invisible in plain text. Safe mode preserves it for review.",
);
const c1Names = [
  "PADDING CHARACTER",
  "HIGH OCTET PRESET",
  "BREAK PERMITTED HERE",
  "NO BREAK HERE",
  "INDEX",
  "NEXT LINE",
  "START OF SELECTED AREA",
  "END OF SELECTED AREA",
  "CHARACTER TABULATION SET",
  "CHARACTER TABULATION WITH JUSTIFICATION",
  "LINE TABULATION SET",
  "PARTIAL LINE FORWARD",
  "PARTIAL LINE BACKWARD",
  "REVERSE LINE FEED",
  "SINGLE SHIFT TWO",
  "SINGLE SHIFT THREE",
  "DEVICE CONTROL STRING",
  "PRIVATE USE ONE",
  "PRIVATE USE TWO",
  "SET TRANSMIT STATE",
  "CANCEL CHARACTER",
  "MESSAGE WAITING",
  "START OF GUARDED AREA",
  "END OF GUARDED AREA",
  "START OF STRING",
  "SINGLE GRAPHIC CHARACTER INTRODUCER",
  "SINGLE CHARACTER INTRODUCER",
  "CONTROL SEQUENCE INTRODUCER",
  "STRING TERMINATOR",
  "OPERATING SYSTEM COMMAND",
  "PRIVACY MESSAGE",
  "APPLICATION PROGRAM COMMAND",
];
for (let value = 0x80; value <= 0x9f; value++) {
  if ([0x84, 0x85, 0x8a, 0x8b, 0x8c, 0x8d].includes(value)) continue;
  define(
    value,
    c1Names[value - 0x80],
    "CTRL",
    "controls",
    "review",
    "A C1 control character, sometimes introduced by encoding errors. It can be interpreted as a command by other software. Safe mode preserves it.",
  );
}
export function codePointLabel(value: number): string {
  return `U+${value.toString(16).toUpperCase().padStart(4, "0")}`;
}
export function characterInfo(value: number): CharacterInfo | undefined {
  const known = catalog.get(value);
  if (known) return known;
  if (
    (value >= 0xfe00 && value <= 0xfe0f) ||
    (value >= 0xe0100 && value <= 0xe01ef)
  ) {
    const number = value <= 0xfe0f ? value - 0xfe00 + 1 : value - 0xe0100 + 17;
    return {
      name: `VARIATION SELECTOR-${number}`,
      label: `VS${number}`,
      category: "variation",
      context: "contextual",
      explanation:
        "Selects a glyph variant. VS15 and VS16 can select text or emoji presentation. Supplementary selectors are used in ideographic variation sequences. Removing it can change appearance.",
    };
  }
  if ([0x180b, 0x180c, 0x180d, 0x180f].includes(value)) {
    const number =
      value === 0x180f ? "FOUR" : ["ONE", "TWO", "THREE"][value - 0x180b];
    return {
      name: `MONGOLIAN FREE VARIATION SELECTOR ${number}`,
      label: "MVS",
      category: "variation",
      context: "contextual",
      explanation:
        "Selects a Mongolian glyph form. Safe mode preserves it to protect legitimate script shaping.",
    };
  }
  if ((value >= 0xe0061 && value <= 0xe007a) || value === 0xe007f)
    return {
      name:
        value === 0xe007f
          ? "CANCEL TAG"
          : `TAG LATIN SMALL LETTER ${String.fromCharCode(value - 0xe0000).toUpperCase()}`,
      label: "TAG",
      category: "formatting",
      context: "contextual",
      explanation:
        "An invisible tag character used in some emoji flag sequences. Removing it can change a valid emoji.",
    };
  return undefined;
}

export function inspectText(
  text: string,
  mode: CleaningMode = "safe",
  selected: readonly Category[] = [],
): Inspection {
  if (text.length > MAX_INPUT_LENGTH)
    throw new Error("Please use up to 1,000,000 UTF-16 units per inspection.");
  const enabled = new Set(selected);
  const findings = new Map<number, Finding>();
  const preview: PreviewSegment[] = [];
  const output: string[] = [];
  let plain = "",
    index = 0,
    count = 0,
    line = 1,
    column = 1,
    previousCR = false,
    detected = 0,
    removed = 0,
    replaced = 0;
  let afterCount = 0;
  for (const character of text) {
    const value = character.codePointAt(0)!;
    const info = characterInfo(value);
    if (info) {
      detected++;
      let finding = findings.get(value);
      if (!finding) {
        finding = {
          ...info,
          value,
          code: codePointLabel(value),
          count: 0,
          positions: [],
        };
        findings.set(value, finding);
      }
      finding.count++;
      if (finding.positions.length < 12)
        finding.positions.push({
          codePoint: count + 1,
          utf16: index,
          line,
          column,
        });
    }
    if (count < PREVIEW_LIMIT) {
      if (info) {
        if (plain) {
          preview.push({ text: plain });
          plain = "";
        }
        preview.push({
          text: character,
          code: codePointLabel(value),
          label: info.label,
          context: info.context,
        });
      } else plain += character;
    }
    const shouldRemove =
      mode === "safe"
        ? value === 0 || (value === 0xfeff && index === 0)
        : !!info && enabled.has(info.category);
    if (shouldRemove) {
      if (
        mode === "advanced" &&
        (info?.category === "spaces" || info?.category === "typographic")
      ) {
        output.push(" ");
        afterCount++;
        replaced++;
      } else removed++;
    } else {
      output.push(character);
      afterCount++;
    }
    if (character === "\r") {
      line++;
      column = 1;
    } else if (character === "\n") {
      if (!previousCR) line++;
      column = 1;
    } else if ([0x85, 0x2028, 0x2029, 11, 12].includes(value)) {
      line++;
      column = 1;
    } else column++;
    previousCR = character === "\r";
    index += character.length;
    count++;
  }
  if (plain) preview.push({ text: plain });
  const cleaned = output.join("");
  return {
    findings: [...findings.values()],
    preview,
    previewTruncated: count > PREVIEW_LIMIT,
    detected,
    cleaned,
    before: { codePoints: count, utf16: text.length, lines: text ? line : 0 },
    after: {
      codePoints: afterCount,
      utf16: cleaned.length,
      lines: cleaned ? line : 0,
    },
    removed,
    replaced,
  };
}

export const SAMPLE_TEXT =
  "\uFEFFSometimes the problem is what you can't see.\n\nOrder\u00A0#1042  ·  copy\u200Bpaste  ·  soft\u00ADhyphen\nPrice: 1\u202F250 EUR\n\nThese can be intentional:\nFamily: 👨‍👩‍👧‍👦   Heart: ❤️\nPersian: می\u200Cروم   Mixed direction: \u2067مرحبا\u2069\n\nSafe mode keeps language and typography intact.\u0000";
