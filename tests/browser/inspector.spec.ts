import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolveSiteUrl } from "../../src/lib/site";

test("safe inspection preserves emoji and language while copying and downloading cleaned text", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const text = "\ufeffPRIVATE_TEST 👩‍💻 می\u200cروم\u00a0\0";
  const expected = "PRIVATE_TEST 👩‍💻 می\u200cروم\u00a0";
  const requests: string[] = [];
  page.on("request", (request) =>
    requests.push(request.url() + (request.postData() ?? "")),
  );
  await page.getByLabel("Your text", { exact: true }).fill(text);
  await expect(
    page.getByRole("button", { name: "Copy cleaned text" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Cleaned text", exact: true }).click();
  await expect(page.getByLabel("Cleaned text", { exact: true })).toHaveValue(
    expected,
  );
  await page.getByRole("button", { name: "Copy cleaned text" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    expected,
  );
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download .txt", exact: false })
    .click();
  const download = await downloading;
  expect(await readFile((await download.path())!, "utf8")).toBe(expected);
  expect(requests.some((request) => request.includes("PRIVATE_TEST"))).toBe(
    false,
  );
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
  expect(errors).toEqual([]);
});

test("advanced cleanup starts unchecked and only changes selected categories", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Your text", { exact: true })
    .fill("hello\u200bworld\u00a010\u202fkg 👩‍💻");
  await page.getByRole("button", { name: "Advanced", exact: true }).click();
  await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Zero-width separators" }).check();
  await page.getByRole("checkbox", { name: "Non-breaking spaces" }).check();
  await expect(
    page.getByRole("button", { name: "Copy cleaned text" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Cleaned text", exact: true }).click();
  await expect(page.getByLabel("Cleaned text", { exact: true })).toHaveValue(
    "helloworld 10 kg 👩‍💻",
  );
});

test("sample findings show locations and clear resets the editor", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try a sample" }).click();
  await expect(
    page.getByRole("button", { name: "Copy cleaned text" }),
  ).toBeEnabled();
  const finding = page
    .locator(".findings-list details")
    .filter({ hasText: "ZERO WIDTH SPACE" });
  await finding.locator("summary").click();
  await expect(
    finding.getByText("UTF-16 offset", { exact: false }).last(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByLabel("Your text", { exact: true })).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Copy cleaned text" }),
  ).toBeDisabled();
});

test("missing or indefinitely loading workers release the UI with an error", async ({
  page,
}) => {
  await page.route("**/inspector-worker.js", () => {});
  await page.goto("/");
  await page.getByLabel("Your text", { exact: true }).fill("test");
  await expect(
    page.getByRole("alert").filter({ hasText: "worker did not start" }),
  ).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByLabel("Your text", { exact: true })).toHaveValue("");
});

test("large input stays responsive and stale results cannot replace new input", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Your text", { exact: true })
    .fill("word\u200b ".repeat(100000));
  await page.getByLabel("Your text", { exact: true }).fill("Latest 👩‍💻");
  await expect(
    page.getByRole("button", { name: "Copy cleaned text" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Cleaned text", exact: true }).click();
  await expect(page.getByLabel("Cleaned text", { exact: true })).toHaveValue(
    "Latest 👩‍💻",
  );
});

test("mobile layout fits the viewport and text markup stays inert", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page
    .getByLabel("Your text", { exact: true })
    .fill('<img src=x onerror="window.bad=true">\u200b');
  await expect(
    page.getByRole("button", { name: "Copy cleaned text" }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(await page.evaluate(() => "bad" in window)).toBe(false);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});

test("six static pages have unique titles, production URLs, and working internal links", async ({
  page,
  request,
}) => {
  const titles = new Set<string>();
  for (const path of [
    "/",
    "/zero-width-space-remover/",
    "/non-breaking-space-remover/",
    "/invisible-characters-excel/",
    "/about/",
    "/privacy/",
  ]) {
    await page.goto(path);
    titles.add(await page.title());
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${resolveSiteUrl(process.env.SITE_URL, true)}${path}`,
    );
    for (const href of await page
      .locator('a[href^="/"]')
      .evaluateAll((links) => [
        ...new Set(
          links.map((link) => link.getAttribute("href")!.split("#")[0] || "/"),
        ),
      ]))
      expect((await request.get(href)).ok()).toBe(true);
  }
  expect(titles.size).toBe(6);
  const worker = await request.get("/inspector-worker.js");
  expect(worker.headers()["content-type"]).toContain("javascript");
  await page.goto("/");
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
});

test("an unresponsive processing operation reaches its deadline", async ({
  page,
}) => {
  await page.route("**/inspector-worker.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: "self.onmessage = () => {}; self.postMessage({ type: 'ready', version: 1 });",
    }),
  );
  await page.goto("/");
  await page.getByLabel("Your text", { exact: true }).fill("timeout sample");
  await expect(
    page.getByRole("alert").filter({ hasText: "exceeded 20 seconds" }),
  ).toBeVisible({ timeout: 26000 });
  await expect(
    page.getByRole("button", { name: "Copy cleaned text" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByLabel("Your text", { exact: true })).toHaveValue("");
});
