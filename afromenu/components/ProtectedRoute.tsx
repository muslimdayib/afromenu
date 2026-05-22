"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6f2] flex flex-col items-center justify-center">
        {/* Pulsing Loading Spinner */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#f7906c]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#f7906c] animate-spin"></div>
        </div>
        <p className="font-heading font-semibold text-[#2d2d2d] text-lg animate-pulse">
          Loading your menu dashboard...
        </p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
