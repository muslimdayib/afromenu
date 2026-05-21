export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-16 h-16 text-charcoal-700 mb-6"
        aria-hidden="true"
      >
        <path d="M3 2v7c0 1.1.9 2 2 2h1v9a1 1 0 0 0 2 0V11h1c1.1 0 2-.9 2-2V2" />
        <path d="M7 2v4" />
        <path d="M17 2c-1.7 0-3 1.3-3 3v5h2v10a1 1 0 0 0 2 0V10h2V5c0-1.7-1.3-3-3-3z" />
      </svg>

      <h2 className="text-xl font-heading font-semibold text-cream mb-2">
        Menu Coming Soon
      </h2>
      <p className="text-cream-muted text-sm max-w-xs">
        This restaurant is still preparing their menu. Check back shortly.
      </p>

      <div
        className="w-12 h-0.5 bg-gold-500 rounded-full mt-6"
        aria-hidden="true"
      />
    </div>
  );
}
