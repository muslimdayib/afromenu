export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-charcoal-950 px-4 text-center">
      {/* Brand mark */}
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto rounded-full border-2 border-gold-500 bg-charcoal-900 flex items-center justify-center mb-6">
          <span className="text-3xl font-heading font-bold text-gold-500 select-none">
            A
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-heading font-bold text-cream tracking-wide mb-3">
          Afromenu
        </h1>

        <div
          className="w-16 h-0.5 bg-gold-500 rounded-full mx-auto mb-4"
          aria-hidden="true"
        />

        <p className="text-cream-muted text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          Premium digital menus, delivered through a single QR&nbsp;code.
        </p>
      </div>

      {/* Scan prompt */}
      <div className="bg-surface border border-border rounded-2xl px-8 py-6 max-w-sm w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-10 h-10 text-gold-500 mx-auto mb-4"
          aria-hidden="true"
        >
          {/* QR code scanner icon */}
          <rect x="2" y="2" width="6" height="6" rx="1" />
          <rect x="16" y="2" width="6" height="6" rx="1" />
          <rect x="2" y="16" width="6" height="6" rx="1" />
          <path d="M16 16h2v2h-2z" />
          <path d="M20 16h2v2h-2z" />
          <path d="M16 20h2v2h-2z" />
          <path d="M20 20h2v2h-2z" />
        </svg>

        <p className="text-cream text-sm font-body leading-relaxed">
          Scan a restaurant&apos;s QR code to view their&nbsp;menu instantly.
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6">
        <p className="text-xs text-cream-muted">
          &copy; {new Date().getFullYear()}{" "}
          <span className="text-gold-500 font-semibold">Afromenu</span>.
          All rights reserved.
        </p>
      </footer>
    </div>
  );
}
