"use client";

import React from "react";
import { Wifi, Phone, MapPin, Utensils } from "lucide-react";

interface RestaurantHeaderProps {
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  wifiPassword?: string | null;
  backgroundUrl?: string | null;
}

export default function RestaurantHeader({
  name,
  logoUrl,
  description,
  address,
  phone,
  wifiPassword,
  backgroundUrl,
}: RestaurantHeaderProps) {
  return (
    <header className="relative w-full">
      {/* Banner Background */}
      <div
        className="h-44 sm:h-56 bg-cover bg-center relative"
        style={{
          backgroundImage: backgroundUrl
            ? `url(${backgroundUrl})`
            : "linear-gradient(135deg, #f7906c 0%, #e8754f 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]"></div>
      </div>

      {/* Profile Box */}
      <div className="max-w-5xl mx-auto px-4 relative -mt-16 mb-8 z-10">
        <div className="bg-white border border-[#eeeeee] rounded-[24px] p-6 shadow-md shadow-gray-100 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-50 overflow-hidden shadow-md -mt-16 mb-4 flex items-center justify-center flex-shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Utensils className="w-8 h-8 text-[#f7906c]" />
            )}
          </div>

          {/* Restaurant Details */}
          <h1 className="font-heading font-extrabold text-2xl text-[#2d2d2d] leading-tight">
            {name}
          </h1>

          {description && (
            <p className="text-xs text-[#888888] max-w-md mt-2 leading-relaxed">
              {description}
            </p>
          )}

          {address && (
            <p className="text-[10px] text-gray-400 font-mono mt-1 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#f7906c]" />
              <span>{address}</span>
            </p>
          )}

          {/* Credentials Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 w-full">
            {/* WiFi */}
            {wifiPassword && (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fdf6f2] border border-[#eeeeee] text-gray-600 shadow-sm">
                <Wifi className="w-3.5 h-3.5 text-[#f7906c]" />
                <span className="font-bold text-[9px] font-mono tracking-wider">
                  WiFi: {wifiPassword}
                </span>
              </div>
            )}

            {/* Phone */}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fdf6f2] border border-[#eeeeee] text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#f7906c]" />
                <span className="font-bold text-[9px] font-mono tracking-wider">
                  {phone}
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
