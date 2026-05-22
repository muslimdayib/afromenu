"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import EditEstablishmentModal from "@/components/EditEstablishmentModal";
import { CreditCard, Calendar, ShieldCheck, ArrowRight, ArrowLeft, History, Coins, Loader2 } from "lucide-react";

function BillingContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [establishment, setEstablishment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);
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
      <div className="min-h-screen bg-[#fdf6f2] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#f7906c]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#f7906c] animate-spin"></div>
        </div>
        <p className="font-heading font-semibold text-sm text-[#888888]">
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
    <div className="min-h-screen bg-[#fdf6f2] pb-24 text-[#2d2d2d]">
      {/* Topbar */}
      <div className="bg-white border-b border-[#eeeeee] px-6 py-4 sticky top-0 z-30 shadow-sm flex items-center justify-between max-w-[430px] mx-auto">
        <button
          onClick={() => router.push(`/p/${slug}`)}
          className="w-9 h-9 rounded-full bg-gray-50 border border-[#eeeeee] flex items-center justify-center text-[#2d2d2d] hover:bg-gray-100 transition-colors font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h1 className="font-heading font-extrabold text-base tracking-tight truncate max-w-[180px]">
            {establishment.name}
          </h1>
          <span className="text-[10px] bg-[#fbe4db] text-[#f7906c] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Billing & Plans
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#f7906c] text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase">
          {establishment.name[0]}
        </div>
      </div>

      {/* Content Container (Mobile size locked at 430px centered) */}
      <main className="max-w-[430px] mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Status card */}
        <div className="bg-white rounded-[24px] border border-[#eeeeee] p-6 card-shadow flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-[#888888] font-bold uppercase tracking-wider">
                Status
              </span>
              <h3 className="font-heading font-extrabold text-base text-[#2d2d2d]">
                Establishment is <span className="text-green-500">Working</span>
              </h3>
            </div>
          </div>

          <hr className="border-[#eeeeee]" />

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4 text-[#f7906c]" />
              <span>Paid until</span>
            </div>
            <span className="font-bold text-[#2d2d2d]">{formattedDate}</span>
          </div>

          <div className="text-xs text-[#888888] leading-relaxed bg-[#fdf6f2] p-3 rounded-2xl border border-[#eeeeee]/60">
            🔔 The establishment doesn&apos;t have an active automatic payment subscription. Add a plan below to keep the menu active.
          </div>

          {/* Subscription plan select dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
              Choose subscription plan
            </label>
            <select
              value={planOption}
              onChange={handlePlanSelect}
              className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f7906c] focus:outline-none text-sm text-[#2d2d2d] bg-[#fdf6f2]/50 transition-all font-bold cursor-pointer mb-4"
            >
              <option value="monthly">Monthly — $10 / month</option>
              <option value="6month">Every 6 months — $9.60 / month (Billed $57.60)</option>
              <option value="annual">Annually — $9.00 / month (Billed $108.00)</option>
            </select>

            <button
              onClick={handleUpgrade}
              disabled={updating}
              className="w-full py-3.5 bg-[#f7906c] hover:bg-[#e8754f] disabled:bg-gray-300 text-white font-extrabold text-sm rounded-[50px] transition-all flex items-center justify-center gap-2 shadow-sm"
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

          <div className="text-center text-[10px] text-[#bcbcbc]">
            VAT may be applicable. Secure mock transaction checkout.
          </div>
        </div>

        {/* Section 2: Billing history */}
        <div>
          <h3 className="font-heading font-extrabold text-sm text-[#2d2d2d] mb-3 flex items-center gap-2">
            <History className="w-4.5 h-4.5 text-gray-400" />
            <span>Billing History</span>
          </h3>

          <div className="bg-white rounded-[24px] border border-[#eeeeee] p-8 card-shadow text-center flex flex-col items-center justify-center min-h-[140px]">
            <Coins className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs text-[#888888] font-bold">No billing history yet</p>
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

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  );
}
