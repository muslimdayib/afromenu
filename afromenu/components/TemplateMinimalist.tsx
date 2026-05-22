"use client";

import React from "react";
import { Utensils } from "lucide-react";

interface TemplateProps {
  establishment: any;
  categories: any[];
  items: any[];
  onItemClick?: (item: any) => void;
}

export default function TemplateMinimalist({ establishment, categories, items, onItemClick }: TemplateProps) {
  const brandColor = establishment.brand_color || "#f2bd11";

  return (
    <div className="w-full bg-white text-slate-800 flex flex-col font-sans">
      {/* Category Quick Nav */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-slate-100 py-3 px-4 flex gap-3 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#cat-${cat.id}`}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-100 hover:border-slate-300 text-slate-600 bg-slate-50 transition-colors whitespace-nowrap"
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* Categories & Dishes list */}
      <div className="flex flex-col gap-10 px-4 py-8">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category_id === cat.id && i.is_available);
          if (catItems.length === 0) return null;

          return (
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-16">
              {/* Category Title */}
              <div className="border-b border-slate-100 pb-2 mb-4 flex items-baseline justify-between">
                <h3 className="font-heading font-extrabold text-base text-slate-800 uppercase tracking-widest">
                  {cat.name}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {catItems.length} Items
                </span>
              </div>

              {/* Minimal list items */}
              <div className="flex flex-col gap-4">
                {catItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => onItemClick && onItemClick(item)}
                    className="flex justify-between items-start gap-4 p-2.5 rounded-2xl hover:bg-slate-50 hover:shadow-xs border border-transparent hover:border-slate-100/50 transition-all cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-800">{item.name}</h4>
                        {item.tags?.map((t: string) => {
                          const tagEmoji = t === "spicy" ? "🌶️" : t === "vegan" ? "🌱" : t === "popular" ? "⭐" : "";
                          return (
                            <span key={t} className="text-[8px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {t} {tagEmoji}
                            </span>
                          );
                        })}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-xs line-clamp-2">
                          {item.description.split("🔥 Macros:")[0]}
                        </p>
                      )}
                    </div>
                    
                    <span className="font-bold text-sm text-slate-800 tabular-nums whitespace-nowrap" style={{ color: brandColor }}>
                      {establishment.currency_symbol}
                      {Number(item.price).toFixed(2)}
                    </span>
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
