"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Utensils, Globe, Coins, BadgeAlert, ArrowRight, HelpCircle } from "lucide-react";

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
  { name: "South African Rand (ZAR, R)", code: "ZAR", symbol: "R" },
  { name: "Moroccan Dirham (MAD, د.م.)", code: "MAD", symbol: "د.م." },
  { name: "Nigerian Naira (NGN, ₦)", code: "NGN", symbol: "₦" },
];

const LANGUAGES = [
  { name: "English (English)", code: "English" },
  { name: "Somali (Soomaali)", code: "Somali" },
  { name: "Arabic (العربية)", code: "Arabic" },
  { name: "French (Français)", code: "French" },
  { name: "Spanish (Español)", code: "Spanish" },
  { name: "Turkish (Türkçe)", code: "Turkish" },
  { name: "Swahili (Kiswahili)", code: "Swahili" },
  { name: "Amharic (አማርኛ)", code: "Amharic" },
  { name: "German (Deutsch)", code: "German" },
  { name: "Italian (Italiano)", code: "Italian" },
  { name: "Portuguese (Português)", code: "Portuguese" },
  { name: "Russian (Русский)", code: "Russian" },
];

function OnboardingContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [currencyCode, setCurrencyCode] = useState("SOS");
  const [language, setLanguage] = useState("Somali");
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if owner already has an establishment, if so, redirect immediately
  useEffect(() => {
    async function checkExistingEstablishment() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("establishments")
          .select("slug")
          .eq("user_id", user.id)
          .limit(1);

        if (!error && data && data.length > 0) {
          router.push(`/p/${data[0].slug}`);
          return;
        }
      } catch (err) {
        console.error("Error checking existing establishment:", err);
      } finally {
        setCheckingExisting(false);
      }
    }

    checkExistingEstablishment();
  }, [user, router]);

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
    // Allow typing only numbers, letters, and dashes
    const filtered = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);

    try {
      const selectedCurrencyObj = CURRENCIES.find((c) => c.code === currencyCode);
      const symbol = selectedCurrencyObj ? selectedCurrencyObj.symbol : "$";
      const currencyLabel = selectedCurrencyObj ? selectedCurrencyObj.name.split(" (")[0] : "US Dollar";

      const { data, error: insertError } = await supabase
        .from("establishments")
        .insert({
          user_id: user?.id,
          name,
          slug,
          currency: currencyLabel,
          currency_symbol: symbol,
          language,
          theme: "light",
          brand_color: "#f7906c",
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          setError("This short URL slug is already taken. Try another name.");
        } else {
          setError(insertError.message);
        }
      } else if (data) {
        router.push(`/p/${data.slug}`);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-[#fdf6f2] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#f7906c]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#f7906c] animate-spin"></div>
        </div>
        <p className="font-heading font-semibold text-sm text-[#888888]">
          Checking for active menus...
        </p>
      </div>
    );
  }

  const originUrl = typeof window !== "undefined" ? window.location.origin : "menuqr.com";

  return (
    <div className="min-h-screen bg-[#fdf6f2] flex flex-col justify-between py-12 px-6">
      {/* Mini Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f7906c] flex items-center justify-center text-white font-bold">
            <Utensils className="w-4.5 h-4.5" />
          </div>
          <span className="font-heading font-extrabold text-lg text-[#2d2d2d]">
            Menu<span className="text-[#f7906c]">QR</span>
          </span>
        </div>
      </header>

      {/* Center White Card */}
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 md:p-10 rounded-[24px] max-w-xl w-full border border-[#eeeeee] card-shadow animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#2d2d2d] mb-2">
              Add Your Establishment
            </h1>
            <p className="text-sm text-[#888888]">
              Let&apos;s build your first gorgeous QR digital menu card.
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100 flex items-center gap-2">
              <BadgeAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
                Establishment Name
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Cafe Castelo or Mogadishu Burgers"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f7906c] focus:outline-none text-sm text-[#2d2d2d] transition-all bg-[#fdf6f2]/50 placeholder:text-gray-400"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>Short Name in URL (Slug)</span>
                <span className="group relative cursor-pointer text-[#888888] hover:text-[#2d2d2d]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-black text-white text-[10px] leading-normal opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30">
                    The short handle used in your menu link. Only letters, digits, and hyphens.
                  </span>
                </span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="cafe-castelo"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f7906c] focus:outline-none text-sm text-[#2d2d2d] transition-all bg-[#fdf6f2]/50 font-mono placeholder:text-gray-400"
              />
              {/* Live Preview */}
              <div className="mt-2 text-xs text-[#888888]">
                Your public URL will be:{" "}
                <span className="font-bold text-[#f7906c] font-mono break-all">
                  {originUrl}/p/{slug || "[slug]"}
                </span>
              </div>
            </div>

            {/* Two Column Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Currency */}
              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-gray-400" />
                  <span>Currency</span>
                </label>
                <select
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f7906c] focus:outline-none text-sm text-[#2d2d2d] bg-[#fdf6f2]/50 transition-all cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Main Language */}
              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span>Main Language</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f7906c] focus:outline-none text-sm text-[#2d2d2d] bg-[#fdf6f2]/50 transition-all cursor-pointer"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#f7906c] hover:bg-[#e8754f] disabled:bg-gray-300 text-white font-bold rounded-[50px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-4 text-sm"
            >
              {loading ? (
                <span>Registering your menu...</span>
              ) : (
                <>
                  <span>Create Establishment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-[#888888] mt-6 leading-relaxed">
            By creating an establishment, you agree to our Terms and authorize a 30-day premium free trial period. No charges apply.
          </p>
        </div>
      </main>

      <footer className="text-center text-xs text-[#888888] mt-8">
        &copy; {new Date().getFullYear()} MenuQR. All rights reserved.
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
