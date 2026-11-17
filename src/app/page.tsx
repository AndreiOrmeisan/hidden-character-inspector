import Link from "next/link";
import { Inspector } from "@/components/inspector";

const guides = [
  {
    href: "/zero-width-space-remover/",
    code: "U+200B",
    title: "The space you can’t see",
    text: "Understand zero-width spaces, broken exact matches, and when a hidden break is intentional.",
  },
  {
    href: "/non-breaking-space-remover/",
    code: "U+00A0",
    title: "Looks like a space. Acts differently.",
    text: "Learn why a copied space can resist trimming, prevent wrapping, and disrupt comparisons.",
  },
  {
    href: "/invisible-characters-excel/",
    code: "EXCEL",
    title: "When spreadsheet text won’t match",
    text: "Find the hidden characters behind stubborn lookups and choose a targeted Excel cleanup.",
  },
];
export default function Home() {
  return (
    <main>
      <section className="wrap hero">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> THE SMALL DETAILS, REVEALED
          </div>
          <h1>
            Make the invisible <span>visible.</span>
          </h1>
          <p>
            Find hidden Unicode characters. Understand what they do.
            <br className="desktop-break" /> Clean your text without losing what
            makes it yours.
          </p>
        </div>
        <div className="hero-aside">
          <span>Zero uploads.</span>
          <span>Zero guesswork.</span>
          <small>Inspect first. Clean with care.</small>
        </div>
      </section>
      <div className="wrap">
        <Inspector />
      </div>
      <section id="how-it-works" className="wrap how-section">
        <div className="section-intro">
          <div>
            <span className="eyebrow">A CLEARER LOOK AT YOUR TEXT</span>
            <h2>
              Three steps. <br />
              Nothing left to guess.
            </h2>
          </div>
          <p>
            Copied text can carry more than words. A hidden break, a special
            space, or a direction mark can explain why two identical-looking
            strings behave differently.
          </p>
        </div>
        <div className="how-grid">
          <article>
            <span className="feature-icon" aria-hidden="true">
              ↳
            </span>
            <h3>Paste the puzzling text</h3>
            <p>
              Bring a sentence, a spreadsheet cell, or a copied paragraph.
              Inspection runs automatically in a local browser worker.
            </p>
          </article>
          <article>
            <span className="feature-icon" aria-hidden="true">
              [·]
            </span>
            <h3>See each hidden character</h3>
            <p>
              Read its name, code point, occurrence count, and locations. Amber
              markers invite review. Teal markers remind you that context
              matters.
            </p>
          </article>
          <article>
            <span className="feature-icon" aria-hidden="true">
              ✓
            </span>
            <h3>Keep control of the cleanup</h3>
            <p>
              Start with conservative Safe mode, or select specific categories
              in Advanced mode. Compare the counts, then copy or download the
              result.
            </p>
          </article>
        </div>
      </section>
      <section className="wrap context-section">
        <div
          className="context-visual"
          aria-label="Emoji joiners are kept in safe mode"
        >
          <span className="emoji-line">
            👩‍💻 <span>→</span> 👩‍💻
          </span>
          <span className="kept-label">ZWJ preserved in Safe mode</span>
          <div className="context-code">
            <span>U+1F469</span>
            <b>ZWJ</b>
            <span>U+1F4BB</span>
          </div>
        </div>
        <div>
          <span className="eyebrow">INVISIBLE DOESN’T MEAN UNNECESSARY</span>
          <h2>
            Some hidden characters
            <br />
            are doing important work.
          </h2>
          <p>
            A zero-width joiner can hold an emoji together. A non-joiner can
            preserve correct letter shaping. A direction mark can make a mixed
            Arabic and English sentence readable.
          </p>
          <p>
            That’s why Safe mode removes only a leading byte order mark and NUL
            characters. Other detected characters stay intact until you
            explicitly choose a category in Advanced mode. Review the result
            whenever typography or language matters.
          </p>
          <a
            href="https://www.unicode.org/reports/tr51/"
            className="source-link"
          >
            Read about Unicode emoji sequences ↗
          </a>
        </div>
      </section>
      <section id="guides" className="wrap guides-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">GET TO KNOW THE USUAL SUSPECTS</span>
            <h2>A field guide to hidden text.</h2>
          </div>
          <span>Small characters. Real consequences.</span>
        </div>
        <div className="guide-grid">
          {guides.map((guide) => (
            <Link className="guide-card" key={guide.href} href={guide.href}>
              <code>{guide.code}</code>
              <h3>{guide.title}</h3>
              <p>{guide.text}</p>
              <span>
                Read the guide <b aria-hidden="true">↗</b>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="wrap faq-section">
        <div>
          <span className="eyebrow">A FEW GOOD QUESTIONS</span>
          <h2>
            Before you <br />
            clean that text.
          </h2>
          <p>The right change depends on the context.</p>
        </div>
        <div className="faq-list">
          {[
            [
              "What counts as a hidden character?",
              "This tool checks a curated catalog of zero-width characters, special spaces, joining controls, directional formatting controls, variation selectors, emoji tag letters, script fillers, and non-layout controls. Ordinary spaces, tabs, and line separators are preserved. It does not detect every Unicode property or decide whether text is malicious.",
            ],
            [
              "Why does Safe mode leave zero-width spaces alone?",
              "A zero-width space can be an unwanted copy-and-paste artifact, but it can also mark valid word-break opportunities. Safe mode preserves it. To remove it deliberately, switch to Advanced and select Zero-width separators. That category also removes word joiners and BOM characters, so review all findings first.",
            ],
            [
              "Will emoji and multilingual text survive?",
              "Safe mode preserves ZWJ, ZWNJ, variation selectors, directional controls, combining marks, and script-specific formatting. Advanced removal can change shaping, spelling, reading order, or emoji appearance. The marker preview interrupts these sequences to reveal their components. The cleaned output retains them unless their category is selected.",
            ],
            [
              "Does my text leave this page?",
              "Text is passed only to a local browser worker. The application does not upload, log, or store your input. Reloading clears the editor. Copy and download transfer the result to your clipboard or a local file at your request. Hosting access logs, browser extensions, and your operating system have their own behavior.",
            ],
            [
              "How much text can I inspect?",
              "Up to 1,000,000 UTF-16 units per inspection. Detection and cleaning cover the full input. The highlighted preview shows at most 2,500 code points, and location details show the first 12 occurrences per character type. Counts and downloads include the entire input. A worker keeps the inspection off the main thread.",
            ],
            [
              "Why are code point counts different from what I see?",
              "One displayed symbol can contain several code points. A family emoji may contain people and joiners, and an accented letter may contain a letter and a combining mark. Supplementary code points use two UTF-16 units. Locations report both code point positions and UTF-16 offsets to make that distinction explicit.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
