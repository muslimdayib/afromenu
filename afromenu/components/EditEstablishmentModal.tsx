"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Upload, Palette, Image as ImageIcon, Loader2, Coins, Globe, Wifi, Phone } from "lucide-react";

interface EditEstablishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  establishment: {
    id: string;
    name: string;
    currency: string;
    currency_symbol: string;
    language: string;
    theme: "light" | "dark";
    brand_color: string;
    logo_url: string | null;
    background_url: string | null;
    wifi_password: string | null;
    phone: string | null;
    template_style: string;
    menu_style?: string | null;
  };
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
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=60", // Bread/flour rustic
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60", // Premium dining plates
  "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800&auto=format&fit=crop&q=60", // Warm wooden background
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60", // Cozy restaurant lights
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60", // Direct food table flatlay
];

export default function EditEstablishmentModal({
  isOpen,
  onClose,
  onSuccess,
  establishment,
}: EditEstablishmentModalProps) {
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [brandColor, setBrandColor] = useState("#f2bd11");
  const [menuStyle, setMenuStyle] = useState("classic-list");
  const [currency, setCurrency] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [language, setLanguage] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (establishment) {
      setName(establishment.name || "");
      setTheme(establishment.theme || "light");
      setBrandColor(establishment.brand_color || "#f2bd11");
      setMenuStyle(establishment.menu_style || "classic-list");
      setCurrency(establishment.currency || "Somali Shilling");
      setCurrencySymbol(establishment.currency_symbol || "Sh");
      setLanguage(establishment.language || "Somali");
      setWifiPassword(establishment.wifi_password || "");
      setPhone(establishment.phone || "");
      setLogoPreview(establishment.logo_url);
      setBgPreview(establishment.background_url);
    }
  }, [establishment, isOpen]);

  if (!isOpen) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBgFile(file);
      setBgPreview(URL.createObjectURL(file));
    }
  };

  const selectBgPreset = (url: string) => {
    setBgFile(null);
    setBgPreview(url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalLogoUrl = logoPreview;
    let finalBgUrl = bgPreview;

    try {
      // Get the active session token to authorize the Prisma API update
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Authorization session not found. Please log in again.");
      }

      // 1. Upload Logo if custom image added
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const filePath = `${establishment.id}/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("menu-images")
          .upload(filePath, logoFile, { upsert: true });

        if (uploadErr) {
          console.warn("Logo upload skipped:", uploadErr.message);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("menu-images")
            .getPublicUrl(filePath);
          finalLogoUrl = publicUrl;
        }
      }

      // 2. Upload Background if custom banner photo selected
      if (bgFile) {
        const fileExt = bgFile.name.split(".").pop();
        const fileName = `bg-${Date.now()}.${fileExt}`;
        const filePath = `${establishment.id}/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("menu-images")
          .upload(filePath, bgFile, { upsert: true });

        if (uploadErr) {
          console.warn("Background upload skipped, preset retained.");
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("menu-images")
            .getPublicUrl(filePath);
          finalBgUrl = publicUrl;
        }
      }

      // 3. Update DB using REST API rather than supabase client (which fails due to RLS blocks)
      const payload = {
        name,
        theme,
        brand_color: brandColor,
        currency,
        currency_symbol: currencySymbol,
        language,
        wifi_password: wifiPassword || null,
        phone: phone || null,
        logo_url: finalLogoUrl || null,
        background_url: finalBgUrl || null,
        menu_style: menuStyle,
      };

      const res = await fetch(`/api/establishments/${establishment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || errJson.details || "Failed to update establishment details.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update establishment details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1b3151]/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 border border-gray-100 relative z-10 shadow-2xl animate-slide-up overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-[#1b3151] transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h3 className="font-heading font-extrabold text-xl text-[#1b3151] mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#f7906c]" />
          <span>Edit Establishment Settings</span>
        </h3>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Establishment Name */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
              Establishment Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Castelo Restaurant"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7906c] focus:ring-1 focus:ring-[#f7906c] focus:outline-none text-sm text-[#1b3151] bg-[#f8f9fa] placeholder:text-gray-400 font-bold transition-all"
            />
          </div>

          {/* Theme & Brand Color Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Color Theme */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                Color Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as "light" | "dark")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7906c] focus:ring-1 focus:ring-[#f7906c] focus:outline-none text-sm text-[#1b3151] bg-[#f8f9fa] transition-all cursor-pointer font-bold"
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>

            {/* Brand Color */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl shadow-sm border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: brandColor }}
                ></div>
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer bg-transparent border border-gray-200 p-1.5 focus:outline-none focus:border-[#f7906c]"
                />
                <span className="font-mono text-xs font-bold text-gray-500 uppercase">{brandColor}</span>
              </div>
            </div>
          </div>

          {/* Menu Display Style Selector */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
              Menu Display Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: "classic-list",
                  name: "Classic List",
                  desc: "Simple list items, name left, price right.",
                  preview: (
                    <div className="flex flex-col gap-1 w-full p-2 bg-slate-50 rounded border border-gray-100">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-1 text-[8px] font-bold text-slate-400">
                        <span>🍔 Avocado Toast</span>
                        <span>$8.50</span>
                      </div>
                      <div className="flex items-center justify-between text-[8px] font-bold text-slate-400">
                        <span>☕ Brewed Cappuccino</span>
                        <span>$3.00</span>
                      </div>
                    </div>
                  )
                },
                {
                  id: "visual-grid",
                  name: "Visual Grid",
                  desc: "2-column visual grid with items and photo covers.",
                  preview: (
                    <div className="grid grid-cols-2 gap-1 w-full">
                      <div className="p-1 bg-slate-50 rounded border border-gray-100 flex flex-col gap-0.5">
                        <div className="h-6 w-full bg-slate-200 rounded-sm"></div>
                        <span className="text-[6px] font-black text-slate-400 leading-none">Toast</span>
                        <span className="text-[5px] text-[#f7906c] font-bold leading-none">$8.50</span>
                      </div>
                      <div className="p-1 bg-slate-50 rounded border border-gray-100 flex flex-col gap-0.5">
                        <div className="h-6 w-full bg-slate-200 rounded-sm"></div>
                        <span className="text-[6px] font-black text-slate-400 leading-none">Coffee</span>
                        <span className="text-[5px] text-[#f7906c] font-bold leading-none">$3.00</span>
                      </div>
                    </div>
                  )
                },
                {
                  id: "photo-cards",
                  name: "Photo Cards",
                  desc: "Large card view with full image and centered text.",
                  preview: (
                    <div className="flex flex-col gap-1 w-full">
                      <div className="h-9 w-full bg-slate-400 rounded relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-black/40"></div>
                        <span className="text-[6px] font-black text-white z-10 uppercase tracking-wider">Avocado Toast • $8.50</span>
                      </div>
                    </div>
                  )
                }
              ].map((style) => {
                const isSelected = menuStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setMenuStyle(style.id)}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#f7906c] bg-[#f7906c]/5 ring-2 ring-[#f7906c]/15"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black text-[#1b3151] block mb-1">{style.name}</span>
                      <span className="text-[9px] text-gray-500 leading-tight block">{style.desc}</span>
                    </div>
                    {style.preview}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currencies & Symbol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Currency dropdown */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-gray-400" />
                <span>Currency Type</span>
              </label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  const found = CURRENCIES.find((c) => c.name === e.target.value);
                  if (found) setCurrencySymbol(found.symbol);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7906c] focus:outline-none text-sm text-[#1b3151] bg-[#f8f9fa] transition-all cursor-pointer font-semibold"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Symbol text */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>Currency Symbol</span>
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="Sh or $"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7906c] focus:outline-none text-sm text-[#1b3151] bg-[#f8f9fa] placeholder:text-gray-400 font-bold"
              />
            </div>
          </div>

          {/* Logo & Background Customizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                Establishment Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="relative border border-dashed border-gray-300 hover:border-[#f7906c] p-3 rounded-xl text-center cursor-pointer transition-colors flex-1 flex flex-col justify-center items-center h-16 bg-[#f8f9fa]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-4 h-4 text-[#1b3151] mb-1" />
                  <span className="text-[10px] font-bold text-[#1b3151]">Upload Logo</span>
                </div>
              </div>
            </div>

            {/* Language dropdown */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span>Primary Language</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7906c] focus:outline-none text-sm text-[#1b3151] bg-[#f8f9fa] transition-all cursor-pointer font-bold"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Background banner */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
              Customer View Background Banner
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Image Picker */}
              <div className="relative border border-dashed border-gray-300 hover:border-[#f7906c] p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-[100px] bg-[#f8f9fa]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBgChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-[#1b3151] mb-1" />
                <span className="text-[10px] font-bold text-[#1b3151]">Upload Banner Photo</span>
              </div>
              
              {/* Preview */}
              <div className="border border-gray-200 rounded-xl h-[100px] bg-gray-50 flex items-center justify-center overflow-hidden relative shadow-inner">
                {bgPreview ? (
                  <>
                    <img src={bgPreview} alt="Background Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setBgPreview(null);
                        setBgFile(null);
                      }}
                      className="absolute top-1.5 right-1.5 bg-[#1b3151]/80 text-white p-1 rounded-full hover:bg-black transition-colors shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-gray-400 text-xs text-center font-bold">No banner image</div>
                )}
              </div>
            </div>

            {/* Presets */}
            <div className="mt-3">
              <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider mb-2">
                Or select wood & brick presets
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {BG_PRESETS.map((bg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectBgPreset(bg)}
                    className="w-12 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-[#f7906c] transition-all focus:outline-none"
                  >
                    <img src={bg} alt="bg preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* WiFi & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WiFi */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-gray-400" />
                <span>Wi-Fi Password</span>
              </label>
              <input
                type="text"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="e.g. CafeCasteloGuest"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7906c] focus:outline-none text-sm text-[#1b3151] bg-[#f8f9fa] placeholder:text-gray-400 font-bold"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>Contact Phone</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +252 61 5000000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7906c] focus:outline-none text-sm text-[#1b3151] bg-[#f8f9fa] placeholder:text-gray-400 font-mono font-bold"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4 border-t border-gray-50 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-250 text-gray-400 hover:bg-slate-50 font-bold rounded-full text-xs uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#f7906c] hover:bg-[#e27653] disabled:bg-gray-300 text-white font-extrabold rounded-full text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
