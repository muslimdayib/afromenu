"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
import AddCategoryModal from "@/components/AddCategoryModal";
import AddItemModal from "@/components/AddItemModal";
import EditEstablishmentModal from "@/components/EditEstablishmentModal";
import AccountSettingsModal from "@/components/AccountSettingsModal";
import ItemDetailModal from "@/components/ItemDetailModal";
import LuxuryDarkMenu from "@/components/menu-styles/LuxuryDarkMenu";
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
  ChevronRight,
  Globe,
  Star,
  MapPin,
  Check,
  Link as LinkIcon,
  MessageSquare,
  X
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

const renderSocialIcon = (key: string, className: string = "w-3.5 h-3.5") => {
  switch (key) {
    case "instagram_url":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case "facebook_url":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      );
    case "twitter_url":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
        </svg>
      );
    case "tiktok_url":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
        </svg>
      );
    case "snapchat_url":
      return <Clock className={className} />;
    case "whatsapp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      );
    default:
      return <LinkIcon className={className} />;
  }
};

export default function HybridMenuPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, profile } = useAuth();

  // Active Live Preview States
  const [activeStyle, setActiveStyle] = useState("luxury-dark");
  const [activeTheme, setActiveTheme] = useState("light");
  const [previewBrandColor, setPreviewBrandColor] = useState<string | null>(null);
  const [previewBrandColorSecondary, setPreviewBrandColorSecondary] = useState<string | null>(null);
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
  const [dismissedGuide, setDismissedGuide] = useState(false);

  // Modals states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);
  const [insertCategoryIndex, setInsertCategoryIndex] = useState<number | null>(null);
  
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [targetCategoryIdForItem, setTargetCategoryIdForItem] = useState<string>("");

  const [isEstModalOpen, setIsEstModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // V3 Detail modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<any>(null);
  
  // Logo error handling states
  const [ownerLogoError, setOwnerLogoError] = useState(false);
  const [guestLogoError, setGuestLogoError] = useState(false);
  
  // Search query for real-time filtering in the redesigned editor
  const [searchQuery, setSearchQuery] = useState("");

  // Premium Guest View states
  const [guestTab, setGuestTab] = useState<"menu" | "about" | "feedback">("menu");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [guestSearchQuery, setGuestSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showWifi, setShowWifi] = useState(false);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  const [currentRating, setCurrentRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");

  const showToast = (title: string, desc: string) => {
    setToast({ title, desc });
    setTimeout(() => setToast(null), 4500);
  };
  
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

  // Local storage checks for guide banner
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("afromenu_guide_dismissed");
      if (dismissed === "true") {
        setDismissedGuide(true);
      }
    }
  }, []);

  const handleDismissGuide = () => {
    setDismissedGuide(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("afromenu_guide_dismissed", "true");
    }
  };

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
        setActiveStyle(data.establishment.menu_style || "luxury-dark");
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

  if (loading && !establishment) {
    return (
      <div className="min-h-screen bg-[#f2bd11]/5 pb-24 font-sans antialiased transition-colors duration-300">
        {/* Skeleton Top Bar */}
        <header className="sticky top-0 z-30 shadow-xs px-6 py-4 flex items-center justify-between max-w-[430px] mx-auto bg-white border-b border-gray-150/40">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
        </header>

        {/* Skeleton Cover Photo */}
        <div className="max-w-[430px] mx-auto mt-4 px-4">
          <div className="w-full h-[140px] rounded-[24px] bg-gray-200 animate-pulse"></div>
        </div>

        {/* Skeleton Overlapping Info Card */}
        <div className="max-w-[430px] mx-auto px-4 relative -mt-8 mb-6 z-10">
          <div className="p-6 rounded-[28px] border border-amber-100/30 bg-white shadow-md flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-200 border-3 border-white animate-pulse"></div>
              <div className="flex-1 mt-1">
                <div className="h-4 bg-gray-200 rounded w-36 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 border-t border-gray-100/50 pt-3">
              <div className="h-3 bg-gray-100 rounded w-48 animate-pulse"></div>
              <div className="h-3 bg-gray-100 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Skeleton Category Pills & Cards */}
        <main className="max-w-[430px] mx-auto px-4 py-2 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
              <div className="px-6 py-4 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
              <div className="px-6 py-4 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
              <div className="px-6 py-4 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <div className="h-40 rounded-3xl bg-gray-200 animate-pulse w-full"></div>
            <div className="h-40 rounded-3xl bg-gray-200 animate-pulse w-full"></div>
            <div className="h-40 rounded-3xl bg-gray-200 animate-pulse w-full"></div>
          </div>
        </main>
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
            className="w-full py-3.5 bg-[#f2bd11] hover:bg-[#d4a50e] text-white font-extrabold rounded-[50px] shadow-md transition-all text-sm hover:shadow-lg cursor-pointer border-0"
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
          className="px-6 py-2.5 rounded-[50px] bg-[#f2bd11] hover:bg-[#d4a50e] text-white font-extrabold text-sm shadow-md transition-all border-0"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Category Ordering Handler
  const handleSwapOrder = async (index: number, direction: "up" | "down") => {
    const swapWithIndex = direction === "up" ? index - 1 : index + 1;
    if (swapWithIndex < 0 || swapWithIndex >= categories.length) return;

    const catA = categories[index];
    const catB = categories[swapWithIndex];

    try {
      const tempOrder = catA.sort_order;
      catA.sort_order = catB.sort_order;
      catB.sort_order = tempOrder;

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

  const brandColor = previewBrandColor || establishment?.brand_color || establishment?.brandColor || "#f2bd11";
  const brandColorSecondary = previewBrandColorSecondary || establishment?.brand_color_secondary || establishment?.brandColorSecondary || "#1b3151";

  // Build active social links
  const socialPlatforms = [
    { key: "website_url", urlPrefix: "" },
    { key: "instagram_url", urlPrefix: "https://instagram.com/" },
    { key: "tiktok_url", urlPrefix: "https://tiktok.com/@" },
    { key: "facebook_url", urlPrefix: "https://facebook.com/" },
    { key: "twitter_url", urlPrefix: "https://x.com/" },
    { key: "snapchat_url", urlPrefix: "https://snapchat.com/add/" },
    { key: "whatsapp", urlPrefix: "https://wa.me/" },
  ];

  /* =========================================================================
     1. OWNER MODE LAYOUT (Visual Editor Rebuilt)
     ========================================================================= */
  if (isOwner) {
    const filteredCategories = categories.filter((cat) => {
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

    return (
      <div 
        id="menu-editor-root"
        style={{
          "--brand": brandColor,
          "--brand-secondary": brandColorSecondary,
          "--brand-color": brandColor,
          accentColor: brandColor,
        } as React.CSSProperties}
        className={`min-h-screen pb-24 font-sans antialiased transition-colors duration-300 ${
          isDark ? "bg-[#121212] text-[#f5f5f5]" : "bg-[#f2bd11]/5 text-[#2d2d2d]"
        }`}
      >
        {/* FIXED TOP HEADER BAR */}
        <header className="sticky top-0 z-30 shadow-xs px-6 py-4 flex items-center justify-between max-w-[430px] mx-auto bg-[#1b3151] border-b border-white/10 transition-colors duration-300">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all border border-transparent font-bold cursor-pointer bg-white/10 text-white hover:bg-white/20"
          >
            ✕
          </button>
          
          <div className="flex-1 flex justify-center">
            <Image
              src="/logo.png"
              alt="Afromenu"
              width={120}
              height={36}
              priority
              unoptimized
              className="h-9 w-auto brightness-0 invert"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
 
          <div 
            style={{ backgroundColor: brandColor }}
            className="w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-xs shadow-sm uppercase select-none flex-shrink-0"
          >
            {profile?.name ? profile.name[0] : (user?.email ? user.email[0] : "O")}
          </div>
        </header>

        {/* BLUE GUIDE BANNER */}
        {!dismissedGuide && (
          <div className="max-w-[430px] mx-auto px-4 mt-4 animate-slide-up">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-800 text-xs font-semibold flex items-start gap-3 shadow-xs">
              <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <p className="font-extrabold text-[11px] uppercase tracking-wide text-blue-900 mb-0.5">Welcome to your Editor!</p>
                <p className="leading-relaxed">These are custom sample dishes populated to showcase layouts. Edit, adjust pricing, or insert your real recipes!</p>
                <button
                  onClick={handleDismissGuide}
                  className="mt-2.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-750 text-white rounded-lg font-black text-[9px] uppercase tracking-wider transition-all border-0 cursor-pointer"
                >
                  Dismiss Guide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 160PX COVER PHOTO AREA */}
        <div className="max-w-[430px] mx-auto mt-4 px-4">
          <div 
            className="w-full rounded-[24px] relative overflow-hidden shadow-sm" 
            style={{
              height: "160px",
              backgroundImage: establishment.background_url ? `url(${establishment.background_url})` : "linear-gradient(135deg, #1b3151 0%, #2d4a6b 50%, #1b3151 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        </div>

        {/* LOGO + OVERLAPPING INFO CARD */}
        <div className="max-w-[430px] mx-auto px-4 relative -mt-8 mb-6 z-10">
          <div className={`p-6 rounded-[28px] border shadow-md flex flex-col gap-4 relative ${
            isDark ? "bg-[#1e1e1e] border-zinc-800" : "bg-white border-amber-100/30"
          }`}>
            
            {/* Left 48px circle logo */}
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-full border-3 overflow-hidden shadow-sm flex items-center justify-center flex-shrink-0 select-none bg-slate-50 border-white">
                {establishment.logo_url && !ownerLogoError ? (
                  <img 
                    src={establishment.logo_url} 
                    alt={establishment.name} 
                    className="w-full h-full object-cover" 
                    loading="lazy" 
                    onError={() => setOwnerLogoError(true)}
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: brandColor || '#1b3151' }}
                  >
                    {establishment.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className={`font-heading font-black text-base tracking-tight truncate ${
                    isDark ? "text-white" : "text-[#2d2d2d]"
                  }`}>
                    {establishment.name}
                  </h2>
                  <button
                    onClick={() => setIsEstModalOpen(true)}
                    className="p-1 rounded-full text-gray-400 hover:text-[#f2bd11] hover:bg-slate-50 transition-all cursor-pointer border-0 bg-transparent"
                    title="Edit Settings"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {establishment.tagline && (
                  <p className="text-[10px] text-gray-450 italic leading-snug truncate mt-0.5">
                    "{establishment.tagline}"
                  </p>
                )}
              </div>
            </div>

            {/* Grey pin, wifi, phone rows */}
            <div className="flex flex-col gap-1.5 text-[10px] text-gray-400 font-semibold border-t border-gray-100/50 pt-3">
              {establishment.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{establishment.address}</span>
                </div>
              )}
              {establishment.wifi_password && (
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="font-mono">Wi-Fi: {establishment.wifi_password}</span>
                </div>
              )}
              {establishment.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>{establishment.phone}</span>
                </div>
              )}
            </div>

            {/* Gray active social icons linking to active URLs */}
             <div className="flex items-center gap-2 flex-wrap border-t border-gray-100/50 pt-3">
              {socialPlatforms.map((platform) => {
                const dbValue = establishment[platform.key] || establishment[platform.key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())];
                if (!dbValue) return null;
                const finalLink = dbValue.startsWith("http") ? dbValue : `${platform.urlPrefix}${dbValue}`;
                
                return (
                  <a
                    key={platform.key}
                    href={finalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-[#f2bd11]/10 text-gray-400 hover:text-[#f2bd11] flex items-center justify-center transition-all border border-orange-50/50 cursor-pointer"
                    title={platform.key.replace("_url", "")}
                  >
                    {renderSocialIcon(platform.key, "w-3.5 h-3.5")}
                  </a>
                );
              })}
            </div>

          </div>
        </div>

        {/* MAIN BODY CONTAINER */}
        <main className="max-w-[430px] mx-auto px-4 py-2 flex flex-col gap-6">          {/* SECTION PILLS ROW */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider px-4 mb-2">Sections</p>
            
            <div className="flex items-start gap-3 overflow-x-auto pb-3.5 scrollbar-none">
              {/* First '+' button to insert a section at index 0 */}
              <button
                onClick={handleAddSection}
                className="w-9 h-9 rounded-full bg-white hover:bg-[#f2bd11] text-[#f2bd11] hover:text-white flex items-center justify-center shadow-xs flex-shrink-0 transition-all font-black border border-amber-100/40 cursor-pointer"
                title="Add First Section"
              >
                +
              </button>
 
              {orderedSections.length === 0 ? (
                <span className="text-xs text-gray-400 italic py-2">No section pills created yet. Tap + to add.</span>
              ) : (
                orderedSections.map((sec, idx) => {
                  const isSelected = selectedSection === sec;
                  return (
                    <div key={sec} className="group relative flex flex-col items-center gap-2 flex-shrink-0 pb-6">
                      
                      {/* Pill plus its trailing insert button */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedSection(sec)}
                          style={
                            isSelected
                              ? { backgroundColor: 'var(--brand)', borderColor: 'var(--brand)', color: 'var(--brand-secondary)' }
                              : { backgroundColor: 'white', borderColor: 'var(--brand)', color: 'var(--brand)' }
                          }
                          className="px-4.5 py-2.5 text-xs font-black rounded-full transition-all border cursor-pointer shadow-xs hover:opacity-90"
                        >
                          <span>{sec}</span>
                        </button>
                        
                        {/* '+' insert button after this pill */}
                        <button
                          onClick={() => {
                            const name = prompt("Enter new section name to insert after this:");
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
                          className="w-5.5 h-5.5 rounded-full bg-amber-50/50 hover:bg-[#f2bd11] text-[#f2bd11] hover:text-white flex items-center justify-center text-[10px] font-black border border-amber-100/30 transition-all cursor-pointer"
                          title="Insert Section Here"
                        >
                          +
                        </button>
                      </div>
 
                      {/* Pill operations panel below the pill (shows on hover) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 mt-1 justify-center absolute -bottom-2 bg-white border border-gray-150 shadow-md rounded-lg p-1 z-20">
                        <button
                          onClick={() => handleRenameSection(sec)}
                          className="p-1 rounded-md text-slate-500 hover:text-[#f2bd11] hover:bg-slate-50 cursor-pointer transition-colors"
                          title="Rename Section"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(sec)}
                          className="p-1 rounded-md text-red-500 hover:text-red-750 hover:bg-red-50 cursor-pointer transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
 
          {/* SEARCH BAR */}
          <div className="my-1.5 w-full">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 border border-gray-200 shadow-xs relative">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search categories or items..."
                className="flex-1 outline-none text-xs text-gray-650 bg-transparent font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[9px] font-black text-gray-400 hover:text-[#f2bd11] uppercase cursor-pointer border-0 bg-transparent"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ADD CATEGORY BUTTON */}
          <button
            onClick={() => {
              setCategoryToEdit(null);
              setInsertCategoryIndex(null);
              setIsCatModalOpen(true);
            }}
            style={{ backgroundColor: 'var(--brand)', color: 'var(--brand-secondary)' }}
            className="w-full py-4 font-extrabold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border-0 hover:opacity-90"
          >
            <Plus className="w-4.5 h-4.5" style={{ color: 'var(--brand-secondary)' }} />
            <span style={{ color: 'var(--brand-secondary)' }}>Create New Category</span>
          </button>

          {/* CATEGORY CARDS LIST */}
          <section className="flex flex-col gap-2">
            {loading ? (
              <div className="flex flex-col gap-4 w-full">
                <div className="h-40 rounded-3xl bg-gray-250 animate-pulse w-full"></div>
                <div className="h-40 rounded-3xl bg-gray-250 animate-pulse w-full"></div>
                <div className="h-40 rounded-3xl bg-gray-250 animate-pulse w-full"></div>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className={`p-12 text-center rounded-[32px] shadow-xs text-gray-400 flex flex-col items-center border ${
                isDark ? "bg-[#1e1e1e] border-zinc-800" : "bg-white border-orange-50"
              }`}>
                <Utensils className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-xs font-semibold">No category matches found.</p>
              </div>
            ) : (
              filteredCategories.map((cat, catIdx) => {
                const catItems = items.filter((i) => i.category_id === cat.id);
                const displayCategoryName = cat.name + (cat.time_from && cat.time_to ? ` (${formatTime(cat.time_from)} - ${formatTime(cat.time_to)})` : "");

                return (
                  <div key={cat.id} className="flex flex-col gap-2">
                    
                    {/* Category card with 160px cover image, white text overlay, glass actions pill */}
                    <div
                      onClick={() => setExpandedCategoryId(cat.id)}
                      className="h-[160px] rounded-3xl overflow-hidden border border-amber-100/50 relative cursor-pointer transition-all hover:shadow-lg transform active:scale-[0.99] mx-4"
                      style={{
                        backgroundImage: cat.image_url ? `url(${cat.image_url})` : "none",
                        backgroundColor: "#1b3151",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      {/* Dark overlay for readability */}
                      <div className="absolute inset-0 bg-black/45 z-0"></div>

                      {/* Top Right Actions (Glassmorphism Pill) */}
                      <div
                        className="absolute top-4 right-4 flex items-center gap-1 bg-white/15 backdrop-blur-md rounded-full p-1.5 border border-white/10 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleSwapOrder(catIdx, "up")}
                          disabled={catIdx === 0}
                          className="w-7 h-7 rounded-full hover:bg-white/20 text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer border-0 bg-transparent"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5 text-white" />
                        </button>
                        <button
                          onClick={() => handleSwapOrder(catIdx, "down")}
                          disabled={catIdx === filteredCategories.length - 1}
                          className="w-7 h-7 rounded-full hover:bg-white/20 text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer border-0 bg-transparent"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-white" />
                        </button>
                        <div className="w-[1px] h-4 bg-white/20 mx-0.5"></div>
                        <button
                          onClick={() => {
                            setCategoryToEdit(cat);
                            setInsertCategoryIndex(null);
                            setIsCatModalOpen(true);
                          }}
                          className="w-7 h-7 rounded-full hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border-0 bg-transparent"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="w-7 h-7 rounded-full hover:bg-red-500/30 text-white flex items-center justify-center transition-all cursor-pointer border-0 bg-transparent"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Text details centered */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-0 text-center select-none">
                        <h3 className="font-heading font-black text-lg text-white uppercase tracking-wider drop-shadow-md">
                          {displayCategoryName}
                        </h3>
                        <span className="text-[9px] text-white/90 font-black mt-2 bg-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
                          {catItems.length} Dishes • Tap to manage
                        </span>
                      </div>
                    </div>

                    {/* INTER-CARD "+" INSERT BUTTON */}
                    <div className="flex justify-center my-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setCategoryToEdit(null);
                          setInsertCategoryIndex(catIdx + 1);
                          setIsCatModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-full bg-[#f2bd11] hover:bg-[#d4a50e] text-white flex items-center justify-center shadow-md transition-all cursor-pointer font-bold border-2 border-white"
                        title="Insert category here"
                      >
                        +
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </section>

        </main>

        {/* SLIDE-IN ITEMS OVERLAY LIST (Bottom Sheet Drawer) */}
        {expandedCategoryId && (() => {
          const cat = categories.find((c) => c.id === expandedCategoryId);
          if (!cat) return null;
          const catItems = items.filter((i) => i.category_id === cat.id);

          return (
            <div className="fixed inset-0 z-40 flex items-end justify-center">
              {/* Backdrop */}
              <div 
                onClick={() => setExpandedCategoryId(null)} 
                className="absolute inset-0 bg-[#1b3151]/30 backdrop-blur-xs transition-opacity duration-300"
              ></div>

              {/* Bottom Sheet Box */}
              <div className="bg-white rounded-t-[32px] w-full max-w-[430px] p-6 border-t border-amber-100/60 shadow-2xl relative z-10 flex flex-col max-h-[80vh] animate-slide-up">
                
                {/* Drag Indicator handle */}
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>

                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Active Category</span>
                    <h3 className="font-heading font-black text-sm uppercase text-[#1b3151] truncate max-w-[200px]">
                      {cat.name}
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => setExpandedCategoryId(null)}
                    className="w-7 h-7 rounded-full bg-slate-50 text-gray-400 hover:text-gray-650 flex items-center justify-center transition-colors cursor-pointer border-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Create Item Button */}
                <button
                  onClick={() => {
                    setItemToEdit(null);
                    setTargetCategoryIdForItem(cat.id);
                    setIsItemModalOpen(true);
                  }}
                  className="w-full py-3.5 bg-[#f2bd11] hover:bg-[#d4a50e] text-white font-extrabold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider border-0 cursor-pointer mb-4"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add Dish to {cat.name}</span>
                </button>

                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 pb-8">
                  {catItems.length === 0 ? (
                    <div className="text-center py-10 text-xs text-gray-400 italic rounded-2xl border border-dashed border-gray-250">
                      No recipes inside this category yet.
                    </div>
                  ) : (
                    catItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border shadow-xs flex items-center justify-between gap-4 transition-colors ${
                          !item.is_available ? "opacity-50" : ""
                        } bg-[#f2bd11]/5/40 border-orange-50/50`}
                      >
                        {/* Thumb & info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl border border-gray-150 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-xs bg-white">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <Utensils className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="font-extrabold text-xs text-[#2d2d2d] truncate">{item.name}</h5>
                              {item.weight && (
                                <span className="text-[9px] font-bold text-gray-400 font-mono">({item.weight})</span>
                              )}
                            </div>
                            
                            {/* Price tags and discount tags cross-out */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-black text-[#f2bd11]">
                                {establishment.currency_symbol || "$"}
                                {Number(item.price || 0).toFixed(2)}
                              </span>
                              {item.old_price && (
                                <span className="text-[10px] text-gray-450 line-through">
                                  {establishment.currency_symbol || "$"}
                                  {Number(item.old_price).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Controls edit/delete */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setItemToEdit(item);
                              setTargetCategoryIdForItem(cat.id);
                              setIsItemModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#f2bd11] hover:bg-[#f2bd11]/10 transition-colors cursor-pointer border-0 bg-transparent"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          );
        })()}

        {/* FIXED BOTTOM NAVIGATION BAR */}
        <BottomNav
          slug={slug}
          activeTab="edit"
          onOpenEditEstablishment={() => setIsEstModalOpen(true)}
          onOpenAccountSettings={() => setIsAccountModalOpen(true)}
        />

        {/* MODALS */}
        <AddCategoryModal
          isOpen={isCatModalOpen}
          onClose={() => {
            setIsCatModalOpen(false);
            setCategoryToEdit(null);
            setInsertCategoryIndex(null);
          }}
          onSuccess={fetchMenuData}
          establishmentId={establishment.id}
          categoryToEdit={categoryToEdit}
          nextSortOrder={insertCategoryIndex !== null ? insertCategoryIndex : categories.length}
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
              setActiveStyle(establishment.menu_style || "luxury-dark");
              setActiveTheme(establishment.theme || "light");
            }
            setPreviewBrandColor(null);
            setPreviewBrandColorSecondary(null);
          }}
          onSuccess={(updatedEst) => {
            if (updatedEst) {
              console.log("Establishment updated:", updatedEst.name)
              setEstablishment(updatedEst);
              setActiveStyle(updatedEst.menu_style || "luxury-dark");
              setActiveTheme(updatedEst.theme || "light");
              
              // Also update document title
              document.title = updatedEst.name + " - Afromenu"
              
              // Update CSS variables for brand colors
              document.documentElement.style.setProperty(
                '--brand', updatedEst.brand_color || '#f2bd11'
              )
              document.documentElement.style.setProperty(
                '--brand-secondary', updatedEst.brand_color_secondary || '#1b3151'
              )
            }
            setPreviewBrandColor(null);
            setPreviewBrandColorSecondary(null);
            fetchMenuData();
          }}
          establishment={establishment}
          onPreviewThemeChange={(theme) => setActiveTheme(theme)}
          onPreviewStyleChange={(style) => setActiveStyle(style)}
          onPreviewColorChange={(primary, secondary) => {
            setPreviewBrandColor(primary);
            setPreviewBrandColorSecondary(secondary);
          }}
        />

        <AccountSettingsModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
        />
      </div>
    );
  }

  /* =========================================================================
     2. GUEST / CUSTOMER MENU VIEW (Public digital menu style router)
     ========================================================================= */
  const menuStyle = establishment.menu_style || 'luxury-dark';

  if (!isOwner) {
    // Customer view
    if (menuStyle === 'luxury-dark') {
      return <LuxuryDarkMenu establishment={establishment} categories={categories} items={items} />;
    }
    // Future styles will be added here
    return <LuxuryDarkMenu establishment={establishment} categories={categories} items={items} />;
  }

  // Fallback (should not be hit because isOwner returns early)
  return <LuxuryDarkMenu establishment={establishment} categories={categories} items={items} />;
}
