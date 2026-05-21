export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950">
      {/* ---- Header skeleton ---- */}
      <header className="flex flex-col items-center gap-4 pt-10 pb-6 px-4">
        <div className="w-20 h-20 rounded-full skeleton" />
        <div className="h-7 w-48 skeleton" />
        <div className="w-16 h-0.5 skeleton" />
      </header>

      {/* ---- Category nav skeleton ---- */}
      <nav className="sticky top-0 z-30 bg-charcoal-950/90 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 rounded-full skeleton" />
          ))}
        </div>
      </nav>

      {/* ---- Menu sections skeleton ---- */}
      <main className="flex-1 max-w-5xl w-full mx-auto pb-12">
        {[1, 2].map((section) => (
          <section key={section} className="px-4 py-6">
            {/* Category heading */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full skeleton" />
              <div className="h-6 w-32 skeleton" />
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="rounded-xl overflow-hidden bg-surface border border-border"
                >
                  {/* Image placeholder */}
                  <div className="aspect-[4/3] skeleton" />
                  {/* Text placeholders */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between">
                      <div className="h-5 w-28 skeleton" />
                      <div className="h-5 w-14 skeleton" />
                    </div>
                    <div className="h-4 w-full skeleton" />
                    <div className="h-4 w-3/4 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
