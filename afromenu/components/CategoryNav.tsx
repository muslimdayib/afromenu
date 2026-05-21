"use client";

interface CategoryNavProps {
  categories: { id: number; name: string }[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  if (categories.length === 0) return null;

  const scrollTo = (id: number) => {
    const el = document.getElementById(`category-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      aria-label="Menu categories"
      className="sticky top-0 z-30 bg-charcoal-950/90 backdrop-blur-sm border-b border-border px-4 py-3"
    >
      <div className="scroll-strip">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => scrollTo(cat.id)}
            className="px-4 py-2 rounded-full text-sm font-body font-medium whitespace-nowrap
              bg-charcoal-800 text-cream-muted border border-border
              hover:bg-gold-500 hover:text-charcoal-950 hover:border-gold-500
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500
              transition-colors duration-200"
          >
            {cat.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
