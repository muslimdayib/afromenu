"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Upload, Image as ImageIcon, Loader2, Plus, Clock } from "lucide-react";
import { resizeImage } from "@/lib/image";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  establishmentId: string;
  categoryToEdit?: {
    id: string;
    name: string;
    image_url: string | null;
    sort_order: number;
    section_name?: string | null;
    time_from?: string | null;
    time_to?: string | null;
  } | null;
  nextSortOrder: number;
  defaultSectionName?: string | null;
  existingSections?: string[];
}

const PRESETS = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60", // Burger
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60", // Pizza
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60", // BBQ
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60", // Dessert
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60", // Interior/Drinks
];

export default function AddCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  establishmentId,
  categoryToEdit,
  nextSortOrder,
  defaultSectionName,
  existingSections = [],
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Section Pills states
  const [sectionName, setSectionName] = useState("");
  const [isNewSection, setIsNewSection] = useState(false);
  const [newSectionInput, setNewSectionInput] = useState("");

  // Timing states
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load / Prefill Category Values
  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || "");
      setImageUrl(categoryToEdit.image_url || "");
      setPreviewUrl(categoryToEdit.image_url || null);
      setTimeFrom(categoryToEdit.time_from || "");
      setTimeTo(categoryToEdit.time_to || "");

      const activeSec = categoryToEdit.section_name || "";
      setSectionName(activeSec);
      setIsNewSection(false);
      setNewSectionInput("");
    } else {
      setName("");
      setImageUrl("");
      setImageFile(null);
      setPreviewUrl(null);
      setTimeFrom("");
      setTimeTo("");

      // Default section pill calculation: preselect active tab or first available pill
      const initialSec = defaultSectionName || (existingSections.length > 0 ? existingSections[0] : "");
      setSectionName(initialSec);
      setIsNewSection(false);
      setNewSectionInput("");
    }
    setError(null);
    setLoading(false);
  }, [categoryToEdit, isOpen, defaultSectionName, existingSections]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const selectPreset = (url: string) => {
    setImageUrl(url);
    setImageFile(null);
    setPreviewUrl(url);
  };

  // Submit Handler
  const handleUploadAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a category name.");
      return;
    }

    // Determine final section name
    const finalSection = isNewSection ? newSectionInput.trim() : sectionName.trim();
    if (isNewSection && !finalSection) {
      setError("Please enter a custom name for your new section.");
      return;
    }

    setLoading(true);
    setError(null);

    let finalImageUrl = imageUrl;

    try {
      // 1. Image upload
      if (imageFile) {
        let fileToUpload: File = imageFile;
        try {
          fileToUpload = await resizeImage(imageFile, 800);
        } catch (resizeErr) {
          console.warn("Image resizing failed, uploading original:", resizeErr);
        }

        const fileExt = fileToUpload.name.split(".").pop();
        const fileName = `${establishmentId}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `categories/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(filePath, fileToUpload, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.warn("Storage upload skipped, preset fallback retained:", uploadError.message);
          finalImageUrl = PRESETS[Math.floor(Math.random() * PRESETS.length)];
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("menu-images")
            .getPublicUrl(filePath);
          finalImageUrl = publicUrl;
        }
      }

      // Default random fallback
      if (!finalImageUrl) {
        finalImageUrl = PRESETS[Math.floor(Math.random() * PRESETS.length)];
      }

      // 2. Submit payload
      const payload = categoryToEdit
        ? {
            id: categoryToEdit.id,
            name,
            imageUrl: finalImageUrl,
            sectionName: finalSection || null,
            timeFrom: timeFrom || null,
            timeTo: timeTo || null,
          }
        : {
            establishmentId,
            name,
            imageUrl: finalImageUrl,
            sortOrder: nextSortOrder,
            sectionName: finalSection || null,
            timeFrom: timeFrom || null,
            timeTo: timeTo || null,
          };

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.error || responseData.details || "Failed to save category.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1b3151]/30 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="bg-white rounded-[32px] max-w-lg w-full p-6 border border-orange-50/50 relative z-10 shadow-2xl animate-slide-up overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-50 hover:bg-[#f7906c]/10 flex items-center justify-center text-gray-400 hover:text-[#f7906c] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="mb-6 flex flex-col gap-0.5">
          <h3 className="font-heading font-black text-xl text-[#2d2d2d] tracking-tight">
            {categoryToEdit ? "Edit Category" : "Add Category"}
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {categoryToEdit ? "Modify category layout and details" : "Create custom category menu display group"}
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 flex items-start gap-2 animate-shake">
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form onSubmit={handleUploadAndSave} className="flex flex-col gap-5">
          {/* FIELD 1: Category Name */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
              Category Name <span className="text-[#f7906c] font-black">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Burgers, Salads, Drinks"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-[#f7906c] focus:ring-2 focus:ring-[#f7906c]/15 focus:outline-none text-xs text-[#2d2d2d] bg-[#fdf6f2]/20 font-bold transition-all placeholder:text-gray-300"
            />
          </div>

          {/* FIELD 2: Section Choice Pills */}
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">
              Add to Section
            </label>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {/* Unique sections pills */}
              {existingSections.filter(Boolean).map((sec) => {
                const isSelected = !isNewSection && sectionName.toLowerCase().trim() === sec.toLowerCase().trim();
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      setSectionName(sec);
                      setIsNewSection(false);
                    }}
                    className={`px-3 py-2 text-[10px] font-black rounded-full border transition-all select-none uppercase tracking-wide cursor-pointer ${
                      isSelected
                        ? "bg-[#f7906c] border-[#f7906c] text-white shadow-sm"
                        : "bg-white border-gray-100 text-gray-400 hover:text-gray-600 hover:border-gray-200"
                    }`}
                  >
                    {sec}
                  </button>
                );
              })}

              {/* [+ New section] Pill */}
              <button
                type="button"
                onClick={() => setIsNewSection(true)}
                className={`px-3 py-2 text-[10px] font-black rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                  isNewSection
                    ? "bg-[#f7906c] border-[#f7906c] text-white shadow-sm"
                    : "bg-slate-50 border-gray-100 text-[#f7906c] hover:bg-orange-50 hover:border-[#f7906c]/30"
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>New Section</span>
              </button>
            </div>

            {/* Custom Input for New Section */}
            {isNewSection && (
              <div className="mt-2 animate-slide-up">
                <input
                  type="text"
                  value={newSectionInput}
                  onChange={(e) => setNewSectionInput(e.target.value)}
                  placeholder="Type new section name (e.g. Desserts)"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-100 focus:border-[#f7906c] focus:outline-none text-xs text-[#2d2d2d] bg-[#fdf6f2]/10 font-semibold"
                />
              </div>
            )}
          </div>

          {/* FIELD 3: Image cover upload */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
              Category Cover Image
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Uploader Box */}
              <div className="relative border-2 border-dashed border-gray-100 hover:border-[#f7906c]/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[120px] bg-[#fdf6f2]/10 hover:bg-[#fdf6f2]/30 group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-6 h-6 text-[#f7906c] mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-black text-[#2d2d2d]">Upload category photo</span>
                <span className="text-[8px] text-gray-400 mt-1 uppercase font-bold">PNG, JPG up to 5MB</span>
              </div>

              {/* Preview Box */}
              <div className="border border-gray-100 rounded-2xl h-[120px] overflow-hidden bg-slate-50/50 flex items-center justify-center relative shadow-inner">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null);
                        setImageFile(null);
                        setImageUrl("");
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1 rounded-full shadow-md transition-all scale-90"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-400 text-xs flex flex-col items-center select-none font-bold">
                    <ImageIcon className="w-7 h-7 mb-1 text-gray-300" />
                    <span className="text-[9px] uppercase tracking-wider text-gray-300">No cover image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Presets library */}
            <div className="mt-3">
              <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider mb-2">
                Or select an appetizing preset
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPreset(p)}
                    className="w-12 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-[#f7906c] focus:outline-none transition-all shadow-sm active:scale-95"
                  >
                    <img src={p} alt="Preset cover" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FIELD 4: Time availability */}
          <div className="flex flex-col gap-2 border-t border-gray-50 pt-4">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock className="w-4 h-4 text-[#f7906c]" />
              <span className="text-[10px] font-black uppercase tracking-wider">Available hours (optional)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Available From
                </label>
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-100 focus:border-[#f7906c] focus:outline-none text-xs text-[#2d2d2d] bg-[#fdf6f2]/10 font-bold"
                />
              </div>
              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Available To
                </label>
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-100 focus:border-[#f7906c] focus:outline-none text-xs text-[#2d2d2d] bg-[#fdf6f2]/10 font-bold"
                />
              </div>
            </div>
            <span className="text-[8px] text-gray-400 leading-normal uppercase block font-bold">
              Automatically appends timing guidelines inside headers (e.g. BURGERS 9 AM - 10 PM)
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4 border-t border-gray-50 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white hover:bg-slate-100 border border-gray-150 text-gray-400 hover:text-gray-650 font-black rounded-full text-xs uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#f7906c] hover:bg-[#e27653] disabled:bg-gray-300 text-white font-black rounded-full text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Saving category...</span>
                </>
              ) : (
                <span>{categoryToEdit ? "Save Changes" : "Create Category"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
