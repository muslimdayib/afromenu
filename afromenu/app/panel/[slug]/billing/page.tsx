"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import EditEstablishmentModal from "@/components/EditEstablishmentModal";
import AccountSettingsModal from "@/components/AccountSettingsModal";
import { CreditCard, Calendar, ShieldCheck, ArrowRight, ArrowLeft, History, Coins, Loader2 } from "lucide-react";

function BillingContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [establishment, setEstablishment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [planOption, setPlanOption] = useState("6month");
  const [updating, setUpdating] = useState(false);

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
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#1b3151]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#f2bd11] animate-spin"></div>
        </div>
        <p className="font-heading font-semibold text-sm text-[#1b3151]">
          Loading billing records...
        </p>
      </div>
    );
  }

  // Format paid until date
  const paidUntilDate = new Date(establishment.paid_until);
  const formattedDate = paidUntilDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePlanSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPlanOption(val);
  };

  // Mock checkout handler
  const handleUpgrade = async () => {
    setUpdating(true);
    // Extends paid_until by 30 days, 180 days, or 365 days depending on selection
    let daysToAdd = 30;
    if (planOption === "6month") daysToAdd = 180;
    else if (planOption === "annual") daysToAdd = 365;

    const newPaidUntil = new Date(paidUntilDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    try {
      const { error } = await supabase
        .from("establishments")
        .update({
          paid_until: newPaidUntil.toISOString(),
        })
        .eq("id", establishment.id);

      if (error) throw error;
      alert("Successfully simulated subscription upgrade!");
      fetchEstablishment();
    } catch (err: any) {
      alert("Upgrade failed: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 text-[#1b3151]">
      {/* Topbar */}
      <div className="bg-[#1b3151] border-b border-[#f2bd11]/20 px-6 py-4 sticky top-0 z-30 shadow-md flex items-center justify-between max-w-[430px] mx-auto text-white">
        <button
          onClick={() => router.push(`/p/${slug}`)}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors font-bold"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="text-center">
          <h1 className="font-heading font-extrabold text-base tracking-tight truncate max-w-[180px] text-white">
            {establishment.name}
          </h1>
          <span className="text-[10px] bg-[#f2bd11] text-[#1b3151] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Billing & Plans
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#f2bd11] text-[#1b3151] flex items-center justify-center font-bold text-sm shadow-sm uppercase">
          {establishment.name[0]}
        </div>
      </div>

      {/* Content Container (Mobile size locked at 430px centered) */}
      <main className="max-w-[430px] mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Status card */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-md flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-[#888888] font-bold uppercase tracking-wider">
                Status
              </span>
              <h3 className="font-heading font-extrabold text-base text-[#1b3151]">
                Establishment is <span className="text-green-500">Working</span>
              </h3>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4 text-[#f2bd11]" />
              <span>Paid until</span>
            </div>
            <span className="font-bold text-[#1b3151]">{formattedDate}</span>
          </div>

          <div className="text-xs text-gray-600 leading-relaxed bg-[#f8f9fa] p-3 rounded-2xl border border-gray-100">
            🔔 The establishment doesn&apos;t have an active automatic payment subscription. Add a plan below to keep the menu active.
          </div>

          {/* Subscription plan select dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-[#1b3151] uppercase tracking-wider mb-2">
              Choose subscription plan
            </label>
            <select
              value={planOption}
              onChange={handlePlanSelect}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1b3151] focus:ring-1 focus:ring-[#1b3151] focus:outline-none text-sm text-[#1b3151] bg-[#f8f9fa] transition-all font-bold cursor-pointer mb-4"
            >
              <option value="monthly">Monthly — $10 / month</option>
              <option value="6month">Every 6 months — $9.60 / month (Billed $57.60)</option>
              <option value="annual">Annually — $9.00 / month (Billed $108.00)</option>
            </select>

            <button
              onClick={handleUpgrade}
              disabled={updating}
              className="w-full py-3.5 bg-[#f2bd11] hover:bg-[#dbab0f] disabled:bg-gray-300 text-[#1b3151] font-extrabold text-sm rounded-[50px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Activating Plan...</span>
                </>
              ) : (
                <>
                  <span>Select Plan & Pay</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </div>

          <div className="text-center text-[10px] text-gray-400">
            VAT may be applicable. Secure mock transaction checkout.
          </div>
        </div>

        {/* Section 2: Billing history */}
        <div>
          <h3 className="font-heading font-extrabold text-sm text-[#1b3151] mb-3 flex items-center gap-2">
            <History className="w-4.5 h-4.5 text-[#f2bd11]" />
            <span>Billing History</span>
          </h3>

          <div className="bg-white rounded-[24px] border border-gray-100 p-8 shadow-md text-center flex flex-col items-center justify-center min-h-[140px]">
            <Coins className="w-8 h-8 text-[#f2bd11]/40 mb-2" />
            <p className="text-xs text-gray-400 font-bold">No billing history yet</p>
            <p className="text-[10px] text-gray-400 max-w-[200px] mt-1 leading-normal">
              Receipt invoices from upgraded plans will appear here in chronological order.
            </p>
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav
        slug={slug}
        activeTab="more"
        onOpenEditEstablishment={() => setIsEstModalOpen(true)}
        onOpenAccountSettings={() => setIsAccountModalOpen(true)}
      />

      {/* Branding Edit Modal */}
      <EditEstablishmentModal
        isOpen={isEstModalOpen}
        onClose={() => setIsEstModalOpen(false)}
        onSuccess={fetchEstablishment}
        establishment={establishment}
      />

      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  );
}
