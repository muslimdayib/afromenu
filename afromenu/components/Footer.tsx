import React from "react";
import Link from "next/link";
import { Utensils } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#eeeeee] pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#1b3151] flex items-center justify-center text-[#f2bd11] font-bold">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-[#1b3151]">
              Afro<span className="text-[#f2bd11]">menu</span>
            </span>
          </Link>
          <p className="text-[#888888] text-sm max-w-sm leading-relaxed mb-6">
            Create beautiful, responsive QR code digital menus for your restaurant, cafe, or bar. Make it easy for your customers to browse, tap, and order.
          </p>
        </div>

        {/* Links: Product */}
        <div>
          <h4 className="font-heading font-bold text-[#1b3151] text-sm mb-4 tracking-wide uppercase">
            Product
          </h4>
          <ul className="flex flex-col gap-3">
            <li>
              <Link href="/pricing" className="text-sm text-[#888888] hover:text-[#f2bd11] transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/catalog" className="text-sm text-[#888888] hover:text-[#f2bd11] transition-colors">
                Menu Examples
              </Link>
            </li>
            <li>
              <span className="text-sm text-[#bcbcbc] cursor-not-allowed">
                Analytics (V2)
              </span>
            </li>
          </ul>
        </div>

        {/* Links: Company */}
        <div>
          <h4 className="font-heading font-bold text-[#1b3151] text-sm mb-4 tracking-wide uppercase">
            Legal & Support
          </h4>
          <ul className="flex flex-col gap-3">
            <li>
              <span className="text-sm text-[#888888] hover:text-[#f2bd11] cursor-pointer">
                Terms of Service
              </span>
            </li>
            <li>
              <span className="text-sm text-[#888888] hover:text-[#f2bd11] cursor-pointer">
                Privacy Policy
              </span>
            </li>
            <li>
              <span className="text-sm text-[#888888] hover:text-[#f2bd11] cursor-pointer">
                Contact Support
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#eeeeee] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#888888]">
          &copy; {new Date().getFullYear()} <span className="font-semibold text-[#1b3151]">Afromenu</span>. All rights reserved.
        </p>
        <p className="text-xs text-[#888888]">
          Made with ❤️ for restaurants in Somalia, East Africa, & Middle East.
        </p>
      </div>
    </footer>
  );
}
