"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Utensils } from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="Afromenu"
            width={140}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/catalog"
            className="text-sm font-semibold text-gray-500 hover:text-[#f2bd11] transition-colors"
          >
            Menu Examples
          </Link>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-sm font-semibold text-gray-500 hover:text-[#f2bd11] transition-colors cursor-not-allowed"
          >
            Blog (Coming Soon)
          </a>
          <Link
            href="/pricing"
            className="text-sm font-semibold text-gray-500 hover:text-[#f2bd11] transition-colors"
          >
            Pricing
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/onboarding"
                className="text-sm font-bold text-[#1b3151] hover:text-[#f2bd11] transition-colors"
              >
                Onboarding
              </Link>
              <button
                onClick={signOut}
                className="text-sm font-bold text-[#1b3151] hover:text-red-500 transition-colors"
              >
                Log Out
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-2.5 rounded-[50px] bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] font-bold text-sm transition-all shadow-md"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold text-[#1b3151] hover:text-[#f2bd11] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-2.5 rounded-[50px] bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] font-bold text-sm transition-all shadow-md"
              >
                Create menu
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-[#1b3151] p-1 focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 py-6 px-6 flex flex-col gap-4 shadow-lg animate-slide-up">
          <Link
            href="/catalog"
            onClick={() => setIsOpen(false)}
            className="text-base font-semibold text-gray-500 hover:text-[#f2bd11] py-2"
          >
            Menu Examples
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsOpen(false)}
            className="text-base font-semibold text-gray-500 hover:text-[#f2bd11] py-2"
          >
            Pricing
          </Link>
          <hr className="border-gray-100" />
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-base font-bold text-[#1b3151] hover:text-[#f2bd11] py-2"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className="text-left text-base font-bold text-red-500 py-2"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-base font-bold text-[#1b3151] hover:text-[#f2bd11] py-2"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 rounded-[50px] bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] font-bold transition-all shadow-md"
              >
                Create menu
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
