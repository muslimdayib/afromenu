"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Utensils, Globe, Coins, BadgeAlert, ArrowRight, HelpCircle, Palette, Sparkles, Rocket } from "lucide-react";

// Currencies mapping to symbols
const CURRENCIES = [
  { name: "Somali Shilling (Shilin Soomaali, Sh)", code: "SOS", symbol: "Sh" },
  { name: "US Dollar ($)", code: "USD", symbol: "$" },
  { name: "Euro (€)", code: "EUR", symbol: "€" },
  { name: "British Pound (£)", code: "GBP", symbol: "£" },
  { name: "Kenyan Shilling (KES, KSh)", code: "KES", symbol: "KSh" },
  { name: "Ethiopian Birr (ETB, Br)", code: "ETB", symbol: "Br" },
  { name: "UAE Dirham (AED, د.إ)", code: "AED", symbol: "د.إ" },
  { name: "Saudi Riyal (SAR, ر.س)", code: "SAR", symbol: "ر.س" },
  { name: "Turkish Lira (TRY, ₺)", code: "TRY", symbol: "₺" },
  { name: "Egyptian Pound (EGP, E£)", code: "EGP", symbol: "E£" },
];

const LANGUAGES = [
  { name: "English (English)", code: "English" },
  { name: "Somali (Soomaali)", code: "Somali" },
  { name: "Arabic (العربية)", code: "Arabic" },
  { name: "French (Français)", code: "French" },
  { name: "Turkish (Türkçe)", code: "Turkish" },
  { name: "Swahili (Kiswahili)", code: "Swahili" },
];

const TEMPLATES = [
  {
    id: "minimalist",
    name: "Minimalist",
    desc: "Pure typography, zero images, clean high-contrast spacing.",
    preview: (
      <div className="border border-slate-100 rounded-xl p-3 bg-white flex flex-col gap-1.5 h-28 justify-center select-none text-[8px]">
        <div className="font-bold border-b pb-1 text-slate-800 tracking-wider">MINIMALIST</div>
        <div className="flex justify-between text-slate-600"><span>1. Espresso Romano</span><span>$3.50</span></div>
        <div className="flex justify-between text-slate-600"><span>2. Affogato al Caffè</span><span>$4.00</span></div>
        <div className="flex justify-between text-slate-600"><span>3. Butter Croissant</span><span>$3.00</span></div>
      </div>
    )
  },
  {
    id: "visual-grid",
    name: "Visual Grid",
    desc: "Modern 2-column image-heavy Instagram style layout.",
    preview: (
      <div className="border border-slate-100 rounded-xl p-2.5 bg-slate-50 grid grid-cols-2 gap-1.5 h-28 items-center select-none text-[7px]">
        <div className="bg-white border border-slate-100 rounded p-1 flex flex-col items-center">
          <span className="text-xs">🍔</span>
          <span className="font-bold mt-0.5 text-slate-800 text-[6px]">Burgers</span>
        </div>
        <div className="bg-white border border-slate-100 rounded p-1 flex flex-col items-center">
          <span className="text-xs">🍕</span>
          <span className="font-bold mt-0.5 text-slate-800 text-[6px]">Pizzas</span>
        </div>
        <div className="bg-white border border-slate-100 rounded p-1 flex flex-col items-center">
          <span className="text-xs">🥤</span>
          <span className="font-bold mt-0.5 text-slate-800 text-[6px]">Drinks</span>
        </div>
        <div className="bg-white border border-slate-100 rounded p-1 flex flex-col items-center">
          <span className="text-xs">🍰</span>
          <span className="font-bold mt-0.5 text-slate-800 text-[6px]">Sweets</span>
        </div>
      </div>
    )
  },
  {
    id: "classic-elegant",
    name: "Classic Elegant",
    desc: "Serif font, luxury gold borders, and luxury dining feel.",
    preview: (
      <div className="border border-amber-200 rounded-xl p-3 bg-[#faf7f2] flex flex-col gap-1 h-28 justify-center items-center text-center select-none text-[8px]">
        <div className="font-serif italic font-bold text-amber-800">The Castelo Room</div>
        <div className="text-[6px] text-amber-600/70 border-b border-amber-200/50 pb-0.5 mb-1 tracking-widest">ELEGANT DIARIO</div>
        <div className="text-slate-700 font-medium">Somali Camel Fillet — $18.00</div>
        <div className="text-slate-700 font-medium">Saffron Rice Platter — $12.00</div>
      </div>
    )
  },
  {
    id: "night-owl",
    name: "Night Owl",
    desc: "Midnight Navy/Black theme with glowing premium gold prices.",
    preview: (
      <div className="border border-zinc-800 rounded-xl p-3 bg-[#1b3151] flex flex-col gap-1.5 h-28 justify-center select-none text-[8px] text-white">
        <div className="font-bold border-b border-white/10 pb-1 text-[#f2bd11] tracking-wider">MIDNIGHT LOUNGE</div>
        <div className="flex justify-between text-zinc-300"><span>1. Charcoal Ribeye</span><span className="text-[#f2bd11] font-bold">$24.00</span></div>
        <div className="flex justify-between text-zinc-300"><span>2. Smoked Mocktail</span><span className="text-[#f2bd11] font-bold">$7.50</span></div>
      </div>
    )
  },
  {
    id: "fast-casual",
    name: "Fast Casual",
    desc: "Condensed tight list with left square photo thumbnails.",
    preview: (
      <div className="border border-slate-100 rounded-xl p-2 bg-slate-50 flex flex-col gap-1 h-28 justify-center select-none text-[7px]">
        <div className="bg-white border rounded p-1 flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-100 rounded flex-shrink-0 flex items-center justify-center">🍔</div>
          <div className="flex-1 flex justify-between font-bold"><span>Cheese Burger</span><span>$8.99</span></div>
        </div>
        <div className="bg-white border rounded p-1 flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-100 rounded flex-shrink-0 flex items-center justify-center">🍟</div>
          <div className="flex-1 flex justify-between font-bold"><span>French Fries</span><span>$3.49</span></div>
        </div>
      </div>
    )
  }
];

