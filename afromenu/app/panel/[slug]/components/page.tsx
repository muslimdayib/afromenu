"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import EditEstablishmentModal from "@/components/EditEstablishmentModal";
import { Puzzle, Sparkles, Sliders, EyeOff, Globe2, CalendarDays, ArrowRight, Lock } from "lucide-react";

function ComponentsContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [establishment, setEstablishment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);

  const fetchEstablishment = async () => {
    try {
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        router.push("/onboarding");
        return;
      }
      setEstablishment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchEstablishment();
    }
  }, [slug]);

  if (loading || !establishment) {
    return (
      <div className="min-h-screen bg-[#fdf6f2] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#f7906c]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#f7906c] animate-spin"></div>
        </div>
        <p className="font-heading font-semibold text-sm text-[#888888]">
          Loading panel features...
        </p>
      </div>
    );
  }

  const components = [
    {
      title: "Add-ons & Options",
      desc: "Allow extra options per item (e.g. 'Extra cheese +$0.50' or double patty choices).",
      icon: Sliders,
      comingSoon: true,
    },
    {
      title: "Items Visibility",
      desc: "Instantly hide specific dishes or whole drink lines without deleting the cards.",
      icon: EyeOff,
      comingSoon: true,
    },
    {
      title: "Multi-Language Translators",
      desc: "Write category & item descriptions in Somali, Arabic, or French translation tables.",
      icon: Globe2,
      comingSoon: true,
    },
    {
      title: "Scheduled Price Updates",
      desc: "Automate menu price changes on select hours (e.g., Happy Hour drink prices).",
      icon: CalendarDays,
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fdf6f2] pb-24 text-[#2d2d2d]">
      {/* Topbar */}
      <div className="bg-white border-b border-[#eeeeee] px-6 py-4 sticky top-0 z-30 shadow-sm flex items-center justify-between max-w-[430px] mx-auto">
        <button
          onClick={() => router.push(`/p/${slug}`)}
          className="w-9 h-9 rounded-full bg-gray-50 border border-[#eeeeee] flex items-center justify-center text-[#2d2d2d] hover:bg-gray-100 transition-colors font-bold"
        >
          ✕
        </button>
        <div className="text-center">
          <h1 className="font-heading font-extrabold text-base tracking-tight truncate max-w-[180px]">
            {establishment.name}
          </h1>
          <span className="text-[10px] bg-[#fbe4db] text-[#f7906c] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Components Panel
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#f7906c] text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase">
          {establishment.name[0]}
        </div>
      </div>

      {/* Main Content (Mobile size locked at 430px centered) */}
      <main className="max-w-[430px] mx-auto px-4 py-6">
        {/* Info Box */}
        <div className="p-4 rounded-3xl bg-white border border-[#eeeeee] card-shadow mb-6 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#fbe4db] text-[#f7906c] flex items-center justify-center flex-shrink-0">
            <Puzzle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs">Unlock Custom Features</h4>
            <p className="text-[10px] text-[#888888] leading-normal">
              Activate options, languages, and automatic scheduling templates.
            </p>
          </div>
        </div>

        {/* 2x2 Grid Components list */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {components.map((comp, idx) => {
            const CompIcon = comp.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#eeeeee] rounded-[24px] p-5 card-shadow flex flex-col justify-between relative overflow-hidden group hover:border-[#f7906c]/30 transition-all cursor-not-allowed"
              >
                {/* Locked layer */}
                <div className="absolute top-4 right-4 bg-gray-100 text-gray-400 p-1.5 rounded-full">
                  <Lock className="w-3.5 h-3.5" />
                </div>

                <div className="pr-8">
                  <div className="w-10 h-10 rounded-xl bg-[#fdf6f2] text-[#f7906c] flex items-center justify-center mb-4">
                    <CompIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-[#2d2d2d] mb-1.5 flex items-center gap-1.5">
                    <span>{comp.title}</span>
                  </h3>
                  <p className="text-[10px] text-[#888888] leading-relaxed mb-4">
                    {comp.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#eeeeee]/50">
                  <span className="text-[8px] font-extrabold uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Coming in V2 (Premium)</span>
                  </span>
                  <span className="text-[10px] font-bold text-gray-300 flex items-center gap-0.5">
                    <span>Locked</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav
        slug={slug}
        activeTab="components"
        onOpenEditEstablishment={() => setIsEstModalOpen(true)}
      />

      {/* Branding Edit Modal */}
      <EditEstablishmentModal
        isOpen={isEstModalOpen}
        onClose={() => setIsEstModalOpen(false)}
        onSuccess={fetchEstablishment}
        establishment={establishment}
      />
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <ProtectedRoute>
      <ComponentsContent />
    </ProtectedRoute>
  );
}
