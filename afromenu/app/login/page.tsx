"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Utensils, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (user) {
      router.push("/onboarding");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
      } else if (data?.user) {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfe] flex flex-col justify-between py-12 px-6">
      {/* Top Navbar Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-[#1b3151] flex items-center justify-center text-[#f2bd11] font-bold shadow-md">
            <Utensils className="w-5 h-5 text-[#f2bd11]" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-[#1b3151]">
            Afro<span className="text-[#f2bd11]">menu</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/catalog" className="text-sm font-semibold text-gray-500 hover:text-[#1b3151] transition-colors">
            Menu Examples
          </Link>
          <Link href="/pricing" className="text-sm font-semibold text-gray-500 hover:text-[#1b3151] transition-colors">
            Pricing
          </Link>
          <Link href="/sign-up" className="px-5 py-2 text-sm font-extrabold text-[#1b3151] bg-[#f2bd11] hover:bg-[#dbab0f] rounded-[50px] transition-colors shadow-sm">
            Sign up
          </Link>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 md:p-10 rounded-[24px] max-w-md w-full border border-gray-100 shadow-xl animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#1b3151] mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500">
              Log in to manage your QR code digital menus.
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-[#1b3151] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@restaurant.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f2bd11] focus:ring-1 focus:ring-[#f2bd11] focus:outline-none text-sm text-[#1b3151] transition-all bg-[#fafbfe]/50 placeholder:text-gray-400 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1b3151] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your account password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f2bd11] focus:ring-1 focus:ring-[#f2bd11] focus:outline-none text-sm text-[#1b3151] pr-10 transition-all bg-[#fafbfe]/50 placeholder:text-gray-400 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#1b3151]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#f2bd11] hover:bg-[#dbab0f] disabled:bg-gray-300 text-[#1b3151] font-extrabold rounded-[50px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2 text-sm cursor-pointer"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-gray-500">
            New to Afromenu?{" "}
            <Link href="/sign-up" className="text-[#1b3151] font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 mt-8">
        &copy; {new Date().getFullYear()} Afromenu. All rights reserved.
      </footer>
    </div>
  );
}
