"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Globe2, Search, ArrowRight, Utensils, Star } from "lucide-react";

const COUNTRIES = [
  { name: "Egypt", slug: "egypt", emoji: "🇪🇬", code: "EGP" },
  { name: "Ethiopia", slug: "ethiopia", emoji: "🇪🇹", code: "ETB" },
  { name: "Kenya", slug: "kenya", emoji: "🇰🇪", code: "KES" },
  { name: "Morocco", slug: "morocco", emoji: "🇲🇦", code: "MAD" },
  { name: "Saudi Arabia", slug: "saudi-arabia", emoji: "🇸🇦", code: "SAR" },
  { name: "Somalia", slug: "somalia", emoji: "🇸🇴", code: "SOS" },
  { name: "Turkey", slug: "turkey", emoji: "🇹🇷", code: "TRY" },
  { name: "United Arab Emirates", slug: "uae", emoji: "🇦🇪", code: "AED" },
];

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicMenus() {
      try {
        const { data, error } = await supabase
          .from("establishments")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(8);

        if (!error && data) {
          setEstablishments(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicMenus();
  }, []);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf6f2] selection:bg-[#f7906c]/30">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16">
        {/* Header Hero */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="w-12 h-12 rounded-2xl bg-[#fbe4db] text-[#f7906c] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Globe2 className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-[#2d2d2d] mb-4">
            Find menus by country
          </h1>
          <p className="text-sm text-[#888888]">
            Browse public menus from beautiful dining spots in East Africa, Somalia, and the Middle East.
          </p>

          {/* Search box */}
          <div className="relative mt-8 max-w-md mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full pl-11 pr-4 py-3 rounded-full border border-[#eeeeee] focus:border-[#f7906c] focus:outline-none text-sm text-[#2d2d2d] bg-white card-shadow placeholder:text-gray-400"
            />
            <Search className="w-4.5 h-4.5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Countries Grid */}
        <div className="mb-16">
          <h3 className="font-heading font-extrabold text-sm text-[#888888] uppercase tracking-wider mb-6 text-center md:text-left">
            Active Countries
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredCountries.map((country) => (
              <Link
                key={country.slug}
                href={`/catalog/${country.slug}`}
                className="bg-white border border-[#eeeeee] rounded-2xl p-5 card-shadow flex items-center justify-between hover:border-[#f7906c]/30 card-shadow-hover"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">{country.emoji}</span>
                  <span className="font-heading font-bold text-sm text-[#2d2d2d]">
                    {country.name}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
          {filteredCountries.length === 0 && (
            <p className="text-center text-xs text-gray-400 italic py-8">
              No matching countries found.
            </p>
          )}
        </div>

        {/* Latest Menus Stream */}
        <div>
          <h3 className="font-heading font-extrabold text-sm text-[#888888] uppercase tracking-wider mb-6 flex items-center gap-2">
            <Star className="w-4 h-4 text-[#f7906c]" />
            <span>Recently Added Menus</span>
          </h3>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-4 border-[#f7906c]/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-[#f7906c] animate-spin"></div>
              </div>
            </div>
          ) : establishments.length === 0 ? (
            <div className="bg-white border border-[#eeeeee] rounded-[24px] p-8 text-center card-shadow">
              <Utensils className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-[#888888] font-bold">No active digital menus publicly registered yet</p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
                Be the first to list your restaurant in our public catalogs! Sign up above to create your profile.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {establishments.map((est) => (
                <Link
                  key={est.id}
                  href={`/p/${est.slug}`}
                  className="bg-white border border-[#eeeeee] rounded-3xl p-5 card-shadow flex flex-col justify-between h-48 card-shadow-hover"
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#fdf6f2] border border-[#eeeeee] overflow-hidden flex items-center justify-center mb-4">
                      {est.logo_url ? (
                        <img src={est.logo_url} alt={est.name} className="w-full h-full object-cover" />
                      ) : (
                        <Utensils className="w-5 h-5 text-[#f7906c]" />
                      )}
                    </div>
                    <h4 className="font-heading font-bold text-sm text-[#2d2d2d] truncate">
                      {est.name}
                    </h4>
                    <p className="text-[10px] text-[#888888] mt-1 flex items-center gap-1">
                      <span>Language: {est.language}</span>
                      <span>•</span>
                      <span>Currency: {est.currency_symbol}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#eeeeee]/50 text-xs">
                    <span className="text-[10px] font-bold text-[#f7906c] hover:underline">
                      View Menu
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#f7906c]" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
