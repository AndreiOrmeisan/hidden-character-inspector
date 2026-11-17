import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
test("bundled worker announces readiness, responds, and reports invalid input", () => {
  const messages: {
    type: string;
    result?: { cleaned: string };
    error?: string;
  }[] = [];
  const self: {
    postMessage: (value: (typeof messages)[number]) => void;
    addEventListener: () => void;
    onmessage?: (event: { data: unknown }) => void;
  } = {
    postMessage: (value) => messages.push(value),
    addEventListener: () => {},
  };
  runInNewContext(readFileSync("public/inspector-worker.js", "utf8"), { self });
  assert.equal(messages[0].type, "ready");
  self.onmessage?.({
    data: { id: 1, text: "\ufeff👩‍💻\0", mode: "safe", selected: [] },
  });
  assert.equal(messages[1].result?.cleaned, "👩‍💻");
  self.onmessage?.({
    data: { id: 1, text: "text", mode: "invalid", selected: [] },
  });
  assert.equal(messages[2].type, "fatal");
  assert.ok(messages[2].error);
});
