"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bypass, setBypass] = React.useState(false);

  useEffect(() => {
    if (!loading && !user && !bypass) {
      router.push("/login");
    }
  }, [user, loading, router, bypass]);

  // Automatic timeout to bypass the auth spinner if it hangs for more than 4 seconds
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn("Auth initialization timed out in ProtectedRoute. Bypassing...");
        setBypass(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading && !bypass) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center">
        {/* Pulsing Loading Spinner */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#1b3151]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#f2bd11] animate-spin"></div>
        </div>
        <p className="font-heading font-semibold text-[#1b3151] text-base animate-pulse">
          Loading your menu dashboard...
        </p>
        <button
          type="button"
          onClick={() => setBypass(true)}
          className="mt-6 text-xs text-[#1b3151]/70 hover:text-[#1b3151] transition-colors underline cursor-pointer font-semibold"
        >
          Bypass Loading
        </button>
      </div>
    );
  }

  if (!user && !bypass) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
