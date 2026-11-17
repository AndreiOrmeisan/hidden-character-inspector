import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteUrl } from "../src/lib/site";
test("production requires an explicit HTTPS origin", () => {
  for (const value of [
    undefined,
    "http://localhost:3000",
    "https://localhost",
    "http://example.com",
    "https://example.com/path",
  ])
    assert.throws(() => resolveSiteUrl(value, true));
  assert.equal(
    resolveSiteUrl("https://inspector.example/", true),
    "https://inspector.example",
  );
  assert.equal(resolveSiteUrl(undefined, false), "http://localhost:3000");
});
