import type { NextConfig } from "next";
import { buildWorker } from "./scripts/build-worker.mjs";

export default async function configureNext(): Promise<NextConfig> {
  await buildWorker();
  return {
    output: "export",
    trailingSlash: true,
    turbopack: {
      rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
    },
  };
}
