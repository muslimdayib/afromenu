"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { resizeImage } from "@/lib/image";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryId: string;
  itemToEdit?: {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    model_3d_url: string | null;
    is_available: boolean;
    tags: string[];
    sort_order: number;
  } | null;
  nextSortOrder: number;
}

const TAG_OPTIONS = [
  { label: "Spicy 🌶️", value: "spicy" },
  { label: "Vegan 🌱", value: "vegan" },
  { label: "Popular ⭐", value: "popular" },
  { label: "New 🆕", value: "new" },
  { label: "Halal ✅", value: "halal" },
];

const PRESETS = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60", // Burger
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60", // Pizza
  "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60", // Fries
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60", // Pizza/Pasta
  "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500&auto=format&fit=crop&q=60", // Ice Cream
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60", // Salad
  "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&auto=format&fit=crop&q=60", // Drinks
];

export default function AddItemModal({
  isOpen,
  onClose,
  onSuccess,
  categoryId,
  itemToEdit,
  nextSortOrder,
}: AddItemModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [model3dUrl, setModel3dUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setDescription(itemToEdit.description || "");
      setPrice(itemToEdit.price.toString());
      setImageUrl(itemToEdit.image_url || "");
      setPreviewUrl(itemToEdit.image_url);
      setModel3dUrl(itemToEdit.model_3d_url || "");
      setTags(itemToEdit.tags || []);
      setIsAvailable(itemToEdit.is_available);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setImageFile(null);
      setPreviewUrl(null);
      setModel3dUrl("");
      setTags([]);
      setIsAvailable(true);
    }
    setError(null);
  }, [itemToEdit, isOpen]);

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

  const handleTagToggle = (tagValue: string) => {
    if (tags.includes(tagValue)) {
      setTags(tags.filter((t) => t !== tagValue));
    } else {
      setTags([...tags, tagValue]);
    }
  };

  const handleAiGenerate = async () => {
    if (!name.trim()) {
      setError("Please enter the Item Name first before auto-generating a description.");
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: name }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.description) {
        setDescription(data.description);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to generate AI description.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide an item name.");
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      setError("Please specify a valid item price.");
      return;
    }

    setLoading(true);
    setError(null);

    let finalImageUrl = imageUrl;

    try {
      if (imageFile) {
        let fileToUpload: File = imageFile;
        try {
          fileToUpload = await resizeImage(imageFile, 800);
        } catch (resizeErr) {
          console.warn("Image resizing failed, uploading original:", resizeErr);
        }

        const fileExt = fileToUpload.name.split(".").pop();
        const fileName = `${categoryId}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `items/${fileName}`;

        // Attempt Supabase storage upload
        const { error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(filePath, fileToUpload, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.warn("Storage upload failed, using random Unsplash preset:", uploadError.message);
          finalImageUrl = PRESETS[Math.floor(Math.random() * PRESETS.length)];
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("menu-images")
            .getPublicUrl(filePath);
          finalImageUrl = publicUrl;
        }
      }

      if (itemToEdit) {
        // Edit existing
        const { error: updateError } = await supabase
          .from("items")
          .update({
            name,
            description: description || null,
            price: parseFloat(price),
            image_url: finalImageUrl || null,
            model_3d_url: model3dUrl.trim() || null,
            is_available: isAvailable,
            tags,
          })
          .eq("id", itemToEdit.id);

        if (updateError) throw updateError;
      } else {
        // Create new
        const { error: insertError } = await supabase.from("items").insert({
          category_id: categoryId,
          name,
          description: description || null,
          price: parseFloat(price),
          image_url: finalImageUrl || null,
          model_3d_url: model3dUrl.trim() || null,
          is_available: isAvailable,
          tags,
          sort_order: nextSortOrder,
        });

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save menu item.");
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
          {itemToEdit ? "Edit Menu Item" : "Add Menu Item"}
        </h3>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Name & Price Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Double Cheeseburger"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f2bd11] focus:outline-none text-sm text-[#2d2d2d] bg-[#f8f9fa] placeholder:text-gray-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f2bd11] focus:outline-none text-sm text-[#2d2d2d] bg-[#f8f9fa] placeholder:text-gray-400 font-bold"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider">
                Description
              </label>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="text-[11px] font-extrabold text-[#1b3151] bg-[#f2bd11] hover:bg-[#e0ad0f] disabled:bg-gray-200 disabled:text-gray-400 px-2 py-1 rounded-lg transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <span>✨ Auto-Generate</span>
                )}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="List ingredients, size details, or auto-generate with macros/allergens..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f2bd11] focus:outline-none text-sm text-[#2d2d2d] bg-[#f8f9fa] placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Tags Checkbox Badges */}
          <div>
            <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
              Badges & Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => {
                const isSelected = tags.includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => handleTagToggle(tag.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      isSelected
                        ? "bg-[#f2bd11] border-[#f2bd11] text-[#1b3151] shadow-sm"
                        : "bg-white border-[#eeeeee] text-[#888888] hover:text-[#2d2d2d]"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image upload area */}
          <div>
            <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
              Item Cover Photo
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Custom Upload */}
              <div className="relative border-2 border-dashed border-[#eeeeee] hover:border-[#f2bd11]/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-[120px] bg-[#f8f9fa]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-[#1b3151] mb-2" />
                <span className="text-xs font-bold text-[#2d2d2d]">Upload Custom Photo</span>
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

          {/* 3D Model Link */}
          <div>
            <label className="block text-xs font-bold text-[#2d2d2d] uppercase tracking-wider mb-2">
              3D Model URL (.glb)
            </label>
            <input
              type="text"
              value={model3dUrl}
              onChange={(e) => setModel3dUrl(e.target.value)}
              placeholder="https://example.com/models/food.glb"
              className="w-full px-4 py-3 rounded-xl border border-[#eeeeee] focus:border-[#f2bd11] focus:outline-none text-sm text-[#2d2d2d] bg-[#f8f9fa] placeholder:text-gray-400 font-bold"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Supports high-end interactive 3D visualizers using Google's Model Viewer
            </span>
          </div>

          {/* Available Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f8f9fa] border border-[#eeeeee]">
            <div>
              <span className="block text-sm font-bold text-[#2d2d2d]">Available on Menu</span>
              <span className="text-[10px] text-[#888888]">Turn off to hide from customers instantly</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 h-7 rounded-full transition-all relative ${
                isAvailable ? "bg-[#f2bd11]" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow-sm ${
                  isAvailable ? "right-1" : "left-1"
                }`}
              ></div>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-2">
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
              className="flex-1 py-3 bg-[#f2bd11] hover:bg-[#e0ad0f] disabled:bg-gray-300 text-[#1b3151] font-extrabold rounded-[50px] text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{itemToEdit ? "Save Changes" : "Add Item"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
