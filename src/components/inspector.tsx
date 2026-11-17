"use client";

import { useEffect, useRef, useState } from "react";
import {
  categories,
  MAX_INPUT_LENGTH,
  PREVIEW_LIMIT,
  SAMPLE_TEXT,
  type Category,
  type CleaningMode,
  type Inspection,
} from "@/lib/unicode";
import { startInspection } from "@/lib/worker-client";

export function Inspector() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<CleaningMode>("safe");
  const [selected, setSelected] = useState<Category[]>([]);
  const [result, setResult] = useState<Inspection | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [tab, setTab] = useState<"highlighted" | "cleaned">("highlighted");
  const [focused, setFocused] = useState<string | null>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const output = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!text) return;
    let active = true;
    let task: ReturnType<typeof startInspection> | undefined;
    const debounce = setTimeout(() => {
      setBusy(true);
      task = startInspection(text, mode, selected);
      task.promise
        .then((inspection) => {
          if (active) {
            setResult(inspection);
            setBusy(false);
          }
        })
        .catch((failure) => {
          if (active) {
            setError(
              failure instanceof Error ? failure.message : "Inspection failed.",
            );
            setBusy(false);
          }
        });
    }, 180);
    return () => {
      active = false;
      clearTimeout(debounce);
      task?.cancel();
    };
  }, [text, mode, selected]);

  function invalidate() {
    setResult(null);
    setError("");
    setStatus("");
    setBusy(false);
    setFocused(null);
  }
  function updateText(value: string) {
    if (value.length > MAX_INPUT_LENGTH) {
      setError(
        "Text is too large. Paste up to 1,000,000 UTF-16 units. Your previous input has been kept.",
      );
      return;
    }
    invalidate();
    setText(value);
  }
  function changeMode(value: CleaningMode) {
    invalidate();
    setMode(value);
  }
  async function copyCleaned() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.cleaned);
      setStatus("Cleaned text copied to your clipboard.");
    } catch {
      setTab("cleaned");
      setStatus(
        "Clipboard access is unavailable. Select the cleaned text and use your keyboard to copy it.",
      );
      setTimeout(() => {
        output.current?.focus();
        output.current?.select();
      }, 0);
    }
  }
  function download() {
    if (!result) return;
    const url = URL.createObjectURL(
      new Blob([result.cleaned], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cleaned-text.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Your cleaned text download is ready.");
  }
  const ready = !!result && !busy;
  return (
    <section
      className="inspector"
      id="inspector"
      aria-label="Hidden character inspection tool"
    >
      <div className="tool-topline">
        <div>
          <span className="live-dot" /> LOCAL TEXT INSPECTION
        </div>
        <span>
          Text stays in this tab <span aria-hidden="true">↗</span>
        </span>
      </div>
      <div className="editor-grid">
        <section className="input-pane">
          <div className="pane-heading">
            <label htmlFor="text-input">Your text</label>
            <div className="small-actions">
              <button
                onClick={() => {
                  updateText(SAMPLE_TEXT);
                  editor.current?.focus();
                }}
              >
                Try a sample
              </button>
              <button
                disabled={!text}
                onClick={() => {
                  updateText("");
                  editor.current?.focus();
                }}
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            id="text-input"
            ref={editor}
            value={text}
            onChange={(event) => updateText(event.target.value)}
            placeholder={
              "Paste your text here.\nWe’ll make the invisible visible."
            }
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            aria-describedby="input-help"
          />
          <div className="editor-foot" id="input-help">
            <span>{text.length.toLocaleString()} / 1,000,000 UTF-16 units</span>
            <span>Inspected automatically</span>
          </div>
        </section>
        <section className="preview-pane" aria-label="Text preview">
          <div className="pane-heading">
            <div className="view-tabs" aria-label="Preview type">
              <button
                aria-pressed={tab === "highlighted"}
                className={tab === "highlighted" ? "selected" : ""}
                onClick={() => setTab("highlighted")}
              >
                Highlighted
              </button>
              <button
                aria-pressed={tab === "cleaned"}
                className={tab === "cleaned" ? "selected" : ""}
                onClick={() => setTab("cleaned")}
              >
                Cleaned text
              </button>
            </div>
            {result && (
              <span className="count-badge">
                {result.detected.toLocaleString()} detected
              </span>
            )}
          </div>
          {result ? (
            tab === "highlighted" ? (
              <div
                className="highlight-preview"
                dir="auto"
                tabIndex={0}
                aria-label="Highlighted original text"
              >
                {result.preview.map((segment, index) =>
                  segment.code ? (
                    <mark
                      className={`${segment.context} ${focused === segment.code ? "focused-marker" : ""}`}
                      key={index}
                      title={`${segment.code} · ${segment.label}`}
                      aria-label={`${segment.label}, ${segment.code}`}
                    >
                      {segment.label}
                      <small>{segment.code.replace("U+", "")}</small>
                    </mark>
                  ) : (
                    <span key={index}>{segment.text}</span>
                  ),
                )}
              </div>
            ) : (
              <textarea
                ref={output}
                className="cleaned-output"
                aria-label="Cleaned text"
                value={result.cleaned}
                readOnly
                spellCheck={false}
              />
            )
          ) : (
            <div className="preview-empty">
              <div className="empty-glyph" aria-hidden="true">
                a<span>ZWSP</span>b
              </div>
              <h3>
                {busy
                  ? "Looking between the letters…"
                  : "See what’s hiding in your text."}
              </h3>
              <p>
                {busy
                  ? "Inspection is running locally in a worker."
                  : "Paste something on the left. Invisible characters will appear as labeled markers here."}
              </p>
            </div>
          )}
          <div className="editor-foot">
            <span>
              <i className="legend-review" /> Review{" "}
              <i className="legend-contextual" /> Context matters
            </span>
            <span>
              {result?.previewTruncated && tab === "highlighted"
                ? `First ${PREVIEW_LIMIT.toLocaleString()} code points`
                : "Line breaks preserved"}
            </span>
          </div>
        </section>
      </div>
      <div className="cleaning-settings">
        <div className="settings-heading">
          <div>
            <h3>A careful cleanup.</h3>
            <p>Choose what changes. Keep what matters.</p>
          </div>
          <div className="mode-switch" aria-label="Cleaning mode">
            <button
              aria-pressed={mode === "safe"}
              className={mode === "safe" ? "selected" : ""}
              onClick={() => changeMode("safe")}
            >
              Safe mode <span aria-hidden="true">✓</span>
            </button>
            <button
              aria-pressed={mode === "advanced"}
              className={mode === "advanced" ? "selected" : ""}
              onClick={() => changeMode("advanced")}
            >
              Advanced
            </button>
          </div>
        </div>
        {mode === "safe" ? (
          <p className="mode-explanation">
            <span aria-hidden="true">◈</span> Removes only a leading BOM and NUL
            characters. Preserves zero-width spaces, emoji, joining controls,
            directional controls, variation selectors, typography, tabs, and
            line breaks.
          </p>
        ) : (
          <fieldset className="category-grid">
            <legend>
              Select the categories to change. All start unchecked. Review the
              cleaned text before using it.
            </legend>
            {categories.map((category) => (
              <label key={category.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(category.id)}
                  onChange={(event) => {
                    invalidate();
                    setSelected((current) =>
                      event.target.checked
                        ? [...current, category.id]
                        : current.filter((value) => value !== category.id),
                    );
                  }}
                />
                <span>
                  <strong>{category.name}</strong>
                  <small>{category.action}</small>
                </span>
              </label>
            ))}
          </fieldset>
        )}
      </div>
      <div className="result-bar">
        <div className="stats">
          <div>
            <span>Before</span>
            <strong>
              {result ? result.before.codePoints.toLocaleString() : "—"}
              <small>code points</small>
            </strong>
          </div>
          <span className="stat-arrow" aria-hidden="true">
            →
          </span>
          <div>
            <span>After</span>
            <strong>
              {result ? result.after.codePoints.toLocaleString() : "—"}
              <small>code points</small>
            </strong>
          </div>
          <div className="change-stat">
            <span>Changes</span>
            <strong>
              {result
                ? `${result.removed.toLocaleString()} removed · ${result.replaced.toLocaleString()} replaced`
                : "Waiting for text"}
            </strong>
          </div>
        </div>
        <div className="output-actions">
          <button
            className="button secondary"
            disabled={!ready}
            onClick={download}
          >
            ↓ Download .txt
          </button>
          <button
            className="button primary"
            disabled={!ready}
            onClick={() => void copyCleaned()}
          >
            Copy cleaned text <span aria-hidden="true">⧉</span>
          </button>
        </div>
      </div>
      <div className="tool-feedback" aria-live="polite">
        {busy && <p>Inspecting text locally…</p>}
        {status && <p>{status}</p>}
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <section className="findings-section" aria-label="Inspection findings">
        <div className="findings-heading">
          <h3>
            What we found <span>{result?.findings.length ?? 0} types</span>
          </h3>
          <p>Detected does not automatically mean unwanted.</p>
        </div>
        {result?.findings.length ? (
          <div className="findings-list">
            {result.findings.map((finding) => (
              <details key={finding.code}>
                <summary onClick={() => setFocused(finding.code)}>
                  <span className={`finding-symbol ${finding.context}`}>
                    {finding.label}
                  </span>
                  <span className="finding-name">
                    <strong>{finding.name}</strong>
                    <code>{finding.code}</code>
                  </span>
                  <span className={`context-badge ${finding.context}`}>
                    {finding.context === "review"
                      ? "Review"
                      : "Context matters"}
                  </span>
                  <span className="finding-count">
                    × {finding.count.toLocaleString()}
                  </span>
                  <span className="expand-icon" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="finding-detail">
                  <p>{finding.explanation}</p>
                  <h4>Locations {finding.count > 12 ? "(first 12)" : ""}</h4>
                  <p className="location-guide">
                    Code point position starts at 1. UTF-16 offset starts at 0.
                    Line and column start at 1 and count code points, including
                    combining marks. CRLF is one line break.
                  </p>
                  <ul>
                    {finding.positions.map((position) => (
                      <li key={position.utf16}>
                        Position {position.codePoint.toLocaleString()} · line{" "}
                        {position.line}, column {position.column} · UTF-16
                        offset {position.utf16.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="findings-empty">
            {result
              ? "No characters from the inspection catalog were found. This is a focused Unicode check, not a security or encoding audit."
              : "Your findings will appear here, with names, explanations, and exact locations."}
          </div>
        )}
      </section>
    </section>
  );
}
