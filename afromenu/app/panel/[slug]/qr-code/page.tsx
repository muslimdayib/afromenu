"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import EditEstablishmentModal from "@/components/EditEstablishmentModal";
import { QRCodeCanvas } from "qrcode.react";
import { Utensils, Download, QrCode, Sparkles, Printer, Copy, Check } from "lucide-react";

function QRCodeContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();
  
  const [establishment, setEstablishment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
          Generating QR stand...
        </p>
      </div>
    );
  }

  // Create public menu URL
  const originUrl = typeof window !== "undefined" ? window.location.origin : "menuqr.com";
  const publicMenuUrl = `${originUrl}/p/${slug}`;

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download PNG QR Code
  const handleDownload = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    // Create a temporary link element
    const link = document.createElement("a");
    link.download = `${slug}-menu-qr.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            QR Generator
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#f7906c] text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase">
          {establishment.name[0]}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[430px] mx-auto px-4 py-6 flex flex-col items-center">
        {/* Helper Card */}
        <div className="p-4 rounded-3xl bg-white border border-[#eeeeee] card-shadow mb-6 flex items-center gap-3.5 w-full">
          <div className="w-10 h-10 rounded-2xl bg-[#fbe4db] text-[#f7906c] flex items-center justify-center flex-shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs">Print QR For Tables</h4>
            <p className="text-[10px] text-[#888888] leading-relaxed">
              Scan this QR to open your menu. Place it on acrylic table stands.
            </p>
          </div>
        </div>

        {/* QR Canvas Card wrapper */}
        <div className="bg-white rounded-[32px] border border-[#eeeeee] p-8 card-shadow flex flex-col items-center justify-center w-full mb-6 relative">
          <div className="absolute top-4 left-4 inline-flex items-center gap-1 text-[8px] font-extrabold uppercase bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
            <Sparkles className="w-2.5 h-2.5" />
            <span>HQ Scan Enabled</span>
          </div>

          {/* QR Canvas element */}
          <div className="p-4 bg-[#fdf6f2] rounded-3xl border border-[#eeeeee]/60 shadow-inner mb-6">
            <QRCodeCanvas
              id="qr-canvas"
              value={publicMenuUrl}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#2d2d2d"}
              level={"H"}
              includeMargin={true}
              imageSettings={{
                src: establishment.logo_url || "",
                x: undefined,
                y: undefined,
                height: 38,
                width: 38,
                excavate: true,
              }}
            />
          </div>

          <h3 className="font-heading font-extrabold text-base text-[#2d2d2d] mb-1">
            {establishment.name}
          </h3>
          <p className="text-center text-[10px] text-[#888888] max-w-xs break-all leading-normal select-all font-mono mb-4">
            {publicMenuUrl}
          </p>

          {/* Inline controls */}
          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-3 px-4 border border-[#eeeeee] hover:bg-gray-50 text-[#888888] font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="py-3 px-4 border border-[#eeeeee] hover:bg-gray-50 text-[#888888] font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Coral Download Button */}
        <button
          onClick={handleDownload}
          className="w-full py-4 bg-[#f7906c] hover:bg-[#e8754f] text-white font-extrabold text-sm rounded-[50px] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mb-10"
        >
          <Download className="w-4.5 h-4.5" />
          <span>Download High-Res QR (PNG)</span>
        </button>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav
        slug={slug}
        activeTab="qr"
        onOpenEditEstablishment={() => setIsEstModalOpen(true)}
      />

      {/* Establishment Branding modal */}
      <EditEstablishmentModal
        isOpen={isEstModalOpen}
        onClose={() => setIsEstModalOpen(false)}
        onSuccess={fetchEstablishment}
        establishment={establishment}
      />
    </div>
  );
}

export default function QRCodePage() {
  return (
    <ProtectedRoute>
      <QRCodeContent />
    </ProtectedRoute>
  );
}
