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
  const [error, setError] = useState<string | null>(null);

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
  
  // Search query for real-time filtering in the redesigned editor
  const [searchQuery, setSearchQuery] = useState("");
  
  // Currently active section pill (e.g. Food, Drinks)
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Fetch all menu items
  const fetchMenuData = async () => {
    try {
      setError(null);
      const res = await fetch(`/api/establishments/by-slug/${slug}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          setEstablishment(null);
          return;
        }
        throw new Error(`Failed to load menu: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (!data.success || !data.establishment) {
        setEstablishment(null);
        return;
      }

      setEstablishment(data.establishment);
      setCategories(data.categories || []);
      setItems(data.items || []);

      // Check if logged-in user owns it
      if (user && user.id === data.establishment.user_id) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } catch (err: any) {
      console.error("Error loading menu data:", err);
      setError(err?.message || "Could not load menu");
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

  // Error Boundary UI
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 md:p-10 rounded-[32px] max-w-md w-full border border-red-100 shadow-xl flex flex-col items-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6 shadow-md border border-red-100">
            <Trash2 className="w-8 h-8" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#1b3151] mb-3">
            Could Not Load Menu
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6 bg-red-50/50 p-4 rounded-2xl border border-red-50 w-full font-mono break-all text-left">
            Error: {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchMenuData();
            }}
            className="w-full py-3.5 bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] font-extrabold rounded-[50px] shadow-md transition-all text-sm hover:shadow-lg cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
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

      // Update in DB via API
      await Promise.all([
        fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: catA.id, sortOrder: catA.sort_order }),
        }),
        fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: catB.id, sortOrder: catB.sort_order }),
        }),
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
      const res = await fetch(`/api/categories?id=${catId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete request failed");
      fetchMenuData();
    } catch (err) {
      console.error("Delete category failed:", err);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try {
      const res = await fetch(`/api/items?id=${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete request failed");
      fetchMenuData();
    } catch (err) {
      console.error("Delete item failed:", err);
    }
  };

  /* =========================================================================
     1. OWNER MODE LAYOUT (Edit Dashboard)
     ========================================================================= */
  if (isOwner) {
    // Filter categories & items dynamically using real-time search query
    const filteredCategories = categories.filter((cat) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const matchesCatName = cat.name.toLowerCase().includes(query);
      const hasMatchingItems = items.some(
        (item) =>
          item.category_id === cat.id &&
          (item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query)))
      );
      return matchesCatName || hasMatchingItems;
    });

    return (
      <div className="min-h-screen bg-[#fdf6f2] pb-24 text-[#2d2d2d] font-sans antialiased">
        
        {/* PREMIUM HEADER */}
        <header className="bg-white border-b border-gray-100/80 sticky top-0 z-30 shadow-sm px-6 py-4 flex items-center justify-between max-w-[430px] mx-auto">
          {/* X close button top left */}
          <button
            onClick={() => router.push("/dashboard")}
            className="w-9 h-9 rounded-full bg-[#fdf6f2] hover:bg-[#f7906c]/10 flex items-center justify-center text-[#2d2d2d] hover:text-[#f7906c] transition-all font-bold border border-transparent"
          >
            ✕
          </button>
          
          {/* Restaurant name centered and bold */}
          <h1 className="font-heading font-extrabold text-base tracking-tight truncate max-w-[180px] text-[#2d2d2d] uppercase">
            {establishment.name}
          </h1>

          {/* Small user avatar circle top right */}
          <div className="w-8 h-8 rounded-full bg-[#f7906c] text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase select-none">
            {profile?.name ? profile.name[0] : (user?.email ? user.email[0] : "O")}
          </div>
        </header>

        {/* CONTENT CONTAINER (Mobile size locked at 430px centered) */}
        <main className="max-w-[430px] mx-auto px-4 py-6 flex flex-col gap-6">
          
          {/* ESTABLISHMENT INFO SECTION */}
          <section className="bg-white p-5 rounded-3xl border border-orange-50 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-lg text-[#2d2d2d] tracking-tight">
                  {establishment.name}
                </h2>
                <button
                  onClick={() => setIsEstModalOpen(true)}
                  className="p-1.5 rounded-full hover:bg-[#fdf6f2] text-gray-400 hover:text-[#f7906c] transition-all"
                  title="Edit Info"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[9px] bg-[#f7906c]/15 text-[#f7906c] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Visual Editor
              </span>
            </div>

            {/* Location & WiFi Rows */}
            <div className="flex flex-col gap-2.5 text-xs text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#f7906c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{establishment.phone || "Main Street branch, Somalia"}</span>
              </div>
              
              {establishment.wifi_password && (
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[#f7906c]" />
                  <span>Wi-Fi: <strong className="font-mono text-[#2d2d2d]">{establishment.wifi_password}</strong></span>
                </div>
              )}
            </div>

            <hr className="border-gray-50" />

            {/* Description Text */}
            <p className="text-xs text-gray-400 leading-relaxed">
              Curate beautiful menu categories, add delicious mock items with custom images, and organize items for your customers in real-time.
            </p>

            {/* TAB PILLS ROW */}
            <div className="mt-2 flex flex-col gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Sections Pills</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                
                {/* Plus button before pills */}
                <button
                  onClick={() => {
                    setCategoryToEdit(null);
                    setIsCatModalOpen(true);
                  }}
                  className="w-8 h-8 rounded-full bg-[#fdf6f2] hover:bg-[#f7906c] text-[#f7906c] hover:text-white flex items-center justify-center shadow-sm flex-shrink-0 transition-all font-black border border-orange-100"
                >
                  +
                </button>

                {/* Categories Pills */}
                {categories.map((cat) => {
                  const isSelected = expandedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setExpandedCategoryId(isSelected ? null : cat.id)}
                      className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex-shrink-0 flex items-center gap-1.5 shadow-sm border ${
                        isSelected
                          ? "bg-[#f7906c] border-[#f7906c] text-white font-extrabold"
                          : "bg-white border-[#eeeeee] text-[#2d2d2d] hover:bg-[#fdf6f2]"
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  );
                })}

                {/* Plus button after last pill */}
                <button
                  onClick={() => {
                    setCategoryToEdit(null);
                    setIsCatModalOpen(true);
                  }}
                  className="w-8 h-8 rounded-full bg-[#fdf6f2] hover:bg-[#f7906c] text-[#f7906c] hover:text-white flex items-center justify-center shadow-sm flex-shrink-0 transition-all font-black border border-orange-100"
                >
                  +
                </button>
              </div>

              {/* Operations Below Active/Selected Pill */}
              {categories.map((cat, idx) => {
                const isSelected = expandedCategoryId === cat.id;
                if (!isSelected) return null;
                return (
                  <div key={cat.id} className="flex items-center gap-2 bg-[#fdf6f2]/80 p-2.5 rounded-2xl border border-orange-100/50 justify-center w-full animate-slide-up">
                    <span className="text-[10px] font-bold text-[#f7906c] uppercase tracking-wider mr-2">{cat.name} actions:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSwapOrder(idx, "up")}
                        disabled={idx === 0}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-100 disabled:opacity-30 text-gray-600 hover:text-[#f7906c] flex items-center justify-center transition-all shadow-sm"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleSwapOrder(idx, "down")}
                        disabled={idx === categories.length - 1}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-100 disabled:opacity-30 text-gray-600 hover:text-[#f7906c] flex items-center justify-center transition-all shadow-sm"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setCategoryToEdit(cat);
                          setIsCatModalOpen(true);
                        }}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-100 text-gray-600 hover:text-blue-500 flex items-center justify-center transition-all shadow-sm"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

            </div>
          </section>

          {/* SEARCH BAR */}
          <section className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories or food items..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-orange-50 focus:border-[#f7906c] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold shadow-sm transition-all"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4 text-[#f7906c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[10px] font-black text-gray-400 hover:text-[#f7906c] uppercase"
              >
                Clear
              </button>
            )}
          </section>

          {/* ADD CATEGORY SECTION */}
          <section className="flex flex-col gap-2 items-center text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Add Category
            </span>
            <button
              onClick={() => {
                setCategoryToEdit(null);
                setIsCatModalOpen(true);
              }}
              className="w-full py-4 bg-[#f7906c] hover:bg-[#e27653] text-white font-extrabold rounded-[50px] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Plus className="w-5 h-5 text-white" />
              <span>Create New Section</span>
            </button>
          </section>

          {/* CATEGORY CARDS */}
          <section className="flex flex-col gap-5">
            {filteredCategories.length === 0 ? (
              <div className="p-10 text-center bg-white border border-orange-50 rounded-[32px] shadow-sm text-gray-400 flex flex-col items-center">
                <Utensils className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-xs font-semibold">No active categories found.</p>
              </div>
            ) : (
              filteredCategories.map((cat, idx) => {
                const isExpanded = expandedCategoryId === cat.id;
                const catItems = items.filter((i) => i.category_id === cat.id);

                return (
                  <div key={cat.id} className="flex flex-col gap-3">
                    
                    {/* Category Card (Full Bleed, height 160px) */}
                    <div
                      className="h-[160px] rounded-[16px] overflow-hidden border border-orange-100/50 relative shadow-md cursor-pointer transition-all hover:shadow-lg transform active:scale-[0.99]"
                      onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                      style={{
                        backgroundImage: cat.image_url ? `url(${cat.image_url})` : "none",
                        backgroundColor: "#1b3151",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-black/55 z-0"></div>

                      {/* Top Right Action Icons */}
                      <div
                        className="absolute top-4 right-4 flex items-center gap-1.5 z-10"
                        onClick={(e) => e.stopPropagation()} // Bypasses card click expansion
                      >
                        {/* Down Arrow / Expand */}
                        <button
                          onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                        
                        {/* Edit Pencil */}
                        <button
                          onClick={() => {
                            setCategoryToEdit(cat);
                            setIsCatModalOpen(true);
                          }}
                          className="w-7 h-7 rounded-full bg-[#f7906c] hover:bg-[#e27653] text-white flex items-center justify-center transition-all shadow-md"
                          title="Edit Category Name & Photo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Trash Delete */}
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-md"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Centered Name */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-0 text-center select-none">
                        <h3 className="font-heading font-extrabold text-xl text-white uppercase tracking-wider drop-shadow-md">
                          {cat.name}
                        </h3>
                        <span className="text-[9px] text-white/95 font-black mt-1 bg-white/10 px-3 py-0.5 rounded-full uppercase tracking-wider">
                          {catItems.length} Dishes
                        </span>
                      </div>
                    </div>

                    {/* Accordion Dishes Sub-List (White premium background card) */}
                    {isExpanded && (
                      <div className="p-4 bg-white border border-[#eeeeee] rounded-[24px] shadow-lg animate-slide-up flex flex-col gap-3 mx-1">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2.5 mb-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Category Dishes
                          </span>
                          
                          {/* Add Item Button inside expanded category */}
                          <button
                            onClick={() => {
                              setItemToEdit(null);
                              setTargetCategoryIdForItem(cat.id);
                              setIsItemModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-[#f7906c] text-white font-extrabold text-[10px] rounded-full hover:bg-[#e27653] transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5 text-white" />
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
                                className={`p-3 rounded-2xl bg-[#fdf6f2]/40 border border-orange-50/50 shadow-sm flex items-center justify-between gap-3 ${
                                  !item.is_available ? "opacity-60 bg-gray-50/50" : ""
                                }`}
                              >
                                {/* Left Item Image & Details */}
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-sm">
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
                                      <h5 className="font-extrabold text-xs text-[#2d2d2d]">{item.name}</h5>
                                      {!item.is_available && (
                                        <span className="text-[7px] font-black uppercase px-1 py-0.5 rounded bg-gray-200 text-gray-600">
                                          Unavailable
                                        </span>
                                      )}
                                      {item.tags?.map((t: string) => (
                                        <span
                                          key={t}
                                          className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-[#f7906c]/10 text-[#f7906c]"
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="text-[9px] text-gray-400 line-clamp-1 max-w-[160px] mt-0.5">
                                      {item.description || "No recipe description set."}
                                    </p>
                                    <span className="text-[11px] font-black text-[#f7906c] block mt-0.5">
                                      {establishment.currency_symbol || "$"}
                                      {Number(item.price).toFixed(2)}
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
                                    className="w-7 h-7 rounded-full hover:bg-[#f7906c]/10 flex items-center justify-center text-gray-400 hover:text-[#f7906c] transition-colors"
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

                    {/* Between Cards coral '+' Insert Button */}
                    <div className="flex items-center justify-center relative z-10 -my-1">
                      <button
                        onClick={() => {
                          setCategoryToEdit(null);
                          setIsCatModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-full bg-[#f7906c] hover:bg-[#e27653] text-white shadow-md flex items-center justify-center transition-all hover:scale-110"
                        title="Insert Section Category"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </section>

        </main>

        {/* FIXED BOTTOM NAVIGATION BAR */}
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
