"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Utensils } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fdf6f2] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[#fbe4db] text-[#f7906c] flex items-center justify-center mb-6 shadow-md shadow-[#f7906c]/10">
        <Utensils className="w-10 h-10" />
      </div>
      <h1 className="font-heading font-extrabold text-3xl text-[#2d2d2d] mb-3">
        Menu Not Found
      </h1>
      <p className="text-sm text-[#888888] max-w-sm leading-relaxed mb-8">
        The establishment or menu catalog you are looking for does not exist or has been modified by the owner.
      </p>
      <button
        onClick={() => router.push("/")}
        className="px-8 py-3 rounded-full bg-[#f7906c] hover:bg-[#e8754f] text-white font-bold text-sm shadow-md shadow-[#f7906c]/20 transition-all active:scale-95 duration-200"
      >
        Return Home
      </button>
    </div>
  );
}
