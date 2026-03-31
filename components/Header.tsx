import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-border py-6 px-6 md:px-12">
      <div className="max-w-3xl mx-auto flex items-baseline gap-3">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-widest text-foreground hover:text-accent transition-colors">
          JARVIS
        </Link>
        <span className="text-muted text-sm tracking-wider">/ 思考の記録</span>
      </div>
    </header>
  );
}
