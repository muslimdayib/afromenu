"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
import AddCategoryModal from "@/components/AddCategoryModal";
import AddItemModal from "@/components/AddItemModal";
import EditEstablishmentModal from "@/components/EditEstablishmentModal";
import TemplateMinimalist from "@/components/TemplateMinimalist";
import TemplateVisualGrid from "@/components/TemplateVisualGrid";
import TemplateClassic from "@/components/TemplateClassic";
import TemplateNightOwl from "@/components/TemplateNightOwl";
import TemplateFastCasual from "@/components/TemplateFastCasual";
import ItemDetailModal from "@/components/ItemDetailModal";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Wifi,
  Phone,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Utensils,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function HybridMenuPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, profile } = useAuth();

  // Database states
  const [establishment, setEstablishment] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Interface view states
  const [isOwner, setIsOwner] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Modals states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);
  
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [targetCategoryIdForItem, setTargetCategoryIdForItem] = useState<string>("");

  const [isEstModalOpen, setIsEstModalOpen] = useState(false);

  // V3 Detail modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<any>(null);

  // Fetch all menu items
  const fetchMenuData = async () => {
    try {
      // 1. Fetch establishment
      const { data: estData, error: estError } = await supabase
        .from("establishments")
        .select("*")
        .eq("slug", slug)
        .single();

      if (estError || !estData) {
        setEstablishment(null);
        setLoading(false);
        return;
      }

      setEstablishment(estData);

      // Check if logged-in user owns it
      if (user && user.id === estData.user_id) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }

      // 2. Fetch categories (filtering out soft deleted records)
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .eq("establishment_id", estData.id)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (catError) throw catError;
      setCategories(catData || []);

      // 3. Fetch items (filtering out soft deleted records)
      if (catData && catData.length > 0) {
        const catIds = catData.map((c) => c.id);
        const { data: itemsData, error: itemsError } = await supabase
          .from("items")
          .select("*")
          .in("category_id", catIds)
          .is("deleted_at", null)
          .order("sort_order", { ascending: true });

        if (itemsError) throw itemsError;
        setItems(itemsData || []);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Error loading menu data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchMenuData();
    }
  }, [slug, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#1b3151]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#f2bd11] animate-spin"></div>
        </div>
        <p className="font-heading font-semibold text-sm text-slate-500 animate-pulse">
          Loading gourmet menu...
        </p>
      </div>
    );
  }

  // 404 Not Found Fallback
  if (!establishment) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#1b3151] text-[#f2bd11] flex items-center justify-center mb-6 shadow-md">
          <Utensils className="w-10 h-10" />
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-[#1b3151] mb-3">Menu Not Found</h1>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
          The establishment you are looking for does not exist or has been disabled by the owner.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 rounded-[50px] bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] font-extrabold text-sm shadow-md transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Trial / Paid Expired Alert banner check
  const isExpired = new Date(establishment.paid_until) < new Date();

  // Category Ordering Handler: Swap sort orders
  const handleSwapOrder = async (index: number, direction: "up" | "down") => {
    const swapWithIndex = direction === "up" ? index - 1 : index + 1;
    if (swapWithIndex < 0 || swapWithIndex >= categories.length) return;

    const catA = categories[index];
    const catB = categories[swapWithIndex];

    try {
      // Swap local orders
      const tempOrder = catA.sort_order;
      catA.sort_order = catB.sort_order;
      catB.sort_order = tempOrder;

      // Update in DB
      await Promise.all([
        supabase.from("categories").update({ sort_order: catA.sort_order }).eq("id", catA.id),
        supabase.from("categories").update({ sort_order: catB.sort_order }).eq("id", catB.id),
      ]);

      // Re-fetch
      fetchMenuData();
    } catch (err) {
      console.error("Failed to reorder categories:", err);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Are you sure you want to delete this category and all its menu items?")) return;
    try {
      await supabase.from("categories").update({ deleted_at: new Date().toISOString() }).eq("id", catId);
      fetchMenuData();
    } catch (err) {
      console.error("Delete category failed:", err);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try {
      await supabase.from("items").update({ deleted_at: new Date().toISOString() }).eq("id", itemId);
      fetchMenuData();
    } catch (err) {
      console.error("Delete item failed:", err);
    }
  };

  // Custom variable for brand theme colors
  const brandStyles = {
    "--brand-color": establishment.brand_color || "#f2bd11",
    "--brand-color-dark": "#1b3151",
  } as React.CSSProperties;

  /* =========================================================================
     1. OWNER MODE LAYOUT (Edit Dashboard)
     ========================================================================= */
  if (isOwner) {
    return (
      <div style={brandStyles} className="min-h-screen bg-[#f8f9fa] pb-24 text-[#1b3151]">
        {/* Trial Expired Alert Banner */}
        {isExpired && (
          <div className="bg-red-500 text-white text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2">
            <span>🚨 Trial has expired. Upgrade your billing plan to reactivate the menu.</span>
            <button
              onClick={() => router.push(`/panel/${slug}/billing`)}
              className="px-3 py-1 bg-white text-red-500 font-extrabold rounded-full hover:bg-red-50 transition-colors uppercase text-[10px]"
            >
              Billing
            </button>
          </div>
        )}

        {/* Edit mode Topbar: Navy Blue (#1b3151), White text, Gold active highlights */}
        <div className="bg-[#1b3151] border-b border-[#f2bd11]/20 px-6 py-4 sticky top-0 z-30 shadow-md flex items-center justify-between max-w-[430px] mx-auto text-white">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors font-bold"
          >
            ✕
          </button>
          <div className="text-center">
            <h1 className="font-heading font-extrabold text-base tracking-tight truncate max-w-[180px] text-white">
              {establishment.name}
            </h1>
            <span className="text-[10px] bg-[#f2bd11] text-[#1b3151] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Visual Editor V3
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f2bd11] text-[#1b3151] flex items-center justify-center font-bold text-sm shadow-sm uppercase">
              {profile?.name ? profile.name[0] : "O"}
            </div>
          </div>
        </div>

        {/* Content Container (Mobile size locked at 430px centered) */}
        <div className="max-w-[430px] mx-auto px-4 py-6">
          {/* Header instructions */}
          <div className="p-4 rounded-3xl bg-white border border-gray-100 shadow-sm mb-6 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1b3151]/5 text-[#f2bd11] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#1b3151]" />
            </div>
            <div>
              <h4 className="font-bold text-xs">Visual Editor Mode</h4>
              <p className="text-[10px] text-gray-500">
                Add food cards, tap them to manage pricing, and sort using arrows.
              </p>
            </div>
          </div>

          {/* Top '+' Category Trigger - Styled Premium Gold */}
          <button
            onClick={() => {
              setCategoryToEdit(null);
              setIsCatModalOpen(true);
            }}
            className="w-full py-4 border border-dashed border-[#1b3151]/30 hover:border-[#1b3151] text-[#1b3151] font-extrabold text-xs rounded-2xl bg-white hover:bg-[#1b3151]/5 transition-all flex items-center justify-center gap-2 mb-4 shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#f2bd11]" />
            <span>Add Menu Category</span>
          </button>

          {/* Categories Loop list */}
          {categories.length === 0 ? (
            <div className="p-8 text-center bg-white border border-gray-100 rounded-3xl shadow-sm my-8 text-gray-400">
              <Utensils className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No categories created yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {categories.map((cat, idx) => {
                const isExpanded = expandedCategoryId === cat.id;
                const catItems = items.filter((i) => i.category_id === cat.id);

                return (
                  <div key={cat.id} className="flex flex-col gap-2">
                    {/* Category Card */}
                    <div
                      className="h-[140px] rounded-3xl overflow-hidden border border-gray-100 relative shadow-md cursor-pointer transition-all hover:shadow-lg"
                      onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                      style={{
                        backgroundImage: cat.image_url ? `url(${cat.image_url})` : "none",
                        backgroundColor: "#1b3151",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-black/55 z-0"></div>

                      {/* Top Action Icons */}
                      <div
                        className="absolute top-3 right-3 flex items-center gap-1.5 z-10"
                        onClick={(e) => e.stopPropagation()} // Stop click expansion
                      >
                        {/* Up arrow */}
                        <button
                          onClick={() => handleSwapOrder(idx, "up")}
                          disabled={idx === 0}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white flex items-center justify-center transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        {/* Down arrow */}
                        <button
                          onClick={() => handleSwapOrder(idx, "down")}
                          disabled={idx === categories.length - 1}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white flex items-center justify-center transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => {
                            setCategoryToEdit(cat);
                            setIsCatModalOpen(true);
                          }}
                          className="w-7 h-7 rounded-full bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] flex items-center justify-center transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Centered Name */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-0 text-center">
                        <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider drop-shadow-md">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] text-white/95 font-bold mt-1 bg-white/10 px-2.5 py-0.5 rounded-full">
                          {catItems.length} dishes • {isExpanded ? "Click to close" : "Click to view dishes"}
                        </span>
                      </div>

                      {/* Expand indicator icon */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/70">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Accordion Dishes Sub-List: Pure White V3 styled card */}
                    {isExpanded && (
                      <div className="p-4 bg-white border border-gray-100 rounded-3xl shadow-md animate-slide-up flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-1">
                          <span className="text-xs font-bold text-[#1b3151] uppercase tracking-wider">
                            Dishes & Drinks
                          </span>
                          {/* Add Item Button: Styled Premium Gold */}
                          <button
                            onClick={() => {
                              setItemToEdit(null);
                              setTargetCategoryIdForItem(cat.id);
                              setIsItemModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-[#f2bd11] text-[#1b3151] font-extrabold text-[10px] rounded-full hover:bg-[#dbab0f] transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Plus className="w-3 h-3 text-[#1b3151]" />
                            <span>Add Dish</span>
                          </button>
                        </div>

                        {catItems.length === 0 ? (
                          <div className="text-center py-6 text-xs text-gray-400 italic">
                            This category is empty. Tap &apos;Add Dish&apos; to populate it.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {catItems.map((item) => (
                              <div
                                key={item.id}
                                className={`p-3 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between gap-3 ${
                                  !item.is_available ? "opacity-60 bg-gray-50/50" : ""
                                }`}
                              >
                                {/* Left Item Picture & Details */}
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                    {item.image_url ? (
                                      <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Utensils className="w-5 h-5 text-gray-300" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h5 className="font-bold text-xs text-[#1b3151]">{item.name}</h5>
                                      {!item.is_available && (
                                        <span className="text-[7px] font-extrabold uppercase px-1 py-0.5 rounded bg-gray-200 text-gray-600">
                                          Unavailable
                                        </span>
                                      )}
                                      {item.tags?.map((t: string) => (
                                        <span
                                          key={t}
                                          className="text-[7px] font-extrabold uppercase px-1 py-0.5 rounded bg-[#1b3151]/5 text-[#1b3151]"
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="text-[9px] text-gray-400 line-clamp-1 max-w-[160px]">
                                      {item.description || "No description set."}
                                    </p>
                                    <span className="text-[11px] font-extrabold text-[#f2bd11]">
                                      {establishment.currency_symbol}
                                      {item.price.toFixed(2)}
                                    </span>
                                  </div>
                                </div>

                                {/* Right Controls */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setItemToEdit(item);
                                      setTargetCategoryIdForItem(cat.id);
                                      setIsItemModalOpen(true);
                                    }}
                                    className="w-7 h-7 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#1b3151] transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dashboard Inline '+' Between Cards */}
                    <div className="flex items-center justify-center py-1">
                      <button
                        onClick={() => {
                          setCategoryToEdit(null);
                          setIsCatModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-full border border-gray-200 hover:border-[#1b3151] bg-white text-gray-400 hover:text-[#1b3151] shadow-sm flex items-center justify-center transition-all hover:scale-105"
                      >
                        <Plus className="w-4 h-4 text-[#f2bd11]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile bottom nav */}
        <BottomNav
          slug={slug}
          activeTab="edit"
          onOpenEditEstablishment={() => setIsEstModalOpen(true)}
        />

        {/* MODAL WRAPPERS */}
        <AddCategoryModal
          isOpen={isCatModalOpen}
          onClose={() => {
            setIsCatModalOpen(false);
            setCategoryToEdit(null);
          }}
          onSuccess={fetchMenuData}
          establishmentId={establishment.id}
          categoryToEdit={categoryToEdit}
          nextSortOrder={categories.length}
        />

        <AddItemModal
          isOpen={isItemModalOpen}
          onClose={() => {
            setIsItemModalOpen(false);
            setItemToEdit(null);
          }}
          onSuccess={fetchMenuData}
          categoryId={targetCategoryIdForItem}
          itemToEdit={itemToEdit}
          nextSortOrder={items.filter((i) => i.category_id === targetCategoryIdForItem).length}
        />

        <EditEstablishmentModal
          isOpen={isEstModalOpen}
          onClose={() => setIsEstModalOpen(false)}
          onSuccess={fetchMenuData}
          establishment={establishment}
        />
      </div>
    );
  }

  /* =========================================================================
     2. GUEST / CUSTOMER MENU VIEW (Public digital menu)
     ========================================================================= */
  const isDark = establishment.theme === "dark";

  return (
    <div
      style={brandStyles}
      className={`min-h-screen ${
        isDark ? "bg-[#121212] text-[#f5f5f5]" : "bg-[#f8f9fa] text-[#1b3151]"
      } pb-16 transition-colors duration-300`}
    >
      {/* Dynamic Background Banner banner */}
      <div
        className="h-44 sm:h-56 bg-cover bg-center relative"
        style={{
          backgroundImage: establishment.background_url
            ? `url(${establishment.background_url})`
            : "linear-gradient(135deg, #1b3151 0%, #1a2b44 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
      </div>

      {/* Profile Logo Box & Header info */}
      <div className="max-w-[430px] mx-auto px-4 relative -mt-16 mb-6">
        <div
          className={`rounded-[32px] p-6 border ${
            isDark ? "bg-[#1e1e1e] border-zinc-800" : "bg-white border-[#eeeeee]"
          } card-shadow flex flex-col items-center text-center`}
        >
          {/* Logo */}
          <div
            className={`w-20 h-20 rounded-full border-4 ${
              isDark ? "border-[#1e1e1e] bg-[#2d2d2d]" : "border-white bg-[#f8f9fa]"
            } overflow-hidden shadow-md -mt-16 mb-4 flex items-center justify-center flex-shrink-0`}
          >
            {establishment.logo_url ? (
              <img
                src={establishment.logo_url}
                alt={establishment.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Utensils className="w-8 h-8 text-[#f2bd11]" />
            )}
          </div>

          {/* Restaurant Title */}
          <h2 className="font-heading font-extrabold text-2xl mb-1">{establishment.name}</h2>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-3 w-full">
            {/* WiFi */}
            {establishment.wifi_password && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                  isDark ? "bg-zinc-800 text-zinc-300" : "bg-gray-50 text-[#1b3151]"
                } border border-[#eeeeee]/50`}
              >
                <Wifi className="w-3.5 h-3.5 text-[#f2bd11]" />
                <span className="font-bold text-[10px] font-mono">{establishment.wifi_password}</span>
              </div>
            )}

            {/* Tel */}
            {establishment.phone && (
              <a
                href={`tel:${establishment.phone}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                  isDark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-gray-50 text-[#1b3151] hover:bg-gray-100"
                } border border-[#eeeeee]/50 transition-colors`}
              >
                <Phone className="w-3.5 h-3.5 text-[#f2bd11]" />
                <span className="font-bold text-[10px] font-mono">{establishment.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Guest Menu Categories Accordions Loop replaced by Dynamic Template Switcher */}
      <div className="max-w-[430px] mx-auto px-4 flex flex-col gap-4">
        {categories.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl ${isDark ? "bg-[#1e1e1e]" : "bg-white"} my-8`}>
            <p className="text-sm text-slate-400">No dishes on the menu yet.</p>
          </div>
        ) : (
          <>
            {establishment.template_style === "visual-grid" || establishment.template_style === "bold-grid" ? (
              <TemplateVisualGrid
                establishment={establishment}
                categories={categories}
                items={items}
                onItemClick={(item) => {
                  setSelectedItemForDetail(item);
                  setIsDetailModalOpen(true);
                }}
              />
            ) : establishment.template_style === "classic-elegant" || establishment.template_style === "classic-list" ? (
              <TemplateClassic
                establishment={establishment}
                categories={categories}
                items={items}
                onItemClick={(item) => {
                  setSelectedItemForDetail(item);
                  setIsDetailModalOpen(true);
                }}
              />
            ) : establishment.template_style === "night-owl" ? (
              <TemplateNightOwl
                establishment={establishment}
                categories={categories}
                items={items}
                onItemClick={(item) => {
                  setSelectedItemForDetail(item);
                  setIsDetailModalOpen(true);
                }}
              />
            ) : establishment.template_style === "fast-casual" ? (
              <TemplateFastCasual
                establishment={establishment}
                categories={categories}
                items={items}
                onItemClick={(item) => {
                  setSelectedItemForDetail(item);
                  setIsDetailModalOpen(true);
                }}
              />
            ) : (
              <TemplateMinimalist
                establishment={establishment}
                categories={categories}
                items={items}
                onItemClick={(item) => {
                  setSelectedItemForDetail(item);
                  setIsDetailModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Powered by Afromenu footer */}
      <footer className="max-w-[430px] mx-auto text-center py-10 px-4 mt-8 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-md bg-[#1b3151] flex items-center justify-center text-[#f2bd11] font-bold">
            <Utensils className="w-3.5 h-3.5" />
          </div>
          <span className={`font-heading font-extrabold text-sm tracking-tight ${isDark ? "text-white" : "text-[#1b3151]"}`}>
            Afro<span className="text-[#f2bd11]">menu</span>
          </span>
        </Link>
        <span className="text-[10px] text-gray-400">
          Digital Table Menu powered by{" "}
          <a href="/" className="hover:text-[#f2bd11] font-bold underline transition-colors">
            Afromenu.com
          </a>
        </span>
      </footer>

      {/* 3D Visualizer Bottom Sheet Modal */}
      <ItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedItemForDetail(null);
        }}
        item={selectedItemForDetail}
        currencySymbol={establishment.currency_symbol}
      />
    </div>
  );
}
