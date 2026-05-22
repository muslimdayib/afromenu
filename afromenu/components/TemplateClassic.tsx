"use client";

import React from "react";
import { Utensils } from "lucide-react";

interface TemplateProps {
  establishment: any;
  categories: any[];
  items: any[];
  onItemClick?: (item: any) => void;
}

export default function TemplateClassic({ establishment, categories, items, onItemClick }: TemplateProps) {
  const brandColor = establishment.brand_color || "#f2bd11";

  return (
    <div className="w-full bg-[#faf7f2] text-stone-800 flex flex-col font-serif pb-12 border-l-4 border-r-4 border-[#f2bd11]/30">
      
      {/* Centered Elegant Header */}
      <div className="text-center py-10 px-4">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#f2bd11] block mb-1">
          Menu selection
        </span>
        <h2 className="font-heading font-extrabold text-2xl text-stone-800">
          Chef&apos;s Specialities
        </h2>
        <div className="w-16 h-0.5 bg-[#f2bd11]/60 mx-auto mt-3"></div>
      </div>

      {/* Categories Content list */}
      <div className="flex flex-col gap-10 px-6">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category_id === cat.id && i.is_available);
          if (catItems.length === 0) return null;

          return (
            <div key={cat.id} className="flex flex-col items-center">
              {/* Category Title */}
              <div className="text-center mb-6 w-full">
                <h3 className="font-heading font-bold text-lg text-stone-800 tracking-wider">
                  {cat.name}
                </h3>
                <span className="text-[8px] italic text-[#f2bd11]/90 uppercase tracking-widest block mt-0.5">
                  ✦ {catItems.length} items ✦
                </span>
                <div className="w-24 h-[1px] bg-stone-200 mx-auto mt-2"></div>
              </div>

              {/* Classic Items centered */}
              <div className="flex flex-col gap-6 w-full">
                {catItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => onItemClick && onItemClick(item)}
                    className="text-center flex flex-col items-center max-w-sm mx-auto w-full p-2.5 rounded-2xl hover:bg-stone-100/60 hover:shadow-xs transition-all cursor-pointer border border-transparent hover:border-stone-200/40"
                  >
                    {/* Item Name & Price row */}
                    <div className="flex items-baseline justify-center gap-2 w-full">
                      <h4 className="font-bold text-sm text-stone-800 tracking-wide">{item.name}</h4>
                      <span className="text-[10px] text-stone-400">..................</span>
                      <span className="font-bold text-sm text-stone-900" style={{ color: brandColor }}>
                        {establishment.currency_symbol}
                        {Number(item.price).toFixed(2)}
                      </span>
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap justify-center mt-1">
                        {item.tags.map((t: string) => {
                          const tagEmoji = t === "spicy" ? "🌶️" : t === "vegan" ? "🌱" : t === "popular" ? "⭐" : "";
                          return (
                            <span key={t} className="text-[7px] text-[#f2bd11] font-bold uppercase tracking-wider bg-stone-100 px-1 py-0.5 rounded">
                              {t} {tagEmoji}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Item Description */}
                    {item.description && (
                      <p className="text-[10px] italic text-stone-500 mt-1.5 leading-relaxed text-center">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
