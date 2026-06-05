import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wifi, Phone, MapPin, Star, Utensils, ChevronRight } from "lucide-react";

interface LuxuryDarkMenuProps {
  establishment: any;
  categories: any[];
  items: any[];
}

export default function LuxuryDarkMenu({ establishment, categories, items }: LuxuryDarkMenuProps) {
  // Premium Guest View states
  const [guestTab, setGuestTab] = useState<"menu" | "about" | "feedback">("menu");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [guestSearchQuery, setGuestSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showWifi, setShowWifi] = useState(false);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  const [currentRating, setCurrentRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [guestLogoError, setGuestLogoError] = useState(false);

  const showToast = (title: string, desc: string) => {
    setToast({ title, desc });
    setTimeout(() => setToast(null), 4500);
  };

  const goldColor = establishment.brand_color || '#dac063';
  const goldSecondaryColor = establishment.brand_color_secondary || '#1b3151';
  
  const coverImage = establishment.background_url;
  const isRealCover = coverImage && 
    !coverImage.includes('placeholder') &&
    !coverImage.includes('via.placeholder') &&
    !coverImage.includes('afromenu-qr');
  
  const hexToRgb = (hex: string) => {
    const cleaned = (hex || '#dac063').replace("#", "");
    if (cleaned.length !== 6 && cleaned.length !== 3) return "218, 192, 99";
    const num = parseInt(cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `${r}, ${g}, ${b}`;
  };

  const brandStyles = {
    "--gold": goldColor,
    "--gold-secondary": goldSecondaryColor,
    "--gold-rgb": hexToRgb(goldColor),
  } as React.CSSProperties;

  // Filter items in the menu
  const displayedItems = items.filter(item => {
    // Visibility / Availability safety check
    const isAvailable = item.isAvailable !== false && item.is_available !== false;
    const isVisible = item.isVisible !== false && item.is_visible !== false;
    
    // Category filter
    const categoryMatch = activeCategory === 'all' || 
      item.category_id === activeCategory;
    
    // Search filter
    const searchMatch = !guestSearchQuery || 
      item.name.toLowerCase().includes(guestSearchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(guestSearchQuery.toLowerCase());
    
    return isAvailable && isVisible && categoryMatch && searchMatch;
  });

  return (
    <div
      style={brandStyles}
      className="min-h-screen bg-neutral-950 text-neutral-200 font-sans overflow-x-hidden relative flex flex-col items-center justify-center p-0 md:p-6 w-full"
    >
      {/* Luxury fonts and custom styling injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-serif-lux { font-family: 'Playfair Display', serif; }
        .font-sans-lux { font-family: 'Montserrat', sans-serif; }
        
        .custom-scroll::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
            background: rgba(var(--gold-rgb), 0.25);
            border-radius: 99px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(var(--gold-rgb), 0.55);
        }
        
        .glass-panel {
            background: rgba(18, 18, 19, 0.75);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(var(--gold-rgb), 0.12);
        }
        
        .glass-panel-light {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ambient-glow {
            position: absolute;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(var(--gold-rgb), 0.15) 0%, rgba(0,0,0,0) 70%);
            pointer-events: none;
        }
      `}} />

      {/* Ambient background glows for extra visual depth */}
      <div className="ambient-glow top-10 left-10"></div>
      <div className="ambient-glow bottom-20 right-10"></div>

      {/* MAIN DEVICE FRAME */}
      <div className="w-full max-w-[430px] h-full md:h-[880px] md:rounded-[40px] md:shadow-[0_0_60px_rgba(0,0,0,0.9)] md:border-8 md:border-neutral-800 bg-neutral-950 overflow-hidden flex flex-col relative">
        
        {/* Status Bar Mimic for Prototyping */}
        <div className="hidden md:flex justify-between items-center px-6 py-2 bg-neutral-950 text-xs text-neutral-400 select-none z-50 shrink-0">
            <span>7:45 AM</span>
            <div className="w-24 h-4 bg-neutral-900 rounded-full mx-auto absolute left-1/2 transform -translate-x-1/2 top-1.5 border border-neutral-800"></div>
            <div className="flex items-center space-x-1.5">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.13 19.58 10.53 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
                <span className="font-mono">5G</span>
                <div className="w-5 h-2.5 border border-neutral-400 rounded-sm p-0.5 flex items-center"><div className="bg-neutral-400 h-full w-4 rounded-2xs"></div></div>
            </div>
        </div>

        {/* MAIN SCROLLABLE CONTAINER */}
        <div id="scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col custom-scroll pb-24 scrollbar-none">
            
            {/* HERO COVER COVER */}
            <div style={{
              height: 200,
              position: 'relative',
              overflow: 'hidden',
            }} className="w-full shrink-0">
              {isRealCover ? (
                <img
                  src={coverImage}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(
                    135deg,
                    #0a0a0b 0%,
                    #1a1a2e 40%,
                    #16213e 70%,
                    #0f3460 100%
                  )`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {/* Decorative pattern */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `radial-gradient(
                      circle at 30% 50%, 
                      rgba(${hexToRgb(goldColor)}, 0.15) 0%, 
                      transparent 60%
                    )`,
                  }} />
                </div>
              )}
              {/* Dark overlay at bottom */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                background: 'linear-gradient(transparent, #0a0a0b)',
              }} />

              {/* Floating Header controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <span className="glass-panel-light text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold" style={{ color: 'var(--gold)' }}>
                      ✦ Premium Experience
                  </span>
                  <div className="glass-panel-light text-xs text-white px-3 py-1 rounded-full flex items-center space-x-1">
                      <span>EN</span>
                  </div>
              </div>
            </div>

            {/* PROFILE SECTION */}
            <div className="px-5 -mt-16 relative z-10 shrink-0">
                <div className="flex items-end justify-between">
                    {/* Elegant Logo Container */}
                    <div className="w-24 h-24 rounded-2xl p-0.5 shadow-xl animate-pulse-slow" style={{ backgroundImage: `linear-gradient(to top right, var(--gold), #fef3c7)` }}>
                        <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center overflow-hidden p-0.5">
                            {establishment.logo_url && !guestLogoError ? (
                              <img src={establishment.logo_url} alt={establishment.name} className="w-full h-full object-cover rounded-[12px]" onError={() => setGuestLogoError(true)} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl font-serif-lux" style={{ backgroundColor: 'var(--gold)' }}>
                                  {establishment.name?.[0]?.toUpperCase() || 'A'}
                              </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex flex-col items-end pb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                            Open Now
                        </span>
                        <span className="text-[10px] text-neutral-400 mt-1">Free Digital QR Menu</span>
                    </div>
                </div>

                {/* Brand Details */}
                <div className="mt-4">
                    <h1 className="text-3.5xl font-serif-lux font-semibold tracking-wide text-white capitalize">{establishment.name}</h1>
                    {establishment.tagline && (
                      <p className="text-xs tracking-widest uppercase mt-1 font-sans-lux font-medium" style={{ color: 'var(--gold)' }}>{establishment.tagline}</p>
                    )}
                </div>

                {/* QUICK ACTIONS GRID */}
                <div className="grid grid-cols-5 gap-2 mt-4">
                    {/* Phone */}
                    {establishment.phone ? (
                      <a href={`tel:${establishment.phone}`} className="glass-panel flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gold-500/10 transition duration-300 active:scale-95">
                          <Phone className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                          <span className="text-[9px] text-neutral-400 mt-1.5 font-bold">Call Us</span>
                      </a>
                    ) : (
                      <div className="glass-panel flex flex-col items-center justify-center p-3 rounded-xl opacity-40">
                          <Phone className="w-5 h-5 text-neutral-600" />
                          <span className="text-[9px] text-neutral-500 mt-1.5 font-bold">Call Us</span>
                      </div>
                    )}
                    {/* Location */}
                    {establishment.address ? (
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(establishment.address)}`} target="_blank" rel="noopener noreferrer" className="glass-panel flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gold-500/10 transition duration-300 active:scale-95">
                          <MapPin className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                          <span className="text-[9px] text-neutral-400 mt-1.5 font-bold">Find Us</span>
                      </a>
                    ) : (
                      <div className="glass-panel flex flex-col items-center justify-center p-3 rounded-xl opacity-40">
                          <MapPin className="w-5 h-5 text-neutral-600" />
                          <span className="text-[9px] text-neutral-500 mt-1.5 font-bold">Find Us</span>
                      </div>
                    )}
                    {/* Instagram */}
                    {establishment.instagram_url ? (
                      <a href={establishment.instagram_url.startsWith("http") ? establishment.instagram_url : `https://instagram.com/${establishment.instagram_url}`} target="_blank" rel="noopener noreferrer" className="glass-panel flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gold-500/10 transition duration-300 active:scale-95">
                          <svg className="w-5 h-5" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                          <span className="text-[9px] text-neutral-400 mt-1.5 font-bold">Social</span>
                      </a>
                    ) : (
                      <div className="glass-panel flex flex-col items-center justify-center p-3 rounded-xl opacity-40">
                          <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                          <span className="text-[9px] text-neutral-500 mt-1.5 font-bold">Social</span>
                      </div>
                    )}
                    {/* Share */}
                    <button onClick={async () => {
                      try {
                        await navigator.share({ url: window.location.href, title: establishment.name });
                        showToast("Link Shared", "Menu link forwarded successfully!");
                      } catch {
                        navigator.clipboard.writeText(window.location.href);
                        showToast("Copied to Clipboard", "Direct menu link copied!");
                      }
                    }} className="glass-panel flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gold-500/10 transition duration-300 active:scale-95 cursor-pointer">
                        <svg className="w-5 h-5" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 10.742l4.028-2.014m0 0a3 3 0 10-2.243-4.077L6.445 6.66a3 3 0 100 4.678l4.028 2.014a3 3 0 112.243-4.077z"></path></svg>
                        <span className="text-[9px] text-neutral-400 mt-1.5 font-bold">Share</span>
                    </button>
                    {/* Wifi Info */}
                    {establishment.wifi_password ? (
                      <button onClick={() => setShowWifi(true)} className="glass-panel flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gold-500/10 transition duration-300 active:scale-95 cursor-pointer">
                          <Wifi className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                          <span className="text-[9px] text-neutral-400 mt-1.5 font-bold">Wifi</span>
                      </button>
                    ) : (
                      <div className="glass-panel flex flex-col items-center justify-center p-3 rounded-xl opacity-40">
                          <Wifi className="w-5 h-5 text-neutral-600" />
                          <span className="text-[9px] text-neutral-500 mt-1.5 font-bold">Wifi</span>
                      </div>
                    )}
                </div>
            </div>

            {/* TAB SELECTOR NAVIGATION */}
            <div className="sticky top-0 bg-neutral-950/90 backdrop-blur-md z-30 px-5 pt-4 pb-2 border-b border-neutral-900 mt-5 shrink-0">
                <div className="flex space-x-1 p-1 bg-neutral-900 rounded-xl">
                    <button onClick={() => setGuestTab('menu')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition duration-300 cursor-pointer ${guestTab === 'menu' ? 'text-neutral-950 bg-gradient-to-r from-gold-600 to-gold-500 shadow-md font-bold' : 'text-neutral-400 hover:text-white font-medium'}`}>
                        The Menu
                    </button>
                    <button onClick={() => setGuestTab('about')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition duration-300 cursor-pointer ${guestTab === 'about' ? 'text-neutral-950 bg-gradient-to-r from-gold-600 to-gold-500 shadow-md font-bold' : 'text-neutral-400 hover:text-white font-medium'}`}>
                        About & Hours
                    </button>
                    <button onClick={() => setGuestTab('feedback')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition duration-300 cursor-pointer ${guestTab === 'feedback' ? 'text-neutral-950 bg-gradient-to-r from-gold-600 to-gold-500 shadow-md font-bold' : 'text-neutral-400 hover:text-white font-medium'}`}>
                        Feedback
                    </button>
                </div>
            </div>

            {/* VIEWPORT CONTENT WRAPPER */}
            <div className="flex-1 p-5 relative">
                
                {/* ================== TAB 1: MENU CONTENT ================== */}
                {guestTab === 'menu' && (
                  <div className="space-y-6">
                      
                      {/* Search Bar */}
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                          </div>
                          <input type="text" value={guestSearchQuery} onChange={(e) => setGuestSearchQuery(e.target.value)} placeholder="Search dishes, drinks, ingredients..." 
                                 className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500/50 transition" />
                      </div>

                      {/* Category Quick Filter Horizontal Scroll */}
                      {categories.length > 0 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-5 px-5 custom-scroll scrollbar-none">
                            <button
                              onClick={() => setActiveCategory('all')}
                              style={{
                                background: activeCategory === 'all' 
                                  ? goldColor 
                                  : 'rgba(255,255,255,0.08)',
                                color: activeCategory === 'all' 
                                  ? '#0a0a0b' 
                                  : 'rgba(255,255,255,0.7)',
                                border: activeCategory === 'all' 
                                  ? 'none' 
                                  : '1px solid rgba(255,255,255,0.15)',
                                borderRadius: 99,
                                padding: '8px 16px',
                                fontSize: 13,
                                fontWeight: activeCategory === 'all' ? 700 : 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              All
                            </button>
                            {categories.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                  background: activeCategory === cat.id 
                                    ? goldColor 
                                    : 'rgba(255,255,255,0.08)',
                                  color: activeCategory === cat.id 
                                    ? '#0a0a0b' 
                                    : 'rgba(255,255,255,0.7)',
                                  border: activeCategory === cat.id 
                                    ? 'none' 
                                    : '1px solid rgba(255,255,255,0.15)',
                                  borderRadius: 99,
                                  padding: '8px 16px',
                                  fontSize: 13,
                                  fontWeight: activeCategory === cat.id ? 700 : 500,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {cat.name}
                              </button>
                            ))}
                        </div>
                      )}

                      {/* MENU ITEMS GRID */}
                      <div className="space-y-4">
                          {displayedItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40 }} className="glass-panel rounded-2xl">
                              <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                                No items in this category yet
                              </p>
                            </div>
                          ) : (
                            displayedItems.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="glass-panel rounded-2xl overflow-hidden transition duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 12,
                                  padding: '16px',
                                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                                }}
                              >
                                {/* Item details on the LEFT side */}
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontSize: 16, 
                                    fontWeight: 700, 
                                    color: 'white',
                                    marginBottom: 4,
                                  }}>
                                    {item.name}
                                  </div>
                                  <div style={{ 
                                    fontSize: 12, 
                                    color: 'rgba(255,255,255,0.5)',
                                    marginBottom: 8,
                                    lineHeight: 1.5,
                                  }}>
                                    {item.description}
                                  </div>
                                  <div style={{ 
                                    color: goldColor, 
                                    fontWeight: 700, 
                                    fontSize: 15 
                                  }}>
                                    {Number(item.price || 0).toFixed(2)} {establishment.currency_symbol || '$'}
                                  </div>
                                </div>
                                
                                {/* Item photo on the RIGHT side */}
                                <div style={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: 12,
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  background: 'rgba(255,255,255,0.05)',
                                }}>
                                  {item.image_url ? (
                                    <img
                                      src={item.image_url}
                                      alt={item.name}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                      }}
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                  ) : (
                                    <div style={{
                                      width: '100%',
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 28,
                                      background: 'rgba(218,192,99,0.1)',
                                    }}>
                                      🍽️
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                      </div>
                  </div>
                )}

                {/* ================== TAB 2: ABOUT CONTENT ================== */}
                {guestTab === 'about' && (
                  <div className="space-y-6">
                      {/* Hours Card */}
                      <div className="glass-panel p-5 rounded-2xl space-y-4">
                          <div className="flex items-center space-x-3" style={{ color: 'var(--gold)' }}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              <h3 className="font-serif-lux text-lg font-medium text-white">Opening Hours</h3>
                          </div>
                          <div className="space-y-2.5 text-xs text-neutral-300">
                              <div className="flex justify-between pb-2 border-b border-neutral-900/60">
                                  <span>Monday - Sunday</span>
                                  <span className="text-white font-medium">11:00 - 23:00</span>
                              </div>
                              <div className="flex justify-between">
                                  <span>Kitchen Closes</span>
                                  <span className="text-white font-medium">22:30</span>
                              </div>
                          </div>
                      </div>

                      {/* Location & Map */}
                      {establishment.address && (
                        <div className="glass-panel p-5 rounded-2xl space-y-4">
                            <div className="flex items-center space-x-3" style={{ color: 'var(--gold)' }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <h3 className="font-serif-lux text-lg font-medium text-white">Our Location</h3>
                            </div>
                            <p className="text-xs text-neutral-300 leading-relaxed">
                                {establishment.address}
                            </p>
                            <a href={`https://maps.google.com/?q=${encodeURIComponent(establishment.address)}`} target="_blank" rel="noopener noreferrer" className="h-36 rounded-xl overflow-hidden relative border border-neutral-800 block">
                                <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                                    <div className="text-center p-4">
                                        <svg className="w-8 h-8 mx-auto animate-bounce" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                                        <span className="text-[10px] text-neutral-400 mt-2 block tracking-wider font-semibold">Tap to launch Live Map Navigation</span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            </a>
                        </div>
                      )}

                      {/* Info Inquiries */}
                      <div className="glass-panel p-5 rounded-2xl space-y-4">
                          <h3 className="font-serif-lux text-lg font-medium text-white">Private Events & Catering</h3>
                          <p className="text-xs text-neutral-300 leading-relaxed">
                              Interested in holding an event or dining reservation with us? Get in touch with our operations manager directly.
                          </p>
                          {establishment.phone && (
                            <a href={`tel:${establishment.phone}`} className="block text-center py-2.5 bg-neutral-900 border border-neutral-800 text-gold-300 rounded-xl text-xs font-semibold hover:bg-gold-500/10 transition" style={{ color: 'var(--gold)', borderColor: 'rgba(var(--gold-rgb), 0.2)' }}>
                                Call Customer Services
                            </a>
                          )}
                      </div>
                  </div>
                )}

                {/* ================== TAB 3: FEEDBACK CONTENT ================== */}
                {guestTab === 'feedback' && (
                  <div className="space-y-6">
                      <div className="glass-panel p-5 rounded-2xl space-y-4">
                          <h3 className="font-serif-lux text-lg font-medium text-white text-center">Guest Satisfaction</h3>
                          <p className="text-xs text-neutral-400 text-center leading-relaxed">
                              We value your opinion. Help us craft the perfect experience.
                          </p>

                          {/* Stars */}
                          <div className="flex justify-center space-x-2 py-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setCurrentRating(star)} className={`transition transform hover:scale-110 cursor-pointer ${star <= currentRating ? "scale-110" : "text-neutral-700"}`} style={star <= currentRating ? { color: 'var(--gold)' } : {}}>
                                    <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                </button>
                              ))}
                          </div>

                          {/* Message */}
                          <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Your notes & experience (optional)</label>
                              <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={3} placeholder="Tell us how we did today..." 
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500/50 transition"></textarea>
                          </div>

                          <button onClick={() => {
                            showToast("Feedback Received", `Thank you for rating us ${currentRating} stars! Your notes are submitted.`);
                            setFeedbackText('');
                            setCurrentRating(5);
                          }} className="w-full py-2.5 text-neutral-950 font-bold rounded-xl text-xs shadow-lg active:scale-[0.98] transition cursor-pointer border-0" style={{ backgroundImage: `linear-gradient(to right, var(--gold), #cca73b)` }}>
                              Submit Review
                          </button>
                      </div>
                  </div>
                )}

            </div>

            {/* FOOTER PLATFORM SIGNATURE */}
            <div className="px-5 pb-8 pt-4 text-center border-t border-neutral-900 bg-neutral-950 shrink-0">
                <span className="text-[10px] text-neutral-500 tracking-widest block">POWERED BY</span>
                <Link href="/" className="inline-flex items-center gap-1 mt-1 hover:opacity-80 transition-opacity">
                  <Image src="/icon.png" alt="Logo" width={16} height={16} className="w-4 h-4 object-contain" />
                  <span className="text-xs font-serif-lux font-semibold tracking-wider" style={{ color: 'var(--gold)' }}>AFROMENU SYSTEM</span>
                </Link>
                <span className="text-[9px] text-neutral-600 block mt-2">© 2026. All rights reserved.</span>
            </div>

        </div>

        {/* ================== FLOATING INTERACTIONS BAR ================== */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[85%] bg-neutral-900/90 backdrop-blur-md rounded-full px-4 py-2 flex justify-between items-center shadow-2xl border border-white/5 z-40">
            <button onClick={() => showToast("Waiter Called", "A server has been requested to your table.")} className="flex items-center space-x-2 text-neutral-300 hover:text-white transition active:scale-95 py-1 px-3 rounded-full hover:bg-white/5 cursor-pointer">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--gold)' }}></span>
                <span className="text-xs font-semibold">Call Waiter</span>
            </button>
            <div className="h-6 w-[1px] bg-neutral-800"></div>
            <button onClick={() => showToast("Bill Requested", "Preparing the bill. Please wait.")} className="flex items-center space-x-2 text-neutral-300 hover:text-white transition active:scale-95 py-1 px-3 rounded-full hover:bg-white/5 cursor-pointer">
                <svg className="w-4 h-4 text-gold-400" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l2-2 4 4m0-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="text-xs font-semibold">Request Bill</span>
            </button>
        </div>

        {/* ================== TOAST NOTIFICATION SYSTEM ================== */}
        {toast && (
          <div className="absolute top-16 left-4 right-4 bg-neutral-900 border p-3 rounded-xl flex items-center space-x-3 shadow-2xl z-50 animate-slide-up" style={{ borderColor: 'rgba(var(--gold-rgb), 0.3)' }}>
              <div className="p-1.5 rounded-lg" style={{ color: 'var(--gold)', backgroundColor: 'rgba(var(--gold-rgb), 0.2)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                  <h4 className="text-xs font-bold text-white">{toast.title}</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{toast.desc}</p>
              </div>
          </div>
        )}

        {/* ================== WIFI NETWORK DIALOG ================== */}
        {showWifi && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6 transition-all duration-300">
              <div className="bg-neutral-950 border rounded-2xl p-6 text-center max-w-sm w-full space-y-4 animate-scale-up" style={{ borderColor: 'rgba(var(--gold-rgb), 0.2)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ color: 'var(--gold)', backgroundColor: 'rgba(var(--gold-rgb), 0.1)' }}>
                      <Wifi className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif-lux text-lg text-white font-medium">Guest Wifi Network</h3>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 text-left">
                      <div className="flex justify-between text-xs pb-1">
                          <span className="text-neutral-500">SSID</span>
                          <span className="text-white font-semibold">{establishment.name}_GUEST</span>
                      </div>
                      {establishment.wifi_password && (
                        <div className="flex justify-between text-xs pt-1 border-t border-neutral-800">
                            <span className="text-neutral-500">Password</span>
                            <span className="font-mono font-bold" style={{ color: 'var(--gold)' }}>{establishment.wifi_password}</span>
                        </div>
                      )}
                  </div>
                  <button onClick={() => setShowWifi(false)} className="w-full py-2.5 bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 rounded-xl text-xs font-semibold cursor-pointer">
                      Dismiss
                  </button>
              </div>
          </div>
        )}

        {/* ================== PRODUCT DETAIL MODAL OVERLAY ================== */}
        {selectedItem && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end transition-all duration-300">
            {/* Bottom Sheet Box */}
            <div 
              className="bg-neutral-950 border-t rounded-t-[30px] overflow-hidden transform translate-y-0 transition-transform duration-300 flex flex-col justify-between max-h-[85%] relative" 
              style={{ borderColor: 'rgba(var(--gold-rgb), 0.2)' }}
            >
              {/* Close button (X) at top right */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center transition-colors hover:bg-black/80 z-50 cursor-pointer border border-white/10"
              >
                ✕
              </button>

              {/* Large item photo at top (240px height) */}
              <div style={{ height: 240, width: '100%', position: 'relative', background: 'rgba(255,255,255,0.03)' }}>
                {selectedItem.image_url ? (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 64,
                    background: 'rgba(218,192,99,0.1)',
                  }}>
                    🍽️
                  </div>
                )}
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent"></div>
              </div>

              {/* Detail Content */}
              <div className="p-6 overflow-y-auto flex-1 custom-scroll">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="font-serif-lux text-2xl font-semibold text-white tracking-wide">{selectedItem.name}</h2>
                  <span className="text-lg font-serif-lux font-semibold whitespace-nowrap" style={{ color: 'var(--gold)' }}>
                    {Number(selectedItem.price || 0).toFixed(2)} {establishment.currency_symbol || '$'}
                  </span>
                </div>

                {/* Weight info */}
                {selectedItem.weight && (
                  <span className="text-xs text-neutral-400 font-mono mt-1 block">
                    Weight: {selectedItem.weight}
                  </span>
                )}

                {/* Tags (spicy, vegan, popular, halal) */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedItem.tags.map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md"
                        style={{
                          backgroundColor: 'rgba(var(--gold-rgb), 0.1)',
                          color: 'var(--gold)',
                          border: '1px solid rgba(var(--gold-rgb), 0.25)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {selectedItem.description && (
                  <div className="mt-6">
                    <span className="text-[10px] uppercase tracking-widest font-semibold block mb-2" style={{ color: 'var(--gold)' }}>
                      Description
                    </span>
                    <p className="text-sm text-neutral-300 leading-relaxed font-sans-lux">
                      {selectedItem.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions Area */}
              <div className="p-6 border-t border-neutral-900 bg-neutral-950/80 backdrop-blur-md flex gap-3">
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="flex-1 py-3 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  Back to Menu
                </button>
                <button 
                  onClick={() => {
                    const itemName = selectedItem.name;
                    setSelectedItem(null);
                    showToast("Added to Favourites", `"${itemName}" has been added to your favourites!`);
                  }}
                  className="flex-1 py-3 text-neutral-950 font-bold rounded-xl text-xs shadow-lg cursor-pointer border-0 transition"
                  style={{ backgroundImage: `linear-gradient(to right, var(--gold), #cca73b)` }}
                >
                  Add to Favourites
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
