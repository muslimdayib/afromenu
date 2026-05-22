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
    <div className="min-h-screen flex flex-col bg-[#fdf6f2] selection:bg-[#f7906c]/30">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7 flex flex-col justify-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fbe4db] text-[#e8754f] text-xs font-bold w-fit mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simplify your operations in Somalia & East Africa</span>
          </div>
          
          <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-[#2d2d2d] leading-[1.1] tracking-tight mb-6">
            The Digital Menu <br />
            <span className="text-[#f7906c]">Your Restaurant</span> Deserves
          </h1>
          
          <p className="text-lg text-[#888888] leading-relaxed mb-8 max-w-xl">
            Create a beautiful, customizable, and fast QR code digital menu in minutes. Give your customers a premium table-side browsing experience — no app download required.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-4 bg-[#f7906c] hover:bg-[#e8754f] text-white font-bold rounded-[50px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Create your menu free</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/catalog"
              className="w-full sm:w-auto px-8 py-4 border border-[#f7906c] text-[#f7906c] hover:bg-[#f7906c]/5 font-bold rounded-[50px] transition-all text-center"
            >
              View Examples
            </Link>
          </div>

          <div className="flex items-center gap-6 mt-8 text-sm text-[#888888]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>30 Days Free Trial</span>
            </div>
            <div className="w-1.5 h-1.5 bg-[#eeeeee] rounded-full"></div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>No Setup Fees</span>
            </div>
          </div>
        </div>

        {/* Live CSS Phone Mockup */}
        <div className="lg:col-span-5 flex justify-center relative">
          <div className="absolute inset-0 bg-[#f7906c]/5 rounded-[40px] blur-3xl -z-10 transform scale-95 translate-y-12"></div>
          {/* Phone Frame */}
          <div className="w-[310px] h-[610px] rounded-[48px] bg-[#2d2d2d] p-3 shadow-2xl relative border-4 border-[#3d3d3d] overflow-hidden">
            {/* Speaker bar */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-[#2d2d2d] rounded-b-xl z-20 flex justify-center items-center">
              <div className="w-12 h-1 bg-[#1d1d1d] rounded-full"></div>
            </div>

            {/* Inner Phone Screen (SaaS Public Menu Mockup) */}
            <div className="w-full h-full rounded-[38px] bg-[#fdf6f2] overflow-y-auto px-4 pt-8 pb-4 relative scrollbar-none flex flex-col">
              {/* Header */}
              <div className="text-center pt-3 pb-2 border-b border-[#eeeeee]">
                <div className="w-12 h-12 rounded-full bg-[#f7906c] text-white flex items-center justify-center font-bold text-lg mx-auto mb-2 shadow-md">
                  C
                </div>
                <h4 className="font-heading font-extrabold text-base text-[#2d2d2d]">Cafe Castelo</h4>
                <p className="text-[10px] text-[#888888]">⚡ WiFi: CasteloFree | 📞 +252 61 5000000</p>
              </div>

              {/* Categories */}
              <div className="flex gap-2 py-3 overflow-x-auto scrollbar-none">
                <span className="px-3 py-1 rounded-full bg-[#f7906c] text-white font-bold text-[10px] shadow-sm">Burgers</span>
                <span className="px-3 py-1 rounded-full bg-white text-[#888888] font-bold text-[10px] border border-[#eeeeee]">Drinks</span>
                <span className="px-3 py-1 rounded-full bg-white text-[#888888] font-bold text-[10px] border border-[#eeeeee]">Desserts</span>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-3">
                <div className="p-2.5 rounded-2xl bg-white border border-[#eeeeee] shadow-sm flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-orange-100 flex-shrink-0 flex items-center justify-center font-bold text-orange-400">🍔</div>
                  <div>
                    <h5 className="font-bold text-xs text-[#2d2d2d]">Special Double Cheese</h5>
                    <p className="text-[9px] text-[#888888] line-clamp-1">Flame-grilled beef patty, extra cheddar</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-bold text-[#f7906c]">$6.50</span>
                      <span className="text-[8px] bg-red-100 text-red-500 font-bold px-1.5 py-0.5 rounded-full">⭐ Popular</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-[#eeeeee] shadow-sm flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-orange-100 flex-shrink-0 flex items-center justify-center font-bold text-orange-400">🥤</div>
                  <div>
                    <h5 className="font-bold text-xs text-[#2d2d2d]">Fresh Hibiscus Drink (Zobo)</h5>
                    <p className="text-[9px] text-[#888888] line-clamp-1">Chilled floral spice brew with ginger</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-bold text-[#f7906c]">$2.50</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-[#eeeeee] shadow-sm flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-orange-100 flex-shrink-0 flex items-center justify-center font-bold text-orange-400">🍟</div>
                  <div>
                    <h5 className="font-bold text-xs text-[#2d2d2d]">Spicy Somali Crisps</h5>
                    <p className="text-[9px] text-[#888888] line-clamp-1">Crispy wedges flavored with Xawaash spice</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-bold text-[#f7906c]">$3.00</span>
                      <span className="text-[8px] bg-amber-100 text-amber-600 font-bold px-1.5 py-0.5 rounded-full">🌶️ Spicy</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branding Footer */}
              <div className="mt-auto pt-6 text-center text-[9px] text-[#bcbcbc]">
                Powered by MenuQR.com
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white border-t border-b border-[#eeeeee] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-[#2d2d2d] mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-sm text-[#888888]">
              Ready to modernize your restaurant dining table? It takes under 5 minutes to launch your digital menu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#fdf6f2] border border-[#eeeeee] text-center card-shadow relative">
              <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-[#f7906c] text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                1
              </span>
              <h3 className="font-heading font-extrabold text-lg text-[#2d2d2d] mt-2 mb-3">
                Sign Up & Profile
              </h3>
              <p className="text-sm text-[#888888] leading-relaxed">
                Create a quick account, name your restaurant, and set your local currency (supporting USD, Somali Shilling Sh, and more).
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#fdf6f2] border border-[#eeeeee] text-center card-shadow relative">
              <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-[#f7906c] text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                2
              </span>
              <h3 className="font-heading font-extrabold text-lg text-[#2d2d2d] mt-2 mb-3">
                Visual Menu Editor
              </h3>
              <p className="text-sm text-[#888888] leading-relaxed">
                Add your menu categories (e.g. Burgers, Starters) and menu items with description, pricing, photos, and spicy/popular badges.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#fdf6f2] border border-[#eeeeee] text-center card-shadow relative">
              <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-[#f7906c] text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                3
              </span>
              <h3 className="font-heading font-extrabold text-lg text-[#2d2d2d] mt-2 mb-3">
                Generate & Place QR Codes
              </h3>
              <p className="text-sm text-[#888888] leading-relaxed">
                Download your automatically generated high-res QR code, print it, and stick it on tables. Your customers scan it to view!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto py-24 px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-[#2d2d2d] mb-4">
            Everything You Need to Manage Your Menu
          </h2>
          <p className="text-sm text-[#888888]">
            Ditch expensive paper printing. Update prices, mark dishes sold out, and customize themes instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-white border border-[#eeeeee] rounded-3xl card-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbe4db] text-[#f7906c] flex items-center justify-center mb-5">
              <QrCode className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-bold text-lg text-[#2d2d2d] mb-2">QR Code Generation</h4>
            <p className="text-sm text-[#888888] leading-relaxed">
              Auto-generates high-definition QR codes representing your restaurant. Custom branding and downloads enabled.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#eeeeee] rounded-3xl card-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbe4db] text-[#f7906c] flex items-center justify-center mb-5">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-bold text-lg text-[#2d2d2d] mb-2">Multi-Language & Somali</h4>
            <p className="text-sm text-[#888888] leading-relaxed">
              Full support for English, Somali (Soomaali), Arabic, French, and East African local languages for custom menu setups.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#eeeeee] rounded-3xl card-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbe4db] text-[#f7906c] flex items-center justify-center mb-5">
              <Palette className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-bold text-lg text-[#2d2d2d] mb-2">Custom Brand Theme</h4>
            <p className="text-sm text-[#888888] leading-relaxed">
              Choose between light & dark layouts and customize your brand primary color picker. Upload custom logos and backgrounds.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#eeeeee] rounded-3xl card-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbe4db] text-[#f7906c] flex items-center justify-center mb-5">
              <Smartphone className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-bold text-lg text-[#2d2d2d] mb-2">Instant Updates</h4>
            <p className="text-sm text-[#888888] leading-relaxed">
              Change prices, add items, or mark a burger sold out in real-time. Changes appear instantly upon next scan.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#eeeeee] rounded-3xl card-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbe4db] text-[#f7906c] flex items-center justify-center mb-5">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-bold text-lg text-[#2d2d2d] mb-2">Works On Any Device</h4>
            <p className="text-sm text-[#888888] leading-relaxed">
              Blazing fast load times optimized for 3G/4G connections. Supports basic Safari, Chrome, and Samsung browsers.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#eeeeee] rounded-3xl card-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbe4db] text-[#f7906c] flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-bold text-lg text-[#2d2d2d] mb-2">Menu Component Cards</h4>
            <p className="text-sm text-[#888888] leading-relaxed">
              Feature dashboard with templates for items visibility, scheduled prices, translation tables, and simple item options.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Embedded Pricing Section */}
      <section className="bg-white border-t border-b border-[#eeeeee] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-[#2d2d2d] mb-4">
              QR Code Menu Service Prices
            </h2>
            <p className="text-sm text-[#888888]">
              Select a payment plan. Transparent pricing, no hidden costs.
            </p>
            
            {/* Toggle periods */}
            <div className="inline-flex bg-[#fdf6f2] p-1 rounded-full border border-[#eeeeee] mt-6">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  billingPeriod === "monthly" ? "bg-white text-[#e8754f] shadow-sm" : "text-[#888888] hover:text-[#2d2d2d]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("6month")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all relative ${
                  billingPeriod === "6month" ? "bg-white text-[#e8754f] shadow-sm" : "text-[#888888] hover:text-[#2d2d2d]"
                }`}
              >
                Every 6 months
                <span className="absolute -top-2.5 -right-2 bg-[#f7906c] text-white text-[8px] px-1.5 py-0.5 rounded-full font-extrabold tracking-wide uppercase">
                  Best Value
                </span>
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  billingPeriod === "annual" ? "bg-white text-[#e8754f] shadow-sm" : "text-[#888888] hover:text-[#2d2d2d]"
                }`}
              >
                Annually
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Monthly Card */}
            <div className="bg-white border border-[#eeeeee] rounded-3xl p-8 card-shadow flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#2d2d2d] mb-4">Monthly Plan</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-sm font-bold text-[#888888]">$</span>
                  <span className="text-5xl font-heading font-extrabold text-[#2d2d2d]">10</span>
                  <span className="text-sm font-bold text-[#888888]">{plans.monthly.duration}</span>
                </div>
                <p className="text-xs text-[#888888] mb-6">Total amount is {plans.monthly.total} charged monthly</p>
                <hr className="border-[#eeeeee] mb-6" />
                <ul className="flex flex-col gap-3 text-sm text-[#888888] mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>1 Active Digital Menu</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Unlimited Dishes & Updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>High-Res QR Code downloads</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full text-center py-3 bg-[#fdf6f2] hover:bg-[#f7906c]/10 border border-[#f7906c] text-[#f7906c] font-bold rounded-[50px] transition-colors"
              >
                Sign up free
              </Link>
            </div>

            {/* 6 Months Card (Highlighted Coral) */}
            <div className="bg-[#f7906c] text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between transform scale-105 border-2 border-[#e8754f] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#e8754f] text-white text-[10px] font-extrabold uppercase py-1 px-4 rounded-bl-2xl shadow-sm tracking-wider">
                Popular Choice
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl mb-4">Every 6 Months</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-sm font-bold text-white/80">$</span>
                  <span className="text-6xl font-heading font-extrabold text-white">9.60</span>
                  <span className="text-sm font-bold text-white/80">{plans.halfYear.duration}</span>
                </div>
                <p className="text-xs text-white/80 mb-6">Total amount is {plans.halfYear.total} charged every 6 months</p>
                <hr className="border-[#eeeeee]/20 mb-6" />
                <ul className="flex flex-col gap-3 text-sm text-white/90 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                    <span>1 Active Digital Menu</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                    <span>Unlimited Dishes & Updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                    <span>High-Res QR Code downloads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                    <span>Theme customize color picker</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full text-center py-3 bg-white text-[#f7906c] hover:bg-orange-50 font-bold rounded-[50px] transition-all shadow-md"
              >
                Sign up free
              </Link>
            </div>

            {/* Annual Plan */}
            <div className="bg-white border border-[#eeeeee] rounded-3xl p-8 card-shadow flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#2d2d2d] mb-4">Annual Plan</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-sm font-bold text-[#888888]">$</span>
                  <span className="text-5xl font-heading font-extrabold text-[#2d2d2d]">9</span>
                  <span className="text-sm font-bold text-[#888888]">{plans.annual.duration}</span>
                </div>
                <p className="text-xs text-[#888888] mb-6">Total amount is {plans.annual.total} charged annually</p>
                <hr className="border-[#eeeeee] mb-6" />
                <ul className="flex flex-col gap-3 text-sm text-[#888888] mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>1 Active Digital Menu</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Unlimited Dishes & Updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>High-Res QR Code downloads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Priority Support Response</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full text-center py-3 bg-[#fdf6f2] hover:bg-[#f7906c]/10 border border-[#f7906c] text-[#f7906c] font-bold rounded-[50px] transition-colors"
              >
                Sign up free
              </Link>
            </div>
          </div>

          <div className="text-center mt-12 text-xs text-[#888888]">
            VAT may be applicable. Support local billing channels in East Africa.
          </div>

          {/* Banner: Free month trial */}
          <div className="max-w-4xl mx-auto mt-16 p-8 rounded-3xl bg-[#fbe4db] border border-[#f7906c]/20 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
            <div>
              <h3 className="font-heading font-extrabold text-xl text-[#2d2d2d] mb-1">
                Free QR code menu for a month
              </h3>
              <p className="text-sm text-[#888888]">
                Get instant access for 30 days — no credit card details required.
              </p>
            </div>
            <Link
              href="/sign-up"
              className="px-8 py-3.5 bg-[#f7906c] hover:bg-[#e8754f] text-white font-bold rounded-[50px] text-sm shadow-md hover:shadow-lg transition-all"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Call To Action Trial Banner */}
      <section className="bg-[#fdf6f2] py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading font-extrabold text-4xl text-[#2d2d2d] mb-6">
            Ready to upgrade your guest experience?
          </h2>
          <p className="text-[#888888] leading-relaxed mb-8">
            Create an account in 1 minute, visual-build your cafe, and print a custom QR table stand. Save printing costs and update anytime!
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-10 py-5 bg-[#f7906c] hover:bg-[#e8754f] text-white font-extrabold rounded-[50px] shadow-lg hover:shadow-xl transition-all"
          >
            <span>Start Free Trial Today</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-[#bcbcbc] mt-4">No credit card details required for trial.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
