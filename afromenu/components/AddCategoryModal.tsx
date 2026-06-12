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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      {/* Backdrop click handler */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div style={{
        background: '#13131a',
        border: '1px solid rgba(218,192,99,0.15)',
        borderRadius: '24px 24px 0 0',
        width: '100%',
        maxWidth: 430,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 24,
        position: 'relative',
        color: 'white',
      }} className="relative z-10 shadow-2xl animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.08)' }}
          className="absolute right-5 top-5 w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="mb-6 flex flex-col gap-0.5">
          <h3 className="font-heading font-black text-xl text-white tracking-tight">
            {categoryToEdit ? "Edit Category" : "Add Category"}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.4)' }} className="text-[10px] font-bold uppercase tracking-wider">
            {categoryToEdit ? "Modify category layout and details" : "Create custom category menu display group"}
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl text-red-400 text-xs font-bold flex items-start gap-2 animate-shake" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form onSubmit={handleUploadAndSave} className="flex flex-col gap-5">
          {/* FIELD 1: Category Name */}
          <div>
            <label style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
              display: 'block',
            }}>
              Category Name <span className="text-[#dac063] font-black">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Burgers, Salads, Drinks"
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '14px 16px',
                color: 'white',
                fontSize: 15,
                outline: 'none',
              }}
              className="text-xs font-bold transition-all placeholder:text-white/25 focus:border-[#dac063]"
            />
          </div>

          {/* FIELD 2: Section Choice Pills */}
          <div className="flex flex-col gap-2">
            <label style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
              display: 'block',
            }}>
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
                    style={isSelected ? { background: '#dac063', borderColor: '#dac063', color: '#0a0a0b' } : { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                    className="px-3 py-2 text-[10px] font-black rounded-full border transition-all select-none uppercase tracking-wide cursor-pointer"
                  >
                    {sec}
                  </button>
                );
              })}

              {/* [+ New section] Pill */}
              <button
                type="button"
                onClick={() => setIsNewSection(true)}
                style={isNewSection ? { background: '#dac063', borderColor: '#dac063', color: '#0a0a0b' } : { background: 'rgba(218,192,99,0.1)', borderColor: 'rgba(218,192,99,0.3)', color: '#dac063' }}
                className="px-3 py-2 text-[10px] font-black rounded-full border transition-all flex items-center gap-1 cursor-pointer"
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
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    color: 'white',
                    fontSize: 15,
                    outline: 'none',
                  }}
                  className="text-xs font-semibold placeholder:text-white/25 focus:border-[#dac063]"
                />
              </div>
            )}
          </div>

          {/* FIELD 3: Image cover upload */}
          <div>
            <label style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
              display: 'block',
            }}>
              Category Cover Image
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Uploader Box */}
              <div className="relative rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[120px] group" style={{ border: '2px dashed rgba(218,192,99,0.3)', background: 'rgba(218,192,99,0.05)' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-6 h-6 text-[#dac063] mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-black text-white">Upload category photo</span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }} className="text-[8px] mt-1 uppercase font-bold">PNG, JPG up to 5MB</span>
              </div>

              {/* Preview Box */}
              <div style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }} className="rounded-2xl h-[120px] overflow-hidden flex items-center justify-center relative">
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
                  <div className="text-center text-xs flex flex-col items-center select-none font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    <ImageIcon className="w-7 h-7 mb-1" style={{ color: 'rgba(255,255,255,0.15)' }} />
                    <span className="text-[9px] uppercase tracking-wider">No cover image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Presets library */}
            <div className="mt-3">
              <span className="block text-[8px] font-black uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Or select an appetizing preset
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPreset(p)}
                    className="w-12 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-[#dac063] focus:outline-none transition-all shadow-sm active:scale-95"
                  >
                    <img src={p} alt="Preset cover" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FIELD 4: Time availability */}
          <div className="flex flex-col gap-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#dac063]" />
              <span style={{ color: 'rgba(255,255,255,0.5)' }} className="text-[10px] font-black uppercase tracking-wider">Available hours (optional)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ color: 'rgba(255,255,255,0.35)' }} className="block text-[8px] font-black uppercase tracking-wider mb-1.5">
                  Available From
                </label>
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    color: 'white',
                    fontSize: 15,
                    outline: 'none',
                  }}
                  className="text-xs font-bold focus:outline-none focus:border-[#dac063]"
                />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.35)' }} className="block text-[8px] font-black uppercase tracking-wider mb-1.5">
                  Available To
                </label>
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    color: 'white',
                    fontSize: 15,
                    outline: 'none',
                  }}
                  className="text-xs font-bold focus:outline-none focus:border-[#dac063]"
                />
              </div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.25)' }} className="text-[8px] leading-normal uppercase block font-bold">
              Automatically appends timing guidelines inside headers (e.g. BURGERS 9 AM - 10 PM)
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14,
                color: 'rgba(255,255,255,0.7)',
                fontSize: 15,
                cursor: 'pointer',
              }}
              className="font-black uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                background: '#dac063',
                border: 'none',
                borderRadius: 14,
                color: '#0a0a0b',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              className="font-black uppercase tracking-wider disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#0a0a0b' }} />
                  <span>Saving...</span>
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
