export default async function teardown() {
  // Close the test server explicitly so Windows cleanup does not need taskkill.
  await fetch("http://127.0.0.1:4174/__test_shutdown__", {
    method: "POST",
    signal: AbortSignal.timeout(3000),
  }).catch(() => {});
}
