"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Utensils, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
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

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agree) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
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
    <div className="min-h-screen bg-[#fdf6f2] flex flex-col justify-between py-12 px-6">
      {/* Top Navbar Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-[#f7906c] flex items-center justify-center text-white font-bold">
            <Utensils className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-[#2d2d2d]">
            Menu<span className="text-[#f7906c]">QR</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/catalog" className="text-sm font-semibold text-[#888888] hover:text-[#2d2d2d] transition-colors">
            Menu Examples
          </Link>
          <Link href="/pricing" className="text-sm font-semibold text-[#888888] hover:text-[#2d2d2d] transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="px-5 py-2 text-sm font-bold text-[#f7906c] hover:bg-[#f7906c]/5 border border-[#f7906c] rounded-[50px] transition-colors">
            Log in
          </Link>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 md:p-10 rounded-[24px] max-w-md w-full border border-[#eeeeee] card-shadow animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#2d2d2d] mb-2">
              Create your account
            </h2>
            <p className="text-sm text-[#888888]">
              Start your free 1-month digital menu trial today.
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abdullahi Ahmed"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f7906c] focus:outline-none text-sm text-[#2d2d2d] transition-all bg-[#fdf6f2]/50 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@restaurant.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f7906c] focus:outline-none text-sm text-[#2d2d2d] transition-all bg-[#fdf6f2]/50 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6+ characters"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f7906c] focus:outline-none text-sm text-[#2d2d2d] pr-10 transition-all bg-[#fdf6f2]/50 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#2d2d2d]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-1">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#f7906c] focus:ring-[#f7906c] cursor-pointer"
              />
              <label htmlFor="agree" className="text-xs text-[#888888] leading-relaxed cursor-pointer select-none">
                Creating an account means you are okay with our{" "}
                <span className="text-[#f7906c] font-semibold hover:underline">
                  Terms of Service
                </span>{" "}
                and Privacy Policy.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#f7906c] hover:bg-[#e8754f] disabled:bg-gray-300 text-white font-bold rounded-[50px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2 text-sm"
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-[#888888]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#f7906c] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-[#888888] mt-8">
        &copy; {new Date().getFullYear()} MenuQR. All rights reserved.
      </footer>
    </div>
  );
}
