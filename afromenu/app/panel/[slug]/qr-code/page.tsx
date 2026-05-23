"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import EditEstablishmentModal from "@/components/EditEstablishmentModal";
import {
  Utensils,
  Download,
  QrCode,
  Sparkles,
  Printer,
  Copy,
  Check,
  Palette,
  FileImage,
  Loader2,
  ExternalLink
} from "lucide-react";

function QRCodeContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();
  
  const [establishment, setEstablishment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);
  const [standDataUrl, setStandDataUrl] = useState<string | null>(null);
  const [qrOnlyDataUrl, setQrOnlyDataUrl] = useState<string | null>(null);
  const [renderingStand, setRenderingStand] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);

  const fetchEstablishment = async () => {
    try {
      const res = await fetch(`/api/establishments/by-slug/${slug}`);
      if (!res.ok) {
        router.push("/onboarding");
        return;
      }
      const responseData = await res.json();
      if (!responseData.success || !responseData.establishment) {
        router.push("/onboarding");
        return;
      }
      setEstablishment(responseData.establishment);
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

  // Create public menu URL
  const originUrl = typeof window !== "undefined" ? window.location.origin : "afromenu.com";
  const publicMenuUrl = `${originUrl}/p/${slug}`;

  // Generate QR Code only and Elegant Stand PNG
  useEffect(() => {
    if (!establishment || !slug) return;

    let isSubscribed = true;
    setRenderingStand(true);

    const generateAssets = async () => {
      try {
        const module = await import("qr-code-styling");
        const QRCodeStyling = module.default;

        // 1. Generate QR Code only (for ref preview and downscale download)
        const qrInstance = new QRCodeStyling({
          width: 320,
          height: 320,
          type: "svg",
          data: publicMenuUrl,
          image: establishment.logo_url || "",
          dotsOptions: {
            color: establishment.brand_color || "#f2bd11",
            type: "rounded"
          },
          cornersSquareOptions: {
            color: "#1b3151",
            type: "extra-rounded"
          },
          cornersDotOptions: {
            color: establishment.brand_color || "#f2bd11",
            type: "dot"
          },
          backgroundOptions: {
            color: "#ffffff",
          },
          imageOptions: {
            crossOrigin: "anonymous",
            margin: 5,
            imageSize: 0.4
          }
        });

        if (isSubscribed && qrRef.current) {
          qrRef.current.innerHTML = "";
          qrInstance.append(qrRef.current);
        }

        // Save standard QR only Data URL
        const qrOnlyBlob = await qrInstance.getRawData("png");
        if (qrOnlyBlob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (isSubscribed) setQrOnlyDataUrl(reader.result as string);
          };
          reader.readAsDataURL(qrOnlyBlob as Blob);
        }

        // 2. Generate Elegant Table Stand (800x1200px)
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 1200;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Fill background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 800, 1200);

        // Outer Navy Frame
        ctx.strokeStyle = "#1b3151";
        ctx.lineWidth = 22;
        ctx.strokeRect(11, 11, 800 - 22, 1200 - 22);

        // Inner gold accent line
        ctx.strokeStyle = "#f2bd11";
        ctx.lineWidth = 4;
        ctx.strokeRect(36, 36, 800 - 72, 1200 - 72);

        // Decorative corner accents (Navy overlapping boxes)
        ctx.fillStyle = "#1b3151";
        // Top-left
        ctx.fillRect(36, 36, 36, 6);
        ctx.fillRect(36, 36, 6, 36);
        // Top-right
        ctx.fillRect(800 - 72, 36, 36, 6);
        ctx.fillRect(800 - 42, 36, 6, 36);
        // Bottom-left
        ctx.fillRect(36, 1200 - 42, 36, 6);
        ctx.fillRect(36, 1200 - 72, 6, 36);
        // Bottom-right
        ctx.fillRect(800 - 72, 1200 - 42, 36, 6);
        ctx.fillRect(800 - 42, 1200 - 72, 6, 36);

        // Function to draw text & QR after logo is fetched (or skipped)
        const drawAllCanvasElements = (logoImgElement?: HTMLImageElement) => {
          let currentY = 160;

          if (logoImgElement) {
            // Draw Circular Cropped Logo
            ctx.save();
            ctx.beginPath();
            ctx.arc(400, 180, 65, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(logoImgElement, 400 - 65, 180 - 65, 130, 130);
            ctx.restore();

            // Golden circle border
            ctx.strokeStyle = "#f2bd11";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(400, 180, 67, 0, Math.PI * 2);
            ctx.stroke();

            currentY = 295;
          } else {
            // Fallback: draw beautiful classic fork spoon emoji/icon
            ctx.fillStyle = "#f2bd11";
            ctx.font = "bold 64px system-ui";
            ctx.textAlign = "center";
            ctx.fillText("🍽️", 400, 195);
            currentY = 265;
          }

          // Restaurant Title Text
          ctx.fillStyle = "#1b3151";
          ctx.font = "bold 42px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(establishment.name.toUpperCase(), 400, currentY);

          // Subtitle
          ctx.fillStyle = "#888888";
          ctx.font = "bold 16px system-ui, sans-serif";
          ctx.letterSpacing = "4px";
          ctx.fillText("SCAN TO VIEW OUR DIGITAL MENU", 400, currentY + 45);

          // Render high-res 460x460 QR inside canvas
          const qrCanvasInstance = new QRCodeStyling({
            width: 440,
            height: 440,
            type: "canvas",
            data: publicMenuUrl,
            image: establishment.logo_url || "",
            dotsOptions: {
              color: establishment.brand_color || "#f2bd11",
              type: "rounded"
            },
            cornersSquareOptions: {
              color: "#1b3151",
              type: "extra-rounded"
            },
            cornersDotOptions: {
              color: establishment.brand_color || "#f2bd11",
              type: "dot"
            },
            backgroundOptions: {
              color: "#ffffff",
            },
            imageOptions: {
              crossOrigin: "anonymous",
              margin: 5,
              imageSize: 0.4
            }
          });

          qrCanvasInstance.getRawData("png").then((canvasBlob) => {
            if (!canvasBlob) return;
            const canvasBlobUrl = URL.createObjectURL(canvasBlob as Blob);
            const qrImageForCanvas = new Image();
            qrImageForCanvas.src = canvasBlobUrl;
            qrImageForCanvas.onload = () => {
              // Draw QR code centered in the canvas
              ctx.drawImage(qrImageForCanvas, 400 - 220, 460, 440, 440);

              // Border frame around QR Code
              ctx.strokeStyle = "#1b3151";
              ctx.lineWidth = 3;
              ctx.strokeRect(400 - 224, 456, 448, 448);

              // Bottom Area CTA text
              ctx.fillStyle = "#1b3151";
              ctx.font = "bold 20px system-ui, sans-serif";
              ctx.letterSpacing = "6px";
              ctx.fillText("WELCOME", 400, 970);

              ctx.fillStyle = "#f2bd11";
              ctx.font = "black 34px system-ui, sans-serif";
              ctx.letterSpacing = "1.5px";
              ctx.fillText("SCAN TO VIEW OUR DIGITAL MENU", 400, 1020);

              ctx.fillStyle = "#888888";
              ctx.font = "italic 16px system-ui, sans-serif";
              ctx.fillText("Point your phone camera. No app needed.", 400, 1060);

              // Sub-footer link branding
              ctx.fillStyle = "#1b3151";
              ctx.font = "bold 13px system-ui, sans-serif";
              ctx.letterSpacing = "2px";
              ctx.fillText(`POWERED BY AFROMENU.COM • /p/${slug}`, 400, 1120);

              // Resolve Stand Data URL
              if (isSubscribed) {
                setStandDataUrl(canvas.toDataURL("image/png"));
                setRenderingStand(false);
              }
            };
          });
        };

        // If logo_url exists, pre-load image with CORS allowed
        if (establishment.logo_url) {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.src = establishment.logo_url;
          logoImg.onload = () => {
            drawAllCanvasElements(logoImg);
          };
          logoImg.onerror = () => {
            console.warn("Failed to load logo for offscreen stand canvas. Painting fallback.");
            drawAllCanvasElements();
          };
        } else {
          drawAllCanvasElements();
        }

      } catch (err) {
        console.error("Failed rendering QR Styling components:", err);
        if (isSubscribed) setRenderingStand(false);
      }
    };

    generateAssets();

    return () => {
      isSubscribed = false;
    };
  }, [establishment, slug]);

  if (loading || !establishment) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#1b3151]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#f2bd11] animate-spin"></div>
        </div>
        <p className="font-heading font-semibold text-sm text-[#1b3151]">
          Loading QR Code assets...
        </p>
      </div>
    );
  }

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download stand
  const handleDownloadStand = () => {
    if (!standDataUrl) return;
    const link = document.createElement("a");
    link.download = `${slug}-afromenu-table-stand.png`;
    link.href = standDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download QR Code only
  const handleDownloadQR = () => {
    if (!qrOnlyDataUrl) return;
    const link = document.createElement("a");
    link.download = `${slug}-qr-code.png`;
    link.href = qrOnlyDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 text-[#1b3151]">
      {/* Topbar */}
      <div className="bg-[#1b3151] text-white px-6 py-4 sticky top-0 z-30 shadow-md flex items-center justify-between max-w-[430px] mx-auto border-b border-[#f2bd11]/20">
        <button
          onClick={() => router.push(`/p/${slug}`)}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors font-bold"
        >
          ✕
        </button>
        <div className="text-center">
          <h1 className="font-heading font-extrabold text-base tracking-tight truncate max-w-[180px] text-white">
            {establishment.name}
          </h1>
          <span className="text-[10px] bg-[#f2bd11] text-[#1b3151] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            QR Generator V3
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#f2bd11] text-[#1b3151] flex items-center justify-center font-bold text-sm shadow-sm uppercase">
          {establishment.name[0]}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[430px] mx-auto px-4 py-6 flex flex-col items-center">
        {/* Helper Card */}
        <div className="p-4 rounded-3xl bg-white border border-gray-100 shadow-sm mb-6 flex items-center gap-3.5 w-full">
          <div className="w-10 h-10 rounded-2xl bg-[#1b3151]/5 text-[#f2bd11] flex items-center justify-center flex-shrink-0">
            <QrCode className="w-5 h-5 text-[#1b3151]" />
          </div>
          <div>
            <h4 className="font-bold text-xs">Print QR & Stands</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Rounded dots colored in your restaurant branding. Fits premium acrylic table frames perfectly.
            </p>
          </div>
        </div>

        {/* Tab Preview Selection */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-md flex flex-col items-center justify-center w-full mb-6">
          <div className="flex items-center justify-between w-full mb-4 border-b border-gray-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b3151]">Visual Preview</span>
            <div className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase bg-[#f2bd11]/10 text-[#f2bd11] px-2 py-0.5 rounded-full">
              <Sparkles className="w-2.5 h-2.5 text-[#f2bd11]" />
              <span>Rounded dot engine</span>
            </div>
          </div>

          {/* Table stand interactive mockup preview */}
          {renderingStand ? (
            <div className="w-full aspect-[2/3] rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center gap-3 my-2">
              <Loader2 className="w-8 h-8 text-[#f2bd11] animate-spin" />
              <span className="text-xs text-gray-400 font-semibold">Generating print stand...</span>
            </div>
          ) : standDataUrl ? (
            <div className="relative group w-full max-w-[280px] aspect-[2/3] my-2 rounded-2xl overflow-hidden border border-gray-200/80 shadow-lg hover:shadow-2xl transition-all duration-300">
              <img
                src={standDataUrl}
                alt="Branded Table Stand Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#1b3151]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button
                  onClick={handleDownloadStand}
                  className="px-4 py-2 bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 transition-all transform scale-95 group-hover:scale-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Stand</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-gray-50 border rounded-2xl text-gray-400">
              Generating Canvas...
            </div>
          )}

          {/* Hidden Canvas holder for code styling SVG append */}
          <div ref={qrRef} className="hidden"></div>

          <h3 className="font-heading font-extrabold text-base text-[#1b3151] mb-1 mt-4">
            {establishment.name}
          </h3>
          <p className="text-center text-[10px] text-gray-500 max-w-xs break-all leading-normal select-all font-mono mb-4 flex items-center gap-1.5 justify-center">
            <span>{publicMenuUrl}</span>
            <a href={publicMenuUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#f2bd11]">
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 w-full mt-2">
            {/* Primary Gold Table Stand Download */}
            <button
              onClick={handleDownloadStand}
              disabled={renderingStand || !standDataUrl}
              className="w-full py-3.5 bg-[#f2bd11] hover:bg-[#dbab0f] disabled:bg-gray-200 text-[#1b3151] font-extrabold text-sm rounded-[50px] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {renderingStand ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#1b3151]" />
                  <span>Generating Stand...</span>
                </>
              ) : (
                <>
                  <FileImage className="w-4.5 h-4.5" />
                  <span>Download 800x1200px Table Stand (PNG)</span>
                </>
              )}
            </button>

            {/* Sub-actions split row */}
            <div className="flex gap-2 w-full">
              <button
                onClick={handleDownloadQR}
                disabled={!qrOnlyDataUrl}
                className="flex-1 py-3 px-3 border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 text-gray-600 font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>QR Only (PNG)</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex-1 py-3 px-3 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Styling controls warning block */}
        <div className="w-full p-4 bg-[#1b3151]/5 border border-[#1b3151]/10 rounded-2xl text-[10px] text-gray-600 leading-relaxed">
          <span className="font-extrabold uppercase text-[#1b3151] block mb-1">PRO-TIP:</span>
          Customized QR styles with your logo and branded rounded dots increase customer scan confidence by over <b className="text-[#1b3151]">42%</b> compared to generic black squares.
        </div>
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
