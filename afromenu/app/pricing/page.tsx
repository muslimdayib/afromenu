"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "6month" | "annual">("6month");

  const plans = {
    monthly: { price: "10", total: "10.00", per: "mo" },
    halfYear: { price: "9.60", total: "57.60", per: "mo" },
    annual: { price: "9.00", total: "108.00", per: "mo" }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf6f2] selection:bg-[#f7906c]/30">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl text-[#2d2d2d] mb-4">
            QR code menu service prices
          </h1>
          <p className="text-sm text-[#888888]">
            Simple, predictable pricing with full support for local restaurants. Switch plans anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl items-stretch mb-12">
          {/* Monthly Card */}
          <div className="bg-white border border-[#eeeeee] rounded-3xl p-8 card-shadow flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#2d2d2d] mb-1">Monthly</h3>
              <p className="text-xs text-[#888888] mb-6">Billed month-to-month</p>
              
              <div className="flex items-baseline mb-6">
                <span className="text-2xl font-bold text-[#2d2d2d]">$</span>
                <span className="text-5xl font-heading font-extrabold text-[#2d2d2d]">{plans.monthly.price}</span>
                <span className="text-sm font-bold text-[#888888]">/mo</span>
              </div>
              
              <p className="text-xs text-[#888888] mb-6">Total amount is ${plans.monthly.total} charged monthly</p>
              <hr className="border-[#eeeeee] mb-6" />
              
              <ul className="flex flex-col gap-3.5 text-sm text-[#888888] mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>1 Active Digital Menu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Unlimited Dishes & Sections</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Interactive Visual Editor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>WiFi Credentials & Tel Link</span>
                </li>
              </ul>
            </div>

            <Link
              href="/sign-up"
              className="w-full text-center py-3.5 bg-[#fdf6f2] hover:bg-[#f7906c]/10 border border-[#f7906c] text-[#f7906c] font-bold rounded-[50px] transition-colors text-sm"
            >
              Get started
            </Link>
          </div>

          {/* 6 Months Card (Highlighted, slightly larger) */}
          <div className="bg-[#f7906c] text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between transform scale-105 border-2 border-[#e8754f] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#e8754f] text-white text-[9px] font-extrabold uppercase py-1 px-4 rounded-bl-xl tracking-wider">
              Best Value
            </div>
            
            <div>
              <h3 className="font-heading font-extrabold text-lg mb-1">Every 6 months</h3>
              <p className="text-xs text-white/80 mb-6">Save 10% compared to monthly</p>
              
              <div className="flex items-baseline mb-6">
                <span className="text-2xl font-bold text-white">$</span>
                <span className="text-6xl font-heading font-extrabold text-white">{plans.halfYear.price}</span>
                <span className="text-sm font-bold text-white/80">/mo</span>
              </div>
              
              <p className="text-xs text-white/80 mb-6">Total amount is ${plans.halfYear.total} charged every 6 months</p>
              <hr className="border-[#eeeeee]/20 mb-6" />
              
              <ul className="flex flex-col gap-3.5 text-sm text-white/95 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span>1 Active Digital Menu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Unlimited Dishes & Sections</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span>High-Res QR Code download</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Theme & brand custom colors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Custom logo & backgrounds</span>
                </li>
              </ul>
            </div>

            <Link
              href="/sign-up"
              className="w-full text-center py-3.5 bg-white text-[#f7906c] hover:bg-orange-50 font-bold rounded-[50px] transition-all text-sm shadow-md"
            >
              Get started
            </Link>
          </div>

          {/* Annual Card */}
          <div className="bg-white border border-[#eeeeee] rounded-3xl p-8 card-shadow flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#2d2d2d] mb-1">Annually</h3>
              <p className="text-xs text-[#888888] mb-6">Save 20% compared to monthly</p>
              
              <div className="flex items-baseline mb-6">
                <span className="text-2xl font-bold text-[#2d2d2d]">$</span>
                <span className="text-5xl font-heading font-extrabold text-[#2d2d2d]">9.00</span>
                <span className="text-sm font-bold text-[#888888]">/mo</span>
              </div>
              
              <p className="text-xs text-[#888888] mb-6">Total amount is ${plans.annual.total} charged annually</p>
              <hr className="border-[#eeeeee] mb-6" />
              
              <ul className="flex flex-col gap-3.5 text-sm text-[#888888] mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>1 Active Digital Menu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Unlimited Dishes & Sections</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>High-Res QR Code download</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Theme & brand custom colors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Priority 24/7 Email Support</span>
                </li>
              </ul>
            </div>

            <Link
              href="/sign-up"
              className="w-full text-center py-3.5 bg-[#fdf6f2] hover:bg-[#f7906c]/10 border border-[#f7906c] text-[#f7906c] font-bold rounded-[50px] transition-colors text-sm"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Small VAT disclaimer */}
        <p className="text-xs text-[#888888] mb-12 text-center">
          VAT may be applicable depending on your country of checkout. Local billing channels in East Africa (Somalia, Kenya, etc.) are available.
        </p>

        {/* Free QR Code Card */}
        <div className="bg-white border border-[#eeeeee] rounded-3xl p-8 max-w-2xl w-full flex flex-col sm:flex-row justify-between items-center gap-6 card-shadow">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-[#2d2d2d] mb-1">
              Free QR code menu for a month
            </h3>
            <p className="text-sm text-[#888888]">
              Test all dashboard items, custom colors, and QR stands completely free.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="px-8 py-3 bg-[#f7906c] hover:bg-[#e8754f] text-white font-extrabold rounded-[50px] text-sm shadow-md transition-all whitespace-nowrap"
          >
            Start free month
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
