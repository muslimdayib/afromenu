"use client";

import { useRef, useCallback } from "react";
import type { MenuItem } from "@/lib/supabase";

interface MenuItemCard3DProps {
  item: MenuItem;
}

/**
 * Interactive 3D menu-item card with real-time mouse-tracking tilt.
 *
 * On desktop, the card dynamically rotates toward the cursor position
 * using CSS 3D transforms (rotateX / rotateY) calculated from the
 * mouse offset relative to the card center. A gold light-reflection
 * overlay follows the cursor for a premium holographic feel.
 *
 * On mobile/touch, the card stays flat for stability.
 *
 * Image container uses a fixed 4:3 aspect-ratio to prevent CLS.
 * The wrapper is designed so <video>/<picture> can replace <img>
 * without touching surrounding layout.
 */
export default function MenuItemCard3D({ item }: MenuItemCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const isUnavailable = !item.is_available;

  /* Locale-aware price formatting */
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(item.price);

  /* ---------------------------------------------------------------- */
  /*  Mouse-tracking 3D tilt logic                                     */
  /* ---------------------------------------------------------------- */

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      const glow = glowRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      /* Cursor position as fraction from center: -0.5 to 0.5 */
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      /* Max tilt: 12 degrees — dramatic but not disorienting */
      const rotateY = x * 24;
      const rotateX = -y * 16;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

      /* Move glow highlight to follow cursor */
      if (glow) {
        glow.style.opacity = "1";
        glow.style.background = `radial-gradient(
          circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%,
          rgba(212, 168, 67, 0.18) 0%,
          rgba(212, 168, 67, 0.06) 40%,
          transparent 70%
        )`;
      }
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (card) {
      card.style.transform =
        "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
    if (glow) {
      glow.style.opacity = "0";
    }
  }, []);

  return (
    <div
      className="card-3d-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <article
        ref={cardRef}
        className={`card-3d-interactive rounded-xl overflow-hidden bg-surface border border-border relative
          ${isUnavailable ? "opacity-50 pointer-events-none" : ""}`}
      >
        {/* Gold glow overlay — follows cursor */}
        <div
          ref={glowRef}
          className="card-glow-overlay"
          aria-hidden="true"
        />

        {/* -------------------------------------------------------------- */}
        {/*  Media container — fixed 4:3 aspect ratio                       */}
        {/*  Swap <img> for <video>/<picture> here for future formats.      */}
        {/* -------------------------------------------------------------- */}
        <div className="menu-media-container">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              loading="lazy"
              decoding="async"
            />
          ) : (
            /* Placeholder when no image is provided */
            <div className="menu-media-placeholder">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-12 h-12"
                aria-hidden="true"
              >
                <path d="M3 2v7c0 1.1.9 2 2 2h1v9a1 1 0 0 0 2 0V11h1c1.1 0 2-.9 2-2V2" />
                <path d="M7 2v4" />
                <path d="M17 2c-1.7 0-3 1.3-3 3v5h2v10a1 1 0 0 0 2 0V10h2V5c0-1.7-1.3-3-3-3z" />
              </svg>
            </div>
          )}

          {/* Unavailable badge */}
          {isUnavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal-950/60 z-10">
              <span className="text-xs font-body font-semibold tracking-wider uppercase text-cream bg-charcoal-900/80 px-3 py-1 rounded-full border border-border">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------- */}
        {/*  Card body                                                      */}
        {/* -------------------------------------------------------------- */}
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading font-semibold text-cream text-base leading-snug">
              {item.name}
            </h3>
            <span className="text-gold-500 font-body font-bold text-sm whitespace-nowrap flex-shrink-0 bg-charcoal-800 px-2 py-0.5 rounded-md">
              {formattedPrice}
            </span>
          </div>

          {item.description && (
            <p className="text-cream-muted text-sm leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Bottom gold accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
      </article>
    </div>
  );
}
