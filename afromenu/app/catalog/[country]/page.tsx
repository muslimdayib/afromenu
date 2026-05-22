"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Utensils, MapPin, ArrowRight, ExternalLink } from "lucide-react";

// Mock profiles matching catalog countries for robust demonstration
const MOCK_RESTAURANTS: Record<string, any[]> = {
  somalia: [
    { id: "1", name: "Mogadishu Burgers", slug: "cafe-castelo", logo: null, desc: "Prime flame-grilled hamburgers and seasoned wraps in Mogadishu.", lang: "Somali, English", cur: "SOS (Sh)", phone: "+252 61 5000000" },
    { id: "2", name: "Hargeisa Tea & Lounge", slug: "hargeisa-lounge", logo: null, desc: "Traditional spiced cardamon tea, sweet crepes, and fresh Somali desserts.", lang: "Somali", cur: "SOS (Sh)", phone: "+252 63 4000000" },
  ],
  kenya: [
    { id: "3", name: "Nairobi Grill & BBQ", slug: "nairobi-grill", logo: null, desc: "Hot nyama choma skewers, kachumbari salad, and refreshing drinks.", lang: "Swahili, English", cur: "KES (KSh)", phone: "+254 700 000000" },
  ],
  uae: [
    { id: "4", name: "Dubai Bistro", slug: "dubai-bistro", logo: null, desc: "Premium Mediterranean mezze platters and coffee in Downtown Dubai.", lang: "Arabic, English", cur: "AED (د.إ)", phone: "+971 50 000000" },
  ],
};

const COUNTRY_NAMES: Record<string, { name: string; emoji: string }> = {
  egypt: { name: "Egypt", emoji: "🇪🇬" },
  ethiopia: { name: "Ethiopia", emoji: "🇪🇹" },
  kenya: { name: "Kenya", emoji: "🇰🇪" },
  morocco: { name: "Morocco", emoji: "🇲🇦" },
  "saudi-arabia": { name: "Saudi Arabia", emoji: "🇸🇦" },
  somalia: { name: "Somalia", emoji: "🇸🇴" },
  turkey: { name: "Turkey", emoji: "🇹🇷" },
  uae: { name: "United Arab Emirates", emoji: "🇦🇪" },
};

export default function CountryCatalogPage() {
  const params = useParams();
  const router = useRouter();
  const countrySlug = params.country as string;

  const [dbMenus, setDbMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCountryMenus() {
      try {
        // Find by approximate indicators (e.g. matching currency or language triggers)
        let queryVal = "Somali";
        if (countrySlug === "uae") queryVal = "Arabic";
        else if (countrySlug === "kenya") queryVal = "Swahili";
        
        const { data, error } = await supabase
          .from("establishments")
          .select("*")
          .eq("is_active", true)
          .ilike("language", `%${queryVal}%`);

        if (!error && data) {
          setDbMenus(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (countrySlug) {
      fetchCountryMenus();
    }
  }, [countrySlug]);

  const countryInfo = COUNTRY_NAMES[countrySlug] || { name: countrySlug, emoji: "🌍" };
  const mockList = MOCK_RESTAURANTS[countrySlug] || [];

  // Merge dynamic results and mock fallbacks
  const combinedMenus = [...dbMenus];
  mockList.forEach((mock) => {
    // Avoid duplicating if DB already has this slug
    if (!combinedMenus.some((m) => m.slug === mock.slug)) {
      combinedMenus.push({
        id: mock.id,
        name: mock.name,
        slug: mock.slug,
        logo_url: mock.logo,
        language: mock.lang,
        currency_symbol: mock.cur,
        phone: mock.phone,
        wifi_password: "GuestWiFi",
        is_mock: true,
      });
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] selection:bg-[#f2bd11]/30">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#888888] hover:text-[#f2bd11] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Countries</span>
        </Link>

        {/* Title */}
        <div className="mb-12 border-b border-[#eeeeee] pb-6 flex items-center gap-4">
          <span className="text-4xl select-none">{countryInfo.emoji}</span>
          <div>
            <h1 className="font-heading font-extrabold text-3xl text-[#1b3151]">
              Menus in {countryInfo.name}
            </h1>
            <p className="text-xs text-[#888888] mt-1">
              Showing active QR digital table menu stands listed under this territory.
            </p>
          </div>
        </div>

        {/* Restaurants List */}
        {combinedMenus.length === 0 ? (
          <div className="bg-white border border-[#eeeeee] p-12 rounded-[24px] text-center card-shadow">
            <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-[#888888] font-bold">No menus added in this country yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Be the first to list a restaurant in {countryInfo.name}! Register your cafe now.
            </p>
            <Link
              href="/sign-up"
              className="mt-6 inline-flex py-2.5 px-6 bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] font-bold rounded-[50px] text-xs shadow-md transition-all"
            >
              Add Restaurant Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {combinedMenus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white border border-[#eeeeee] rounded-3xl p-6 card-shadow flex flex-col justify-between h-48 card-shadow-hover relative"
              >
                {menu.is_mock && (
                  <span className="absolute top-4 right-4 text-[7px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-600">
                    Sample Profile
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#f8f9fa] border border-[#eeeeee] overflow-hidden flex items-center justify-center">
                      {menu.logo_url ? (
                        <img src={menu.logo_url} alt={menu.name} className="w-full h-full object-cover" />
                      ) : (
                        <Utensils className="w-6 h-6 text-[#1b3151]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-base text-[#1b3151] truncate max-w-[200px]">
                        {menu.name}
                      </h4>
                      <p className="text-[9px] text-[#888888] mt-0.5 flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-[#f2bd11]" />
                        <span>{countryInfo.name}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#888888] line-clamp-2 leading-relaxed">
                    {menu.is_mock ? "Explore gourmet dishes, burgers, or warm Somali cardamon tea at this premium local establishment." : `Browse menu items, wifi details, and contact options for ${menu.name}.`}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#eeeeee]/50 text-xs">
                  <div className="flex gap-2 text-[9px] text-gray-400">
                    <span>Lang: {menu.language}</span>
                    <span>•</span>
                    <span>Cur: {menu.currency_symbol}</span>
                  </div>

                  <Link
                    href={`/p/${menu.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f2bd11] hover:underline"
                  >
                    <span>View Stand</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
