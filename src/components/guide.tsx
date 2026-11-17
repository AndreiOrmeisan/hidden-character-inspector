import Link from "next/link";
export function Guide({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="wrap article-page">
      <div className="breadcrumbs">
        <Link href="/">Inspector</Link>
        <span aria-hidden="true">/</span>
        <span>Character guide</span>
      </div>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="article-intro">{intro}</p>
      <div className="article-content">{children}</div>
      <div className="article-cta">
        <div>
          <h2>See what your text contains.</h2>
          <p>Inspect the characters before deciding what to change.</p>
        </div>
        <Link className="button primary" href="/#inspector">
          Open the inspector →
        </Link>
      </div>
      <nav className="related-links" aria-label="Related character guides">
        <Link href="/zero-width-space-remover/">Zero-width spaces</Link>
        <Link href="/non-breaking-space-remover/">Non-breaking spaces</Link>
        <Link href="/invisible-characters-excel/">Excel cleanup</Link>
      </nav>
    </main>
  );
}
