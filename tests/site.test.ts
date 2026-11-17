import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteUrl, PRODUCTION_SITE_URL } from "../src/lib/site";
test("production defaults to its Cloudflare HTTPS origin and validates overrides", () => {
  assert.equal(resolveSiteUrl(undefined, true), PRODUCTION_SITE_URL);
  assert.equal(resolveSiteUrl("", true), PRODUCTION_SITE_URL);
  for (const value of [
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
