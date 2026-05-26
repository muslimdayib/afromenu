"use client";

import React, { useState, useEffect } from "react";
import { MENU_STYLES } from "@/lib/menu-styles";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import {
  X,
  Upload,
  Palette,
  Image as ImageIcon,
  Loader2,
  Coins,
  Globe,
  Wifi,
  Phone,
  Check,
  User,
  Link as LinkIcon,
  Star,
  MapPin,
  MessageSquare,
  Sparkles,
  Info
} from "lucide-react";

interface EditEstablishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedEstablishment?: any) => void;
  onUpdate?: (updatedEstablishment?: any) => void;
  establishment: {
    id: string;
    name: string;
    currency: string;
    currency_symbol: string;
    language: string;
    theme: "light" | "dark";
    brand_color: string;
    brand_color_secondary?: string | null;
    logo_url: string | null;
    background_url: string | null;
    wifi_password: string | null;
    phone: string | null;
    menu_style?: string | null;
    tagline?: string | null;
    address?: string | null;
    website_url?: string | null;
    instagram_url?: string | null;
    tiktok_url?: string | null;
    facebook_url?: string | null;
    twitter_url?: string | null;
    snapchat_url?: string | null;
    whatsapp?: string | null;
    google_review?: string | null;
    tripadvisor_url?: string | null;
    show_reviews?: boolean | null;
    review_style?: string | null;
  };
  onPreviewThemeChange?: (theme: "light" | "dark") => void;
  onPreviewStyleChange?: (style: string) => void;
  onPreviewColorChange?: (primary: string, secondary: string) => void;
}

const CURRENCIES = [
  { name: "Somali Shilling", symbol: "Sh" },
  { name: "US Dollar", symbol: "$" },
  { name: "Euro", symbol: "€" },
  { name: "British Pound", symbol: "£" },
  { name: "Kenyan Shilling", symbol: "KSh" },
  { name: "Ethiopian Birr", symbol: "Br" },
  { name: "UAE Dirham", symbol: "د.إ" },
  { name: "Saudi Riyal", symbol: "ر.س" },
  { name: "Turkish Lira", symbol: "₺" },
];

const LANGUAGES = ["English", "Somali", "Arabic", "French", "Spanish", "Turkish", "Swahili"];

const BG_PRESETS = [
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60",
];

const SECTIONS = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "media", label: "Media & Banners", icon: ImageIcon },
  { id: "contact", label: "Contact & Info", icon: MapPin },
  { id: "socials", label: "Social Links", icon: LinkIcon },
  { id: "reviews", label: "Reviews & Star Ratings", icon: Star },
];

