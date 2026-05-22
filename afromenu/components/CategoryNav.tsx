"use client";

import React, { useRef, useEffect } from "react";

interface CategoryNavProps {
  categories: { id: string; name: string }[];
  activeCategoryId?: string | null;
  onCategorySelect?: (id: string) => void;
}

export default function CategoryNav({
  categories,
  activeCategoryId,
  onCategorySelect,
}: CategoryNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll active element into view
  useEffect(() => {
    if (activeCategoryId && containerRef.current) {
      const activeEl = containerRef.current.querySelector(
        `[data-id="${activeCategoryId}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeCategoryId]);

  const handleScroll = (id: string) => {
    if (onCategorySelect) {
      onCategorySelect(id);
    } else {
      // Traditional anchor jumping if no callback provided
      const element = document.getElementById(`category-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div
        ref={containerRef}
        className="max-w-5xl mx-auto flex items-center gap-2.5 overflow-x-auto py-3.5 px-4 scrollbar-none snap-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              data-id={cat.id}
              onClick={() => handleScroll(cat.id)}
              className={`snap-center flex-shrink-0 px-5 py-2 rounded-full font-heading font-semibold text-xs tracking-wide uppercase transition-all duration-300 ${
                isActive
                  ? "bg-[#f7906c] text-white shadow-md shadow-[#f7906c]/20 scale-105"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