function OnboardingContent() {
  const { user, session } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [currencyCode, setCurrencyCode] = useState("SOS");
  const [language, setLanguage] = useState("Somali");
  const [templateStyle, setTemplateStyle] = useState("minimalist");
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if owner already has an establishment, if so, redirect immediately
  useEffect(() => {
    async function checkExistingEstablishment() {
      if (!user) return;
      setError(null);
      setCheckingExisting(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("API request timed out after 5 seconds. Aborting...");
        controller.abort();
      }, 5000);

      try {
        // Retrieve session token to authenticate the API request
        let token = session?.access_token;
        if (!token) {
          const { data: sessionData } = await supabase.auth.getSession();
          token = sessionData.session?.access_token;
        }

        if (!token) {
          throw new Error("No active session token found. Please log in again.");
        }

        console.log("Starting API fetch to connection-pooled establishments endpoint...");
        const res = await fetch("/api/establishments/mine", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("API response received");

        const responseData = await res.json();

        if (!res.ok) {
          throw new Error(
            responseData.details || responseData.error || "Failed to query establishments."
          );
        }

        const establishments = responseData.establishments;

        const searchParams = new URLSearchParams(window.location.search);
        const isForceNew = searchParams.get("new") === "true";

        // Redirect to dashboard if the user already has an establishment
        if (!isForceNew && establishments && establishments.length > 0) {
          console.log("Establishment found. Redirecting to dashboard.");
          router.push("/dashboard");
          return;
        } else {
          console.log("0 establishments found or forced new onboarding. Stopping spinner.");
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error("Error checking existing establishment:", err);
        if (err.name === "AbortError") {
          setError("Database connection check timed out. Bypassing check and loading form.");
        } else {
          setError(err?.message || "Failed to check existing establishments.");
        }
      } finally {
        setCheckingExisting(false);
      }
    }

    checkExistingEstablishment();
  }, [user, session, router]);

  // Slugify Helper: lowercase, hyphens, alphanumeric
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove special chars
      .replace(/[\s_]+/g, "-") // replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(slugify(val));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const filtered = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(filtered);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please specify your establishment's name.");
      return;
    }
    if (!slug.trim()) {
      setError("Please specify a URL slug.");
      return;
    }
    if (slug.length < 3) {
      setError("Slug must be at least 3 characters.");
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    setStep(3);
  };

  const handleLaunch = async () => {
    setError(null);
    setLoading(true);

    try {
      let token = session?.access_token;
      if (!token) {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData.session?.access_token;
      }

      if (!token) {
        throw new Error("No active session token found. Please log in again.");
      }

      const res = await fetch("/api/establishments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          slug,
          currencyCode,
          language,
          templateStyle,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || responseData.details || "Failed to save establishment.");
      }

      if (responseData.success) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-[#1b3151] flex flex-col items-center justify-center text-white">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#f2bd11]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#f2bd11] animate-spin"></div>
        </div>
        <p className="font-heading font-semibold text-sm text-slate-300">
          Checking for active menus...
        </p>
        <button
          type="button"
          onClick={() => setCheckingExisting(false)}
          className="mt-6 text-xs text-[#f2bd11]/70 hover:text-[#f2bd11] transition-colors underline cursor-pointer font-semibold"
        >
          Bypass Loading
        </button>
      </div>
    );
  }

  const originUrl = typeof window !== "undefined" ? window.location.origin : "afromenu.com";

  return (
    <div className="min-h-screen bg-[#fafbfe] flex flex-col justify-between py-12 px-6">
      
      {/* Onboarding Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#1b3151] flex items-center justify-center text-[#f2bd11] font-bold shadow-md">
            <Utensils className="w-5 h-5" />
          </div>
          <span className="font-heading font-extrabold text-xl text-[#1b3151]">
            Afromenu
          </span>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <span
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border transition-all ${
                  step === s
                    ? "bg-[#f2bd11] border-[#f2bd11] text-[#1b3151] font-extrabold scale-110 shadow-sm"
                    : step > s
                    ? "bg-[#1b3151] border-[#1b3151] text-white"
                    : "bg-white border-slate-200 text-slate-400"
                }`}
              >
                {s}
              </span>
              {s < 3 && <div className={`w-6 h-0.5 ${step > s ? "bg-[#1b3151]" : "bg-slate-200"} mx-1`} />}
            </div>
          ))}
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 md:p-10 rounded-[32px] max-w-xl w-full border border-slate-100 shadow-xl relative animate-slide-up overflow-hidden">
          
          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100 flex items-center gap-2.5">
              <BadgeAlert className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: The Basics */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="flex flex-col gap-6">
              <div className="mb-2">
                <span className="text-[#f2bd11] font-extrabold text-xs tracking-wider uppercase block mb-1">Step 1 of 3</span>
                <h1 className="font-heading font-extrabold text-2xl text-[#1b3151]">
                  Establishment Basics
                </h1>
                <p className="text-xs text-slate-500 mt-1">Tell us your restaurant name, language, and primary checkout currency.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Establishment Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Arabica Steakhouse"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f2bd11] focus:outline-none text-sm text-slate-800 bg-slate-50/50 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>URL Slug Handle</span>
                  <span className="group relative cursor-pointer text-slate-400 hover:text-slate-700">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-black text-white text-[10px] leading-normal opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30">
                      The identifier used in your menu link. e.g. afromenu.com/p/slug
                    </span>
                  </span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="arabica-steakhouse"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f2bd11] focus:outline-none text-sm text-slate-800 bg-slate-50/50 font-mono"
                />
                <div className="mt-2 text-xs text-slate-400">
                  Link preview:{" "}
                  <span className="font-bold text-[#1b3151] font-mono break-all">
                    {originUrl}/p/{slug || "[slug]"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-slate-400" />
                    <span>Currency</span>
                  </label>
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f2bd11] focus:outline-none text-sm text-slate-800 bg-slate-50/50 font-semibold cursor-pointer"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Language</span>
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f2bd11] focus:outline-none text-sm text-slate-800 bg-slate-50/50 font-semibold cursor-pointer"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#f2bd11] hover:bg-[#e0ad0b] text-[#1b3151] font-extrabold rounded-[50px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-4 text-sm"
              >
                <span>Choose Style Template</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </form>
          )}

          {/* STEP 2: Choose Your Style (Visual Layout Selection Carousel) */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-[#f2bd11] font-extrabold text-xs tracking-wider uppercase block mb-1">Step 2 of 3</span>
                <h1 className="font-heading font-extrabold text-2xl text-[#1b3151]">
                  Choose Your Menu Layout
                </h1>
                <p className="text-xs text-slate-500 mt-1">Select a core theme layout. You can customize the colors and content at any time.</p>
              </div>

              {/* Selector Carousel Column Grid */}
              <div className="flex flex-col gap-4">
                {TEMPLATES.map((tpl) => {
                  const isSelected = templateStyle === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setTemplateStyle(tpl.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row gap-4 items-center ${
                        isSelected
                          ? "border-[#f2bd11] bg-[#f2bd11]/5 shadow-sm"
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      }`}
                    >
                      {/* Left info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center p-0.5 ${
                              isSelected ? "border-[#f2bd11] bg-[#f2bd11]" : "border-slate-300"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#1b3151]" />}
                          </span>
                          <span className="font-heading font-extrabold text-sm text-[#1b3151]">
                            {tpl.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal">{tpl.desc}</p>
                      </div>

                      {/* Right HTML Mini Preview */}
                      <div className="w-full sm:w-44 flex-shrink-0">
                        {tpl.preview}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-400 hover:text-slate-700 font-bold rounded-[50px] text-sm transition-colors text-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="flex-1 py-3.5 bg-[#f2bd11] hover:bg-[#e0ad0b] text-[#1b3151] font-extrabold rounded-[50px] text-sm transition-all shadow-md text-center"
                >
                  Configure Launch
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Launch */}
          {step === 3 && (
            <div className="flex flex-col gap-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#f2bd11]/10 text-[#f2bd11] flex items-center justify-center mx-auto mb-2 animate-bounce">
                <Rocket className="w-8 h-8" />
              </div>
              
              <div>
                <span className="text-[#f2bd11] font-extrabold text-xs tracking-wider uppercase block mb-1">Step 3 of 3</span>
                <h1 className="font-heading font-extrabold text-2xl text-[#1b3151]">
                  Your Menu is Ready!
                </h1>
                <p className="text-xs text-slate-500 mt-2">
                  We are ready to deploy your premium digital menu on <b>Afromenu</b>.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-left text-xs text-slate-600 flex flex-col gap-2.5 max-w-sm mx-auto w-full">
                <div className="flex justify-between">
                  <span className="font-semibold">Restaurant:</span>
                  <span className="font-bold text-[#1b3151]">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Short Handle URL:</span>
                  <span className="font-mono font-bold text-slate-700">{slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Active Style:</span>
                  <span className="font-bold text-slate-700 capitalize">{templateStyle.replace("-", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Primary Currency:</span>
                  <span className="font-bold text-slate-700">{currencyCode}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep(2)}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-400 hover:text-slate-700 font-bold rounded-[50px] text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleLaunch}
                  className="flex-1 py-3.5 bg-[#f2bd11] hover:bg-[#e0ad0b] disabled:bg-slate-200 text-[#1b3151] font-extrabold rounded-[50px] text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <span>Launching...</span>
                  ) : (
                    <>
                      <span>Launch Editor</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-[10px] text-slate-400 mt-8 leading-relaxed">
            By proceeding, you unlock unlimited free access to Afromenu Digital Menus. No payment details required.
          </p>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 mt-8">
        &copy; {new Date().getFullYear()} Afromenu SaaS. All rights reserved.
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}
