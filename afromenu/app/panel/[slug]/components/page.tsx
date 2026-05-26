"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import EditEstablishmentModal from "@/components/EditEstablishmentModal";
import AccountSettingsModal from "@/components/AccountSettingsModal";
import { 
  Puzzle, 
  Sparkles, 
  Sliders, 
  EyeOff, 
  Globe2, 
  CalendarDays, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle 
} from "lucide-react";

type TabType = "addons" | "visibility" | "languages" | "scheduling" | null;

function ComponentsContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [establishment, setEstablishment] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ADD-ONS STATE
  const [addonItemId, setAddonItemId] = useState<string>("");
  const [addonGroups, setAddonGroups] = useState<any[]>([]);

  // VISIBILITY STATE
  const [visibilityStatus, setVisibilityStatus] = useState<{ [key: string]: boolean }>({});

  // LANGUAGES STATE
  const [secondaryLanguage, setSecondaryLanguage] = useState<string>("");

  // SCHEDULED PRICES STATE
  const [schedItemId, setSchedItemId] = useState<string>("");
  const [promoPrice, setPromoPrice] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchData = async () => {
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
      setCategories(responseData.categories || []);
      
      const loadedItems = responseData.items || [];
      setItems(loadedItems);
      setSecondaryLanguage(responseData.establishment.language || "English");

      // Pre-fill visibility dictionary
      const visDict: { [key: string]: boolean } = {};
      loadedItems.forEach((i: any) => {
        visDict[i.id] = i.is_available;
      });
      setVisibilityStatus(visDict);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Load Add-ons when selected item changes
  useEffect(() => {
    if (addonItemId) {
      const selectedItem = items.find(i => i.id === addonItemId);
      if (selectedItem) {
        try {
          const parsed = typeof selectedItem.addons === "string" 
            ? JSON.parse(selectedItem.addons) 
            : selectedItem.addons;
          setAddonGroups(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setAddonGroups([]);
        }
      } else {
        setAddonGroups([]);
      }
    } else {
      setAddonGroups([]);
    }
  }, [addonItemId, items]);

  // Load scheduling details when selected item changes
  useEffect(() => {
    if (schedItemId) {
      const selectedItem = items.find(i => i.id === schedItemId);
      if (selectedItem) {
        setPromoPrice(selectedItem.scheduled_price ? String(selectedItem.scheduled_price) : "");
        setStartDate(selectedItem.scheduled_start ? new Date(selectedItem.scheduled_start).toISOString().slice(0, 16) : "");
        setEndDate(selectedItem.scheduled_end ? new Date(selectedItem.scheduled_end).toISOString().slice(0, 16) : "");
      } else {
        setPromoPrice("");
        setStartDate("");
        setEndDate("");
      }
    } else {
      setPromoPrice("");
      setStartDate("");
      setEndDate("");
    }
  }, [schedItemId, items]);

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const showError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 4000);
  };

  // 1. SAVE ADD-ONS
  const handleSaveAddons = async () => {
    if (!addonItemId) return;
    setSaving(true);
    setActionError(null);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: addonItemId,
          addons: JSON.stringify(addonGroups)
        })
      });
      if (!res.ok) throw new Error("Failed to save customization details");
      await fetchData();
      showSuccess("Add-ons and options updated successfully!");
    } catch (e: any) {
      showError(e.message || "Failed to update customizations");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddonGroup = () => {
    setAddonGroups([
      ...addonGroups,
      { name: "Extra Toppings", mandatory: false, options: [{ name: "Extra Sauce", price: 0.5 }] }
    ]);
  };

  const handleRemoveAddonGroup = (gIdx: number) => {
    setAddonGroups(addonGroups.filter((_, idx) => idx !== gIdx));
  };

  const handleAddOption = (gIdx: number) => {
    const updated = [...addonGroups];
    updated[gIdx].options.push({ name: "New Option", price: 1.0 });
    setAddonGroups(updated);
  };

  const handleRemoveOption = (gIdx: number, oIdx: number) => {
    const updated = [...addonGroups];
    updated[gIdx].options = updated[gIdx].options.filter((_: any, idx: number) => idx !== oIdx);
    setAddonGroups(updated);
  };

  const handleGroupFieldChange = (gIdx: number, key: string, value: any) => {
    const updated = [...addonGroups];
    updated[gIdx][key] = value;
    setAddonGroups(updated);
  };

  const handleOptionFieldChange = (gIdx: number, oIdx: number, key: string, value: any) => {
    const updated = [...addonGroups];
    updated[gIdx].options[oIdx][key] = value;
    setAddonGroups(updated);
  };

  // 2. TOGGLE VISIBILITY
  const handleToggleVisibility = async (itemId: string, currentAvailable: boolean) => {
    const nextVal = !currentAvailable;
    // Optimistic UI update
    setVisibilityStatus(prev => ({ ...prev, [itemId]: nextVal }));
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: itemId,
          isAvailable: nextVal
        })
      });
      if (!res.ok) throw new Error("Could not update item availability");
      await fetchData();
      showSuccess("Item visibility toggled successfully!");
    } catch (e: any) {
      // Revert state
      setVisibilityStatus(prev => ({ ...prev, [itemId]: currentAvailable }));
      showError(e.message || "Failed to toggle visibility");
    }
  };

  // 3. SAVE LANGUAGE
  const handleSaveLanguage = async () => {
    setSaving(true);
    setActionError(null);
    try {
      const { error: updateErr } = await supabase
        .from("establishments")
        .update({
          language: secondaryLanguage
        })
        .eq("id", establishment.id);

      if (updateErr) throw updateErr;
      await fetchData();
      showSuccess("Establishment language preference saved!");
    } catch (e: any) {
      showError(e.message || "Failed to update language");
    } finally {
      setSaving(false);
    }
  };

  // 4. SAVE SCHEDULING
  const handleSaveScheduling = async () => {
    if (!schedItemId || !promoPrice || !startDate || !endDate) {
      showError("Please complete all scheduled pricing fields.");
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: schedItemId,
          scheduledPrice: promoPrice,
          scheduledStart: new Date(startDate).toISOString(),
          scheduledEnd: new Date(endDate).toISOString()
        })
      });
      if (!res.ok) throw new Error("Could not save price schedule");
      await fetchData();
      showSuccess("Price schedule automated successfully!");
    } catch (e: any) {
      showError(e.message || "Failed to save scheduled pricing");
    } finally {
      setSaving(false);
    }
  };

  const handleClearScheduling = async () => {
    if (!schedItemId) return;
    setSaving(true);
    setActionError(null);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: schedItemId,
          scheduledPrice: null,
          scheduledStart: null,
          scheduledEnd: null
        })
      });
      if (!res.ok) throw new Error("Could not clear scheduled price");
      await fetchData();
      setPromoPrice("");
      setStartDate("");
      setEndDate("");
      showSuccess("Price schedule cleared.");
    } catch (e: any) {
      showError(e.message || "Failed to clear price scheduling");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !establishment) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#1b3151]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#f2bd11] animate-spin"></div>
        </div>
        <p className="font-heading font-semibold text-sm text-[#1b3151]">
          Loading panel features...
        </p>
      </div>
    );
  }

  const components = [
    {
      id: "addons" as TabType,
      title: "Add-ons & Options",
      desc: "Allow extra options per item (e.g. 'Extra cheese +$0.50' or double patty choices).",
      icon: Sliders,
    },
    {
      id: "visibility" as TabType,
      title: "Items Visibility",
      desc: "Instantly hide specific dishes or whole drink lines without deleting the cards.",
      icon: EyeOff,
    },
    {
      id: "languages" as TabType,
      title: "Multi-Language Translators",
      desc: "Write category & item descriptions in Somali, Arabic, or French translation tables.",
      icon: Globe2,
    },
    {
      id: "scheduling" as TabType,
      title: "Scheduled Price Updates",
      desc: "Automate menu price changes on select hours (e.g., Happy Hour drink prices).",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 text-[#1b3151]">
      {/* Topbar */}
      <div className="bg-[#1b3151] border-b border-[#f2bd11]/20 px-6 py-4 sticky top-0 z-30 shadow-md flex items-center justify-between max-w-[430px] mx-auto text-white">
        <button
          onClick={() => activeTab ? setActiveTab(null) : router.push(`/p/${slug}`)}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors font-bold border border-transparent"
        >
          {activeTab ? <ArrowLeft className="w-4 h-4" /> : "✕"}
        </button>
        <div className="text-center">
          <h1 className="font-heading font-extrabold text-base tracking-tight truncate max-w-[180px] text-white">
            {activeTab ? components.find(c => c.id === activeTab)?.title : establishment.name}
          </h1>
          <span className="text-[10px] bg-[#f2bd11] text-[#1b3151] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {activeTab ? "Interactive View" : "Components Panel"}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#f2bd11] text-[#1b3151] flex items-center justify-center font-bold text-sm shadow-sm uppercase">
          {establishment.name[0]}
        </div>
      </div>

      {/* Main Content (Mobile size locked at 430px centered) */}
      <main className="max-w-[430px] mx-auto px-4 py-6">
        
        {/* Status Alerts */}
        {actionSuccess && (
          <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 flex items-center gap-2 animate-slide-up">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100 flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{actionError}</span>
          </div>
        )}

        {/* 1. GENERAL MENU DASHBOARD (Active tab is NULL) */}
        {!activeTab ? (
          <>
            <div className="p-4 rounded-3xl bg-white border border-gray-100 shadow-sm mb-6 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#1b3151]/5 text-[#f2bd11] flex items-center justify-center flex-shrink-0">
                <Puzzle className="w-5 h-5 text-[#1b3151]" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Unlock Custom Features</h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Configure add-ons, translator preferences, schedules, or items toggles instantly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              {components.map((comp) => {
                const CompIcon = comp.icon;
                return (
                  <button
                    key={comp.id}
                    onClick={() => setActiveTab(comp.id)}
                    className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-[#f2bd11]/60 transition-all text-left w-full cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 p-1.5 rounded-full border border-emerald-100 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>

                    <div className="pr-8">
                      <div className="w-10 h-10 rounded-xl bg-[#1b3151]/5 text-[#f2bd11] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <CompIcon className="w-5 h-5 text-[#1b3151]" />
                      </div>
                      <h3 className="font-heading font-extrabold text-sm text-[#1b3151] mb-1.5">
                        {comp.title}
                      </h3>
                      <p className="text-[10px] text-gray-500 leading-relaxed mb-4">
                        {comp.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 w-full text-xs font-bold text-[#f2bd11] hover:text-[#dbab0f] transition-colors">
                      <span>Click to Manage feature</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* 2. SUB-MANAGEMENT INTERFACES */
          <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-lg flex flex-col gap-6 animate-slide-up">
            
            {/* ADD-ONS AND OPTIONS MANAGEMENT */}
            {activeTab === "addons" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#1b3151] uppercase tracking-wider mb-2">
                    Select Menu Item to Edit
                  </label>
                  <select
                    value={addonItemId}
                    onChange={(e) => setAddonItemId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1b3151] focus:outline-none text-xs text-[#1b3151] bg-[#f8f9fa] font-bold"
                  >
                    <option value="">-- Select an Item --</option>
                    {categories.map((cat) => (
                      <optgroup key={cat.id} label={cat.name.toUpperCase()}>
                        {items
                          .filter((i) => i.category_id === cat.id)
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} (${Number(item.price).toFixed(2)})
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {addonItemId ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Customization Groups</span>
                      <button
                        type="button"
                        onClick={handleAddAddonGroup}
                        className="px-3 py-1 bg-[#1b3151]/5 hover:bg-[#1b3151]/10 text-[#1b3151] font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Group</span>
                      </button>
                    </div>

                    {addonGroups.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        No customizations set yet. Click &apos;Add Group&apos; above.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {addonGroups.map((group, gIdx) => (
                          <div key={gIdx} className="p-4 bg-[#fdf6f2]/60 border border-orange-100/50 rounded-2xl relative">
                            <button
                              type="button"
                              onClick={() => handleRemoveAddonGroup(gIdx)}
                              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 pr-6">
                              <div>
                                <label className="block text-[9px] font-bold text-[#1b3151] uppercase mb-1">Group Title</label>
                                <input
                                  type="text"
                                  value={group.name}
                                  onChange={(e) => handleGroupFieldChange(gIdx, "name", e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#1b3151]"
                                  placeholder="e.g. Extra Toppings"
                                />
                              </div>
                              <div className="flex items-center gap-2 mt-4.5">
                                <input
                                  type="checkbox"
                                  id={`mand-${gIdx}`}
                                  checked={group.mandatory || false}
                                  onChange={(e) => handleGroupFieldChange(gIdx, "mandatory", e.target.checked)}
                                  className="rounded text-[#f2bd11] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                                />
                                <label htmlFor={`mand-${gIdx}`} className="text-[10px] font-bold text-gray-500 cursor-pointer select-none">
                                  Mandatory Choice
                                </label>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100/60 pb-1">
                                <span>Options</span>
                                <button
                                  type="button"
                                  onClick={() => handleAddOption(gIdx)}
                                  className="text-[#f2bd11] hover:underline"
                                >
                                  + Add Option
                                </button>
                              </div>
                              
                              {group.options?.map((opt: any, oIdx: number) => (
                                <div key={oIdx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={opt.name}
                                    onChange={(e) => handleOptionFieldChange(gIdx, oIdx, "name", e.target.value)}
                                    placeholder="Option name"
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#1b3151]"
                                  />
                                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 w-20">
                                    <span className="text-[10px] text-gray-400 font-bold">$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={opt.price}
                                      onChange={(e) => handleOptionFieldChange(gIdx, oIdx, "price", parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                      className="w-full py-1.5 text-xs focus:outline-none font-mono"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(gIdx, oIdx)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveAddons}
                      className="w-full py-3 bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] font-bold rounded-[50px] text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:bg-gray-200"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Add-ons...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Customization Options</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-gray-400 italic">
                    Select a menu item above to start editing its options.
                  </div>
                )}
              </div>
            )}

            {/* ITEMS VISIBILITY MANAGEMENT */}
            {activeTab === "visibility" && (
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">Toggle dishes visibility</span>
                
                <div className="flex flex-col gap-6">
                  {categories.map((cat) => {
                    const catItems = items.filter((i) => i.category_id === cat.id);
                    if (catItems.length === 0) return null;
                    return (
                      <div key={cat.id} className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-black text-[#f2bd11] uppercase tracking-widest border-b border-gray-50 pb-1 mb-1">
                          {cat.name}
                        </h4>
                        
                        <div className="flex flex-col gap-3">
                          {catItems.map((item) => {
                            const isAvailable = visibilityStatus[item.id] !== undefined ? visibilityStatus[item.id] : true;
                            return (
                              <div key={item.id} className="flex justify-between items-center bg-[#fdf6f2]/30 p-2.5 rounded-xl border border-orange-50/20">
                                <div>
                                  <h5 className="text-xs font-bold text-[#1b3151]">{item.name}</h5>
                                  <span className="text-[9px] text-gray-400 font-mono">${Number(item.price).toFixed(2)}</span>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => handleToggleVisibility(item.id, isAvailable)}
                                  className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center flex-shrink-0 cursor-pointer ${
                                    isAvailable ? "bg-emerald-500" : "bg-gray-200"
                                  }`}
                                >
                                  <span
                                    className={`w-4 h-4 rounded-full bg-white shadow-sm absolute transition-transform ${
                                      isAvailable ? "translate-x-5.5" : "translate-x-0.5"
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MULTI-LANGUAGE PREFERENCES */}
            {activeTab === "languages" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#1b3151] uppercase tracking-wider mb-2">
                    Primary/Secondary Language
                  </label>
                  <select
                    value={secondaryLanguage}
                    onChange={(e) => setSecondaryLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1b3151] focus:outline-none text-xs text-[#1b3151] bg-[#f8f9fa] font-bold"
                  >
                    <option value="English">English Only</option>
                    <option value="Somali">English + Somali Translation</option>
                    <option value="Arabic">English + Arabic Translation</option>
                    <option value="French">English + French Translation</option>
                    <option value="Spanish">English + Spanish Translation</option>
                    <option value="Turkish">English + Turkish Translation</option>
                    <option value="Swahili">English + Swahili Translation</option>
                  </select>
                </div>

                <div className="p-3.5 bg-[#fdf6f2]/80 border border-orange-100 rounded-2xl flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#f2bd11] mt-0.5" />
                  <p className="text-[10px] text-gray-500 leading-normal font-medium">
                    Saving your selection writes the translation meta table preference to the establishment settings. Customers will see menu fields automatically formatted for <strong>{secondaryLanguage}</strong> standard locales.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveLanguage}
                  className="w-full py-3 bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] font-bold rounded-[50px] text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-200"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving preference...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Language Preference</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* SCHEDULED PRICE AUTOMATIONS */}
            {activeTab === "scheduling" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#1b3151] uppercase tracking-wider mb-2">
                    Select Menu Item
                  </label>
                  <select
                    value={schedItemId}
                    onChange={(e) => setSchedItemId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1b3151] focus:outline-none text-xs text-[#1b3151] bg-[#f8f9fa] font-bold"
                  >
                    <option value="">-- Select an Item --</option>
                    {categories.map((cat) => (
                      <optgroup key={cat.id} label={cat.name.toUpperCase()}>
                        {items
                          .filter((i) => i.category_id === cat.id)
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} (${Number(item.price).toFixed(2)})
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {schedItemId ? (
                  <div className="flex flex-col gap-4">
                    {/* Current Schedule status if exists */}
                    {items.find(i => i.id === schedItemId)?.scheduled_price && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 text-[10px] rounded-xl border border-emerald-100 flex flex-col gap-0.5">
                        <span className="font-bold uppercase tracking-wider text-[8px] text-emerald-600 block">Active Pricing Automation</span>
                        <span>Promo Price: <strong>${Number(items.find(i => i.id === schedItemId)?.scheduled_price).toFixed(2)}</strong></span>
                        <span>Start: {new Date(items.find(i => i.id === schedItemId)?.scheduled_start).toLocaleString()}</span>
                        <span>End: {new Date(items.find(i => i.id === schedItemId)?.scheduled_end).toLocaleString()}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Scheduled Promo Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={promoPrice}
                        onChange={(e) => setPromoPrice(e.target.value)}
                        placeholder="e.g. 5.99"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1b3151] font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Start Date & Time</label>
                        <input
                          type="datetime-local"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1b3151] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">End Date & Time</label>
                        <input
                          type="datetime-local"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1b3151] font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                      {items.find(i => i.id === schedItemId)?.scheduled_price && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={handleClearScheduling}
                          className="flex-1 py-3 border border-red-200 hover:bg-red-50 text-red-500 font-bold rounded-[50px] text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:bg-gray-200"
                        >
                          ✕ Clear Promo
                        </button>
                      )}
                      
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleSaveScheduling}
                        className="flex-1 py-3 bg-[#f2bd11] hover:bg-[#dbab0f] text-[#1b3151] font-bold rounded-[50px] text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-200"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Scheduling...</span>
                          </>
                        ) : (
                          <>
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>Automate Price</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-gray-400 italic">
                    Select a menu item above to start scheduling price automation.
                  </div>
                )}
              </div>
            )}

            {/* BACK TO MAIN */}
            <button
              onClick={() => setActiveTab(null)}
              className="py-2.5 bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 font-bold rounded-2xl text-[10px] uppercase tracking-wider transition-colors w-full cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard Features</span>
            </button>
          </div>
        )}

      </main>

      {/* Mobile bottom nav */}
      <BottomNav
        slug={slug}
        activeTab="components"
        onOpenEditEstablishment={() => setIsEstModalOpen(true)}
        onOpenAccountSettings={() => setIsAccountModalOpen(true)}
      />

      {/* Branding Edit Modal */}
      <EditEstablishmentModal
        isOpen={isEstModalOpen}
        onClose={() => setIsEstModalOpen(false)}
        onSuccess={fetchData}
        establishment={establishment}
      />

      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <ProtectedRoute>
      <ComponentsContent />
    </ProtectedRoute>
  );
}
