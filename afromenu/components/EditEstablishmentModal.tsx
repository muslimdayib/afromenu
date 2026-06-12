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
  Check,
  User,
  Link as LinkIcon,
  Star,
  MapPin,
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
  { id: "reviews", label: "Reviews", icon: Star },
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
  const [brandColor, setBrandColor] = useState("#dac063");
  const [brandColorSecondary, setBrandColorSecondary] = useState("#1b3151");
  const [menuStyle, setMenuStyle] = useState("luxury-dark");
  const [reviewStyle, setReviewStyle] = useState("stars");

  // Media
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
  const [savedCheck, setSavedCheck] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (establishment) {
      setName(establishment.name || "");
      setTheme(establishment.theme || "dark");
      setBrandColor(establishment.brand_color || (establishment as any).brandColor || "#dac063");
      setBrandColorSecondary(establishment.brand_color_secondary || (establishment as any).brandColorSecondary || "#1b3151");
      setMenuStyle(establishment.menu_style || "luxury-dark");
      setCurrency(establishment.currency || "Somali Shilling");
      setCurrencySymbol(establishment.currency_symbol || "Sh");
      setLanguage(establishment.language || "English");
      setWifiPassword(establishment.wifi_password || "");
      setPhone(establishment.phone || "");
      setLogoPreview(establishment.logo_url);
      setBgPreview(establishment.background_url);

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

  if (!isOpen) return null;

  const uploadToSupabase = async (file: File, bucket: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload failed: ${errText}`);
    }
    
    const data = await response.json();
    return data.url;
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLogoUploading(true);
      const url = await uploadToSupabase(file, 'logos');
      setLogoPreview(url);
      toast.success("Logo uploaded!");
    } catch (err: any) {
      console.error(err);
      toast.error("Logo upload failed: " + err.message);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleBgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBgUploading(true);
      const url = await uploadToSupabase(file, 'covers');
      setBgPreview(url);
      toast.success("Cover uploaded!");
    } catch (err: any) {
      console.error(err);
      toast.error("Cover upload failed: " + err.message);
    } finally {
      setBgUploading(false);
    }
  };

  const selectBgPreset = (url: string) => {
    setBgPreview(url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setSavedCheck(false);

    try {
      const payload: any = {
        name: name?.trim(),
        brand_color: brandColor,
        brand_color_secondary: brandColorSecondary,
        currency,
        currency_symbol: currencySymbol,
        language,
        wifi_password: wifiPassword?.trim() || null,
        phone: phone?.trim() || null,
        logo_url: logoPreview || null,
        background_url: bgPreview || null,
        theme,
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

      const response = await fetch(`/api/establishments/${establishment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const updated = data.establishment || data;

      if (onSuccess) onSuccess(updated);
      if (onUpdate) onUpdate(updated);

      setSavedCheck(true);
      toast.success("Settings saved!");
      setTimeout(() => onClose(), 500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Save failed");
      toast.error(err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
    display: 'block',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '14px 16px',
    color: 'white',
    fontSize: 15,
    outline: 'none',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div style={{
        background: '#13131a',
        border: '1px solid rgba(218,192,99,0.15)',
        borderRadius: '24px 24px 0 0',
        width: '100%',
        maxWidth: 430,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 24,
        position: 'relative',
        color: 'white',
      }} className="relative z-10 shadow-2xl animate-slide-up flex flex-col">
        
        {/* Header */}
        <div className="pb-4 border-b border-white/10 flex items-center justify-between mb-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-heading font-black text-xl text-white tracking-tight">Settings</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Customize your digital experience</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)' }}
            className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-white/10 scrollbar-none">
          {SECTIONS.map((sec) => {
            const isSelected = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveTab(sec.id)}
                style={isSelected ? { background: '#dac063', color: '#0a0a0b' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer uppercase tracking-wider"
              >
                {sec.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-4 mb-4 rounded-xl text-red-400 text-xs font-bold animate-shake" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {error}
          </div>
        )}

        <form id="establishment-settings-form" onSubmit={handleSave} className="flex flex-col gap-5 pb-4">
          
          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <div className="flex flex-col gap-4 animate-slide-up">
              <div>
                <label style={labelStyle}>Establishment Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Castelo Gourmet Cafe"
                  required
                  style={inputStyle}
                  className="font-bold focus:border-[#dac063]"
                />
              </div>

              <div>
                <label style={labelStyle}>Primary Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={inputStyle}
                  className="font-bold focus:border-[#dac063] bg-[#13131a] cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      const found = CURRENCIES.find((c) => c.name === e.target.value);
                      if (found) setCurrencySymbol(found.symbol);
                    }}
                    style={inputStyle}
                    className="font-bold focus:border-[#dac063] bg-[#13131a] cursor-pointer"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="e.g. $"
                    required
                    style={inputStyle}
                    className="font-bold focus:border-[#dac063]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING */}
          {activeTab === "branding" && (
            <div className="flex flex-col gap-4 animate-slide-up">
              <div>
                <label style={labelStyle}>Color Theme</label>
                <select
                  value={theme}
                  onChange={(e) => {
                    const val = e.target.value as "light" | "dark";
                    setTheme(val);
                    if (onPreviewThemeChange) onPreviewThemeChange(val);
                  }}
                  style={inputStyle}
                  className="font-bold focus:border-[#dac063] bg-[#13131a] cursor-pointer"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Brand Accent (Primary)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => {
                        setBrandColor(e.target.value);
                        if (onPreviewColorChange) onPreviewColorChange(e.target.value, brandColorSecondary);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-white/50">{brandColor}</span>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Brand Accent (Secondary)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandColorSecondary}
                      onChange={(e) => {
                        setBrandColorSecondary(e.target.value);
                        if (onPreviewColorChange) onPreviewColorChange(brandColor, e.target.value);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-white/50">{brandColorSecondary}</span>
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Reviews Widget Style</label>
                <select
                  value={reviewStyle}
                  onChange={(e) => setReviewStyle(e.target.value)}
                  style={inputStyle}
                  className="font-bold focus:border-[#dac063] bg-[#13131a] cursor-pointer"
                >
                  <option value="stars">5-Star Gold Ratings</option>
                  <option value="badges">Minimal Badges</option>
                  <option value="compact">Compact summary</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Menu Style Layout</label>
                <div className="grid grid-cols-1 gap-2">
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
                        border: menuStyle === style.id ? '2px solid #dac063' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        padding: 12,
                        cursor: style.isAvailable ? 'pointer' : 'not-allowed',
                        opacity: style.isAvailable ? 1 : 0.5,
                        background: 'rgba(255,255,255,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-white">{style.name}</span>
                        <span className="text-[9px] text-white/40">{style.description}</span>
                      </div>
                      {menuStyle === style.id && <span className="text-[9px] bg-[#dac063] text-[#0a0a0b] px-2 py-0.5 rounded font-black uppercase">Active</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA */}
          {activeTab === "media" && (
            <div className="flex flex-col gap-4 animate-slide-up">
              <div>
                <label style={labelStyle}>Logo Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative border-2 border-dashed border-white/10 hover:border-[#dac063]/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[90px] w-[90px] bg-white/[0.02] flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {logoUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-[#dac063]" />}
                  </div>
                  {logoPreview && (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.01]">
                      <img src={logoPreview} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Background Banner / Cover</label>
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative border-2 border-dashed border-white/10 hover:border-[#dac063]/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[90px] w-[90px] bg-white/[0.02] flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBgChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {bgUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-[#dac063]" />}
                  </div>
                  {bgPreview && (
                    <div className="w-24 h-16 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.01]">
                      <img src={bgPreview} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <span className="block text-[8px] font-black text-white/30 uppercase tracking-wider mb-2">Or select a banner preset</span>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {BG_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectBgPreset(p)}
                        className="w-12 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-[#dac063] focus:outline-none transition-all"
                      >
                        <img src={p} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT & INFO */}
          {activeTab === "contact" && (
            <div className="flex flex-col gap-4 animate-slide-up">
              <div>
                <label style={labelStyle}>Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Fresh Italian Pasta & Pizza"
                  style={inputStyle}
                  className="font-bold focus:border-[#dac063]"
                />
              </div>

              <div>
                <label style={labelStyle}>Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Street 15, Mogadishu"
                  style={inputStyle}
                  className="font-bold focus:border-[#dac063]"
                />
              </div>

              <div>
                <label style={labelStyle}>Wi-Fi Password</label>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="SSID password for dining room guests"
                  style={inputStyle}
                  className="font-bold focus:border-[#dac063]"
                />
              </div>

              <div>
                <label style={labelStyle}>Business Telephone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +252615000000"
                  style={inputStyle}
                  className="font-bold focus:border-[#dac063]"
                />
              </div>
            </div>
          )}

          {/* TAB 5: SOCIAL LINKS */}
          {activeTab === "socials" && (
            <div className="flex flex-col gap-4 animate-slide-up">
              <div>
                <label style={labelStyle}>Website Link</label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="e.g. https://yoursite.com"
                  style={inputStyle}
                  className="focus:border-[#dac063]"
                />
              </div>

              <div>
                <label style={labelStyle}>Instagram Profile / Link</label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="e.g. myrestaurant"
                  style={inputStyle}
                  className="focus:border-[#dac063]"
                />
              </div>

              <div>
                <label style={labelStyle}>TikTok Profile / Link</label>
                <input
                  type="text"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="e.g. myrestaurant"
                  style={inputStyle}
                  className="focus:border-[#dac063]"
                />
              </div>

              <div>
                <label style={labelStyle}>WhatsApp Number / Link</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. +252615000000"
                  style={inputStyle}
                  className="focus:border-[#dac063]"
                />
              </div>

              <div>
                <label style={labelStyle}>Facebook Profile / Link</label>
                <input
                  type="text"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="e.g. myrestaurant"
                  style={inputStyle}
                  className="focus:border-[#dac063]"
                />
              </div>

              <div>
                <label style={labelStyle}>Twitter Profile / Link</label>
                <input
                  type="text"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="e.g. myrestaurant"
                  style={inputStyle}
                  className="focus:border-[#dac063]"
                />
              </div>

              <div>
                <label style={labelStyle}>Snapchat Username</label>
                <input
                  type="text"
                  value={snapchatUrl}
                  onChange={(e) => setSnapchatUrl(e.target.value)}
                  placeholder="e.g. myrestaurant"
                  style={inputStyle}
                  className="focus:border-[#dac063]"
                />
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="flex flex-col gap-4 animate-slide-up">
              <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex flex-col gap-0.5 select-none">
                  <span className="text-xs font-black text-white">Show Ratings Widgets</span>
                  <span className="text-[8px] text-white/30 font-bold uppercase">Google/Tripadvisor</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviews(!showReviews)}
                  className={`w-11 h-6 rounded-full transition-all relative outline-none focus:outline-none ${
                    showReviews ? "bg-[#dac063]" : "bg-neutral-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${showReviews ? "right-1" : "left-1"}`} />
                </button>
              </div>

              <div>
                <label style={labelStyle}>Google Place / Review URL</label>
                <input
                  type="text"
                  value={googleReview}
                  onChange={(e) => setGoogleReview(e.target.value)}
                  placeholder="Google Place link"
                  style={inputStyle}
                  className="focus:border-[#dac063]"
                />
              </div>

              <div>
                <label style={labelStyle}>TripAdvisor Review Link</label>
                <input
                  type="text"
                  value={tripadvisorUrl}
                  onChange={(e) => setTripadvisorUrl(e.target.value)}
                  placeholder="TripAdvisor link"
                  style={inputStyle}
                  className="focus:border-[#dac063]"
                />
              </div>
            </div>
          )}

        </form>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 15,
              cursor: 'pointer',
            }}
            className="font-black uppercase tracking-wider text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="establishment-settings-form"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: '#dac063',
              border: 'none',
              borderRadius: 14,
              color: '#0a0a0b',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            className="font-black uppercase tracking-wider text-xs disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-neutral-950" />
            ) : savedCheck ? (
              <span>Saved!</span>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
