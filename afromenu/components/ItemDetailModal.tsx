"use client";

import React, { useEffect, useState } from "react";
import { X, Sparkles, AlertCircle, RefreshCw, Sliders } from "lucide-react";
import { Item } from "@/lib/supabase";

// Register custom HTML elements for TypeScript compilation safety
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        "auto-rotate"?: boolean;
        camera_controls?: boolean;
        "camera-controls"?: boolean;
        ar?: boolean;
        shadow_intensity?: string;
        "shadow-intensity"?: string;
        exposure?: string;
        loading?: string;
        style?: React.CSSProperties;
      }, HTMLElement>;
    }
  }
}

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  currencySymbol?: string;
}

export default function ItemDetailModal({
  isOpen,
  onClose,
  item,
  currencySymbol = "$",
}: ItemDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"image" | "3d">("image");

  // Dynamically load Google's <model-viewer> script if a 3D model is active
  useEffect(() => {
    if (isOpen && item?.model_3d_url) {
      const scriptId = "model-viewer-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "module";
        script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
        document.body.appendChild(script);
      }

      // Default to 3D tab if 3D model is present
      setActiveTab("3d");
    } else {
      setActiveTab("image");
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  // Extract Macros & Allergens if they exist in the auto-generated description
  const descriptionText = item.description || "";
  let cleanDescription = descriptionText;
  let macrosStr = "";
  let allergensStr = "";

  if (descriptionText.includes("🔥 Macros:")) {
    const parts = descriptionText.split("🔥 Macros:");
    cleanDescription = parts[0].trim();
    const subParts = parts[1].split("⚠️ Allergens:");
    macrosStr = subParts[0].trim();
    if (subParts[1]) {
      allergensStr = subParts[1].trim();
    }
  } else if (descriptionText.includes("Macros:")) {
    const parts = descriptionText.split("Macros:");
    cleanDescription = parts[0].trim();
    const subParts = parts[1].split("Allergens:");
    macrosStr = subParts[0].trim();
    if (subParts[1]) {
      allergensStr = subParts[1].trim();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-Up Bottom Sheet */}
      <div className="relative w-full max-w-[480px] bg-white rounded-t-[32px] overflow-hidden shadow-2xl z-10 animate-slide-up max-h-[92vh] flex flex-col border-t border-[#eeeeee]">
        {/* Swipe Handle Indicator */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-3 flex-shrink-0" onClick={onClose} />

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20 transition-all shadow-md cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Container (Image vs 3D Viewer) */}
        <div className="relative w-full h-[280px] sm:h-[320px] bg-gray-50 flex-shrink-0">
          {activeTab === "3d" && item.model_3d_url ? (
            <div className="w-full h-full relative">
              <model-viewer
                src={item.model_3d_url}
                alt={item.name}
                auto-rotate
                camera-controls
                shadow-intensity="1"
                exposure="1.2"
                style={{ width: "100%", height: "100%", outline: "none" }}
              />
              <div className="absolute bottom-3 left-3 bg-[#1b3151]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin-slow" />
                <span>Drag to Rotate & Pan 3D Model</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full overflow-hidden">
              <img 
                src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"} 
                alt={item.name}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* Toggle Tab Pill Buttons (If 3D url exists) */}
          {item.model_3d_url && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200/80 p-0.5 rounded-xl flex gap-1 shadow-md">
              <button
                onClick={() => setActiveTab("image")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "image"
                    ? "bg-[#1b3151] text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Photo
              </button>
              <button
                onClick={() => setActiveTab("3d")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === "3d"
                    ? "bg-[#f2bd11] text-[#1b3151]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Interactive 3D</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable details */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Header Row */}
          <div>
            <div className="flex justify-between items-start gap-4">
              <h2 className="font-heading font-extrabold text-2xl text-[#1b3151] leading-tight">
                {item.name}
              </h2>
              <span className="font-heading font-black text-2xl text-[#f2bd11] whitespace-nowrap bg-[#1b3151] px-4 py-1.5 rounded-2xl shadow-sm">
                {currencySymbol}{item.price.toFixed(2)}
              </span>
            </div>

            {/* Badges/Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#f8f9fa] border border-gray-200 text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-[#f8f9fa] p-4 rounded-2xl border border-gray-100">
            <h4 className="text-[10px] font-bold text-[#1b3151] uppercase tracking-wider mb-1.5">
              Chef's Description
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              {cleanDescription || "Crafted freshly with signature herbs and the finest hand-selected local ingredients."}
            </p>
          </div>

          {/* Add-ons & Options customizations */}
          {item.addons && (
            <div>
              <h4 className="text-[10px] font-bold text-[#1b3151] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#f2bd11]" />
                <span>Customization & Add-ons</span>
              </h4>
              <div className="flex flex-col gap-3">
                {(() => {
                  try {
                    const groups = typeof item.addons === "string" ? JSON.parse(item.addons) : item.addons;
                    if (!Array.isArray(groups) || groups.length === 0) return <span className="text-xs text-gray-400 italic">No add-ons available</span>;
                    return groups.map((g: any, gIdx: number) => (
                      <div key={gIdx} className="bg-white border border-gray-200 p-3.5 rounded-2xl shadow-sm">
                        <h5 className="font-extrabold text-xs text-[#1b3151] mb-2 flex justify-between">
                          <span>{g.name}</span>
                          {g.mandatory && <span className="text-[8px] text-[#f2bd11] font-black uppercase">Required</span>}
                        </h5>
                        <div className="flex flex-col gap-2">
                          {g.options?.map((opt: any, oIdx: number) => (
                            <div key={oIdx} className="flex justify-between items-center text-xs">
                              <span className="text-gray-500 font-medium">{opt.name}</span>
                              <span className="font-bold text-[#1b3151]">
                                +{currencySymbol}{Number(opt.price).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  } catch (e) {
                    return null;
                  }
                })()}
              </div>
            </div>
          )}

          {/* Macro Nutrient Stats (If parsed from description or general placeholder) */}
          <div>
            <h4 className="text-[10px] font-bold text-[#1b3151] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#f2bd11]" />
              <span>Nutrition & Macros</span>
            </h4>
            
            {macrosStr ? (
              <div className="grid grid-cols-2 gap-2 bg-[#f8f9fa] border border-[#eeeeee] p-3 rounded-2xl">
                {macrosStr.split("|").map((m, idx) => {
                  const mParts = m.trim().split(":");
                  const label = mParts[0]?.replace("~", "")?.trim() || "";
                  const val = mParts[1]?.trim() || "";
                  return (
                    <div key={idx} className="flex justify-between items-center px-3 py-1.5 bg-white rounded-xl shadow-xs border border-gray-50">
                      <span className="text-xs text-gray-500 font-bold capitalize">{label}</span>
                      <span className="text-xs text-[#1b3151] font-black">{val}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[#f8f9fa] border border-gray-150 p-2.5 rounded-xl">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Cal</span>
                  <span className="text-xs font-black text-[#1b3151]">~340 kcal</span>
                </div>
                <div className="bg-[#f8f9fa] border border-gray-150 p-2.5 rounded-xl">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Prot</span>
                  <span className="text-xs font-black text-[#1b3151]">14g</span>
                </div>
                <div className="bg-[#f8f9fa] border border-gray-150 p-2.5 rounded-xl">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Carbs</span>
                  <span className="text-xs font-black text-[#1b3151]">38g</span>
                </div>
                <div className="bg-[#f8f9fa] border border-gray-150 p-2.5 rounded-xl">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Fats</span>
                  <span className="text-xs font-black text-[#1b3151]">12g</span>
                </div>
              </div>
            )}
          </div>

          {/* Allergens Warning Section */}
          <div>
            <h4 className="text-[10px] font-bold text-[#1b3151] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Allergen Information</span>
            </h4>
            <div className="p-3 bg-amber-50/50 border border-amber-100/80 rounded-2xl flex items-start gap-3">
              <div className="text-sm text-amber-800 font-bold leading-relaxed">
                {allergensStr ? (
                  <span>Contains: <strong className="font-extrabold">{allergensStr}</strong></span>
                ) : (
                  <span>No highly sensitive allergens cataloged. Please ask your server if you have severe dietary limits.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer/CTA Row */}
        <div className="p-5 border-t border-gray-100 bg-[#f8f9fa] flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-[#1b3151] hover:bg-[#15263f] text-white font-extrabold rounded-[50px] text-sm transition-all shadow-md text-center block cursor-pointer"
          >
            Close Item
          </button>
        </div>
      </div>
    </div>
  );
}
