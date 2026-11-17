import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
const root = resolve("out");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".xml": "application/xml",
};
const server = createServer(async (request, response) => {
  // Used only by the local browser-test teardown, never deployed with the site.
  if (request.method === "POST" && request.url === "/__test_shutdown__") {
    response.writeHead(204).end();
    setTimeout(() => {
      server.closeAllConnections();
      server.close();
    }, 20);
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? "/", "http://localhost").pathname,
    );
    const file = resolve(
      root,
      `.${pathname}${pathname.endsWith("/") ? "index.html" : ""}`,
    );
    if (!file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const content = await readFile(file);
    response.writeHead(200, {
      "Content-Type": mime[extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(content);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(4174, "127.0.0.1", () =>
  console.log("Static export at http://127.0.0.1:4174"),
);
