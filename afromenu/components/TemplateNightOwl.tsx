"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Item } from "@/lib/supabase";

interface TemplateProps {
  establishment: any;
  categories: any[];
  items: any[];
  onItemClick?: (item: Item) => void;
}

export default function TemplateNightOwl({ 
  establishment, 
  categories, 
  items,
  onItemClick,
}: TemplateProps) {
  const brandColor = establishment.brand_color || "#f2bd11";

  return (
    <div className="w-full bg-[#0a1424] text-white flex flex-col font-sans pb-10 rounded-[24px] overflow-hidden border border-gray-800 shadow-2xl">
      {/* Centered Elegant Header */}
      <div className="text-center py-8 px-4 bg-gradient-to-b from-[#0e1d33] to-[#0a1424] border-b border-gray-800/60">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#f2bd11] block mb-1">
          🌌 Midnight Selection 🌌
        </span>
        <h2 className="font-heading font-extrabold text-xl text-white tracking-wide">
          Night Owl Specialties
        </h2>
        <div className="w-12 h-0.5 bg-[#f2bd11] mx-auto mt-2.5"></div>
      </div>

      {/* Category Quick Nav */}
      <div className="sticky top-0 bg-[#0e1d33]/95 backdrop-blur-md z-20 border-b border-gray-800/80 py-3 px-4 flex gap-2.5 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#cat-${cat.id}`}
            className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl border border-gray-850 hover:border-[#f2bd11]/50 text-gray-300 hover:text-white bg-[#0a1424] transition-all whitespace-nowrap"
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* Categories & Dishes list */}
      <div className="flex flex-col gap-9 px-4 py-8">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category_id === cat.id && i.is_available);
          if (catItems.length === 0) return null;

          return (
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-16">
              {/* Category Title */}
              <div className="border-b border-gray-800 pb-2 mb-4.5 flex items-baseline justify-between">
                <h3 className="font-heading font-black text-sm text-[#f2bd11] uppercase tracking-wider">
                  {cat.name}
                </h3>
                <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-900/50 px-2 py-0.5 rounded border border-gray-800">
                  {catItems.length} Dishes
                </span>
              </div>

              {/* Items Card Grid */}
              <div className="flex flex-col gap-3.5">
                {catItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => onItemClick && onItemClick(item)}
                    className="p-4 bg-[#0e1d33] border border-gray-850 hover:border-[#f2bd11]/40 rounded-2xl flex items-center justify-between gap-4 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-md"
                  >
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-sm text-white tracking-wide">{item.name}</h4>
                        {item.tags?.map((t: string) => {
                          const tagEmoji = t === "spicy" ? "🌶️" : t === "vegan" ? "🌱" : t === "popular" ? "⭐" : "";
                          return (
                            <span 
                              key={t} 
                              className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-[#f2bd11] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                            >
                              {t} {tagEmoji}
                            </span>
                          );
                        })}
                      </div>
                      
                      {item.description && (
                        <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed line-clamp-2 pr-2">
                          {item.description.split("🔥 Macros:")[0]}
                        </p>
                      )}
                    </div>
                    
                    {/* Image & Price container */}
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 flex-shrink-0">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="font-heading font-black text-sm text-[#f2bd11] tabular-nums whitespace-nowrap bg-[#0a1424] px-3 py-1.5 rounded-xl border border-gray-800 shadow-sm">
                        {establishment.currency_symbol}
                        {Number(item.price).toFixed(2)}
                      </span>
                    </div>
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
