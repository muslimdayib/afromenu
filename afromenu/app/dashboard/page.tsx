"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  Utensils, 
  Plus, 
  ExternalLink, 
  LogOut, 
  Store, 
  Loader2, 
  AlertCircle,
  Clock,
  Sparkles
} from "lucide-react";

function DashboardContent() {
  const { user, session, signOut } = useAuth();
  const router = useRouter();
  
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Retrieve session token to authenticate the API request
      let token = session?.access_token;
      if (!token) {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData.session?.access_token;
      }

      if (!token) {
        throw new Error("No active session token found. Please log in again.");
      }

      const res = await fetch("/api/establishments/mine", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(
          responseData.details || responseData.error || "Failed to query establishments."
        );
      }

      setEstablishments(responseData.establishments || []);
    } catch (err: any) {
      console.error("Error fetching establishments:", err);
      setError(err?.message || "Failed to check existing establishments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEstablishments();
    }
  }, [user]);

  const originUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  return (
    <div className="min-h-screen bg-[#fafbfe] text-[#1b3151] flex flex-col justify-between">
      
      {/* Top Premium Navbar */}
      <header className="bg-[#1b3151] border-b border-[#f2bd11]/20 px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#f2bd11] font-bold shadow-sm border border-white/5">
              <Utensils className="w-5 h-5 text-[#f2bd11]" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-white">
              Afro<span className="text-[#f2bd11]">menu</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-slate-300 font-bold">
                {user?.user_metadata?.name || user?.email}
              </span>
              <span className="text-[10px] text-[#f2bd11] font-bold uppercase tracking-wider">
                Partner Portal
              </span>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        
        {/* Welcome Banner */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-5 h-5 text-[#f2bd11] fill-[#f2bd11]/10" />
            <span className="text-xs font-extrabold text-[#f2bd11] tracking-wider uppercase">Welcome Back</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-[#1b3151]">
            Your Digital Menus
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Manage your establishments, view live QR code links, and curate beautiful interactive menu layouts.
          </p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#f2bd11] animate-spin mb-4" />
            <p className="text-sm text-slate-500 font-semibold animate-pulse">
              Retrieving your establishments...
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-50/50 border border-red-100 rounded-3xl p-8 max-w-md mx-auto text-center shadow-sm animate-slide-up flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="font-heading font-extrabold text-lg text-[#1b3151] mb-2">
              Failed to Load Dashboard
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-mono bg-white p-3 rounded-xl border border-slate-100 w-full break-all">
              {error}
            </p>
            <button
              onClick={fetchEstablishments}
              className="px-6 py-2.5 bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] font-extrabold text-xs rounded-full shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          /* Main Establishments Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            
            {/* List existing establishments */}
            {establishments.map((est) => {
              const liveUrl = `${originUrl}/p/${est.slug}`;

              return (
                <div 
                  key={est.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                >
                  {/* Card top details */}
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      {/* Logo placeholder */}
                      <div className="w-12 h-12 rounded-2xl bg-[#1b3151]/5 text-[#1b3151] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        {est.logo_url ? (
                          <img 
                            src={est.logo_url} 
                            alt={est.name} 
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <Store className="w-6 h-6 text-[#1b3151]" />
                        )}
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] font-extrabold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Live & Active
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 capitalize">
                          {(est.template_style || "default").replace("-", " ")} Style
                        </span>
                      </div>
                    </div>

                    <h3 className="font-heading font-extrabold text-xl mb-1 text-[#1b3151] truncate">
                      {est.name}
                    </h3>
                    
                    {/* Live QR Link display */}
                    <a 
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-[#f2bd11] font-semibold flex items-center gap-1 mt-1 transition-colors w-fit break-all font-mono"
                    >
                      <span>{liveUrl.replace("http://", "").replace("https://", "")}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Card bottom CTA options */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/p/${est.slug}`)}
                      className="flex-1 py-2.5 bg-[#1b3151] hover:bg-[#15253d] text-white font-bold rounded-xl text-xs shadow-sm transition-all hover:scale-[1.01] cursor-pointer text-center"
                    >
                      Edit Menu
                    </button>
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-[#1b3151] hover:border-slate-300 font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center"
                    >
                      View Live
                    </a>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => router.push("/onboarding?new=true")}
              className="bg-white rounded-3xl border-2 border-dashed border-slate-200 hover:border-[#f2bd11] p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-[#f2bd11]/5 hover:shadow-lg min-h-[220px] group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#f2bd11]/10 text-[#f2bd11] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-[#1b3151] mb-1">
                Add Establishment
              </h3>
              <p className="text-xs text-slate-400 max-w-[200px] leading-normal">
                Create a new gourmet digital menu for another branch or brand.
              </p>
            </button>
            
          </div>
        )}

      </main>

      {/* Powered Footer */}
      <footer className="text-center py-6 border-t border-slate-100 text-xs text-slate-400">
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
