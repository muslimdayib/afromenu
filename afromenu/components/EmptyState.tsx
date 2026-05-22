"use client";

import React from "react";
import { Utensils } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "No Dishes Available Yet",
  description = "The chef is preparing the kitchen! Check back shortly to view our full gourmet digital menu.",
}: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-16">
      <div className="w-20 h-20 rounded-full bg-[#1b3151]/5 border border-[#f2bd11]/20 text-[#f2bd11] flex items-center justify-center mb-6 shadow-md shadow-[#f2bd11]/5 animate-pulse">
        <Utensils className="w-9 h-9" />
      </div>
      <h3 className="font-heading font-extrabold text-xl text-[#2d2d2d] tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#888888] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
