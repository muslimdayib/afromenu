"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Puzzle, QrCode, MoreHorizontal, Settings, CreditCard, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface BottomNavProps {
  slug: string;
  activeTab: "edit" | "components" | "qr" | "more";
  onOpenEditEstablishment: () => void;
}

export default function BottomNav({ slug, activeTab, onOpenEditEstablishment }: BottomNavProps) {
  const { signOut } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const router = useRouter();

  const handleMoreItemClick = (action: () => void) => {
    setShowMoreMenu(false);
    action();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#eeeeee] pb-safe-bottom shadow-lg">
      {/* More Options Popover */}
      {showMoreMenu && (
        <>
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/10 z-40"
            onClick={() => setShowMoreMenu(false)}
          ></div>
          
          <div className="absolute bottom-[65px] right-4 bg-white border border-[#eeeeee] rounded-2xl shadow-xl p-2 w-52 z-50 animate-slide-up flex flex-col gap-1">
            <button
              onClick={() => handleMoreItemClick(onOpenEditEstablishment)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#2d2d2d] hover:bg-[#f7906c]/10 hover:text-[#f7906c] rounded-xl transition-all text-left w-full"
            >
              <Settings className="w-4.5 h-4.5" />
              <span>Edit Info</span>
            </button>
            
            <button
              onClick={() => handleMoreItemClick(() => router.push(`/panel/${slug}/billing`))}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#2d2d2d] hover:bg-[#f7906c]/10 hover:text-[#f7906c] rounded-xl transition-all text-left w-full"
            >
              <CreditCard className="w-4.5 h-4.5" />
              <span>Billing</span>
            </button>
            
            <hr className="border-[#eeeeee] my-1" />
            
            <button
              onClick={() => handleMoreItemClick(signOut)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all text-left w-full"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Log out</span>
            </button>
          </div>
        </>
      )}

      {/* Main Tabs Container */}
      <div className="max-w-[430px] mx-auto flex items-center justify-around h-16 px-4">
        {/* Edit Menu */}
        <Link
          href={`/p/${slug}`}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === "edit" ? "text-[#f7906c]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Edit2 className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold tracking-wide uppercase">Edit Menu</span>
        </Link>

        {/* Components */}
        <Link
          href={`/panel/${slug}/components`}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === "components" ? "text-[#f7906c]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Puzzle className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold tracking-wide uppercase">Components</span>
        </Link>

        {/* QR Code */}
        <Link
          href={`/panel/${slug}/qr-code`}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === "qr" ? "text-[#f7906c]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <QrCode className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold tracking-wide uppercase">QR Code</span>
        </Link>

        {/* More Tab */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === "more" || showMoreMenu ? "text-[#f7906c]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold tracking-wide uppercase">More</span>
        </button>
      </div>
    </div>
  );
}
