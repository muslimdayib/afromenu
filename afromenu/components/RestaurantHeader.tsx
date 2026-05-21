interface RestaurantHeaderProps {
  name: string;
  logoUrl: string | null;
}

export default function RestaurantHeader({
  name,
  logoUrl,
}: RestaurantHeaderProps) {
  /* First letter of the restaurant name, used as fallback avatar */
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="flex flex-col items-center gap-4 pt-10 pb-6 px-4">
      {/* Logo / Fallback Avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold-500 bg-charcoal-800 flex items-center justify-center flex-shrink-0">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <span className="text-3xl font-heading font-bold text-gold-500 select-none">
            {initial}
          </span>
        )}
      </div>

      {/* Restaurant name */}
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-cream text-center tracking-wide">
        {name}
      </h1>

      {/* Gold accent divider */}
      <div
        className="w-16 h-0.5 bg-gold-500 rounded-full"
        aria-hidden="true"
      />
    </header>
  );
}
