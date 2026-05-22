"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, QrCode, Globe, Palette, Sparkles, Smartphone, ShieldCheck, ChevronRight, Zap } from "lucide-react";

export default function HomePage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "6month" | "annual">("6month");

  const getPriceDetails = () => {
    switch (billingPeriod) {
      case "monthly":
        return {
          monthlyPrice: 10,
          periodText: "month",
          totalText: "Charged monthly",
          plans: {
            monthly: { price: "$10", total: "$10", duration: "/mo" },
            halfYear: { price: "$9.6", total: "$57.6", duration: "/mo" },
            annual: { price: "$9", total: "$108", duration: "/mo" }
          }
        };
      case "6month":
        return {
          monthlyPrice: 9.6,
          periodText: "6 months",
          totalText: "Charged every 6 months / Total amount is $57.60",
          plans: {
            monthly: { price: "$10", total: "$10", duration: "/mo" },
            halfYear: { price: "$9.60", total: "$57.60", duration: "/mo" },
            annual: { price: "$9", total: "$108", duration: "/mo" }
          }
        };
      case "annual":
        return {
          monthlyPrice: 9,
          periodText: "12 months",
          totalText: "Charged annually / Total amount is $108.00",
          plans: {
            monthly: { price: "$10", total: "$10", duration: "/mo" },
            halfYear: { price: "$9.6", total: "$57.6", duration: "/mo" },
            annual: { price: "$9.00", total: "$108.00", duration: "/mo" }
          }
        };
    }
  };

  const { plans } = getPriceDetails();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfe] selection:bg-[#f2bd11]/30">
      <Navbar />

      {/* Hero Section: Premium Solid Navy Blue Background */}
      <section className="bg-[#1b3151] text-white pt-20 pb-32 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1e3e6b,transparent_60%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col justify-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-[#f2bd11] text-xs font-bold w-fit mb-6 border border-white/10">
              <Sparkles className="w-4 h-4" />
              <span>Premium QR Menus supporting USD & Somali Shilling (Sh)</span>
            </div>
            
            <h1 className="font-heading font-extrabold text-5xl md:text-7xl text-white leading-[1.1] tracking-tight mb-6">
              See <span className="text-[#f2bd11]">Afromenu</span> in Action
            </h1>
            
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
              Launch a high-performance digital menu instantly. Enable contactless browsing, instant changes, and dynamic template styles optimized for East African connections.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-4 bg-[#f2bd11] hover:bg-[#e0ad0b] text-[#1b3151] font-extrabold rounded-[50px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Create Your Menu Free</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/catalog"
                className="w-full sm:w-auto px-8 py-4 border-2 border-white/20 hover:border-white/40 text-white font-bold rounded-[50px] hover:bg-white/5 transition-all text-center"
              >
                Inspiration Gallery
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#f2bd11]" />
                <span>30 Days Free Trial</span>
              </div>
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#f2bd11]" />
                <span>No Setup Fees</span>
              </div>
            </div>
          </div>

          {/* Sleek Borderless Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="absolute inset-0 bg-[#f2bd11]/10 rounded-[40px] blur-3xl -z-10 transform scale-95 translate-y-12"></div>
            
            {/* Phone Container */}
            <div className="w-[320px] h-[630px] rounded-[48px] bg-slate-900 p-2 shadow-2xl relative border-4 border-slate-800 overflow-hidden">
              {/* Camera punch hole / Dynamic Island style */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-20 flex justify-center items-center">
                <div className="w-2 h-2 rounded-full bg-slate-800 mr-2"></div>
                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
              </div>

              {/* Inner Screen */}
              <div className="w-full h-full rounded-[40px] bg-white overflow-y-auto px-4 pt-8 pb-4 relative scrollbar-none flex flex-col text-slate-900">
                {/* Header */}
                <div className="text-center pt-3 pb-3 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-full bg-[#1b3151] text-white flex items-center justify-center font-bold text-xl mx-auto mb-2 shadow-md">
                    A
                  </div>
                  <h4 className="font-heading font-extrabold text-base text-[#1b3151]">Aromas Cafe</h4>
                  <p className="text-[9px] text-slate-500">⚡ WiFi: AromasGold | 📞 +252 61 7000000</p>
                </div>

                {/* Categories */}
                <div className="flex gap-2 py-3 overflow-x-auto scrollbar-none">
                  <span className="px-3 py-1 rounded-full bg-[#1b3151] text-[#f2bd11] font-bold text-[10px] shadow-sm">Entrees</span>
                  <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 font-bold text-[10px] border border-slate-100">Cold Drinks</span>
                  <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 font-bold text-[10px] border border-slate-100">Desserts</span>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-3">
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-2xl">🥩</div>
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-[#1b3151]">Somali Camel Steak</h5>
                      <p className="text-[8px] text-slate-500 line-clamp-1">Tender steak flavored with authentic Xawaash spice</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] font-bold text-[#1b3151]">180,000 Sh (or $7.00)</span>
                        <span className="text-[8px] bg-amber-50 text-[#f2bd11] border border-[#f2bd11]/20 font-bold px-1.5 py-0.5 rounded-full">Popular</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-2xl">🍹</div>
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-[#1b3151]">Ginger Hibiscus Tea</h5>
                      <p className="text-[8px] text-slate-500 line-clamp-1">Chilled Zobo juice with fresh Somali ginger</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] font-bold text-[#1b3151]">60,000 Sh (or $2.50)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-2xl">🥪</div>
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-[#1b3151]">Spicy Beef Sambusa</h5>
                      <p className="text-[8px] text-slate-500 line-clamp-1">Crispy pastries stuffed with minced beef & chili</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] font-bold text-[#1b3151]">45,000 Sh (or $1.80)</span>
                        <span className="text-[8px] bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded-full">🌶️ Spicy</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-6 text-center text-[9px] text-slate-400">
                  Powered by Afromenu
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid: Clean grid using Pure White cards & Gold line-art icons */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-[#1b3151] mb-4">
            Powerful Menu Upgrades
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Eliminate traditional menu printing. Instantly update prices, currencies, and styles while preserving ultra-fast mobile load times.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#1b3151]/5 text-[#f2bd11] flex items-center justify-center mb-6 group-hover:bg-[#1b3151] group-hover:text-white transition-colors">
              <QrCode className="w-7 h-7" />
            </div>
            <h4 className="font-heading font-bold text-xl text-[#1b3151] mb-3">Instant QR Generation</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Auto-generate gorgeous high-resolution QR codes mapped directly to your digital tables. Download, brand, and print instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#1b3151]/5 text-[#f2bd11] flex items-center justify-center mb-6 group-hover:bg-[#1b3151] group-hover:text-white transition-colors">
              <Globe className="w-7 h-7" />
            </div>
            <h4 className="font-heading font-bold text-xl text-[#1b3151] mb-3">Multi-Currency & Somali Shilling</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Seamlessly toggle pricing display between Somali Shillings (Sh), USD, AED, and global currencies for high-trust customer interactions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#1b3151]/5 text-[#f2bd11] flex items-center justify-center mb-6 group-hover:bg-[#1b3151] group-hover:text-white transition-colors">
              <Palette className="w-7 h-7" />
            </div>
            <h4 className="font-heading font-bold text-xl text-[#1b3151] mb-3">Layout Styles & Carousel</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Dynamically select from three custom templates: Minimalist, visual-grid, or elegant list styles, customized with your unique brand color accent.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#1b3151]/5 text-[#f2bd11] flex items-center justify-center mb-6 group-hover:bg-[#1b3151] group-hover:text-white transition-colors">
              <Smartphone className="w-7 h-7" />
            </div>
            <h4 className="font-heading font-bold text-xl text-[#1b3151] mb-3">Real-time Updates</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Running low on an item? Instantly toggle availability status or update steak prices from your owner dashboard. Updates reflect immediately.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#1b3151]/5 text-[#f2bd11] flex items-center justify-center mb-6 group-hover:bg-[#1b3151] group-hover:text-white transition-colors">
              <Zap className="w-7 h-7" />
            </div>
            <h4 className="font-heading font-bold text-xl text-[#1b3151] mb-3">High-Efficiency SSR</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Engineered with dynamic server-side rendering (SSR) to render your menu instantly on 3G and weak cellular data networks.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#1b3151]/5 text-[#f2bd11] flex items-center justify-center mb-6 group-hover:bg-[#1b3151] group-hover:text-white transition-colors">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h4 className="font-heading font-bold text-xl text-[#1b3151] mb-3">HTTP-Only Security</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Secured with premium JWT authentication stored in HTTP-only browser cookies, preventing XSS and securing restaurant administration.
            </p>
          </div>

        </div>
      </section>

      {/* Pricing Section: Highlight the 6-month tier using a Navy Blue card with a Gold signup button */}
      <section className="bg-[#1b3151] text-white py-24 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#1e3e6b,transparent_55%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-white mb-4">
              Simple, Dynamic Pricing
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pick the tier that matches your restaurant scale. No hidden fees, instant setup.
            </p>

            {/* Toggle periods */}
            <div className="inline-flex bg-white/10 p-1.5 rounded-full border border-white/10 mt-8 backdrop-blur-md">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  billingPeriod === "monthly" ? "bg-[#f2bd11] text-[#1b3151] shadow-md" : "text-white hover:text-[#f2bd11]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("6month")}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all relative ${
                  billingPeriod === "6month" ? "bg-[#f2bd11] text-[#1b3151] shadow-md" : "text-white hover:text-[#f2bd11]"
                }`}
              >
                6-Month Billing
                <span className="absolute -top-3 -right-2 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full font-extrabold tracking-wide uppercase">
                  Best Value
                </span>
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  billingPeriod === "annual" ? "bg-[#f2bd11] text-[#1b3151] shadow-md" : "text-white hover:text-[#f2bd11]"
                }`}
              >
                Annually
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            
            {/* Monthly Card: Crisp Pure White */}
            <div className="bg-white text-slate-900 border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#1b3151] mb-4">Monthly Plan</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-sm font-bold text-slate-400">$</span>
                  <span className="text-5xl font-heading font-extrabold text-[#1b3151]">10</span>
                  <span className="text-sm font-bold text-slate-400">{plans.monthly.duration}</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">Total amount is {plans.monthly.total} charged monthly</p>
                <hr className="border-slate-100 mb-6" />
                <ul className="flex flex-col gap-4 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                    <span>1 Active Digital Menu</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                    <span>Unlimited Categories & Items</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                    <span>Contactless QR Generation</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full text-center py-3.5 bg-slate-50 hover:bg-[#f2bd11]/15 text-[#1b3151] hover:text-[#e0ad0b] border border-[#1b3151]/10 font-bold rounded-[50px] transition-colors"
              >
                Sign Up Free
              </Link>
            </div>

            {/* 6 Months Card: Highlighted Premium Navy Blue Card with Premium Gold accents */}
            <div className="bg-[#1e3e6b] text-white rounded-[32px] p-8 shadow-2xl flex flex-col justify-between transform scale-105 border-2 border-[#f2bd11] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#f2bd11] text-[#1b3151] text-[9px] font-extrabold uppercase py-1 px-4 rounded-bl-2xl shadow-sm tracking-wider">
                Popular Choice
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#f2bd11] mb-4">6-Month Premium</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-sm font-bold text-[#f2bd11]">$</span>
                  <span className="text-6xl font-heading font-extrabold text-[#f2bd11]">9.60</span>
                  <span className="text-sm font-bold text-slate-300">{plans.halfYear.duration}</span>
                </div>
                <p className="text-xs text-slate-300 mb-6">Total amount is {plans.halfYear.total} charged every 6 months</p>
                <hr className="border-white/10 mb-6" />
                <ul className="flex flex-col gap-4 text-sm text-slate-200 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                    <span>1 Active Digital Menu</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                    <span>Unlimited Categories & Items</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                    <span>Choose Template layout styles</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                    <span>Brand primary color customized accents</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full text-center py-4 bg-[#f2bd11] hover:bg-[#e0ad0b] text-[#1b3151] font-extrabold rounded-[50px] transition-all shadow-md"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Annual Card: Crisp Pure White */}
            <div className="bg-white text-slate-900 border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#1b3151] mb-4">Annual Plan</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-sm font-bold text-slate-400">$</span>
                  <span className="text-5xl font-heading font-extrabold text-[#1b3151]">9</span>
                  <span className="text-sm font-bold text-slate-400">{plans.annual.duration}</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">Total amount is {plans.annual.total} charged annually</p>
                <hr className="border-slate-100 mb-6" />
                <ul className="flex flex-col gap-4 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                    <span>1 Active Digital Menu</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                    <span>Unlimited Categories & Items</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                    <span>All Premium Layout designs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                    <span>Priority Support Response</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full text-center py-3.5 bg-slate-50 hover:bg-[#f2bd11]/15 text-[#1b3151] hover:text-[#e0ad0b] border border-[#1b3151]/10 font-bold rounded-[50px] transition-colors"
              >
                Sign Up Free
              </Link>
            </div>

          </div>

          <div className="text-center mt-16 text-xs text-slate-400">
            VAT may be applicable. Support local billing channels in East Africa.
          </div>
        </div>
      </section>

      {/* Trial Section Banner */}
      <section className="bg-white py-24 px-6 text-center border-b border-slate-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading font-extrabold text-4xl text-[#1b3151] mb-6">
            Ready to upgrade your restaurant experience?
          </h2>
          <p className="text-slate-500 leading-relaxed mb-8">
            Create an account in 1 minute, build your menus, and print custom table stands.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-10 py-5 bg-[#1b3151] hover:bg-[#15263f] text-[#f2bd11] font-extrabold rounded-[50px] shadow-lg hover:shadow-xl transition-all"
          >
            <span>Start Free Trial Today</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-slate-400 mt-4">No credit card details required for trial.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
