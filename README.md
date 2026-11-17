# Hidden Character Inspector

Free, private Unicode inspection and careful cleanup. Next.js App Router, TypeScript, Tailwind CSS, static Cloudflare Pages hosting, and a local browser worker. All website content is English.

## Windows PowerShell

Use Node.js 22 or newer. The `.cmd` suffix avoids PowerShell's script execution policy restrictions.

```powershell
cd C:\Users\Raluca\Desktop\Web\hidden-character-inspector
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:3000. Restart development after changing worker code. Input is held only in page/worker memory. The app has no input storage, text uploads, analytics, ads, accounts, or backend.

## Production origin and Cloudflare Pages

The actual production domain is intentionally unconfigured. Set `SITE_URL` to the actual HTTPS origin in `.env.local`, the PowerShell environment, or the Cloudflare Pages build environment. Use an origin without a path. Production builds fail if it is missing, insecure, or localhost, preventing invalid sitemap/canonical URLs. It is a build-time setting. Rebuild when the domain changes.

```powershell
$env:SITE_URL = Read-Host 'Actual HTTPS site origin'
npm.cmd run build
```

Cloudflare Pages settings are **build command** `npm run build` and **output directory** `out`. Select the static framework preset, configure Node.js 22 or newer and `SITE_URL`, and upload the entire `out` directory. No deployment or hosting connection is included in this project setup.

Worker generation runs inside Next configuration, including direct `next build` invocations. Postbuild verifies all six canonical/Open Graph URLs, sitemap, robots directive, and the worker asset. Do not omit `inspector-worker.js` from an upload.

For QA only, the reserved origin `https://example.com` was used. This is not a selected deployment domain. The browser tests use that reserved test origin and serve `out` over local HTTP.

## Checks and production browser tests

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
$env:SITE_URL = 'https://example.com'
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:browser
```

Alternatively, use installed Edge by setting `$env:PLAYWRIGHT_CHANNEL = 'msedge'` before the browser tests. The test server uses port 4174 and serves the static export. Unit tests cover emoji sequences, multilingual shaping controls, surrogate pairs, supplementary selectors, non-breaking spaces, directional controls, line layout, code point positions, bounds, and the bundled worker protocol.

To inspect the static output manually, run `node scripts/serve-export.mjs`, then visit http://127.0.0.1:4174. Press Ctrl+C to stop.

## Cleaning policy

Safe mode removes only U+0000 NUL and a single U+FEFF at UTF-16 offset zero. It preserves everything else, including ZWSP, ZWJ/ZWNJ, variation selectors, directional controls, script markers, soft hyphens, and non-breaking spaces. Invisible formatting can be intentional.

Advanced mode starts with no categories selected. Non-breaking and typographic spaces are replaced by ordinary U+0020 spaces. Other selected catalog categories are removed. Ordinary spaces, tabs, CR/LF, common line-layout controls, NEL, and Unicode line/paragraph separators are never removed. No Unicode normalization, trimming, or whitespace collapsing occurs.

The catalog is curated, rather than an exhaustive implementation of all Unicode properties. It includes the listed separators, bidi controls, variation selectors, common script fillers, lowercase emoji tag letters and CANCEL TAG, common typographic spaces, and non-layout C0/C1 controls. It does not diagnose all confusables, invalid encodings, or malicious text. Unicode names are standard names or control aliases. Detection classifications are review guidance, not automatic judgments about intent.

## Limits and privacy

- Maximum 1,000,000 UTF-16 units. Full input is analyzed and cleaned in a worker.
- Highlight preview is limited to the first 2,500 code points. Details list the first 12 locations per character type. Totals and downloads cover the full input.
- Positions are 1-based Unicode code point positions, with 0-based UTF-16 offsets. Line/column counts are 1-based. CRLF is a single line break. Combining marks each count as a code point. Counts do not represent grapheme clusters.
- Workers have a 10-second startup and 20-second processing deadline. Changes cancel obsolete workers. Errors are displayed and the editor remains available. No main-thread processing fallback is used.
- Clipboard permission can be denied. The UI offers selectable cleaned text. Downloads contain UTF-8 output with no extra BOM added.
- Text persists only in the active tab. User actions can copy it to the clipboard or download it. Host access logs and browser/OS features have separate behavior. No remote fonts or third-party scripts load automatically.

## Source map

- `src/lib/unicode.ts` contains the catalog, Unicode-safe detection, positions, statistics, and cleaning.
- `src/workers/inspector.worker.ts` and `src/lib/worker-client.ts` handle isolated processing and failures.
- `src/components/inspector.tsx` implements the editor, highlighted preview, findings, modes, clipboard, and download.
- `src/app` contains six pages, metadata routes, styles, and the icon.
- `src/lib/site.ts` centralizes production URL validation and metadata.
- `scripts` contains worker bundling, export verification, and a local static test server.
- `tests` contains unit, worker, and production browser coverage.

Unicode references are linked within the relevant guides. The Excel guide links to Microsoft documentation. No company information or contact details are fabricated.
