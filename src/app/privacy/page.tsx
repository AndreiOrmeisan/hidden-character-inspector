import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Privacy",
  "Understand local text processing, temporary browser memory, clipboard and download behavior, and hosting requests in Hidden Character Inspector.",
  "/privacy/",
);
export default function Privacy() {
  return (
    <main className="wrap prose-page">
      <span className="eyebrow">YOUR WORDS STAY WITH YOU</span>
      <h1>Privacy, in plain text.</h1>
      <p className="article-intro">
        The application processes text locally in your browser. User-entered
        text is never uploaded, logged, or saved by the application.
      </p>
      <h2>What happens to your input</h2>
      <p>
        Your text lives in the current page’s memory and is sent to a local Web
        Worker for inspection. This message stays within your browser. It is not
        a request to a remote processing service. Clear removes the text from
        the active editor. Reloading or closing the page clears the
        application’s workspace.
      </p>
      <p>
        The application does not use localStorage, sessionStorage, IndexedDB, or
        cookies to save your input. Your browser, operating system, extensions,
        spell-check tools, or clipboard manager may have independent behavior
        under their own settings.
      </p>
      <h2>Clipboard and downloads</h2>
      <p>
        Copy cleaned text writes the reviewed result to your clipboard at your
        request. Download creates a UTF-8 text file on your device. Those copies
        remain wherever your browser or operating system saves them. Clipboard
        permission can be denied, in which case you can select and copy the
        output manually.
      </p>
      <h2>Website requests</h2>
      <p>
        Your browser requests the site’s HTML, JavaScript, CSS, icon, and local
        worker script from the static hosting provider. The application includes
        no analytics, advertising scripts, remote fonts, or external processing
        APIs. Hosting providers may keep ordinary access logs, such as IP
        addresses, request paths, and timestamps.
      </p>
      <p>
        Some explanatory pages link to Unicode and Microsoft documentation.
        Following one of those links sends a normal browser request to that
        external site, which has its own privacy practices.
      </p>
      <h2>Scope of this notice</h2>
      <p>
        This describes the features included in this version. It does not
        promise protection from software installed on your device or from
        content you choose to copy into another service.
      </p>
    </main>
  );
}
