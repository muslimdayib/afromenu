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

  const labelStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
    display: 'block',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '14px 16px',
    color: 'white',
    fontSize: 15,
    outline: 'none',
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
      }} className="relative z-10 shadow-2xl animate-slide-up flex flex-col">
        
        {/* Header */}
        <div className="pb-4 border-b border-white/10 flex items-center justify-between mb-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-heading font-black text-xl text-white tracking-tight">
              {itemToEdit ? "Edit Item Details" : "Create New Item"}
            </h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
              {itemToEdit ? "Modify and sync menu dish properties" : "Add custom dish to your visual category"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)' }}
            className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          
          {error && (
            <div className="p-4 rounded-2xl text-red-400 text-xs font-bold flex items-start gap-2.5 shadow-sm animate-shake" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* S1: Basic Info */}
          <div className="flex flex-col gap-4">
            {/* Name & Weight */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label style={labelStyle}>Item Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Avocado Toast Deluxe"
                  required
                  style={inputStyle}
                  className="placeholder:text-white/20 font-bold focus:border-[#dac063]"
                />
              </div>
              <div>
                <label style={labelStyle}>Weight / Vol</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 250g"
                  style={inputStyle}
                  className="placeholder:text-white/20 font-bold focus:border-[#dac063]"
                />
              </div>
            </div>

            {/* Price & Old Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Selling Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  style={inputStyle}
                  className="placeholder:text-white/20 font-bold focus:border-[#dac063]"
                />
              </div>
              <div>
                <label style={labelStyle}>Old Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="e.g. 14.99"
                  style={inputStyle}
                  className="placeholder:text-white/20 font-bold focus:border-[#dac063]"
                />
              </div>
            </div>

            {/* Variants */}
            <div className="p-4 rounded-2xl flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">
                    Variants / Sizes
                  </span>
                  <span className="text-[8px] text-white/30 font-bold uppercase">
                    Define custom sizing models (e.g. Small, Medium)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  style={{ background: '#dac063', color: '#0a0a0b' }}
                  className="px-2.5 py-1 text-[9px] font-black transition-all rounded-lg flex items-center gap-1 shadow-sm uppercase cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Variant</span>
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-4 rounded-xl text-[9px] text-white/30 italic" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
                  No size variants added yet.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {variants.map((v, index) => (
                    <div key={index} className="flex items-center gap-2 animate-slide-up">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleVariantFieldChange(index, "name", e.target.value)}
                        placeholder="e.g. Large"
                        style={inputStyle}
                        className="flex-1 py-2 text-xs focus:border-[#dac063]"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={v.price}
                        onChange={(e) => handleVariantFieldChange(index, "price", e.target.value)}
                        placeholder="Price"
                        style={inputStyle}
                        className="w-20 py-2 text-xs focus:border-[#dac063]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label style={labelStyle}>Description</label>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}
                  className="text-[9px] font-black px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-sm uppercase cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>✨ AI Generate</span>
                  )}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dish description, ingredients, allergens..."
                rows={3}
                style={inputStyle}
                className="placeholder:text-white/20 resize-none focus:border-[#dac063]"
              />
            </div>
          </div>

          {/* S2: Details & Assets */}
          <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
            {/* Image */}
            <div>
              <label style={labelStyle}>Item Cover Photo</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload box */}
                <div className="relative border-2 border-dashed border-white/10 hover:border-[#dac063]/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[120px] bg-white/[0.02] hover:bg-white/[0.05] group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <Upload className="w-6 h-6 text-[#dac063] mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-black text-white">Upload Custom Photo</span>
                  <span className="text-[8px] text-white/30 mt-1 uppercase font-bold">PNG, JPG up to 5MB</span>
                </div>

                {/* Preview Box */}
                <div className="border border-white/10 rounded-2xl h-[120px] overflow-hidden bg-white/[0.01] flex items-center justify-center relative">
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
                    <div className="text-center text-white/30 text-xs flex flex-col items-center select-none font-bold">
                      <ImageIcon className="w-7 h-7 mb-1 text-white/20" />
                      <span className="text-[9px] uppercase tracking-wider">No Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Presets */}
              <div className="mt-3">
                <span className="block text-[8px] font-black text-white/30 uppercase tracking-wider mb-2">
                  Select a preset
                </span>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectPreset(p)}
                      className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-[#dac063] focus:outline-none transition-all shadow-sm active:scale-95"
                    >
                      <img src={p} alt="Preset cover" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges/Tags */}
            <div>
              <label style={labelStyle}>Badges & Labels</label>
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
                      style={isSelected ? { background: '#dac063', color: '#0a0a0b', borderColor: '#dac063' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}
                      className="px-3 py-1.5 rounded-full text-[10px] font-black border transition-all"
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3D glb URL */}
            <div>
              <label style={labelStyle}>3D GLB Model Asset URL (.glb)</label>
              <input
                type="text"
                value={model3dUrl}
                onChange={(e) => setModel3dUrl(e.target.value)}
                placeholder="https://yourstore.com/assets/dish.glb"
                style={inputStyle}
                className="placeholder:text-white/20 font-bold focus:border-[#dac063]"
              />
            </div>

            {/* Addons Dropdown Selector */}
            <div className="flex flex-col gap-2">
              <label style={labelStyle}>Customization Options / Add-ons</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsAddonDropdownOpen(!isAddonDropdownOpen)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 12, padding: '12px 16px' }}
                  className="w-full hover:border-white/20 flex items-center justify-between text-xs transition-all font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-white/40" />
                    <span>
                      {selectedAddons.length > 0
                        ? `Linked: ${selectedAddons.map((g) => g.name).join(", ")}`
                        : "Select customizable add-ons"}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#dac063] font-black uppercase">
                    {isAddonDropdownOpen ? "Close" : "Open"}
                  </span>
                </button>

                {isAddonDropdownOpen && (
                  <div className="absolute top-[102%] left-0 right-0 z-20 bg-[#13131a] border border-white/10 shadow-2xl rounded-2xl p-3 flex flex-col gap-3 animate-slide-up max-h-[220px] overflow-y-auto">
                    <div className="relative">
                      <input
                        type="text"
                        value={addonSearch}
                        onChange={(e) => setAddonSearch(e.target.value)}
                        placeholder="Search addon groups..."
                        style={inputStyle}
                        className="py-2 text-xs focus:border-[#dac063]"
                      />
                    </div>
                    <div className="flex flex-col gap-1 pr-1">
                      {filteredAddonGroups.length === 0 ? (
                        <div className="py-6 text-center text-[10px] text-white/30 italic">
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
                              style={isSelected ? { background: 'rgba(218,192,99,0.1)', borderColor: 'rgba(218,192,99,0.3)', color: '#dac063' } : { background: 'transparent', borderColor: 'transparent', color: 'white' }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors border"
                            >
                              <div className="flex flex-col gap-0.5">
                                <span>{group.name}</span>
                                <span className="text-[8px] text-white/40 font-bold uppercase">
                                  {group.options?.length || 0} choices
                                </span>
                              </div>
                              {isSelected ? <Check className="w-4 h-4" /> : <span className="text-[10px] text-white/30">+ Link</span>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Display Linked */}
              {selectedAddons.length > 0 && (
                <div className="flex flex-col gap-2 mt-1 p-2.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-[8px] font-black text-white/40 uppercase block">
                    Linked Groups checklist ({selectedAddons.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAddons.map((group, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[10px] text-white font-extrabold flex items-center gap-1.5 shadow-sm"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <span>{group.name}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedAddons(selectedAddons.filter((g) => g.name.toLowerCase().trim() !== group.name.toLowerCase().trim()))}
                          className="text-white/40 hover:text-red-500 ml-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add addon shortcut link */}
              <div className="flex items-center justify-between text-[10px] px-1">
                <span className="text-white/30 font-bold uppercase">Add options?</span>
                <a
                  href={`/panel/${slug}/components`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-black text-[#dac063] hover:underline flex items-center gap-0.5 uppercase tracking-wide"
                >
                  <span>Create new add-on</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Visibility & Availability Switch */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex flex-col gap-0.5 select-none">
                  <span className="text-xs font-black text-white">Visible on Page</span>
                  <span className="text-[8px] text-white/30 font-bold uppercase">Toggle visibility</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className={`w-11 h-6 rounded-full transition-all relative outline-none focus:outline-none ${
                    isVisible ? "bg-[#dac063]" : "bg-neutral-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${isVisible ? "right-1" : "left-1"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex flex-col gap-0.5 select-none">
                  <span className="text-xs font-black text-white">In Stock</span>
                  <span className="text-[8px] text-white/30 font-bold uppercase">Toggle ordering</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`w-11 h-6 rounded-full transition-all relative outline-none focus:outline-none ${
                    isAvailable ? "bg-[#dac063]" : "bg-neutral-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${isAvailable ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-3">
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
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-950" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{itemToEdit ? "Save Changes" : "Create Item"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
