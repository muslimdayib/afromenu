"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Globe2, Search, ArrowRight, Star, Sparkles, QrCode } from "lucide-react";

const DEMO_MENUS = [
  {
    name: "Arabica Steakhouse",
    slug: "arabica",
    desc: "Premium grill & cutlet dining house",
    bgClass: "from-amber-900 to-stone-900",
    color: "#f2bd11",
    logo: "🥩",
    wifi: "Arabica_Guest",
    categories: ["Flame Grill", "Sides", "Beverages"],
    items: [
      { name: "Ribeye Steak", price: "$24.00", icon: "🍖" },
      { name: "Truffle Fries", price: "$6.50", icon: "🍟" },
      { name: "Arabic Coffee", price: "$4.00", icon: "☕" },
    ]
  },
  {
    name: "Mogadishu Burger Lab",
    slug: "mburger",
    desc: "Somali fusion smash burgers & chips",
    bgClass: "from-[#1b3151] to-blue-900",
    color: "#f2bd11",
    logo: "🍔",
    wifi: "Moryaan_Free",
    categories: ["Smash Burgers", "Sides", "Shakes"],
    items: [
      { name: "Double Xawaash Smash", price: "120,000 Sh", icon: "🍔" },
      { name: "Spicy Crisps", price: "40,000 Sh", icon: "🍟" },
      { name: "Mango Milkshake", price: "50,000 Sh", icon: "🥤" },
    ]
  },
  {
    name: "Castelo Cafe & Bistro",
    slug: "castelo",
    desc: "Specialty coffee roastery & brunch",
    bgClass: "from-emerald-900 to-zinc-900",
    color: "#10b981",
    logo: "☕",
    wifi: "Castelo_5G",
    categories: ["Espresso", "All Day Brunch", "Sweets"],
    items: [
      { name: "Saffron Latte", price: "$5.50", icon: "☕" },
      { name: "Avocado Toast", price: "$9.00", icon: "🥑" },
      { name: "Baklava Cheesecake", price: "$6.50", icon: "🍰" },
    ]
  }
];

const COUNTRIES = [
  { name: "Somalia", slug: "somalia", emoji: "🇸🇴", code: "SOS" },
  { name: "United Arab Emirates", slug: "uae", emoji: "🇦🇪", code: "AED" },
  { name: "Saudi Arabia", slug: "saudi-arabia", emoji: "🇸🇦", code: "SAR" },
  { name: "Kenya", slug: "kenya", emoji: "🇰🇪", code: "KES" },
  { name: "Ethiopia", slug: "ethiopia", emoji: "🇪🇹", code: "ETB" },
  { name: "Egypt", slug: "egypt", emoji: "🇪🇬", code: "EGP" },
  { name: "Morocco", slug: "morocco", emoji: "🇲🇦", code: "MAD" },
  { name: "Turkey", slug: "turkey", emoji: "🇹🇷", code: "TRY" },
];

