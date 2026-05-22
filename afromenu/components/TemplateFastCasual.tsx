"use client";

import React from "react";
import { Item } from "@/lib/supabase";

interface TemplateProps {
  establishment: any;
  categories: any[];
  items: any[];
  onItemClick?: (item: Item) => void;
}

export default function TemplateFastCasual({ 
  establishment, 
  categories, 
  items,
  onItemClick,
}: TemplateProps) {
  const brandColor = establishment.brand_color || "#f2bd11";

  return (
    <div className="w-full bg-[#f8f9fa] text-slate-800 flex flex-col font-sans pb-12 rounded-[24px] overflow-hidden border border-gray-200/80 shadow-md">
      {/* Category Slider Nav */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-slate-200/60 py-2.5 px-4 flex gap-2 overflow-x-auto scrollbar-none shadow-xs">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#cat-${cat.id}`}
            className="text-[11px] font-black px-3 py-1.5 rounded-lg border border-slate-100 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 transition-all whitespace-nowrap"
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* Main categories list */}
      <div className="flex flex-col gap-6 px-3 py-6">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category_id === cat.id && i.is_available);
          if (catItems.length === 0) return null;

          return (
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-14 bg-white rounded-2xl p-3 border border-slate-200/50 shadow-xs">
              {/* Category Title */}
              <div className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
                <h3 className="font-heading font-black text-sm text-slate-800 uppercase tracking-wider">
                  {cat.name}
                </h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  {catItems.length} items
                </span>
              </div>

              {/* Compact Fast Casual Items List */}
              <div className="flex flex-col gap-2.5">
                {catItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => onItemClick && onItemClick(item)}
                    className="p-2 bg-[#f8f9fa]/50 hover:bg-[#f8f9fa] border border-slate-100 hover:border-slate-200 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.005] active:scale-[0.995] cursor-pointer"
                  >
                    {/* Left Thumbnail (Small Square) */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-slate-200/50 flex-shrink-0 flex items-center justify-center relative">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="text-[10px] text-gray-300 font-bold">Menu</div>
                      )}
                    </div>

                    {/* Compact Details & Price */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-slate-800 truncate tracking-wide">
                            {item.name}
                          </h4>
                          {item.description && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[200px]">
                              {item.description.split("🔥 Macros:")[0]}
                            </p>
                          )}
                        </div>

                        {/* Right-aligned Price */}
                        <span className="font-heading font-black text-xs text-[#1b3151] tabular-nums whitespace-nowrap bg-white px-2 py-1 rounded-lg border border-slate-200/60 shadow-xs">
                          {establishment.currency_symbol}
                          {Number(item.price).toFixed(2)}
                        </span>
                      </div>

                      {/* Small Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-1">
                          {item.tags.map((t: string) => (
                            <span 
                              key={t} 
                              className="text-[7px] font-black uppercase bg-slate-200/60 text-slate-500 px-1 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
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
