"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { X, Upload, Image as ImageIcon, Loader2, Plus, Trash2, Search, ArrowRight, Check, AlertCircle } from "lucide-react";
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
    weight?: string | null;
    old_price?: number | null;
    variants?: any;
    is_visible?: boolean;
    addons?: any;
  } | null;
  nextSortOrder: number;
  allItems?: any[];
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
  allItems = [],
}: AddItemModalProps) {
  const params = useParams();
  const slug = params.slug as string;

  // Basic Info States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [description, setDescription] = useState("");

  // Variants States
  const [variants, setVariants] = useState<{ name: string; price: string }[]>([]);

  // Asset States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [model3dUrl, setModel3dUrl] = useState("");

  // Visibility / Custom Add-ons States
  const [isVisible, setIsVisible] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Search Add-ons Dropdown States
  const [isAddonDropdownOpen, setIsAddonDropdownOpen] = useState(false);
  const [addonSearch, setAddonSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Status States
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAddonDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync / Load Initial Values
  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || "");
      setDescription(itemToEdit.description || "");
      setPrice(itemToEdit.price ? itemToEdit.price.toString() : "");
      setWeight(itemToEdit.weight || "");
      setOldPrice(itemToEdit.old_price ? itemToEdit.old_price.toString() : "");

      // Safe variants parsing
      let parsedVariants: any[] = [];
      if (itemToEdit.variants) {
        try {
          parsedVariants = typeof itemToEdit.variants === "string"
            ? JSON.parse(itemToEdit.variants)
            : itemToEdit.variants;
        } catch (e) {
          console.error("Failed to parse variants JSON:", e);
        }
      }
      setVariants(
        Array.isArray(parsedVariants)
          ? parsedVariants.map((v) => ({ name: v.name || "", price: v.price !== undefined ? v.price.toString() : "" }))
          : []
      );

      // Safe availability & visibility
      setIsAvailable(itemToEdit.is_available !== undefined ? itemToEdit.is_available : true);
      setIsVisible(itemToEdit.is_visible !== undefined ? itemToEdit.is_visible : true);

      // Safe addons parsing
      let parsedAddons: any[] = [];
      if (itemToEdit.addons) {
        try {
          parsedAddons = typeof itemToEdit.addons === "string"
            ? JSON.parse(itemToEdit.addons)
            : itemToEdit.addons;
        } catch (e) {
          console.error("Failed to parse addons JSON:", e);
        }
      }
      setSelectedAddons(Array.isArray(parsedAddons) ? parsedAddons : []);

      setImageUrl(itemToEdit.image_url || "");
      setPreviewUrl(itemToEdit.image_url || null);
      setModel3dUrl(itemToEdit.model_3d_url || "");
      setTags(itemToEdit.tags || []);
    } else {
      // Create defaults
      setName("");
      setDescription("");
      setPrice("");
      setWeight("");
      setOldPrice("");
      setVariants([]);
      setIsVisible(true);
      setIsAvailable(true);
      setSelectedAddons([]);
      setImageUrl("");
      setImageFile(null);
      setPreviewUrl(null);
      setModel3dUrl("");
      setTags([]);
    }
    setError(null);
    setAddonSearch("");
    setIsAddonDropdownOpen(false);
    setLoading(false);
  }, [itemToEdit, isOpen]);

  // Extract unique addon groups from allLoadedItems
  const uniqueAddonGroups = React.useMemo(() => {
    const groups: any[] = [];
    const seenNames = new Set<string>();
    if (allItems) {
      allItems.forEach((item) => {
        if (item.addons) {
          try {
            const parsed = typeof item.addons === "string" ? JSON.parse(item.addons) : item.addons;
            if (Array.isArray(parsed)) {
              parsed.forEach((g) => {
                if (g && g.name && !seenNames.has(g.name.toLowerCase().trim())) {
                  seenNames.add(g.name.toLowerCase().trim());
                  groups.push(g);
                }
              });
            }
          } catch (e) {
            console.error("Error reading addons list:", e);
          }
        }
      });
    }
    return groups;
  }, [allItems]);

  // Filter addon groups
  const filteredAddonGroups = uniqueAddonGroups.filter((g) =>
    g.name.toLowerCase().includes(addonSearch.toLowerCase())
  );

  if (!isOpen) return null;

  // File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Image Preset Selection
  const selectPreset = (url: string) => {
    setImageUrl(url);
    setImageFile(null);
    setPreviewUrl(url);
  };

  // Badges Tags Toggle
  const handleTagToggle = (tagValue: string) => {
    if (tags.includes(tagValue)) {
      setTags(tags.filter((t) => t !== tagValue));
    } else {
      setTags([...tags, tagValue]);
    }
  };

  // AI Description Generator
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
      if (data.error) throw new Error(data.error);
      if (data.description) setDescription(data.description);
    } catch (err: any) {
      setError(err?.message || "Failed to generate AI description.");
    } finally {
      setAiLoading(false);
    }
  };

  // Add Variant Row
  const handleAddVariant = () => {
    setVariants([...variants, { name: "", price: "" }]);
  };

  // Remove Variant Row
  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  // Edit Variant Fields
  const handleVariantFieldChange = (index: number, key: "name" | "price", value: string) => {
    const updated = [...variants];
    updated[index][key] = value;
    setVariants(updated);
  };

  // Addons toggle checklist
  const toggleAddonGroup = (group: any) => {
    const isSelected = selectedAddons.some((g) => g.name.toLowerCase().trim() === group.name.toLowerCase().trim());
    if (isSelected) {
      setSelectedAddons(selectedAddons.filter((g) => g.name.toLowerCase().trim() !== group.name.toLowerCase().trim()));
    } else {
      setSelectedAddons([...selectedAddons, group]);
    }
  };

  // Save changes
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

    // Custom validations for variants
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.name.trim()) {
        setError(`Variant row #${i + 1} requires a valid variant name.`);
        return;
      }
      if (!v.price.trim() || isNaN(parseFloat(v.price))) {
        setError(`Variant row #${i + 1} (${v.name}) requires a valid numeric price.`);
        return;
      }
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

        const { error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(filePath, fileToUpload, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.warn("Storage upload failed, fallback preset:", uploadError.message);
          finalImageUrl = PRESETS[Math.floor(Math.random() * PRESETS.length)];
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("menu-images")
            .getPublicUrl(filePath);
          finalImageUrl = publicUrl;
        }
      }

      const payload = itemToEdit
        ? {
            id: itemToEdit.id,
            name,
            description: description || null,
            price: parseFloat(price),
            imageUrl: finalImageUrl || null,
            model3dUrl: model3dUrl.trim() || null,
            isAvailable,
            isVisible,
            weight: weight.trim() || null,
            oldPrice: oldPrice.trim() ? parseFloat(oldPrice) : null,
            variants: variants.map((v) => ({ name: v.name.trim(), price: parseFloat(v.price) })),
            addons: selectedAddons,
            tags,
          }
        : {
            categoryId,
            name,
            description: description || null,
            price: parseFloat(price),
            imageUrl: finalImageUrl || null,
            model3dUrl: model3dUrl.trim() || null,
            isAvailable,
            isVisible,
            weight: weight.trim() || null,
            oldPrice: oldPrice.trim() ? parseFloat(oldPrice) : null,
            variants: variants.map((v) => ({ name: v.name.trim(), price: parseFloat(v.price) })),
            addons: selectedAddons,
            tags,
            sortOrder: nextSortOrder,
          };

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.error || responseData.details || "Failed to save item.");
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
      {/* Backdrop with elegant blur */}
      <div className="absolute inset-0 bg-[#1b3151]/30 backdrop-blur-md transition-opacity" onClick={onClose}></div>

      {/* Slide-Up High Fidelity Modal Card Container */}
      <div className="bg-white rounded-[32px] max-w-lg w-full border border-orange-50/50 relative z-10 shadow-2xl animate-slide-up flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-heading font-black text-xl text-[#2d2d2d] tracking-tight">
              {itemToEdit ? "Edit Item details" : "Create new item"}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {itemToEdit ? "Modify and sync menu dish properties" : "Add custom dish to your visual category"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#f7906c]/10 flex items-center justify-center text-gray-400 hover:text-[#f7906c] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body Container */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col gap-6">
          
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-start gap-2.5 shadow-sm animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* ==========================================
              SECTION 1: BASIC INFO
              ========================================== */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-l-4 border-[#f7906c] pl-2.5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Basic Info
              </span>
            </div>

            {/* Name & Weight Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
                  Item Name <span className="text-[#f7906c] font-black">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Avocado Toast Deluxe"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-[#f7906c] focus:ring-2 focus:ring-[#f7906c]/15 focus:outline-none text-xs text-[#2d2d2d] bg-[#fdf6f2]/20 font-bold transition-all placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
                  Weight / Vol
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 250g"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-[#f7906c] focus:ring-2 focus:ring-[#f7906c]/15 focus:outline-none text-xs text-[#2d2d2d] bg-[#fdf6f2]/20 font-bold transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Price & Old Price Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
                  Selling Price <span className="text-[#f7906c] font-black">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-[#f7906c] focus:ring-2 focus:ring-[#f7906c]/15 focus:outline-none text-xs text-[#2d2d2d] bg-[#fdf6f2]/20 font-bold transition-all placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
                  Old Price <span className="text-gray-400 font-normal">(Discount strike)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="e.g. 14.99"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-[#f7906c] focus:ring-2 focus:ring-[#f7906c]/15 focus:outline-none text-xs text-[#2d2d2d] bg-[#fdf6f2]/20 font-bold transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* VARIANTS BUILDER */}
            <div className="bg-[#fdf6f2]/30 p-4 rounded-2xl border border-orange-50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Variants / Sizes
                  </span>
                  <span className="text-[8px] text-gray-400 font-bold">
                    Define custom sizing models (e.g. Small, Medium, Large)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-2.5 py-1 text-[9px] font-black text-white bg-[#f7906c] hover:bg-[#e27653] transition-all rounded-lg flex items-center gap-1 shadow-sm uppercase cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Variant</span>
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-orange-100 rounded-xl text-[9px] text-gray-400 italic">
                  No size variants added yet. Tap Add Variant to append items.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {variants.map((v, index) => (
                    <div key={index} className="flex items-center gap-2 animate-slide-up">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleVariantFieldChange(index, "name", e.target.value)}
                        placeholder="e.g. Large / Double Patty"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-100 focus:border-[#f7906c] focus:outline-none text-xs text-[#2d2d2d] bg-white font-semibold"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={v.price}
                        onChange={(e) => handleVariantFieldChange(index, "price", e.target.value)}
                        placeholder="Price"
                        className="w-20 px-3 py-2 rounded-lg border border-gray-100 focus:border-[#f7906c] focus:outline-none text-xs text-[#2d2d2d] bg-white font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description Textarea */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">
                  Description
                </label>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="text-[9px] font-black text-white bg-[#1b3151] hover:bg-[#112036] disabled:bg-gray-100 disabled:text-gray-400 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-sm uppercase cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>✨ Auto Description</span>
                  )}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give a quick summary of ingredients, seasoning methods, allergens, etc..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-[#f7906c] focus:outline-none text-xs text-[#2d2d2d] bg-[#fdf6f2]/20 placeholder:text-gray-300 resize-none transition-all"
              />
            </div>
          </div>

          {/* ==========================================
              SECTION 2: SCROLLABLE DETAILS
              ========================================== */}
          <div className="flex flex-col gap-4 border-t border-gray-50 pt-5">
            <div className="flex items-center gap-2 border-l-4 border-[#f7906c] pl-2.5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Details & Assets
              </span>
            </div>

            {/* Large Dashed Image Uploader */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
                Item Cover Photo
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Uploader Trigger */}
                <div className="relative border-2 border-dashed border-gray-100 hover:border-[#f7906c]/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[120px] bg-[#fdf6f2]/10 hover:bg-[#fdf6f2]/35 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <Upload className="w-6 h-6 text-[#f7906c] mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-black text-[#2d2d2d]">Upload Custom Photo</span>
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
                      <span className="text-[9px] uppercase tracking-wider text-gray-300">No Image loaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Presets Library */}
              <div className="mt-3">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider mb-2">
                  Select a gourmet preset
                </span>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectPreset(p)}
                      className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-[#f7906c] focus:outline-none transition-all shadow-sm active:scale-95"
                    >
                      <img src={p} alt="Preset cover" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges and tags checkboxes */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
                Badges & Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => {
                  const isSelected = tags.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTagToggle(tag.value);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${
                        isSelected
                          ? "bg-[#f7906c] border-[#f7906c] text-white shadow-sm"
                          : "bg-white border-gray-100 text-gray-400 hover:text-gray-600 hover:border-gray-200"
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3D glb assets link */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                3D GLB Model Asset URL (.glb)
              </label>
              <input
                type="text"
                value={model3dUrl}
                onChange={(e) => setModel3dUrl(e.target.value)}
                placeholder="https://yourstore.com/assets/dish.glb"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-[#f7906c] focus:outline-none text-xs text-[#2d2d2d] bg-[#fdf6f2]/20 font-bold transition-all placeholder:text-gray-300"
              />
              <span className="text-[8px] text-gray-400 mt-1 block font-bold leading-normal uppercase">
                Enables users to project interactive 3D structures in their web browser
              </span>
            </div>

            {/* SELECT ADD-ONS DROPDOWN COMPONENT */}
            <div className="flex flex-col gap-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">
                Customization Options / Add-ons
              </label>
              
              <div className="relative" ref={dropdownRef}>
                {/* Custom Search/Dropdown input button */}
                <button
                  type="button"
                  onClick={() => setIsAddonDropdownOpen(!isAddonDropdownOpen)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#fdf6f2]/20 hover:border-gray-200 flex items-center justify-between text-xs text-slate-500 transition-all font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span>
                      {selectedAddons.length > 0
                        ? `Linked: ${selectedAddons.map((g) => g.name).join(", ")}`
                        : "Select and link customizable add-ons"}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#f7906c] font-black uppercase">
                    {isAddonDropdownOpen ? "Close" : "Open"}
                  </span>
                </button>

                {/* Dropdown Menu list */}
                {isAddonDropdownOpen && (
                  <div className="absolute top-[102%] left-0 right-0 z-20 bg-white border border-orange-50 shadow-2xl rounded-2xl p-3 flex flex-col gap-3 animate-slide-up max-h-[220px] overflow-hidden">
                    {/* Search bar inside */}
                    <div className="relative">
                      <input
                        type="text"
                        value={addonSearch}
                        onChange={(e) => setAddonSearch(e.target.value)}
                        placeholder="Search addon groups..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-100 focus:border-[#f7906c] focus:outline-none text-[11px] text-[#2d2d2d] bg-[#fdf6f2]/10 font-semibold"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>

                    {/* Groups List */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-1 pr-1">
                      {filteredAddonGroups.length === 0 ? (
                        <div className="py-6 text-center text-[10px] text-gray-400 italic">
                          No unique customization groups found.
                        </div>
                      ) : (
                        filteredAddonGroups.map((group, idx) => {
                          const isSelected = selectedAddons.some(
                            (g) => g.name.toLowerCase().trim() === group.name.toLowerCase().trim()
                          );
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => toggleAddonGroup(group)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors border ${
                                isSelected
                                  ? "bg-[#fdf6f2] border-orange-100 text-[#f7906c] font-bold"
                                  : "bg-white border-transparent hover:bg-slate-50 text-[#2d2d2d]"
                              }`}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span>{group.name}</span>
                                <span className="text-[8px] text-gray-400 font-bold uppercase">
                                  {group.options?.length || 0} choices • {group.mandatory ? "Required" : "Optional"}
                                </span>
                              </div>
                              {isSelected ? (
                                <Check className="w-4 h-4 text-[#f7906c]" />
                              ) : (
                                <span className="text-[10px] text-slate-300 font-bold">+ Link</span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Display Linked Badges */}
              {selectedAddons.length > 0 && (
                <div className="flex flex-col gap-2 mt-1 bg-slate-50/50 p-2.5 rounded-2xl border border-gray-100/50">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block">
                    Linked Groups checklist ({selectedAddons.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAddons.map((group, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-150 text-[10px] text-gray-700 font-extrabold flex items-center gap-1.5 shadow-sm"
                      >
                        <span>{group.name}</span>
                        <span className="text-[8px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-bold">
                          {group.options?.length || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAddons(
                              selectedAddons.filter((g) => g.name.toLowerCase().trim() !== group.name.toLowerCase().trim())
                            )
                          }
                          className="text-gray-400 hover:text-red-500 ml-0.5 transition-colors font-bold text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add addon creator shortcut link */}
              <div className="flex items-center justify-between text-[10px] px-1">
                <span className="text-gray-400 font-bold uppercase">Add customized options?</span>
                <a
                  href={`/panel/${slug}/components`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-black text-[#f7906c] hover:text-[#d36e4b] hover:underline flex items-center gap-0.5 uppercase tracking-wide"
                >
                  <span>Create new add-on</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Visibility & Availability Controls */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* Visible Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fdf6f2]/10 border border-gray-100">
                <div className="flex flex-col gap-0.5 select-none">
                  <span className="text-xs font-black text-[#2d2d2d]">Visible on Page</span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase">Toggle visibility</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className={`w-11 h-6 rounded-full transition-all relative outline-none focus:outline-none ${
                    isVisible ? "bg-[#f7906c]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${
                      isVisible ? "right-1" : "left-1"
                    }`}
                  ></div>
                </button>
              </div>

              {/* Available Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fdf6f2]/10 border border-gray-100">
                <div className="flex flex-col gap-0.5 select-none">
                  <span className="text-xs font-black text-[#2d2d2d]">In Stock / Available</span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase">Toggle ordering</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`w-11 h-6 rounded-full transition-all relative outline-none focus:outline-none ${
                    isAvailable ? "bg-[#f7906c]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${
                      isAvailable ? "right-1" : "left-1"
                    }`}
                  ></div>
                </button>
              </div>
            </div>

          </div>

        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-white hover:bg-slate-100 border border-gray-100 text-gray-400 hover:text-gray-600 font-black rounded-full text-xs transition-colors uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-[#f7906c] hover:bg-[#e27653] disabled:bg-gray-300 text-white font-black rounded-full text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider border-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Saving item...</span>
              </>
            ) : (
              <span>{itemToEdit ? "Save Changes" : "Create Item"}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