export default function EditEstablishmentModal({
  isOpen,
  onClose,
  onSuccess,
  onUpdate,
  establishment,
  onPreviewThemeChange,
  onPreviewStyleChange,
  onPreviewColorChange,
}: EditEstablishmentModalProps) {
  const [activeTab, setActiveTab] = useState("basic");

  // Basic Info
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [language, setLanguage] = useState("");

  // Branding
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [brandColor, setBrandColor] = useState("#f2bd11");
  const [brandColorSecondary, setBrandColorSecondary] = useState("#1b3151");
  const [menuStyle, setMenuStyle] = useState("luxury-dark");
  const [reviewStyle, setReviewStyle] = useState("stars");

  // Media
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);

  // Contact & Info
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Social Links
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [snapchatUrl, setSnapchatUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Reviews
  const [showReviews, setShowReviews] = useState(false);
  const [googleReview, setGoogleReview] = useState("");
  const [tripadvisorUrl, setTripadvisorUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState<boolean | null>(null);
  const [bgUploadSuccess, setBgUploadSuccess] = useState<boolean | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);
  const [savedCheck, setSavedCheck] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Modal establishment:", establishment?.id);
    if (establishment) {
      setName(establishment.name || "");
      setTheme(establishment.theme || "light");
      setBrandColor(establishment.brand_color || (establishment as any).brandColor || "#f2bd11");
      setBrandColorSecondary(establishment.brand_color_secondary || (establishment as any).brandColorSecondary || "#1b3151");
      setMenuStyle(establishment.menu_style || "luxury-dark");
      setCurrency(establishment.currency || "Somali Shilling");
      setCurrencySymbol(establishment.currency_symbol || "Sh");
      setLanguage(establishment.language || "Somali");
      setWifiPassword(establishment.wifi_password || "");
      setPhone(establishment.phone || "");
      setLogoPreview(establishment.logo_url);
      setBgPreview(establishment.background_url);

      // 13 New Fields
      const est = establishment as any;
      setTagline(est.tagline || "");
      setAddress(est.address || "");
      setWebsiteUrl(est.website_url || est.websiteUrl || "");
      setInstagramUrl(est.instagram_url || est.instagramUrl || "");
      setTiktokUrl(est.tiktok_url || est.tiktokUrl || "");
      setFacebookUrl(est.facebook_url || est.facebookUrl || "");
      setTwitterUrl(est.twitter_url || est.twitterUrl || "");
      setSnapchatUrl(est.snapchat_url || est.snapchatUrl || "");
      setWhatsapp(est.whatsapp || "");
      setGoogleReview(est.google_review || est.googleReview || "");
      setTripadvisorUrl(est.tripadvisor_url || est.tripadvisorUrl || "");
      setShowReviews(!!(est.show_reviews ?? est.showReviews));
      setReviewStyle(est.review_style || est.reviewStyle || "stars");
    }
    setSavedCheck(false);
    setLoading(false);
  }, [establishment, isOpen]);

  useEffect(() => {
    const initBuckets = async () => {
      try {
        await supabase.storage.createBucket("logos", { public: true });
        await supabase.storage.createBucket("covers", { public: true });
        await supabase.storage.createBucket("items", { public: true });
        console.log("Supabase storage buckets checked/created successfully.");
      } catch (err) {
        console.warn("Storage bucket auto-creation note:", err);
      }
    };
    if (isOpen) {
      initBuckets();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const uploadToSupabase = async (
    file: File, 
    bucket: string
  ): Promise<string> => {
    console.log("=== UPLOADING to bucket:", bucket, "via Server API ===")
    console.log("File:", file.name, file.size, file.type)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errText = await response.text()
      console.error("Upload server response error:", errText)
      throw new Error(`Upload failed: ${errText}`)
    }
    
    const data = await response.json()
    console.log("Upload success, url:", data.url)
    return data.url
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    console.log("Logo file selected:", file.name)
    setLogoUploadSuccess(null)
    setLogoUploadError(null)
    
    // Show preview immediately
    const preview = URL.createObjectURL(file)
    setLogoPreview(preview)
    
    try {
      setLogoUploading(true)
      const url = await uploadToSupabase(file, 'logos')
      setLogoPreview(url)
      setLogoUploadSuccess(true)
      console.log("Logo URL saved to form:", url)
    } catch (err: any) {
      console.error("Logo upload failed:", err.message)
      setLogoUploadError(err.message)
      setLogoUploadSuccess(false)
      alert("Logo upload failed: " + err.message)
    } finally {
      setLogoUploading(false)
    }
  }

  const handleBgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    console.log("Cover file selected:", file.name)
    setBgUploadSuccess(null)
    setBgUploadError(null)
    
    const preview = URL.createObjectURL(file)
    setBgPreview(preview)
    
    try {
      setBgUploading(true)
      const url = await uploadToSupabase(file, 'covers')
      setBgPreview(url)
      setBgUploadSuccess(true)
      console.log("Cover URL saved to form:", url)
    } catch (err: any) {
      console.error("Cover upload failed:", err.message)
      setBgUploadError(err.message)
      setBgUploadSuccess(false)
      alert("Cover upload failed: " + err.message)
    } finally {
      setBgUploading(false)
    }
  }

  const selectBgPreset = (url: string) => {
    setBgFile(null);
    setBgPreview(url);
    setBgUploadSuccess(null);
    setBgUploadError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // prevent double clicks
    setLoading(true);
    setError(null);
    setSavedCheck(false);

    try {
      // Log what we have
      console.log("establishment.id:", establishment?.id);
      if (!establishment?.id) {
        throw new Error("No establishment ID found");
      }

      console.log("Saving to:", `/api/establishments/${establishment.id}`);
      console.log("Method: PUT");
      console.log("Establishment ID:", establishment.id);

      const payload: any = {
        name: name?.trim(),
        brand_color: brandColor,
        brand_color_secondary: brandColorSecondary,
        currency: currency,
        currency_symbol: currencySymbol,
        language: language,
        wifi_password: wifiPassword?.trim() || null,
        phone: phone?.trim() || null,
        logo_url: logoPreview || null,
        background_url: bgPreview || null,
        theme: theme,
        tagline: tagline?.trim() || null,
        address: address?.trim() || null,
        website_url: websiteUrl?.trim() || null,
        instagram_url: instagramUrl?.trim() || null,
        tiktok_url: tiktokUrl?.trim() || null,
        facebook_url: facebookUrl?.trim() || null,
        twitter_url: twitterUrl?.trim() || null,
        snapchat_url: snapchatUrl?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        google_review: googleReview?.trim() || null,
        tripadvisor_url: tripadvisorUrl?.trim() || null,
        show_reviews: showReviews,
        review_style: reviewStyle,
        menu_style: menuStyle,
      };

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) delete payload[key];
      });

      console.log("=== FINAL PAYLOAD ===", payload);

      const response = await fetch(
        `/api/establishments/${establishment.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        }
      );

      const rawText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response text:", rawText);

      if (!response.ok) {
        throw new Error(`Server error ${response.status}: ${rawText}`);
      }

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Server returned: " + rawText.slice(0, 200));
      }

      console.log("=== SAVED SUCCESSFULLY ===", data);
      const updated = data.establishment || data;

      // Update parent immediately
      if (onSuccess) onSuccess(updated);
      if (onUpdate) onUpdate(updated);

      setSavedCheck(true);

      // Show success toast
      toast.success("Settings saved!");

      // Close modal after short delay
      setTimeout(() => onClose(), 500);

    } catch (err: any) {
      console.error("=== SAVE ERROR ===", err.message);
      toast.error(err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1b3151]/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="bg-white rounded-[32px] max-w-4xl w-full p-0 border border-gray-100 relative z-10 shadow-2xl animate-slide-up overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 bg-[#f2bd11]/5/80 border-b md:border-b-0 md:border-r border-amber-100/50 p-6 flex flex-col justify-between flex-shrink-0">
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div>
              <h4 className="font-heading font-black text-lg text-[#1b3151]">Settings</h4>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Customize your digital experience</p>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isSelected = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveTab(sec.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer text-left border ${
                      isSelected
                        ? "bg-[#f2bd11] border-[#f2bd11] text-white shadow-sm font-extrabold"
                        : "bg-white/50 border-amber-100/30 text-gray-650 hover:bg-[#f2bd11]/5 hover:text-[#f2bd11]"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isSelected ? "text-white" : "text-gray-400"}`} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick instructions / Help */}
          <div className="hidden md:flex items-start gap-2.5 p-3.5 bg-white/70 border border-amber-100/50 rounded-2xl text-[10px] text-gray-500 leading-normal">
            <Info className="w-4 h-4 text-[#f2bd11] flex-shrink-0 mt-0.5" />
            <span>Changes made are saved when clicking the "Save Settings" button at the bottom.</span>
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white">
          {/* Header row */}
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-[#f2bd11] tracking-widest">
                {SECTIONS.find(s => s.id === activeTab)?.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#1b3151] transition-colors p-1.5 rounded-full hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-8">
            {error && (
              <div className="p-4 mb-6 rounded-2xl bg-red-50 border border-red-105 text-red-650 text-xs font-semibold animate-shake">
                {error}
              </div>
            )}

            <form id="establishment-settings-form" onSubmit={handleSave} className="flex flex-col gap-6">
              
              {/* TAB 1: BASIC INFO */}
              {activeTab === "basic" && (
                <div className="flex flex-col gap-5 animate-slide-up">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Establishment Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Castelo Gourmet Cafe"
                      required
                      className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold shadow-xs transition-all"
                    />
                  </div>

                  {/* Language */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Primary Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] font-semibold bg-white transition-all cursor-pointer"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  {/* Currencies */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Currency Type
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => {
                          setCurrency(e.target.value);
                          const found = CURRENCIES.find((c) => c.name === e.target.value);
                          if (found) setCurrencySymbol(found.symbol);
                        }}
                        className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] font-semibold bg-white transition-all cursor-pointer"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Currency Symbol
                      </label>
                      <input
                        type="text"
                        value={currencySymbol}
                        onChange={(e) => setCurrencySymbol(e.target.value)}
                        placeholder="e.g. $ or Sh"
                        required
                        className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BRANDING & CUSTOM STYLE PREVIEW */}
              {activeTab === "branding" && (
                <div className="flex flex-col gap-6 animate-slide-up">
                  {/* Theme & Brand Colors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Color Theme
                      </label>
                      <select
                        value={theme}
                        onChange={(e) => {
                          const val = e.target.value as "light" | "dark";
                          setTheme(val);
                          if (onPreviewThemeChange) onPreviewThemeChange(val);
                        }}
                        className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] font-semibold bg-white transition-all cursor-pointer"
                      >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Brand Accent (Primary)
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl border border-gray-150 flex-shrink-0 transition-transform shadow-xs"
                          style={{ backgroundColor: brandColor }}
                        ></div>
                        <input
                          type="color"
                          value={brandColor}
                          onChange={(e) => {
                            const newColor = e.target.value
                            console.log("Primary color changed to:", newColor)
                            setBrandColor(newColor)
                            
                            // Apply to page IMMEDIATELY via CSS variable
                            document.documentElement.style.setProperty('--brand', newColor)
                            
                            // Also update the menu page behind the modal
                            const menuPage = document.getElementById('menu-editor-root')
                            if (menuPage) {
                              menuPage.style.setProperty('--brand', newColor)
                            }
                            
                            if (onPreviewColorChange) onPreviewColorChange(newColor, brandColorSecondary)
                          }}
                          className="w-full h-11 rounded-2xl cursor-pointer bg-transparent border border-orange-50 p-1.5 focus:outline-none focus:border-[#f2bd11]"
                        />
                        <span className="font-mono text-xs font-black text-gray-400 uppercase">{brandColor}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Brand Accent (Secondary)
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl border border-gray-150 flex-shrink-0 transition-transform shadow-xs"
                          style={{ backgroundColor: brandColorSecondary }}
                        ></div>
                        <input
                          type="color"
                          value={brandColorSecondary}
                          onChange={(e) => {
                            const newColor = e.target.value
                            console.log("Secondary color changed to:", newColor)
                            setBrandColorSecondary(newColor)
                            
                            // Apply to page IMMEDIATELY via CSS variable
                            document.documentElement.style.setProperty('--brand-secondary', newColor)
                            
                            // Also update the menu page behind the modal
                            const menuPage = document.getElementById('menu-editor-root')
                            if (menuPage) {
                              menuPage.style.setProperty('--brand-secondary', newColor)
                            }
                            
                            if (onPreviewColorChange) onPreviewColorChange(brandColor, newColor)
                          }}
                          className="w-full h-11 rounded-2xl cursor-pointer bg-transparent border border-orange-50 p-1.5 focus:outline-none focus:border-[#f2bd11]"
                        />
                        <span className="font-mono text-xs font-black text-gray-400 uppercase">{brandColorSecondary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review style */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Reviews Widget Visual Style
                    </label>
                    <select
                      value={reviewStyle}
                      onChange={(e) => setReviewStyle(e.target.value)}
                      className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] font-semibold bg-white transition-all cursor-pointer"
                    >
                      <option value="stars">5-Star Gold Ratings</option>
                      <option value="badges">Minimal Badges & Count</option>
                      <option value="compact">Compact text summary (e.g. 4.9/5)</option>
                    </select>
                  </div>

                  {/* Layout selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Menu Style Layouts</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      {MENU_STYLES.map(style => (
                        <div
                          key={style.id}
                          onClick={() => {
                            if (style.isAvailable) {
                              setMenuStyle(style.id);
                              if (onPreviewStyleChange) onPreviewStyleChange(style.id);
                            }
                          }}
                          style={{
                            border: menuStyle === style.id 
                              ? '2px solid #f2bd11' 
                              : '1px solid #e2e8f0',
                            borderRadius: 12,
                            padding: 12,
                            cursor: style.isAvailable ? 'pointer' : 'not-allowed',
                            opacity: style.isAvailable ? 1 : 0.5,
                            position: 'relative',
                            backgroundColor: 'white',
                          }}
                        >
                          {!style.isAvailable && (
                            <span style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              fontSize: 10,
                              background: '#1b3151',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: 99,
                            }}>
                              Soon
                            </span>
                          )}
                          {menuStyle === style.id && (
                            <span style={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              fontSize: 10,
                              background: '#f2bd11',
                              color: '#1b3151',
                              padding: '2px 6px',
                              borderRadius: 99,
                              fontWeight: 700,
                            }}>
                              Active
                            </span>
                          )}
                          <div style={{
                            height: 80,
                            background: style.id === 'luxury-dark' 
                              ? 'linear-gradient(135deg, #0a0a0b 0%, #1a1a1f 100%)'
                              : '#f0f0f0',
                            borderRadius: 8,
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {style.id === 'luxury-dark' && (
                              <span style={{ color: '#dac063', fontSize: 20 }}>✦</span>
                            )}
                            {!style.isAvailable && (
                              <span style={{ color: '#999', fontSize: 12 }}>?</span>
                            )}
                          </div>
                          <p style={{ 
                            fontSize: 13, 
                            fontWeight: 600, 
                            margin: 0,
                            color: '#1b3151'
                          }}>
                            {style.name}
                          </p>
                          <p style={{ 
                            fontSize: 11, 
                            color: '#6b7280', 
                            margin: '4px 0 0' 
                          }}>
                            {style.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LIVE PREVIEW CARD */}
                  <div className="mt-2 p-4.5 border border-dashed border-amber-100 rounded-3xl bg-[#f2bd11]/5/20">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-3">Live Branding Preview</span>
                    <div className={`p-5 rounded-2xl shadow-md max-w-sm mx-auto border transition-colors ${theme === "dark" ? "bg-[#121212] border-zinc-800 text-white" : "bg-white border-gray-100 text-[#2d2d2d]"}`}>
                      
                      {/* Mini Cover */}
                      <div className="h-14 rounded-xl relative overflow-hidden flex items-center justify-center" style={{
                        backgroundImage: bgPreview 
                          ? `url(${bgPreview})` 
                          : `linear-gradient(135deg, ${brandColor} 0%, ${brandColorSecondary} 100%)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }}>
                        <div className="absolute inset-0 bg-black/10"></div>
                      </div>

                      {/* Mini Logo and Title */}
                      <div className="flex items-center gap-2 mt-3 pl-2">
                        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow bg-slate-50 flex items-center justify-center -mt-6 z-10">
                          {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" /> : <span className="text-xs font-bold">🍔</span>}
                        </div>
                        <div>
                          <h6 className="text-[10px] font-black tracking-tight">{name || "Castelo Gourmet"}</h6>
                          <span className="text-[7px] text-gray-400 font-bold block leading-none">Primary: {language}</span>
                        </div>
                      </div>

                      {/* Mini Items Layout */}
                      <div className="mt-4 border-t border-gray-100/50 pt-3">
                        <span className="text-[7px] font-black uppercase text-gray-400 tracking-wider">Our Dishes</span>
                        <div className="flex flex-col gap-1.5 mt-2 p-2 rounded-xl bg-neutral-900 border border-amber-500/10 text-white">
                          <div className="flex items-center justify-between text-[8px] font-bold pb-1 border-b border-zinc-800">
                            <span className="text-zinc-200">✦ Avocado toast</span>
                            <span style={{ color: '#dac063' }}>{currencySymbol}12.00</span>
                          </div>
                          <div className="flex items-center justify-between text-[8px] font-bold">
                            <span className="text-zinc-200">✦ Waffle syrup</span>
                            <span style={{ color: '#dac063' }}>{currencySymbol}8.50</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA & BANNERS */}
              {activeTab === "media" && (
                <div className="flex flex-col gap-6 animate-slide-up">
                  {/* Logo Upload */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Logo Image
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-18 h-18 rounded-3xl bg-gray-50 border border-orange-50 overflow-hidden flex items-center justify-center flex-shrink-0 relative shadow-sm">
                        {logoUploading ? (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                            <Loader2 className="w-6 h-6 animate-spin text-[#f2bd11]" />
                          </div>
                        ) : null}
                        
                        {logoUploadSuccess === true && (
                          <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 z-20 border border-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white stroke-[4px]" />
                          </div>
                        )}
                        {logoUploadSuccess === false && (
                          <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 z-20 border border-white flex items-center justify-center" title={logoUploadError || "Upload failed"}>
                            <span className="text-[7px] font-black leading-none px-0.5">✕</span>
                          </div>
                        )}

                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-7 h-7 text-gray-300" />
                        )}
                      </div>
                      <div className="relative border border-dashed border-gray-300 hover:border-[#f2bd11] p-4 rounded-2xl text-center cursor-pointer transition-all flex-1 flex flex-col justify-center items-center h-18 bg-[#f8f9fa]">
                        {logoUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#1b3151] mb-1" />
                            <span className="text-[10px] font-black text-[#1b3151]">Uploading Logo...</span>
                          </>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              disabled={logoUploading}
                            />
                            <Upload className="w-4.5 h-4.5 text-[#1b3151] mb-1" />
                            <span className="text-[10px] font-black text-[#1b3151]">Upload Custom Logo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Banner Photo Upload */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Background Banner Cover (Customer Public View)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative border border-dashed border-gray-300 hover:border-[#f2bd11] p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[110px] bg-[#f8f9fa]">
                        {bgUploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-[#1b3151] mb-1.5" />
                            <span className="text-[10px] font-black text-[#1b3151]">Uploading Cover...</span>
                          </>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBgChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              disabled={bgUploading}
                            />
                            <Upload className="w-5 h-5 text-[#1b3151] mb-1.5" />
                            <span className="text-[10px] font-black text-[#1b3151]">Upload Custom Banner</span>
                          </>
                        )}
                      </div>

                      <div className="border border-orange-50 rounded-2xl h-[110px] bg-slate-50 flex items-center justify-center overflow-hidden relative shadow-inner">
                        {bgUploading ? (
                          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 px-4">
                            <Loader2 className="w-6 h-6 animate-spin text-[#f2bd11] mb-2" />
                            <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                              <div className="bg-[#f2bd11] h-full animate-pulse w-3/4"></div>
                            </div>
                            <span className="text-[8px] font-black text-gray-500 mt-1 uppercase tracking-wider">Uploading Banner...</span>
                          </div>
                        ) : null}

                        {bgUploadSuccess === true && (
                          <div className="absolute top-2 left-2 bg-emerald-500 text-white rounded-full p-1 z-20 border border-white flex items-center gap-1 shadow-sm px-2 py-0.5">
                            <Check className="w-2.5 h-2.5 text-white stroke-[4px]" />
                            <span className="text-[7px] font-black uppercase tracking-wider">Success</span>
                          </div>
                        )}
                        {bgUploadSuccess === false && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 z-20 border border-white flex items-center gap-1 shadow-sm px-2 py-0.5" title={bgUploadError || "Upload failed"}>
                            <span className="text-[7px] font-black uppercase tracking-wider">✕ Failed</span>
                          </div>
                        )}

                        {bgPreview ? (
                          <>
                            <img src={bgPreview} alt="Background Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setBgPreview(null);
                                setBgFile(null);
                                setBgUploadSuccess(null);
                                setBgUploadError(null);
                              }}
                              className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black transition-colors shadow-sm"
                              disabled={bgUploading}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="text-gray-405 text-xs font-bold flex flex-col items-center gap-1">
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                            <span>No banner loaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Banner Presets */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Professional Background Presets
                    </span>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                      {BG_PRESETS.map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectBgPreset(presetUrl)}
                          className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-[#f2bd11] focus:outline-none transition-all shadow-sm"
                        >
                          <img src={presetUrl} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CONTACT & DETAILS */}
              {activeTab === "contact" && (
                <div className="flex flex-col gap-5 animate-slide-up">
                  {/* Tagline */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Tagline / Welcome Catchphrase
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Delicious recipes served since 2005"
                      className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold"
                    />
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Full Address Location
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Km4 Street, Mogadishu, Somalia"
                      className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Contact Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +252 61 5000000"
                      className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-mono font-semibold"
                    />
                  </div>

                  {/* WiFi */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Table Wi-Fi Password
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="e.g. GuestCafe2026"
                      className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-mono font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: SOCIAL LINKS */}
              {activeTab === "socials" && (
                <div className="flex flex-col gap-4 animate-slide-up">
                  {/* Website */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Website Link
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="e.g. https://castelocafe.com"
                      className="w-full px-4.5 py-3 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Instagram Handle or URL
                    </label>
                    <input
                      type="text"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="e.g. castelocafe"
                      className="w-full px-4.5 py-3 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      TikTok Handle or URL
                    </label>
                    <input
                      type="text"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      placeholder="e.g. castelocafe_tiktok"
                      className="w-full px-4.5 py-3 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold"
                    />
                  </div>

                  {/* Facebook */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Facebook URL
                    </label>
                    <input
                      type="text"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="e.g. castelocafemax"
                      className="w-full px-4.5 py-3 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold"
                    />
                  </div>

                  {/* Twitter/X */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Twitter/X Handle
                    </label>
                    <input
                      type="text"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="e.g. castelocafe"
                      className="w-full px-4.5 py-3 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold"
                    />
                  </div>

                  {/* Snapchat */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Snapchat Handle
                    </label>
                    <input
                      type="text"
                      value={snapchatUrl}
                      onChange={(e) => setSnapchatUrl(e.target.value)}
                      placeholder="e.g. castelosnap"
                      className="w-full px-4.5 py-3 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      WhatsApp Business Link / Number
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="e.g. +252615000000"
                      className="w-full px-4.5 py-3 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-mono font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: REVIEWS & RATING WIDGETS */}
              {activeTab === "reviews" && (
                <div className="flex flex-col gap-5 animate-slide-up">
                  {/* Toggle Show Reviews */}
                  <div className="flex items-center justify-between p-4.5 bg-[#f2bd11]/5/20 border border-amber-100 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-[#1b3151] block">Show Social Reviews Widgets</span>
                      <span className="text-[9px] text-gray-400 font-semibold mt-0.5 block leading-normal">Display Tripadvisor and Google ratings below your digital menu.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReviews(!showReviews)}
                      className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-all duration-300 ${
                        showReviews ? "bg-[#f2bd11] justify-end" : "bg-gray-200 justify-start"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
                    </button>
                  </div>

                  {/* Google Reviews */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Google Review Link / Place ID
                    </label>
                    <input
                      type="text"
                      value={googleReview}
                      onChange={(e) => setGoogleReview(e.target.value)}
                      placeholder="e.g. https://g.page/r/your-restaurant-id/review"
                      className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold"
                    />
                  </div>

                  {/* TripAdvisor */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      TripAdvisor Review URL
                    </label>
                    <input
                      type="text"
                      value={tripadvisorUrl}
                      onChange={(e) => setTripadvisorUrl(e.target.value)}
                      placeholder="e.g. https://www.tripadvisor.com/Restaurant_Review..."
                      className="w-full px-4.5 py-3.5 rounded-2xl border border-orange-50 focus:border-[#f2bd11] focus:outline-none text-xs text-[#2d2d2d] placeholder:text-gray-400 font-semibold"
                    />
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="px-8 py-5 border-t border-gray-100 flex items-center gap-3 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border border-gray-200 text-gray-400 hover:bg-slate-50 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-colors flex-shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="establishment-settings-form"
              disabled={loading}
              className="flex-1 py-3.5 bg-[#f2bd11] hover:bg-[#d4a50e] disabled:bg-gray-300 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : savedCheck ? (
                <div className="flex items-center gap-1.5">
                  <Check className="w-4.5 h-4.5 text-white" />
                  <span>Saved & Synced!</span>
                </div>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
