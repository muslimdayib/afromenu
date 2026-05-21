"use client";

import type { MenuItem } from "@/lib/supabase";
import MenuItemCard3D from "./MenuItemCard";

interface MenuSectionProps {
  categoryId: number;
  categoryName: string;
  items: MenuItem[];
}

export default function MenuSection({
  categoryId,
  categoryName,
  items,
}: MenuSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      id={`category-${categoryId}`}
      className="scroll-mt-16 px-4 py-8"
    >
      {/* Category heading with gold accent */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-1 h-7 rounded-full bg-gradient-to-b from-gold-400 to-gold-600 flex-shrink-0"
          aria-hidden="true"
        />
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-cream tracking-wide">
          {categoryName}
        </h2>
        <div
          className="flex-1 h-px bg-gradient-to-r from-gold-500/30 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* 3D perspective grid */}
      <div className="perspective-stage">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <MenuItemCard3D key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
