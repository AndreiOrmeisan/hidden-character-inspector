import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const home = await readFile("out/index.html", "utf8");
const canonical = home.match(/rel="canonical" href="([^"]+)"/);
assert.ok(canonical, "Missing home canonical URL.");
const base = new URL(canonical[1]);
assert.equal(base.protocol, "https:", "Production URLs must use HTTPS.");
assert.ok(
  !base.hostname.includes("localhost"),
  "Production SEO cannot use localhost.",
);
const origin = base.origin;
const paths = [
  "",
  "zero-width-space-remover/",
  "non-breaking-space-remover/",
  "invisible-characters-excel/",
  "about/",
  "privacy/",
];
for (const path of paths) {
  const html = await readFile(`out/${path}index.html`, "utf8");
  assert.ok(
    html.includes(`rel="canonical" href="${origin}/${path}"`),
    `Incorrect canonical for ${path}`,
  );
  assert.ok(
    html.includes(`property="og:url" content="${origin}/${path}"`),
    `Incorrect Open Graph URL for ${path}`,
  );
  assert.ok(!html.includes("localhost"), `Localhost in exported page ${path}`);
}
const sitemap = await readFile("out/sitemap.xml", "utf8");
for (const path of paths)
  assert.ok(sitemap.includes(`<loc>${origin}/${path}</loc>`));
assert.ok(!sitemap.includes("localhost"));
assert.ok(
  (await readFile("out/robots.txt", "utf8")).includes(
    `Sitemap: ${origin}/sitemap.xml`,
  ),
);
assert.deepEqual(
  await readFile("out/inspector-worker.js"),
  await readFile("public/inspector-worker.js"),
);
console.log(
  "Verified six static pages, production SEO URLs, robots.txt, and worker bundle.",
);
