export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-charcoal-950">
      <p className="text-6xl font-heading font-bold text-gold-500 mb-4">
        404
      </p>
      <h1 className="text-2xl font-heading font-semibold text-cream mb-3">
        Restaurant Not Found
      </h1>
      <p className="text-cream-muted text-sm max-w-sm mb-8">
        We couldn&apos;t find a menu for this link. Double-check the QR code
        or contact the restaurant directly.
      </p>

      <div
        className="w-12 h-0.5 bg-gold-500 rounded-full"
        aria-hidden="true"
      />
    </div>
  );
}
