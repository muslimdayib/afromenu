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
import AccountSettingsModal from "@/components/AccountSettingsModal";
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
  ArrowLeft,
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

// Helper function to format 24h time to standard AM/PM format (e.g. 09:00 -> 9 AM)
const formatTime = (timeStr: string | null | undefined): string => {
  if (!timeStr) return "";
  try {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const minutesDisplay = minutes > 0 ? `:${parts[1]}` : "";
    return `${displayHours}${minutesDisplay} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
};

export default function HybridMenuPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, profile } = useAuth();

  // Active Live Preview States
  const [activeStyle, setActiveStyle] = useState("classic-list");
  const [activeTheme, setActiveTheme] = useState("light");
  const isDark = activeTheme === "dark";

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
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // V3 Detail modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<any>(null);
  
  // Search query for real-time filtering in the redesigned editor
  const [searchQuery, setSearchQuery] = useState("");
  
  // Section and tab states
  const [localSections, setLocalSections] = useState<string[]>([]);
  const dbSections = Array.from(new Set(categories.map(c => c.section_name || c.sectionName || null).filter(Boolean))) as string[];
  const allSections = Array.from(new Set([...dbSections, ...localSections]));

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [guestSelectedSection, setGuestSelectedSection] = useState<string | null>(null);
  const guestSections = Array.from(new Set(categories.map(c => c.section_name || c.sectionName || null).filter(Boolean))) as string[];
  const displayedGuestCategories = guestSections.length > 0 && guestSelectedSection
    ? categories.filter(c => (c.section_name || c.sectionName) === guestSelectedSection)
    : categories;

  // Ordered sections for reordering pills
  const [orderedSections, setOrderedSections] = useState<string[]>([]);

  // Sync ordered sections with allSections while preserving past order
  useEffect(() => {
    setOrderedSections(prev => {
      const currentSet = new Set(prev);
      const newSections = allSections.filter(s => !currentSet.has(s));
      const filteredPrev = prev.filter(s => allSections.includes(s));
      return [...filteredPrev, ...newSections];
    });
  }, [categories, localSections]);

  // Tab Title synchronization when name changes
  useEffect(() => {
    if (establishment?.name) {
      document.title = `${establishment.name} - AfroMenu Editor`;
    }
  }, [establishment?.name]);

  // Section pill reordering
  const handleMoveSection = (index: number, direction: "left" | "right") => {
    const swapIndex = direction === "left" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= orderedSections.length) return;
    
    setOrderedSections(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[swapIndex];
      updated[swapIndex] = temp;
      return updated;
    });
  };

  // Section pill renaming
  const handleRenameSection = async (oldName: string) => {
    const newName = prompt(`Rename section "${oldName}" to:`, oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;
    const trimmedNew = newName.trim();
    
    // Optimistic update
    setCategories(prev => prev.map(c => {
      if ((c.section_name || c.sectionName) === oldName) {
        return { ...c, section_name: trimmedNew, sectionName: trimmedNew };
      }
      return c;
    }));
    
    setLocalSections(prev => prev.map(s => s === oldName ? trimmedNew : s));
    if (selectedSection === oldName) setSelectedSection(trimmedNew);

    try {
      const catsToUpdate = categories.filter(c => (c.section_name || c.sectionName) === oldName);
      await Promise.all(catsToUpdate.map(cat => 
        fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: cat.id, sectionName: trimmedNew })
        })
      ));
      fetchMenuData();
    } catch (err) {
      console.error("Failed to rename section categories:", err);
    }
  };

  // Section pill deleting
  const handleDeleteSection = async (sectionName: string) => {
    if (!confirm(`Are you sure you want to delete the section "${sectionName}" and all of its categories?`)) return;
    
    // Optimistic update
    setCategories(prev => prev.filter(c => (c.section_name || c.sectionName) !== sectionName));
    setLocalSections(prev => prev.filter(s => s !== sectionName));
    if (selectedSection === sectionName) {
      const remaining = allSections.filter(s => s !== sectionName);
      setSelectedSection(remaining[0] || null);
    }

    try {
      const catsToDelete = categories.filter(c => (c.section_name || c.sectionName) === sectionName);
      await Promise.all(catsToDelete.map(cat => 
        fetch(`/api/categories?id=${cat.id}`, {
          method: "DELETE"
        })
      ));
      fetchMenuData();
    } catch (err) {
      console.error("Failed to delete section categories:", err);
    }
  };

  useEffect(() => {
    if (orderedSections.length > 0 && !selectedSection) {
      setSelectedSection(orderedSections[0]);
    }
  }, [orderedSections, selectedSection]);

  useEffect(() => {
    if (guestSections.length > 0 && !guestSelectedSection) {
      setGuestSelectedSection(guestSections[0]);
    }
  }, [guestSections, guestSelectedSection]);

  const handleAddSection = () => {
    const name = prompt("Enter new section name (e.g. Food, Drinks, Desserts):");
    if (name && name.trim()) {
      const trimmed = name.trim();
      if (!allSections.includes(trimmed)) {
        setLocalSections([...localSections, trimmed]);
      }
      setSelectedSection(trimmed);
    }
  };

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
      if (data.establishment) {
        setActiveStyle(data.establishment.menu_style || "classic-list");
        setActiveTheme(data.establishment.theme || "light");
      }
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
    // Filter categories & items dynamically using active section pill and real-time search query
    const filteredCategories = categories.filter((cat) => {
      // If sections exist, filter categories by the selected section pill
      if (allSections.length > 0 && selectedSection) {
        if ((cat.section_name || cat.sectionName) !== selectedSection) return false;
      }

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

    const brandColor = establishment.brand_color || establishment.brandColor || "#f7906c";

    return (
      <div className={`min-h-screen pb-24 font-sans antialiased transition-colors duration-300 ${isDark ? "bg-[#121212] text-[#f5f5f5]" : "bg-[#fdf6f2] text-[#2d2d2d]"}`}>
        
        {/* PREMIUM HEADER */}
        <header className={`sticky top-0 z-30 shadow-sm px-6 py-4 flex items-center justify-between max-w-[430px] mx-auto border-b transition-colors duration-300 ${isDark ? "bg-[#1e1e1e] border-zinc-800" : "bg-white border-gray-100/80"}`}>
          {/* X close button top left */}
          <button
            onClick={() => router.push("/dashboard")}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all font-bold border border-transparent ${isDark ? "bg-[#121212] text-white hover:bg-zinc-800" : "bg-[#fdf6f2] text-[#2d2d2d] hover:bg-[#f7906c]/10"}`}
          >
            ✕
          </button>
          
          {/* Restaurant name centered and bold */}
          <h1 className={`font-heading font-extrabold text-base tracking-tight truncate max-w-[180px] uppercase text-center flex-1 ${isDark ? "text-white" : "text-[#2d2d2d]"}`}>
            {establishment.name}
          </h1>

          {/* Small user avatar circle top right */}
          <div className="w-8 h-8 rounded-full bg-[#f7906c] text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase select-none flex-shrink-0">
            {profile?.name ? profile.name[0] : (user?.email ? user.email[0] : "O")}
          </div>
        </header>

        {/* COVER IMAGE AREA */}
        <div 
          className="w-full relative" 
          style={{
            height: "120px",
            backgroundImage: establishment.background_url ? `url(${establishment.background_url})` : `linear-gradient(135deg, ${brandColor} 0%, #1a2b44 100%)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
        </div>

        {/* ESTABLISHMENT INFO CARD (white card below cover, overlapping the cover at the top) */}
        <div className="max-w-[430px] mx-auto px-4 relative -mt-10 mb-6 z-10">
          <div className={`p-6 rounded-[28px] border shadow-md flex flex-col gap-4 relative ${isDark ? "bg-[#1e1e1e] border-zinc-800" : "bg-white border-gray-100"}`}>
            
            {/* Overlapping Logo */}
            <div className="absolute -top-12 left-6">
              <div className={`w-20 h-20 rounded-full border-4 overflow-hidden shadow-md flex items-center justify-center flex-shrink-0 select-none ${isDark ? "border-[#1e1e1e] bg-zinc-800" : "border-white bg-slate-50"}`}>
                {establishment.logo_url ? (
                  <img src={establishment.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className={`text-2xl font-black uppercase ${isDark ? "text-white" : "text-[#1b3151]"}`}>
                    {establishment.name ? establishment.name[0] : "A"}
                  </span>
                )}
              </div>
            </div>

            {/* Content offset for overlapping logo */}
            <div className="pt-8">
              {/* Name & Pencil edit icon */}
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`font-heading font-black text-xl tracking-tight leading-tight ${isDark ? "text-white" : "text-[#2d2d2d]"}`}>
                  {establishment.name}
                </h2>
                <button
                  onClick={() => setIsEstModalOpen(true)}
                  className={`p-1.5 rounded-full text-gray-400 hover:text-[#f7906c] transition-all cursor-pointer ${isDark ? "hover:bg-zinc-800" : "hover:bg-[#fdf6f2]"}`}
                  title="Edit Settings"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Description (if set) */}
              {establishment.description && (
                <p className="text-xs text-gray-400 leading-relaxed mt-2">
                  {establishment.description}
                </p>
              )}

              {/* Location, WiFi, Phone Rows */}
              <div className="flex flex-col gap-2.5 mt-4 text-xs text-gray-500 font-medium">
                {/* Location pin icon + address */}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#f7906c] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{establishment.phone || "Main Street branch, Somalia"}</span>
                </div>

                {/* WiFi (if set) */}
                {establishment.wifi_password && (
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-[#f7906c] flex-shrink-0" />
                    <span>Wi-Fi: <strong className="font-mono text-[#2d2d2d] dark:text-white">{establishment.wifi_password}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT CONTAINER (Mobile size locked at 430px centered) */}
        <main className="max-w-[430px] mx-auto px-4 py-6 flex flex-col gap-6">
          
          {/* BLUE INFO BANNER FOR SAMPLE DATA */}
          {items.some(i => i.name.toLowerCase().includes("sample")) && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold flex items-start gap-2.5 animate-slide-up shadow-sm">
              <Sparkles className="w-4.5 h-4.5 text-blue-500 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                These are sample items. Edit or delete them and add your real menu items.
              </div>
            </div>
          )}

          {/* SECTION PILLS ROW */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Sections Pills</span>
            
            <div className="flex items-start gap-4 overflow-x-auto pb-4 scrollbar-none">
              {/* "+" button before first pill */}
              <button
                onClick={handleAddSection}
                className="w-9 h-9 rounded-full bg-[#fdf6f2] hover:bg-[#f7906c] text-[#f7906c] hover:text-white flex items-center justify-center shadow-sm flex-shrink-0 transition-all font-black border border-orange-100 cursor-pointer"
                title="Add Section Pill"
              >
                +
              </button>

              {/* Render ordered sections */}
              {orderedSections.length === 0 ? (
                <span className="text-xs text-gray-400 italic py-2">No sections created yet. Tap + to add.</span>
              ) : (
                orderedSections.map((sec, idx) => {
                  const isSelected = selectedSection === sec;
                  return (
                    <div key={sec} className="flex flex-col items-center gap-2 flex-shrink-0">
                      {/* The Pill Row: pill + "+" button after each pill */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedSection(sec)}
                          className={`px-4 py-2 text-xs font-bold rounded-full transition-all border cursor-pointer ${
                            isSelected
                              ? "bg-[#f7906c] border-[#f7906c] text-white font-extrabold"
                              : "bg-white border-[#f7906c] text-[#f7906c] hover:bg-[#fdf6f2]"
                          }`}
                        >
                          <span>{sec}</span>
                        </button>
                        
                        {/* "+" button after this pill */}
                        <button
                          onClick={() => {
                            const name = prompt("Enter new section name to add after this:");
                            if (name && name.trim()) {
                              const trimmed = name.trim();
                              if (!orderedSections.includes(trimmed)) {
                                setLocalSections(prev => [...prev, trimmed]);
                                setOrderedSections(prev => {
                                  const updated = [...prev];
                                  updated.splice(idx + 1, 0, trimmed);
                                  return updated;
                                });
                              }
                              setSelectedSection(trimmed);
                            }
                          }}
                          className="w-5 h-5 rounded-full bg-orange-50 text-[#f7906c] hover:bg-[#f7906c] hover:text-white flex items-center justify-center text-[10px] font-bold border border-orange-100 transition-all cursor-pointer"
                          title="Add section after this"
                        >
                          +
                        </button>
                      </div>

                      {/* Below each pill: 4 small buttons (← → pencil trash) */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveSection(idx, "left")}
                          disabled={idx === 0}
                          className="w-5 h-5 rounded bg-slate-50 border border-gray-150 disabled:opacity-30 text-gray-500 hover:text-[#f7906c] flex items-center justify-center text-[10px] cursor-pointer"
                          title="Move Left"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => handleMoveSection(idx, "right")}
                          disabled={idx === orderedSections.length - 1}
                          className="w-5 h-5 rounded bg-slate-50 border border-gray-150 disabled:opacity-30 text-gray-500 hover:text-[#f7906c] flex items-center justify-center text-[10px] cursor-pointer"
                          title="Move Right"
                        >
                          →
                        </button>
                        <button
                          onClick={() => handleRenameSection(sec)}
                          className="w-5 h-5 rounded bg-slate-50 border border-gray-150 text-gray-500 hover:text-blue-500 flex items-center justify-center text-[10px] cursor-pointer"
                          title="Rename Section"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteSection(sec)}
                          className="w-5 h-5 rounded bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                          title="Delete Section"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Operations Below Active Category (If expanded) */}
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
                      className="w-7 h-7 rounded-lg bg-white border border-gray-100 disabled:opacity-30 text-gray-600 hover:text-[#f7906c] flex items-center justify-center transition-all shadow-sm cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSwapOrder(idx, "down")}
                      disabled={idx === categories.length - 1}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-100 disabled:opacity-30 text-gray-600 hover:text-[#f7906c] flex items-center justify-center transition-all shadow-sm cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setCategoryToEdit(cat);
                        setIsCatModalOpen(true);
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-100 text-gray-600 hover:text-blue-500 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

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
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[10px] font-black text-gray-400 hover:text-[#f7906c] uppercase cursor-pointer"
              >
                Clear
              </button>
            )}
          </section>

          {/* ADD CATEGORY AREA */}
          <section className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              ADD CATEGORY
            </span>
            <button
              onClick={() => {
                setCategoryToEdit(null);
                setIsCatModalOpen(true);
              }}
              className="w-full py-4 bg-[#f7906c] hover:bg-[#e27653] text-white font-extrabold rounded-[20px] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </section>

          {/* CATEGORY CARDS or CATEGORY ITEMS DRILLDOWN PANEL */}
          {expandedCategoryId ? (
            (() => {
              const cat = categories.find((c) => c.id === expandedCategoryId);
              if (!cat) return null;
              const catItems = items.filter((i) => i.category_id === cat.id);
              const displayCategoryName = cat.name + (cat.time_from && cat.time_to ? ` (${formatTime(cat.time_from)} - ${formatTime(cat.time_to)})` : "");

              return (
                <div className={`p-5 rounded-[24px] border shadow-md flex flex-col gap-5 animate-slide-up transition-colors duration-300 ${isDark ? "bg-[#1e1e1e] border-zinc-800" : "bg-white border-orange-50"}`}>
                  {/* Header row */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <button
                      onClick={() => setExpandedCategoryId(null)}
                      className="flex items-center gap-1 text-xs font-black text-[#f7906c] hover:opacity-80 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Sections</span>
                    </button>
                    <h3 className={`font-heading font-black text-sm uppercase truncate max-w-[180px] ${isDark ? "text-white" : "text-[#2d2d2d]"}`}>
                      {displayCategoryName}
                    </h3>
                  </div>

                  {/* Add dish inside category */}
                  <button
                    onClick={() => {
                      setItemToEdit(null);
                      setTargetCategoryIdForItem(cat.id);
                      setIsItemModalOpen(true);
                    }}
                    className="w-full py-3 bg-[#f7906c] hover:bg-[#e27653] text-white font-extrabold rounded-[50px] shadow-sm transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Add Item to {cat.name}</span>
                  </button>

                  {/* Items List */}
                  {catItems.length === 0 ? (
                    <div className={`text-center py-10 text-xs text-gray-400 italic rounded-2xl border border-dashed ${isDark ? "bg-[#121212]/50 border-zinc-800" : "bg-gray-50 border-gray-150"}`}>
                      No items inside this category. Click &apos;Add Item&apos; above.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {catItems.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border shadow-xs flex items-center justify-between gap-3 transition-colors duration-300 ${
                            !item.is_available ? "opacity-50" : ""
                          } ${isDark ? "bg-[#121212]/40 border-zinc-850" : "bg-[#fdf6f2]/40 border-orange-50/50"}`}
                        >
                          {/* Item cover photo & info */}
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl border overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-sm ${isDark ? "bg-[#1e1e1e] border-zinc-800" : "bg-white border-gray-100"}`}>
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
                                <h5 className={`font-extrabold text-xs transition-colors duration-300 ${isDark ? "text-white" : "text-[#2d2d2d]"}`}>{item.name}</h5>
                                {item.weight && (
                                  <span className="text-[9px] font-bold text-gray-400 font-mono">({item.weight})</span>
                                )}
                                {!item.is_available && (
                                  <span className="text-[7px] font-black uppercase px-1 py-0.5 rounded bg-gray-200 text-gray-600 font-sans">
                                    Unavailable
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] text-gray-400 line-clamp-1 max-w-[160px] mt-0.5">
                                {item.description || "No recipe description set."}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-black text-[#f7906c]">
                                  {establishment.currency_symbol || "$"}
                                  {Number(item.price || 0).toFixed(2)}
                                </span>
                                {item.old_price && (
                                  <span className="text-[10px] text-gray-400 line-through">
                                    {establishment.currency_symbol || "$"}
                                    {Number(item.old_price).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Item Edit & Delete Controls */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setItemToEdit(item);
                                setTargetCategoryIdForItem(cat.id);
                                setIsItemModalOpen(true);
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#f7906c] transition-colors cursor-pointer ${isDark ? "hover:bg-zinc-800" : "hover:bg-[#f7906c]/10"}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer ${isDark ? "hover:bg-red-950" : "hover:bg-red-50"}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            /* OTHERWISE RENDER CATEGORY LIST AS CARDS RESPONDING TO ACTIVESTYLE */
            <section className={activeStyle === "visual-grid" ? "grid grid-cols-2 gap-4 animate-slide-up" : "flex flex-col gap-5 animate-slide-up"}>
              {filteredCategories.length === 0 ? (
                <div className={`col-span-full p-10 text-center rounded-[32px] shadow-sm text-gray-400 flex flex-col items-center border ${isDark ? "bg-[#1e1e1e] border-zinc-800" : "bg-white border-orange-50"}`}>
                  <Utensils className="w-10 h-10 mb-2 text-gray-300" />
                  <p className="text-xs font-semibold">No active categories found.</p>
                </div>
              ) : (
                filteredCategories.map((cat, catIdx) => {
                  const catItems = items.filter((i) => i.category_id === cat.id);
                  const displayCategoryName = cat.name + (cat.time_from && cat.time_to ? ` (${formatTime(cat.time_from)} - ${formatTime(cat.time_to)})` : "");

                  return (
                    <div key={cat.id} className="flex flex-col gap-3">
                      {activeStyle === "classic-list" ? (
                        /* Classic List Style in Editor: Simple Row */
                        <div
                          onClick={() => setExpandedCategoryId(cat.id)}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-xs cursor-pointer active:scale-[0.99] ${
                            isDark
                              ? "bg-[#1e1e1e] border-zinc-800 hover:border-[#f7906c]/40 hover:bg-zinc-800"
                              : "bg-white border-gray-100 hover:border-[#f7906c]/40 hover:bg-[#fdf6f2]/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? "bg-zinc-800 text-[#f7906c]" : "bg-orange-50 text-[#f7906c]"}`}>
                              📁
                            </div>
                            <div>
                              <h3 className={`font-heading font-black text-xs uppercase ${isDark ? "text-white" : "text-[#2d2d2d]"}`}>
                                {displayCategoryName}
                              </h3>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                                {catItems.length} Dishes
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setExpandedCategoryId(prev => prev === cat.id ? null : cat.id);
                              }}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
                                isDark ? "bg-[#121212] text-gray-300 hover:text-[#f7906c]" : "bg-slate-50 text-gray-500 hover:text-[#f7906c]"
                              }`}
                              title="Toggle Items View"
                            >
                              {expandedCategoryId === cat.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => {
                                setCategoryToEdit(cat);
                                setIsCatModalOpen(true);
                              }}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
                                isDark ? "bg-[#121212] text-gray-400 hover:text-[#f7906c] hover:bg-zinc-800" : "bg-slate-50 text-gray-400 hover:text-[#f7906c] hover:bg-[#f7906c]/10"
                              }`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
                                isDark ? "bg-[#121212] text-gray-400 hover:text-red-500 hover:bg-red-950" : "bg-red-50 text-gray-400 hover:text-red-500 hover:bg-red-100"
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : activeStyle === "visual-grid" ? (
                        /* Visual Grid Style in Editor: 2-column cards */
                        <div
                          onClick={() => setExpandedCategoryId(cat.id)}
                          className={`rounded-2xl border shadow-sm cursor-pointer transition-all active:scale-[0.99] flex flex-col justify-between h-[150px] overflow-hidden group hover:shadow-md ${
                            isDark ? "bg-[#1e1e1e] border-zinc-800 text-white" : "bg-white border-gray-100 text-[#2d2d2d]"
                          }`}
                        >
                          <div className={`relative h-20 flex items-center justify-center overflow-hidden ${isDark ? "bg-[#121212]" : "bg-slate-50"}`}>
                            {cat.image_url ? (
                              <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <Utensils className="w-6 h-6 text-gray-300" />
                            )}
                            <div className="absolute top-2 right-2 flex items-center gap-1 z-10" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setExpandedCategoryId(prev => prev === cat.id ? null : cat.id);
                                }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                                  isDark ? "bg-zinc-800 text-gray-300 hover:text-white" : "bg-white text-gray-500 hover:text-[#f7906c]"
                                }`}
                                title="Toggle Items View"
                              >
                                {expandedCategoryId === cat.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => {
                                    setCategoryToEdit(cat);
                                    setIsCatModalOpen(true);
                                }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                                  isDark ? "bg-zinc-800 text-gray-300 hover:text-white" : "bg-white text-gray-500 hover:text-[#f7906c]"
                                }`}
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                                  isDark ? "bg-zinc-800 text-gray-300 hover:text-red-500" : "bg-white text-gray-500 hover:text-red-500"
                                }`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="p-3">
                            <h3 className={`font-heading font-black text-[11px] uppercase truncate leading-tight ${isDark ? "text-white" : "text-[#2d2d2d]"}`}>
                              {displayCategoryName}
                            </h3>
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 block">
                              {catItems.length} Dishes
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Photo Cards Style: Full Width landscape cards */
                        <div
                          className="h-[160px] rounded-[16px] overflow-hidden border border-orange-100/50 relative shadow-md cursor-pointer transition-all hover:shadow-lg transform active:scale-[0.99]"
                          onClick={() => setExpandedCategoryId(cat.id)}
                          style={{
                            backgroundImage: cat.image_url ? `url(${cat.image_url})` : "none",
                            backgroundColor: "#1b3151",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="absolute inset-0 bg-black/55 z-0"></div>

                          {/* Top Right action button group */}
                          <div
                            className="absolute top-4 right-4 flex items-center gap-1.5 z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setExpandedCategoryId(prev => prev === cat.id ? null : cat.id);
                              }}
                              className="w-7 h-7 rounded-full bg-[#1b3151] hover:bg-[#2c4b75] text-white flex items-center justify-center transition-all shadow-md cursor-pointer border border-white/20"
                              title="Toggle Items View"
                            >
                              {expandedCategoryId === cat.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => {
                                setCategoryToEdit(cat);
                                setIsCatModalOpen(true);
                              }}
                              className="w-7 h-7 rounded-full bg-[#f7906c] hover:bg-[#e27653] text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-0 text-center select-none">
                            <h3 className="font-heading font-extrabold text-xl text-white uppercase tracking-wider drop-shadow-md">
                              {displayCategoryName}
                            </h3>
                            <span className="text-[10px] text-white/95 font-black mt-1.5 bg-white/10 px-4 py-0.5 rounded-full uppercase tracking-wider">
                              {catItems.length} dishes • Click to view
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Between cards insert button */}
                      <div className="flex justify-center my-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setCategoryToEdit(null);
                            setIsCatModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full bg-[#f7906c] hover:bg-[#e27653] text-white flex items-center justify-center shadow-md transition-all cursor-pointer font-bold border-2 border-white"
                          title="Insert Category"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          )}

        </main>

        {/* FIXED BOTTOM NAVIGATION BAR */}
        <BottomNav
          slug={slug}
          activeTab="edit"
          onOpenEditEstablishment={() => setIsEstModalOpen(true)}
          onOpenAccountSettings={() => setIsAccountModalOpen(true)}
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
          defaultSectionName={selectedSection}
          existingSections={allSections}
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
          allItems={items}
        />

        <EditEstablishmentModal
          isOpen={isEstModalOpen}
          onClose={() => {
            setIsEstModalOpen(false);
            if (establishment) {
              setActiveStyle(establishment.menu_style || "classic-list");
              setActiveTheme(establishment.theme || "light");
            }
          }}
          onSuccess={(updatedEst) => {
            if (updatedEst) {
              setEstablishment(updatedEst);
              setActiveStyle(updatedEst.menu_style || "classic-list");
              setActiveTheme(updatedEst.theme || "light");
            }
            fetchMenuData();
          }}
          establishment={establishment}
          onPreviewThemeChange={(theme) => setActiveTheme(theme)}
          onPreviewStyleChange={(style) => setActiveStyle(style)}
        />

        <AccountSettingsModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
        />
      </div>
    );
  }

  /* =========================================================================
     2. GUEST / CUSTOMER MENU VIEW (Public digital menu)
     ========================================================================= */
  const brandColor = establishment.brand_color || establishment.brandColor || "#f7906c";
  const brandStyles = {
    "--brand-color": brandColor,
    accentColor: brandColor,
  } as React.CSSProperties;

  return (
    <div
      style={brandStyles}
      className={`min-h-screen ${
        isDark ? "bg-[#121212] text-white" : "bg-[#fdf6f2] text-[#2d2d2d]"
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

      {/* Guest Section Pills */}
      {guestSections.length > 0 && (
        <div className="max-w-[430px] mx-auto px-4 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {guestSections.map((sec) => {
              const isSelected = guestSelectedSection === sec;
              return (
                <button
                  key={sec}
                  onClick={() => setGuestSelectedSection(sec)}
                  className={`px-4 py-2 text-xs font-black rounded-full transition-all shadow-sm border ${
                    isSelected
                      ? "bg-[#f2bd11] border-[#f2bd11] text-[#1b3151]"
                      : isDark
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        : "bg-white border-gray-200 text-slate-600 hover:bg-gray-50"
                  }`}
                >
                  {sec}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Guest Menu Categories Loop */}
      <div className="max-w-[430px] mx-auto px-4 flex flex-col gap-6">
        {displayedGuestCategories.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl ${isDark ? "bg-[#1e1e1e]" : "bg-white"} my-8`}>
            <p className="text-sm text-slate-400">No dishes in this section yet.</p>
          </div>
        ) : (
          displayedGuestCategories.map((category) => {
            const categoryItems = items.filter((item) => item.category_id === category.id && (item.is_visible !== false));

            return (
              <div key={category.id} className="flex flex-col gap-4">
                {/* Category Header */}
                <h4 className="font-heading font-black text-sm uppercase tracking-wider border-b pb-2 border-orange-100/50 mt-2">
                  {category.name}
                </h4>

                {/* Layout styles */}
                {categoryItems.length === 0 ? (
                  <p className="text-[10px] text-gray-400 italic">No available dishes in this category.</p>
                ) : establishment.menu_style === "visual-grid" ? (
                  /* 2-column Grid style */
                  <div className="grid grid-cols-2 gap-4">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItemForDetail(item);
                          setIsDetailModalOpen(true);
                        }}
                        className={`rounded-2xl overflow-hidden p-3 border shadow-sm transition-all active:scale-[0.99] flex flex-col justify-between h-[210px] cursor-pointer ${
                          isDark ? "bg-[#1e1e1e] border-zinc-800" : "bg-white border-[#eeeeee]"
                        }`}
                      >
                        <div>
                          {/* Image */}
                          <div className="h-24 w-full rounded-xl overflow-hidden bg-slate-50 relative shadow-inner mb-2 flex items-center justify-center flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Utensils className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          {/* Title & Weight */}
                          <h5 className="font-black text-xs truncate leading-snug">
                            {item.name}
                            {item.weight && <span className="text-[9px] font-bold text-gray-400 font-mono ml-1">({item.weight})</span>}
                          </h5>
                          {/* Description */}
                          <p className="text-[9px] text-gray-450 line-clamp-1 mt-0.5 leading-normal">
                            {item.description || "Fresh and delicious recipe details."}
                          </p>
                        </div>
                        {/* Price Row */}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-xs font-black text-[#f7906c]">
                            {establishment.currency_symbol || "$"}
                            {Number(item.price || 0).toFixed(2)}
                          </span>
                          {item.old_price && (
                            <span className="text-[9px] text-gray-400 line-through">
                              {establishment.currency_symbol || "$"}
                              {Number(item.old_price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : establishment.menu_style === "photo-cards" ? (
                  /* Full-width Photo Cards with text overlay style */
                  <div className="flex flex-col gap-4">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItemForDetail(item);
                          setIsDetailModalOpen(true);
                        }}
                        className={`h-[160px] rounded-2xl overflow-hidden relative shadow-md cursor-pointer transition-all active:scale-[0.99] transform`}
                        style={{
                          backgroundImage: item.image_url ? `url(${item.image_url})` : "none",
                          backgroundColor: "#1b3151",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-black/55 z-0 transition-opacity hover:bg-black/60"></div>
                        
                        {/* Text Overlay Details */}
                        <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 text-white select-none">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h5 className="font-heading font-extrabold text-sm uppercase tracking-wide truncate max-w-[280px]">
                                {item.name}
                                {item.weight && <span className="text-[10px] font-mono opacity-80 ml-1">({item.weight})</span>}
                              </h5>
                              <p className="text-[9px] text-white/70 line-clamp-2 leading-relaxed mt-1 max-w-[280px]">
                                {item.description || "Gourmet dish details crafted fresh today."}
                              </p>
                            </div>
                          </div>
                          
                          {/* Bottom price tags */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#f7906c] drop-shadow-sm">
                              {establishment.currency_symbol || "$"}
                              {Number(item.price || 0).toFixed(2)}
                            </span>
                            {item.old_price && (
                              <span className="text-[10px] text-white/50 line-through">
                                {establishment.currency_symbol || "$"}
                                {Number(item.old_price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Classic List (Default style) */
                  <div className="flex flex-col gap-3">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItemForDetail(item);
                          setIsDetailModalOpen(true);
                        }}
                        className={`p-3.5 rounded-2xl border shadow-xs transition-all active:scale-[0.99] flex items-center justify-between gap-4 cursor-pointer ${
                          isDark ? "bg-[#1e1e1e] border-zinc-800/80" : "bg-white border-[#eeeeee]/60"
                        }`}
                      >
                        {/* Left Info and small thumbnail */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-inner">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Utensils className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <h5 className="font-extrabold text-xs">
                              {item.name}
                              {item.weight && <span className="text-[9px] font-bold text-gray-400 font-mono ml-1">({item.weight})</span>}
                            </h5>
                            <p className="text-[9px] text-gray-450 line-clamp-1 leading-normal mt-0.5 max-w-[200px]">
                              {item.description || "Gourmet chef crafted specialty."}
                            </p>
                          </div>
                        </div>

                        {/* Right Price details */}
                        <div className="text-right flex flex-col items-end flex-shrink-0">
                          <span className="text-xs font-black text-[#f7906c]">
                            {establishment.currency_symbol || "$"}
                            {Number(item.price || 0).toFixed(2)}
                          </span>
                          {item.old_price && (
                            <span className="text-[9px] text-gray-400 line-through">
                              {establishment.currency_symbol || "$"}
                              {Number(item.old_price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
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
