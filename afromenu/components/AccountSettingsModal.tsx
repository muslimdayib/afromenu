"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { X, User, Lock, Loader2, Check, AlertCircle, LogOut } from "lucide-react";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { user, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) throw updateErr;

      setSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
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
      {/* Backdrop */}
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
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.08)' }}
          className="absolute right-5 top-5 w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <h3 className="font-heading font-extrabold text-xl text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#dac063]" />
          <span>Account Settings</span>
        </h3>

        {/* Success/Error Alerts */}
        {success && (
          <div className="p-3.5 mb-5 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Check className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="p-3.5 mb-5 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)' }}>
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Profile info display */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }} className="p-4 rounded-2xl">
            <h4 style={labelStyle} className="mb-2">
              Profile Information
            </h4>
            <div className="flex flex-col gap-1.5 text-xs text-neutral-300">
              <div>
                <span className="text-white/40 font-bold uppercase text-[9px] tracking-wider">Account Name: </span>
                <span className="font-extrabold">{user?.user_metadata?.name || user?.email?.split("@")[0] || "Partner"}</span>
              </div>
              <div className="mt-0.5">
                <span className="text-white/40 font-bold uppercase text-[9px] tracking-wider">Email Address: </span>
                <span className="font-mono font-semibold">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <h4 style={labelStyle} className="flex items-center gap-1.5 mb-0.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </h4>

            <div className="flex flex-col gap-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={inputStyle}
                className="placeholder:text-white/20 font-bold focus:border-[#dac063]"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={inputStyle}
                className="placeholder:text-white/20 font-bold focus:border-[#dac063]"
              />
            </div>

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
              className="font-black uppercase tracking-wider text-xs disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-neutral-950" />
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>

          <hr className="border-white/10" />

          {/* Log out button */}
          <button
            onClick={() => {
              signOut();
              onClose();
            }}
            style={{
              width: '100%',
              padding: '14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 14,
              color: '#ef4444',
              fontSize: 15,
              cursor: 'pointer',
            }}
            className="font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
