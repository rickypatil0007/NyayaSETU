import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto py-24 px-6">
      <h1 className="text-3xl font-semibold mb-3">NyayaSetu</h1>
      <p className="text-slate-600 mb-8">
        Upload a contract. A Reviewer, Skeptic, and Supervisor agent debate every compliance
        concern before it reaches you — with citations, not guesses.
      </p>
      <Link href="/audit/new" className="inline-block rounded-lg bg-slate-900 text-white px-5 py-2.5">
        Start an audit
      </Link>
    </main>
  );
}
