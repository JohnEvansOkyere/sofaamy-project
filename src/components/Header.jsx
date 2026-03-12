export default function Header() {
  return (
    <header className="header-pattern text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-accent tracking-tight">
          SOFAAMY
        </h1>
        <p className="text-white/90 text-xs sm:text-sm uppercase tracking-widest mt-1">
          Glass · Aluminium · Alucobond · Security Doors
        </p>
        <a
          href="https://sofaamy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-white/70 hover:text-accent text-xs uppercase tracking-wider transition-colors"
        >
          sofaamy.com
        </a>
      </div>
      <div className="h-1 bg-accent" aria-hidden />
    </header>
  );
}
