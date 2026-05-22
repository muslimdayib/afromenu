"use client";

import React from "react";
import { Utensils } from "lucide-react";

interface TemplateProps {
  establishment: any;
  categories: any[];
  items: any[];
  onItemClick?: (item: any) => void;
}

export default function TemplateVisualGrid({ establishment, categories, items, onItemClick }: TemplateProps) {
  const brandColor = establishment.brand_color || "#f2bd11";

  return (
    <div className="w-full bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Category Grid Section */}
      <div className="flex flex-col gap-8 px-4 py-8">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category_id === cat.id && i.is_available);
          if (catItems.length === 0) return null;

          return (
            <div key={cat.id} className="flex flex-col">
              {/* Category Header Card */}
              <div
                className="h-28 rounded-2xl bg-cover bg-center flex items-center justify-center relative overflow-hidden shadow-sm mb-4"
                style={{
                  backgroundImage: cat.image_url ? `url(${cat.image_url})` : "none",
                  backgroundColor: "#1e3151",
                }}
              >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
                <div className="relative z-10 text-center px-4">
                  <h3 className="font-heading font-extrabold text-base text-white uppercase tracking-wider">
                    {cat.name}
                  </h3>
                  <span className="text-[9px] text-white/80 font-bold block mt-1">
                    {catItems.length} dishes
                  </span>
                </div>
              </div>

              {/* 2-Column Responsive Visual Card Grid */}
              <div className="grid grid-cols-2 gap-4">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onItemClick && onItemClick(item)}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    {/* Dish Image Box */}
                    <div className="h-28 bg-slate-100 relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Utensils className="w-8 h-8 text-slate-300" />
                      )}
                      
                      {/* Popular tag top right */}
                      {item.tags?.includes("popular") && (
                        <span className="absolute top-2 right-2 bg-[#f2bd11] text-[#1b3151] text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                          ★ Pop
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{item.name}</h4>
                        {item.description && (
                          <p className="text-[9px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1 flex-wrap">
                        <span className="font-bold text-xs text-[#1b3151]" style={{ color: brandColor }}>
                          {establishment.currency_symbol}
                          {Number(item.price).toFixed(2)}
                        </span>
                        
                        {item.tags?.includes("spicy") && (
                          <span className="text-[10px]">🌶️</span>
                        )}
                      </div>
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
