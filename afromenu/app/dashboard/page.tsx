"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  Utensils, 
  Plus, 
  ExternalLink, 
  LogOut, 
  Store, 
  Sparkles,
  ChevronDown,
  User,
  Settings,
  AlertCircle
} from "lucide-react";

function DashboardContent() {
  const { user, session, signOut } = useAuth();
  const router = useRouter();
  
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchEstablishments = async () => {
    try {
      setError(null);
      const res = await fetch('/api/establishments/mine', {
        credentials: 'include',
        cache: 'no-store',
      });
      
      console.log('Dashboard fetch status:', res.status);
      
      if (res.status === 401) {
        console.log('Not authenticated - going to login');
        router.push('/login');
        return;
      }
      
      const text = await res.text();
      console.log('Dashboard response:', text.slice(0, 200));
      
      try {
        const data = JSON.parse(text);
        setEstablishments(data.establishments || []);
      } catch {
        console.error('Parse failed:', text.slice(0, 100));
        setEstablishments([]);
      }
      
    } catch (err: any) {
      console.error('Dashboard error:', err.message);
      setError(err?.message || "Failed to check existing establishments.");
      setEstablishments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, [router]);

  // Click outside to close avatar dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const originUrl = typeof window !== "undefined" ? window.location.origin : "afromenu.com";
  const userInitial = user?.user_metadata?.name?.[0] || user?.email?.[0] || "U";

  return (
    <div className="min-h-screen bg-bg text-text-main flex flex-col justify-between font-body antialiased">
      
      {/* 1. PREMIUM HEADER NAVBAR */}
      <header className="bg-[#1b3151] border-b border-white/10 sticky top-0 z-30 transition-all duration-200 shadow-sm">
        <div className="max-w-6xl w-full mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="Afromenu"
              width={130}
              height={38}
              priority
              className="h-9 w-auto brightness-0 invert"
            />
          </Link>

          {/* User profile dropdown on the right */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/20"
            >
              <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-extrabold text-sm uppercase shadow-sm select-none">
                {userInitial}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-white pr-1 max-w-[100px] truncate">
                {user?.user_metadata?.name || user?.email?.split("@")[0]}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu card */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-surface rounded-2xl border border-border-main shadow-lg py-2.5 z-40 animate-slide-up">
                <div className="px-4 py-2 border-b border-border-main mb-1.5">
                  <p className="text-xs font-bold text-text-main truncate">
                    {user?.user_metadata?.name || "Partner"}
                  </p>
                  <p className="text-[10px] text-text-sub font-mono truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/dashboard");
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-text-main hover:bg-surface-2 hover:text-brand flex items-center gap-2.5 transition-colors cursor-pointer border-0 bg-transparent"
                >
                  <User className="w-4 h-4 text-text-sub" />
                  <span>My Profile</span>
                </button>

                <hr className="border-border-main my-1.5" />

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    signOut();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-error hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer border-0 bg-transparent"
                >
                  <LogOut className="w-4 h-4 text-error" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN GRID AND CORE SECTION */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        
        {/* Title details */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-5 h-5 text-brand fill-brand/10 animate-pulse" />
            <span className="text-[10px] font-extrabold text-brand tracking-widest uppercase">Partner Hub</span>
          </div>
          <h1 className="font-heading font-black text-[28px] text-text-main leading-none">
            My Restaurants
          </h1>
          <p className="text-xs text-text-sub mt-2 max-w-xl leading-relaxed">
            Manage your establishments, view live QR code links, and curate premium interactive menu layouts.
          </p>
        </div>

        {error ? (
          /* Robust Error boundary display */
          <div className="bg-white border border-border-main rounded-3xl p-8 max-w-md mx-auto text-center shadow-md animate-slide-up flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-error mb-4" />
            <h3 className="font-heading font-extrabold text-base text-text-main mb-1">
              Connection Sync Failed
            </h3>
            <p className="text-xs text-text-sub mb-6 font-mono bg-surface-2 p-3.5 rounded-xl border border-border-main w-full break-all">
              {error}
            </p>
            <button
              onClick={() => {
                setLoading(true);
                fetchEstablishments();
              }}
              className="px-6 py-3 bg-brand hover:bg-brand-secondary text-white font-extrabold text-xs rounded-full shadow-md transition-all hover:scale-[1.01] cursor-pointer border-0"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          /* Grid list (skeleton loader if loading) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {loading ? (
              /* Premium Skeleton grid cards loading instantly */
              <>
                {[1, 2, 3].map((s) => (
                  <div key={s} className="bg-white rounded-3xl border border-border-main overflow-hidden shadow-sm h-[360px] flex flex-col justify-between p-0">
                    <div className="animate-pulse bg-gray-200 h-40 w-full relative">
                      <div className="absolute -bottom-6.5 left-5 w-13 h-13 rounded-full border-3 border-white bg-gray-300"></div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col gap-3 justify-center mt-3">
                      <div className="animate-pulse bg-gray-200 rounded-lg h-5 w-3/4"></div>
                      <div className="animate-pulse bg-gray-200 rounded-lg h-3 w-1/2"></div>
                      <div className="animate-pulse bg-gray-200 rounded-lg h-3.5 w-1/3 mt-1"></div>
                    </div>
                    <div className="p-5 border-t border-border-main bg-slate-50/20">
                      <div className="animate-pulse bg-gray-200 rounded-full h-11 w-full"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              /* Real dashboard establishments cards */
              <>
                {establishments.map((est) => {
                  const liveUrl = `${originUrl}/p/${est.slug}`;
                  const estBrand = est.brand_color || "#f2bd11";
                  const estBrandSecondary = est.brand_color_secondary || "#1b3151";

                  return (
                    <div 
                      key={est.id}
                      className="bg-white rounded-3xl border border-border-main shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 h-[360px]"
                    >
                      {/* Card Top cover */}
                      <div 
                        className="h-40 w-full relative flex-shrink-0"
                        style={{
                          backgroundImage: est.background_url ? `url(${est.background_url})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          background: est.background_url ? undefined : `linear-gradient(135deg, ${estBrand} 0%, ${estBrandSecondary} 100%)`
                        }}
                      >
                        <div className="absolute inset-0 bg-black/10"></div>
                        
                        {/* Overlapping Logo Circle bottom-left of cover */}
                        <div className="absolute -bottom-6.5 left-5">
                          <div className="w-13 h-13 rounded-full border-3 border-white overflow-hidden shadow-sm bg-white flex items-center justify-center select-none">
                            {est.logo_url ? (
                              <img 
                                src={est.logo_url} 
                                alt={est.name} 
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <Store className="w-5 h-5 text-text-sub" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom detail */}
                      <div className="p-5 pt-8 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2.5">
                            <h3 className="font-heading font-bold text-lg text-text-main truncate max-w-[180px]">
                              {est.name}
                            </h3>
                            <span className="text-[9px] font-black uppercase text-[#10b981] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                              <span>Active</span>
                            </span>
                          </div>

                          <a 
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-text-sub hover:text-brand font-semibold flex items-center gap-1.5 mt-1.5 transition-colors w-fit break-all font-mono"
                          >
                            <span>{liveUrl.replace("http://", "").replace("https://", "")}</span>
                            <ExternalLink className="w-3 h-3 text-text-sub" />
                          </a>
                        </div>

                        {/* Full width custom brand accent button */}
                        <button
                          onClick={() => router.push(`/p/${est.slug}`)}
                          style={{ 
                            backgroundColor: estBrand,
                            color: estBrand === "#f2bd11" ? "#1b3151" : "#ffffff",
                            boxShadow: `0 4px 14px -3px ${estBrand}60`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = estBrand === "#f2bd11" ? "#d4a50e" : estBrandSecondary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = estBrand;
                          }}
                          className="w-full h-11 font-extrabold rounded-full text-xs transition-all flex items-center justify-center cursor-pointer border-0 mt-3 hover:scale-[1.01]"
                        >
                          Edit Menu
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* ADD NEW ESTABLISHMENT CARD */}
            <button
              onClick={() => router.push("/onboarding?new=true")}
              className="bg-white rounded-3xl border-2 border-dashed border-border-main hover:border-brand p-8 flex flex-col items-center justify-center text-center transition-all duration-200 hover:bg-brand/5 hover:shadow-lg min-h-[360px] group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200 shadow-xs">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-text-main mb-1">
                Add Restaurant
              </h3>
              <p className="text-xs text-text-sub max-w-[200px] leading-normal font-medium">
                Start building your menu details for another branch or brand.
              </p>
            </button>
            
          </div>
        )}

      </main>

      {/* Powered Footer */}
      <footer className="text-center py-6 border-t border-border-main text-xs text-text-sub font-semibold">
        &copy; {new Date().getFullYear()} Afromenu SaaS. All rights reserved.
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
