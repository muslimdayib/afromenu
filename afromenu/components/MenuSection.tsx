"use client";

import React from "react";
import { Utensils } from "lucide-react";
import type { Item } from "@/lib/supabase";

interface MenuSectionProps {
  categoryId: string;
  categoryName: string;
  items: any[];
  currency: string;
}

export default function MenuSection({
  categoryId,
  categoryName,
  items,
  currency,
}: MenuSectionProps) {
  const visibleItems = items.filter(
    (item) => item.is_available !== false && item.is_hidden !== true
  );

  return (
    <section
      id={`category-${categoryId}`}
      className="max-w-5xl mx-auto px-4 py-8 border-b border-gray-100 last:border-b-0 scroll-mt-16"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-[#f7906c] rounded-full"></div>
        <h2 className="font-heading font-extrabold text-xl text-[#2d2d2d] uppercase tracking-wider">
          {categoryName}
        </h2>
        <span className="text-[10px] bg-gray-100 text-gray-400 font-bold px-2 py-0.5 rounded-full">
          {visibleItems.length} dishes
        </span>
      </div>

      {visibleItems.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-100 rounded-3xl bg-white italic">
          No active dishes in this category currently.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleItems.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-white border border-[#eeeeee] rounded-[16px] p-4 flex gap-4 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[12px] bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Utensils className="w-6 h-6 text-gray-200" />
                  )}
                </div>

                {/* Body Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm text-[#2d2d2d] truncate">
                        {item.name}
                      </h4>
                      {item.tags?.map((t: string) => {
                        const isSpicy = t.toLowerCase() === "spicy";
                        const isVegan = t.toLowerCase() === "vegan";
                        const isPopular = t.toLowerCase() === "popular";
                        const tagEmoji = isSpicy
                          ? "🌶️"
                          : isVegan
                          ? "🌱"
                          : isPopular
                          ? "⭐"
                          : "";
                        return (
                          <span
                            key={t}
                            className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#fbe4db] text-[#f7906c]"
                          >
                            {t} {tagEmoji}
                          </span>
                        );
                      })}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-[#888888] line-clamp-2 leading-relaxed mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <span className="font-heading font-extrabold text-sm text-[#f7906c] mt-2 block">
                    {currency}
                    {Number(item.price).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
