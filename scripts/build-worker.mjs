import { build } from "esbuild";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
export async function buildWorker() {
  await build({
    absWorkingDir: resolve(dirname(fileURLToPath(import.meta.url)), ".."),
    entryPoints: ["src/workers/inspector.worker.ts"],
    outfile: "public/inspector-worker.js",
    bundle: true,
    platform: "browser",
    target: "es2020",
    format: "iife",
    minify: true,
  });
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  buildWorker().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
