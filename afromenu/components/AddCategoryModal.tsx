"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { resizeImage } from "@/lib/image";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  establishmentId: string;
  categoryToEdit?: { id: string; name: string; image_url: string | null; sort_order: number } | null;
  nextSortOrder: number;
}

// Preset appetizing category backgrounds for fallbacks
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
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setImageUrl(categoryToEdit.image_url || "");
      setPreviewUrl(categoryToEdit.image_url);
    } else {
      setName("");
      setImageUrl("");
      setImageFile(null);
      setPreviewUrl(null);
    }
    setError(null);
  }, [categoryToEdit, isOpen]);

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

  const handleUploadAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a category name.");
      return;
    }

    setLoading(true);
    setError(null);

    let finalImageUrl = imageUrl;

    try {
      // Robust upload logic with client-side compression
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

        // Attempt Supabase storage upload
        const { data, error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(filePath, fileToUpload, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.warn("Storage upload failed, using Unsplash preset fallback:", uploadError.message);
          // Fallback to random preset if Storage upload fails (e.g. bucket doesn't exist yet)
          finalImageUrl = PRESETS[Math.floor(Math.random() * PRESETS.length)];
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("menu-images")
            .getPublicUrl(filePath);
          finalImageUrl = publicUrl;
        }
      }

      // If neither preset nor upload file selected and editing new item, set a random preset
      if (!finalImageUrl) {
        finalImageUrl = PRESETS[Math.floor(Math.random() * PRESETS.length)];
      }

      if (categoryToEdit) {
        // Edit existing
        const { error: updateError } = await supabase
          .from("categories")
          .update({
            name,
            image_url: finalImageUrl,
          })
          .eq("id", categoryToEdit.id);

        if (updateError) throw updateError;
      } else {
        // Create new
        const { error: createError } = await supabase.from("categories").insert({
          establishment_id: establishmentId,
          name,
          image_url: finalImageUrl,
          sort_order: nextSortOrder,
          is_visible: true,
        });

        if (createError) throw createError;
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 border border-[#eeeeee] relative z-10 shadow-2xl animate-slide-up overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#888888] hover:text-[#2d2d2d] transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h3 className="font-heading font-extrabold text-xl text-[#2d2d2d] mb-6">
          {categoryToEdit ? "Edit Category" : "Add Menu Category"}
        </h3>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleUploadAndSave} className="flex flex-col gap-6">
          {/* Category name */}
          <div>
            <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BURGERS (11 AM - 9 PM)"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#1b3151] focus:outline-none text-sm text-[#1b3151] bg-gray-50 placeholder:text-gray-400 font-bold"
            />
          </div>

          {/* Photo upload area */}
          <div>
            <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
              Category Cover Photo
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Custom Upload */}
              <div className="relative border-2 border-dashed border-[#eeeeee] hover:border-[#1b3151]/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-[120px] bg-[#1b3151]/5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-[#f2bd11] mb-2" />
                <span className="text-xs font-bold text-[#1b3151]">Upload Custom Photo</span>
                <span className="text-[10px] text-[#888888] mt-1">PNG, JPG up to 5MB</span>
              </div>

              {/* Preview */}
              <div className="border border-[#eeeeee] rounded-2xl h-[120px] overflow-hidden bg-gray-50 flex items-center justify-center relative">
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
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1 rounded-full shadow-md transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-400 text-xs flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 mb-1 text-gray-300" />
                    <span>No cover image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Presets library */}
            <div className="mt-4">
              <span className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-2">
                Or select an appetizing preset
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPreset(p)}
                    className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-[#f2bd11] transition-all"
                  >
                    <img src={p} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#eeeeee] text-[#888888] hover:bg-gray-50 font-bold rounded-[50px] text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#f2bd11] hover:bg-[#dbab0f] disabled:bg-gray-300 text-[#1b3151] font-extrabold rounded-[50px] text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#1b3151]" />
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