export default function CatalogPage() {
  const [search, setSearch] = useState("");

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfe] selection:bg-[#f2bd11]/30">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16">
        
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-20 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#1b3151]/5 text-[#f2bd11] flex items-center justify-center mx-auto mb-4 border border-[#1b3151]/5">
            <Globe2 className="w-7 h-7" />
          </div>
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl text-[#1b3151] mb-4">
            See Afromenu in Action
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Browse interactive mockup menus to see how restaurants customize colors, templates, and currency layouts dynamically.
          </p>

          {/* Search box for countries */}
          <div className="relative mt-8 max-w-md mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-100 focus:border-[#f2bd11] focus:outline-none text-sm text-slate-800 bg-white shadow-sm placeholder:text-slate-400 font-medium"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4.5 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* 3-Column Interactive Grid of Demo Menus featuring Borderless Phone Mockups */}
        <div className="mb-24">
          <h3 className="font-heading font-extrabold text-sm text-slate-400 uppercase tracking-widest mb-10 text-center flex items-center justify-center gap-2">
            <Star className="w-4.5 h-4.5 text-[#f2bd11] fill-[#f2bd11]" />
            <span>Interactive Demo Showroom</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
            {DEMO_MENUS.map((menu, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center group relative cursor-pointer"
              >
                {/* Visual Label */}
                <div className="text-center mb-4">
                  <h4 className="font-heading font-extrabold text-lg text-[#1b3151]">
                    {menu.name}
                  </h4>
                  <p className="text-xs text-slate-400">{menu.desc}</p>
                </div>

                {/* Borderless CSS Phone Mockup */}
                <div className="w-[270px] h-[520px] rounded-[40px] bg-slate-900 p-1.5 shadow-xl relative border-2 border-slate-800 overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                  {/* Phone Screen */}
                  <div className="w-full h-full rounded-[34px] bg-white overflow-hidden flex flex-col relative select-none">
                    
                    {/* Mockup Header: Solid color gradient */}
                    <div className={`p-4 bg-gradient-to-br ${menu.bgClass} text-white text-center relative`}>
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-lg mx-auto mb-1.5 font-bold shadow-inner">
                        {menu.logo}
                      </div>
                      <h5 className="font-heading font-extrabold text-xs tracking-tight">{menu.name}</h5>
                      <span className="text-[7px] text-white/70 block mt-0.5">⚡ WiFi: {menu.wifi}</span>
                    </div>

                    {/* Menu Categories Carousel */}
                    <div className="flex gap-1.5 px-3 py-2 border-b border-slate-100 overflow-x-auto scrollbar-none bg-slate-50/50">
                      {menu.categories.map((cat, cIdx) => (
                        <span
                          key={cIdx}
                          className={`text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                            cIdx === 0
                              ? "bg-[#1b3151] text-[#f2bd11]"
                              : "bg-white text-slate-400 border border-slate-100"
                          }`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* Menu Dishes */}
                    <div className="flex-1 p-3 flex flex-col gap-2 bg-slate-50/30 overflow-y-auto scrollbar-none">
                      {menu.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="bg-white border border-slate-100 p-2 rounded-xl flex items-center gap-2.5 shadow-sm"
                        >
                          <span className="text-xl">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h6 className="font-bold text-[9px] text-slate-800 truncate">{item.name}</h6>
                            <span className="text-[8px] font-extrabold text-[#1b3151] mt-0.5 block">
                              {item.price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA Overlay on Hover */}
                    <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-[#f2bd11] text-[#1b3151] flex items-center justify-center shadow-lg">
                        <QrCode className="w-6 h-6 animate-pulse" />
                      </div>
                      <span className="text-white text-xs font-bold tracking-wide uppercase">
                        Scan & Open Menu
                      </span>
                      <Link
                        href={`/onboarding`}
                        className="px-4 py-2 bg-white text-[#1b3151] font-extrabold text-[10px] rounded-full hover:bg-[#f2bd11] transition-colors"
                      >
                        Create Similar Style
                      </Link>
                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Countries Desktop Grid (4 columns, 2 on mobile) */}
        <div>
          <h3 className="font-heading font-extrabold text-sm text-slate-400 uppercase tracking-widest mb-8 text-center md:text-left flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#f2bd11]" />
            <span>Regional Presence</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredCountries.map((country) => (
              <Link
                key={country.slug}
                href={`/onboarding?country=${country.slug}`}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all duration-300 hover:border-[#f2bd11] hover:text-[#f2bd11] group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">{country.emoji}</span>
                  <span className="font-heading font-bold text-sm text-slate-800 group-hover:text-[#f2bd11] transition-colors">
                    {country.name}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#f2bd11] group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
          {filteredCountries.length === 0 && (
            <p className="text-center text-xs text-slate-400 italic py-8">
              No matching countries found.
            </p>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
