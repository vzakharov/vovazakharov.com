import Link from 'next/link';

/** Closes every content page — they are reached from the site, not only from search. */
export function BackToHome() {
  return (
    <footer className="text-center opacity-60 text-sm pt-8 border-t border-foreground/20 print:hidden">
      <Link href="/" className="underline">
        ← Back to the home page
      </Link>
    </footer>
  );
}
