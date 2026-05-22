"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

export default function PricingPage() {
  const plans = {
    monthly: { price: "10.00", total: "10.00", per: "mo" },
    halfYear: { price: "9.60", total: "57.60", per: "mo" },
    annual: { price: "9.00", total: "108.00", per: "mo" }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfe] selection:bg-[#f2bd11]/30">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl text-[#1b3151] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-sm text-slate-500">
            Predictable billing supporting USD and Somali Shillings. Get started with a 30-day trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl items-stretch mb-12">
          
          {/* Monthly Card: Crisp White */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#1b3151] mb-1">Monthly</h3>
              <p className="text-xs text-slate-400 mb-6">Cancel anytime</p>
              
              <div className="flex items-baseline mb-6">
                <span className="text-2xl font-bold text-[#1b3151]">$</span>
                <span className="text-5xl font-heading font-extrabold text-[#1b3151]">{plans.monthly.price}</span>
                <span className="text-sm font-bold text-slate-400">/mo</span>
              </div>
              
              <p className="text-xs text-slate-500 mb-6">Total amount is ${plans.monthly.total} charged monthly</p>
              <hr className="border-slate-100 mb-6" />
              
              <ul className="flex flex-col gap-4 text-sm text-slate-600 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                  <span>1 Active Digital Menu</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                  <span>Unlimited Dishes & Sections</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                  <span>Interactive Menu Editor</span>
                </li>
              </ul>
            </div>

            <Link
              href="/sign-up"
              className="w-full text-center py-3.5 bg-slate-50 hover:bg-[#f2bd11]/15 text-[#1b3151] hover:text-[#e0ad0b] border border-[#1b3151]/10 font-bold rounded-[50px] transition-colors text-sm"
            >
              Get Started
            </Link>
          </div>

          {/* 6 Months Card: Highlighted Premium Navy Blue Card with Premium Gold accents */}
          <div className="bg-[#1b3151] text-white rounded-[32px] p-8 shadow-xl flex flex-col justify-between transform scale-105 border-2 border-[#f2bd11] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#f2bd11] text-[#1b3151] text-[9px] font-extrabold uppercase py-1 px-4 rounded-bl-xl tracking-wider">
              Best Value
            </div>
            
            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#f2bd11] mb-1">Every 6 Months</h3>
              <p className="text-xs text-slate-300 mb-6">Save 10% compared to monthly</p>
              
              <div className="flex items-baseline mb-6">
                <span className="text-2xl font-bold text-[#f2bd11]">$</span>
                <span className="text-6xl font-heading font-extrabold text-[#f2bd11]">{plans.halfYear.price}</span>
                <span className="text-sm font-bold text-slate-300">/mo</span>
              </div>
              
              <p className="text-xs text-slate-300 mb-6">Total amount is ${plans.halfYear.total} charged every 6 months</p>
              <hr className="border-white/10 mb-6" />
              
              <ul className="flex flex-col gap-4 text-sm text-slate-200 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                  <span>1 Active Digital Menu</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                  <span>Unlimited Dishes & Sections</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                  <span>High-Res QR Code download</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                  <span>Choose template style carousel</span>
                </li>
              </ul>
            </div>

            <Link
              href="/sign-up"
              className="w-full text-center py-4 bg-[#f2bd11] hover:bg-[#e0ad0b] text-[#1b3151] font-extrabold rounded-[50px] transition-all text-sm shadow-md animate-pulse"
            >
              Get Started
            </Link>
          </div>

          {/* Annual Card: Crisp White */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#1b3151] mb-1">Annually</h3>
              <p className="text-xs text-slate-400 mb-6">Save 20% compared to monthly</p>
              
              <div className="flex items-baseline mb-6">
                <span className="text-2xl font-bold text-[#1b3151]">$</span>
                <span className="text-5xl font-heading font-extrabold text-[#1b3151]">{plans.annual.price}</span>
                <span className="text-sm font-bold text-slate-400">/mo</span>
              </div>
              
              <p className="text-xs text-slate-500 mb-6">Total amount is ${plans.annual.total} charged annually</p>
              <hr className="border-slate-100 mb-6" />
              
              <ul className="flex flex-col gap-4 text-sm text-slate-600 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                  <span>1 Active Digital Menu</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                  <span>Unlimited Dishes & Sections</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                  <span>High-Res QR Code download</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f2bd11] flex-shrink-0" />
                  <span>Priority 24/7 Support</span>
                </li>
              </ul>
            </div>

            <Link
              href="/sign-up"
              className="w-full text-center py-3.5 bg-slate-50 hover:bg-[#f2bd11]/15 text-[#1b3151] hover:text-[#e0ad0b] border border-[#1b3151]/10 font-bold rounded-[50px] transition-colors text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Small VAT disclaimer */}
        <p className="text-xs text-slate-400 mb-12 text-center">
          VAT may be applicable depending on your checkout country. Local billing channels (such as EVC Plus, eDahab, Telesom, M-Pesa) are supported via support.
        </p>

        {/* Free QR Code Card */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-8 max-w-2xl w-full flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-[#1b3151] mb-1">
              Free QR code menu for a month
            </h3>
            <p className="text-sm text-slate-500">
              Test all dashboard items, custom colors, and QR stands completely free.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="px-8 py-4 bg-[#f2bd11] hover:bg-[#e0ad0b] text-[#1b3151] font-extrabold rounded-[50px] text-sm shadow-md hover:shadow-lg transition-all whitespace-nowrap"
          >
            Start Free Month
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
